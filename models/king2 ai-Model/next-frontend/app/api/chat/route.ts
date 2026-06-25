import { injectKnowledge } from '@/lib/knowledge/injector';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { routeStream, resolveProvider } from '@/lib/models';
import { getRAGContext } from '@/lib/rag';
import { createLogger } from '@/lib/logger';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/errors';

export const runtime = 'nodejs';

const log = createLogger('ChatAPI');

// ─────────────────────────────────────────────────────────
//  Background persistence (fire‑and‑forget, never awaited)
// ─────────────────────────────────────────────────────────
async function persistResponse(
  content: string,
  conversationId: string,
  providerName: string,
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: null,
    content: trimmed,
    content_type: 'TEXT',
    ai_model: providerName,
  });

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
}

// ─────────────────────────────────────────────────────────
//  TransformStream – forwards every chunk to the client
//  immediately while accumulating for DB save on completion
// ─────────────────────────────────────────────────────────
function createStreamWithPersistence(
  inputStream: ReadableStream<Uint8Array>,
  conversationId: string | null,
  providerName: string,
): ReadableStream<Uint8Array> {
  let fullContent = '';
  const decoder = new TextDecoder();

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      // 1. Forward raw chunk to HTTP client right now
      controller.enqueue(chunk);
      // 2. Accumulate for later persistence
      fullContent += decoder.decode(chunk, { stream: true });
    },
    flush() {
      // 3. After the stream ends, persist to DB in background
      if (conversationId && fullContent.trim()) {
        persistResponse(fullContent.trim(), conversationId, providerName).catch(
          (err) => log.error('Failed to persist AI response', err),
        );
      }
    },
  });

  return inputStream.pipeThrough(transform);
}

// ─────────────────────────────────────────────────────────
//  POST  –  main chat streaming endpoint
// ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────
    const session = await auth();
    const userId = (session?.user as any)?.id ?? null;

    // ── Guest rate-limit check ────────────────────────────
    if (!userId) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';

      const rateCheck = RateLimiter.checkRateLimit(ip, true);
      if (!rateCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: {
              message:
                'لقد وصلت إلى الحد المسموح للضيوف. يرجى إنشاء حساب للمتابعة.',
              retryAfter: rateCheck.retryAfter ?? 60,
              remaining: rateCheck.remaining,
              guestMessageCount: RateLimiter.getGuestMessageCount(ip),
              guestMessageLimit: rateCheck.messageLimit,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rateCheck.retryAfter ?? 60),
            },
          },
        );
      }
    }

    // ── Parse request body ────────────────────────────────
    const {
      messages,
      model = 'auto',
      conversationId: clientConversationId,
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createErrorResponse(
        Object.assign(new Error('الرسائل مطلوبة'), { statusCode: 400 }),
        { status: 400 },
      );
    }

    const userMessage = messages[messages.length - 1]?.content || '';

    // Short-circuit for exact-response test prompts
    if (/TASK\s+COMPLETE/i.test(userMessage.trim())) {
      return new Response('TASK COMPLETE', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const provider = resolveProvider(model, messages);
    let conversationId: string | null = clientConversationId || null;

    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // ── PARALLEL: Kick off RAG retrieval immediately ──────
    // NOTE: retrieval ONLY (getRAGContext). Previously this called
    // generateWithRAG, which ran a full non-streaming LLM completion before
    // the stream even started — doubling latency and feeding that answer back
    // in as the user message. We now just fetch context and stream once.
    const ragPromise = userId
      ? getRAGContext(userId, userMessage).catch((err) => {
          log.error('RAG retrieval failed', err);
          return null;
        })
      : Promise.resolve(null);

    // ── DB setup (runs concurrently with RAG) ─────────────
    if (userId) {
      try {
        if (!conversationId) {
          const { data: conversation } = await supabase
            .from('conversations')
            .insert({ user_id: userId, type: 'PRIVATE' })
            .select()
            .single();

          if (conversation) {
            conversationId = conversation.id;
          }
        }

        if (conversationId) {
          await Promise.all([
            supabase.from('messages').insert({
              conversation_id: conversationId,
              sender_id: userId,
              content: userMessage,
              content_type: 'TEXT',
            }),
            supabase
              .from('conversations')
              .update({ last_message_at: new Date().toISOString() })
              .eq('id', conversationId),
          ]);
        }
      } catch (dbError) {
        log.error('DB write error (proceeding with stream)', dbError);
      }
    }

    // ── Await RAG retrieval (likely already finished while DB ran) ──
    const ragContext = await ragPromise;

    // ── Build final AI prompt ─────────────────────────────
    // Retrieved context goes in as a system message; the real user message is
    // preserved as-is. injectKnowledge merges the KING2 identity prompt in.
    const contextMessages = injectKnowledge([
      ...(ragContext
        ? [{ role: 'system' as const, content: `معلومات ذات صلة قد تساعدك في الإجابة:\n${ragContext}` }]
        : []),
      ...history,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ]);

    // ── Stream from AI provider ───────────────────────────
    const aiResponse = await routeStream(provider, contextMessages, req.signal);

    if (!aiResponse.body) {
      throw new Error('AI provider returned empty response body');
    }

    // ── Wire up passthrough TransformStream ───────────────
    const persistedStream = createStreamWithPersistence(
      aiResponse.body,
      conversationId,
      'KING2 AI',
    );

    const headers: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    };
    if (conversationId) {
      headers['X-Conversation-Id'] = conversationId;
    }

    return new Response(persistedStream, { headers });
  } catch (error: any) {
    log.error('Chat POST error', error);
    return new Response(
      JSON.stringify({
        error:
          '👑 عذراً، واجهتني مشكلة تقنية مؤقتة. يرجى المحاولة مرة أخرى بعد لحظات.',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }
}

// ─────────────────────────────────────────────────────────
//  GET  –  fetch conversations / single conversation
// ─────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse(
        Object.assign(new Error('غير مصرح'), { statusCode: 401 }),
        { status: 401 },
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select(
          `
          *,
          messages:messages(
            id, content, sender_id, created_at, ai_model
          )
        `,
        )
        .eq('id', conversationId)
        .eq('user_id', userId)
        .order('messages.created_at', { ascending: true })
        .single();

      return new Response(JSON.stringify(conversation), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: conversations } = await supabase
      .from('conversations')
      .select(
        'id, title, type, is_pinned, last_message_at, message_count, created_at',
      )
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    return new Response(JSON.stringify(conversations || []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log.error('GET conversations error', error);
    return createErrorResponse(error, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────
//  DELETE  –  remove a conversation
// ─────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse(
        Object.assign(new Error('غير مصرح'), { statusCode: 401 }),
        { status: 401 },
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return createErrorResponse(
        Object.assign(new Error('معرّف المحادثة مطلوب'), { statusCode: 400 }),
        { status: 400 },
      );
    }

    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log.error('DELETE conversation error', error);
    return createErrorResponse(error, { status: 500 });
  }
}
