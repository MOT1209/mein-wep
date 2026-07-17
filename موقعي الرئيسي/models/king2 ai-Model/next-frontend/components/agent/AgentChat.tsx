'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStatus } from './AgentStatus';
import { ThinkingAnimation } from './ThinkingAnimation';
import { ToolUsageCard } from './ToolUsageCard';
import { TaskProgress } from './TaskProgress';
import { AgentStatus as AgentStatusType, AgentStep } from '@/lib/agents/types';

interface StreamChunk {
  type: 'step_start' | 'step_update' | 'step_end' | 'tool_call' | 'tool_result' | 'text' | 'error' | 'done';
  content: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: AgentStep[];
  tools?: { toolName: string; input: string; output?: string; status: string }[];
}

interface AgentChatProps {
  agentId?: string;
  agentName?: string;
}

export function AgentChat({ agentId, agentName }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>('idle');
  const [currentTool, setCurrentTool] = useState<{ name: string; input: string; status: string } | null>(null);
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>([]);
  const [currentStepProgress, setCurrentStepProgress] = useState<{ current: number; total: number } | null>(null);
  const streamContent = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clear chat when agent changes
  useEffect(() => {
    setMessages([]);
    setInput('');
    setAgentStatus('idle');
    setCurrentTool(null);
    setCurrentSteps([]);
    setCurrentStepProgress(null);
  }, [agentId]);

  // Clipboard error suppression (model does not support image input)
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (
        e.message?.includes('clipboard') ||
        e.message?.includes('does not support image')
      ) {
        e.preventDefault();
      }
    };
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message || '';
      if (
        msg.includes('clipboard') ||
        msg.includes('does not support image')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setAgentStatus('idle');
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (isStreaming) return;
    if (!input.trim()) {
      setValidationError('يرجى كتابة طلب قبل الإرسال');
      return;
    }
    setValidationError('');

    const userMessage = input.trim();
    setInput('');
    setIsStreaming(true);
    setAgentStatus('thinking');
    setCurrentSteps([]);
    setCurrentTool(null);
    setCurrentStepProgress(null);
    streamContent.current = '';

    const assistantMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      steps: [],
      tools: [],
    };
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() - 1).toString(), role: 'user', content: userMessage },
      assistantMsg,
    ]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/king2/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agentId,
          agentName,
          ...(agentId === 'sovereign-translator' && {
            systemPrompt: `You are Sovereign_Translator_Agent, a professional multilingual translator.
You understand and translate between ALL languages fluently.
Your primary focus: Arabic, English, German, French, Spanish, Chinese, Turkish, Persian, Urdu, Russian.

Rules:
- Detect the source language automatically
- Translate accurately while preserving meaning, tone, and context
- For code: translate variable names? No, keep them. Translate comments and strings only.
- If the user asks in Arabic, respond in Arabic with the translation
- If the user asks in another language, respond in that language
- Provide brief explanations when helpful`,
          }),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            setIsStreaming(false);
            setAgentStatus('done');
            continue;
          }

          try {
            const chunk: StreamChunk = JSON.parse(data);

            switch (chunk.type) {
              case 'text':
                streamContent.current += chunk.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === 'assistant') {
                    last.content = streamContent.current;
                  }
                  return [...updated];
                });
                break;

              case 'step_start':
                setAgentStatus('planning');
                setCurrentStepProgress({ current: 0, total: chunk.content.totalSteps });
                break;

              case 'step_update':
                setAgentStatus('executing_tool');
                setCurrentStepProgress({ current: chunk.content.step, total: chunk.content.total });
                break;

              case 'tool_call':
                setAgentStatus('executing_tool');
                setCurrentTool({ name: chunk.content.tool, input: chunk.content.input, status: 'running' });
                setCurrentSteps((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    type: 'tool_call',
                    content: chunk.content.input,
                    toolName: chunk.content.tool,
                    status: 'running',
                    startedAt: new Date().toISOString(),
                  },
                ]);
                break;

              case 'tool_result':
                setCurrentTool((prev) =>
                  prev ? { ...prev, status: 'done' } : null
                );
                setCurrentSteps((prev) =>
                  prev.map((s, i) =>
                    i === prev.length - 1
                      ? { ...s, status: 'done', toolOutput: chunk.content.result, completedAt: new Date().toISOString() }
                      : s
                  )
                );
                break;

              case 'error':
                setAgentStatus('error');
                streamContent.current += `\n\n❌ ${chunk.content}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === 'assistant') {
                    last.content = streamContent.current;
                  }
                  return [...updated];
                });
                break;
            }
          } catch {
            // skip parse errors
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setAgentStatus('error');
        streamContent.current += `\n\n❌ ${error.message}`;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            last.content = streamContent.current;
          }
          return [...updated];
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-king-600/20 border border-king-500/20 text-zinc-200'
                    : 'bg-surface-tertiary/50 border border-zinc-800/30 text-zinc-300'
                }`}
              >
                {msg.role === 'assistant' && i === messages.length - 1 && isStreaming && (
                  <AgentStatus
                    status={agentStatus}
                    currentStep={currentTool?.name ? `🔧 ${currentTool.name}: ${currentTool.input.slice(0, 50)}` : undefined}
                    progress={currentStepProgress || undefined}
                  />
                )}

                {msg.role === 'assistant' && currentSteps.length > 0 && i === messages.length - 1 && (
                  <TaskProgress steps={currentSteps} currentStep={0} totalSteps={currentSteps.length} />
                )}

                {msg.role === 'assistant' && currentTool && i === messages.length - 1 && (
                  <ToolUsageCard
                    toolName={currentTool.name}
                    input={currentTool.input}
                    output={undefined}
                    status={currentTool.status as any}
                  />
                )}

                {msg.role === 'assistant' && i === messages.length - 1 && isStreaming && !msg.content && (
                  <ThinkingAnimation visible text="AIAGENT يعمل على طلبك" />
                )}

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content || (msg.role === 'user' ? msg.content : '')}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800/30">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
              {validationError && (
                <p id="agent-request-error" data-testid="agent-request-error" className="text-xs text-red-400 font-medium mr-1 mb-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationError}
                </p>
              )}
              <textarea
              data-testid="agent-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (validationError) setValidationError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.startsWith('image/')) {
                    e.preventDefault();
                    return;
                  }
                }
              }}
              placeholder="اكتب طلبك لـ AIAGENT..."
              aria-required="true"
              aria-invalid={validationError ? 'true' : 'false'}
              aria-describedby={validationError ? 'agent-request-error' : undefined}
              rows={1}
              className="w-full bg-surface-tertiary border border-zinc-800/30 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-king-500/30 focus:border-king-500/30 resize-none"
              disabled={isStreaming}
            />
          </div>
          <div className="flex gap-2">
            {isStreaming ? (
              <button
                data-testid="agent-stop"
                type="button"
                onClick={stopGeneration}
                className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                ⏹ إيقاف
              </button>
            ) : (
              <button
                data-testid="agent-submit"
                type="submit"
                className="px-4 py-3 rounded-xl bg-king-600 hover:bg-king-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white"
              >
                ➤ إرسال
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
