import { many, one, withTransaction } from '../../config/db.js';
import { errors } from '../../lib/errors.js';
import { isOnline } from '../../realtime/presence.js';
import type { ConversationDto, MessageDto } from '../../types/index.js';
import type {
  CreateConversationInput,
  MessagesQuery,
  SendMessageInput,
} from './conversations.schemas.js';

export interface MessageRecord extends MessageDto {
  senderUsername: string;
}

export interface MemberInfo {
  conversationId: string;
  participantIds: string[];
  /** the other participant (private chat) */
  otherUserId: string;
}

/**
 * Selects a message for a given viewer and derives its delivery status.
 * `mine`/`other` are the viewer's own read pointer and the counterpart's
 * read/delivered pointers — ticks are always evaluated for the sender.
 *
 * Note: designed for `type = 'private'` (exactly two participants). Group
 * chats will need per-message read receipts instead of a single pointer.
 */
const MESSAGE_SELECT = `
  select m.id, m.conversation_id, m.sender_id, m.body, m.deleted_at, m.created_at,
         u.username as sender_username,
         case
           when m.sender_id = $2 then
             case
               when other.last_read_at is not null and m.created_at <= other.last_read_at then 'read'
               when other.last_delivered_at is not null and m.created_at <= other.last_delivered_at then 'delivered'
               else 'sent'
             end
           else
             case
               when mine.last_read_at is not null and m.created_at <= mine.last_read_at then 'read'
               else 'delivered'
             end
         end as status
    from messages m
    join users u on u.id = m.sender_id
    join conversation_participants mine
      on mine.conversation_id = m.conversation_id and mine.user_id = $2
    left join conversation_participants other
      on other.conversation_id = m.conversation_id and other.user_id <> $2
`;

function mapMessage(row: Record<string, unknown>): MessageRecord {
  const deleted = row.deleted_at !== null;
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderId: String(row.sender_id),
    senderUsername: String(row.sender_username),
    body: deleted ? null : String(row.body),
    status: (row.status as MessageDto['status']) ?? 'sent',
    deleted,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

/** Authorize a conversation for a user and return both participant ids. */
export async function assertMember(conversationId: string, userId: string): Promise<MemberInfo> {
  const rows = await many<{ user_id: string }>(
    'select user_id from conversation_participants where conversation_id = $1',
    [conversationId],
  );
  // 404 rather than 403 so foreign conversation ids cannot be probed.
  if (rows.length === 0) throw errors.notFound('Conversation not found.');
  const participantIds = rows.map((r) => r.user_id);
  if (!participantIds.includes(userId)) throw errors.notFound('Conversation not found.');

  const otherUserId = participantIds.find((id) => id !== userId);
  if (!otherUserId) throw errors.notFound('Conversation not found.');
  return { conversationId, participantIds, otherUserId };
}

export async function createPrivate(
  viewerId: string,
  input: CreateConversationInput,
): Promise<{ conversation: ConversationDto; created: boolean }> {
  if (input.recipientId === viewerId) {
    throw errors.validation('You cannot start a conversation with yourself.');
  }

  const recipient = await one<{ id: string; is_disabled: boolean }>(
    'select id, is_disabled from users where id = $1',
    [input.recipientId],
  );
  if (!recipient || recipient.is_disabled) throw errors.notFound('User not found.');

  const [a, b] =
    viewerId < input.recipientId ? [viewerId, input.recipientId] : [input.recipientId, viewerId];
  const directKey = `${a}:${b}`;

  const existing = await one<{ id: string }>(
    'select id from conversations where direct_key = $1',
    [directKey],
  );
  if (existing) {
    return { conversation: await getForViewer(existing.id, viewerId), created: false };
  }

  const conversationId = await withTransaction(async (client) => {
    const inserted = await client.query<{ id: string }>(
      // The unique index on direct_key is partial, so the predicate must be
      // repeated here or Postgres refuses to infer it.
      `insert into conversations (type, direct_key) values ('private', $1)
       on conflict (direct_key) where direct_key is not null do nothing
       returning id`,
      [directKey],
    );
    const id = inserted.rows[0]?.id;
    if (!id) {
      const raced = await client.query<{ id: string }>(
        'select id from conversations where direct_key = $1',
        [directKey],
      );
      const racedId = raced.rows[0]?.id;
      if (!racedId) throw errors.internal('Could not create conversation.');
      return racedId;
    }
    await client.query(
      `insert into conversation_participants (conversation_id, user_id)
       values ($1, $2), ($1, $3)`,
      [id, viewerId, input.recipientId],
    );
    return id;
  });

  return { conversation: await getForViewer(conversationId, viewerId), created: true };
}

export async function list(viewerId: string, limit: number): Promise<ConversationDto[]> {
  const rows = await many<Record<string, unknown>>(
    `select c.id, c.type, c.created_at,
            u.id as p_id, u.username as p_username, u.display_name as p_display_name,
            u.avatar_url as p_avatar_url, u.last_seen_at as p_last_seen_at,
            lm.id as lm_id, lm.conversation_id as lm_conversation_id, lm.sender_id as lm_sender_id,
            lm.body as lm_body, lm.deleted_at as lm_deleted_at, lm.created_at as lm_created_at,
            coalesce(lm.sender_username, '') as lm_sender_username,
            (select count(*)::int from messages m
              where m.conversation_id = c.id
                and m.sender_id <> $1
                and m.created_at > coalesce(cp.last_read_at, timestamptz '-infinity')
            ) as unread_count
       from conversations c
       join conversation_participants cp
         on cp.conversation_id = c.id and cp.user_id = $1
       join conversation_participants other
         on other.conversation_id = c.id and other.user_id <> $1
       join users u on u.id = other.user_id
       left join lateral (
         select m.*, su.username as sender_username
           from messages m
           join users su on su.id = m.sender_id
          where m.conversation_id = c.id
          order by m.created_at desc, m.id desc
          limit 1
       ) lm on true
      order by coalesce(lm.created_at, c.created_at) desc, c.id
      limit $2`,
    [viewerId, limit],
  );

  return rows.map((row) => ({
    id: String(row.id),
    type: row.type as 'private' | 'group',
    createdAt: new Date(row.created_at as string).toISOString(),
    participant: {
      id: String(row.p_id),
      username: String(row.p_username),
      displayName: String(row.p_display_name),
      avatarUrl: (row.p_avatar_url as string | null) ?? null,
      isOnline: isOnline(String(row.p_id)),
      lastSeenAt: row.p_last_seen_at
        ? new Date(row.p_last_seen_at as string).toISOString()
        : null,
    },
    lastMessage: row.lm_id
      ? {
          id: String(row.lm_id),
          conversationId: String(row.lm_conversation_id),
          senderId: String(row.lm_sender_id),
          senderUsername: String(row.lm_sender_username),
          body: row.lm_deleted_at ? null : String(row.lm_body),
          status: 'sent' as const,
          deleted: row.lm_deleted_at !== null,
          createdAt: new Date(row.lm_created_at as string).toISOString(),
        }
      : null,
    unreadCount: Number(row.unread_count ?? 0),
  }));
}

export async function getForViewer(
  conversationId: string,
  viewerId: string,
): Promise<ConversationDto> {
  await assertMember(conversationId, viewerId);
  const found = (await list(viewerId, 100)).find((c) => c.id === conversationId);
  if (!found) throw errors.notFound('Conversation not found.');
  return found;
}

/** Advances the viewer's delivered pointer up to `upto` (defaults to now). */
export async function markDelivered(
  viewerId: string,
  conversationId: string,
  upto?: string,
): Promise<void> {
  await one(
    `update conversation_participants
        set last_delivered_at = greatest(
              coalesce(last_delivered_at, timestamptz '-infinity'),
              coalesce($3::timestamptz, now())
            )
      where conversation_id = $1 and user_id = $2`,
    [conversationId, viewerId, upto ?? null],
  );
}

/**
 * Advances the viewer's delivered pointer to an exact message timestamp.
 * Used after a fetch so the comparison keeps PostgreSQL's microsecond
 * precision — ISO strings coming back from JavaScript are millisecond-precision
 * and would round *down*, leaving freshly read messages stuck on "sent".
 */
async function markDeliveredUpToMessage(
  viewerId: string,
  conversationId: string,
  messageId: string,
): Promise<void> {
  await one(
    `update conversation_participants cp
        set last_delivered_at = greatest(
              coalesce(cp.last_delivered_at, timestamptz '-infinity'),
              m.created_at
            )
       from messages m
      where m.id = $3
        and m.conversation_id = cp.conversation_id
        and cp.conversation_id = $1
        and cp.user_id = $2`,
    [conversationId, viewerId, messageId],
  );
}

export async function getMessages(
  viewerId: string,
  conversationId: string,
  query: MessagesQuery,
): Promise<{ messages: MessageRecord[]; hasMore: boolean }> {
  await assertMember(conversationId, viewerId);

  // An unknown cursor (purged/expired message) is treated as "no cursor".
  let beforeIso: string | null = null;
  if (query.before) {
    const cursor = await one<{ created_at: Date }>(
      'select created_at from messages where id = $1 and conversation_id = $2',
      [query.before, conversationId],
    );
    beforeIso = cursor ? cursor.created_at.toISOString() : null;
  }

  const rows = await many<Record<string, unknown>>(
    `${MESSAGE_SELECT}
      where m.conversation_id = $1
        and ($3::timestamptz is null or (m.created_at, m.id) < ($3::timestamptz, $5::uuid))
      order by m.created_at desc, m.id desc
      limit $4`,
    [conversationId, viewerId, beforeIso, query.limit + 1, query.before ?? null],
  );

  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;
  const messages = page.reverse().map(mapMessage);

  const newest = messages.at(-1);
  if (newest) await markDeliveredUpToMessage(viewerId, conversationId, newest.id);

  return { messages, hasMore };
}

export async function createMessage(
  viewerId: string,
  conversationId: string,
  input: SendMessageInput,
): Promise<{ message: MessageRecord; participantIds: string[] }> {
  const { participantIds } = await assertMember(conversationId, viewerId);

  const inserted = await one<{ id: string }>(
    `insert into messages (conversation_id, sender_id, body)
     values ($1, $2, $3)
     returning id`,
    [conversationId, viewerId, input.body],
  );
  if (!inserted) throw errors.internal('Could not save message.');

  const saved = await one<Record<string, unknown>>(
    `${MESSAGE_SELECT} where m.conversation_id = $1 and m.id = $3`,
    [conversationId, viewerId, inserted.id],
  );
  if (!saved) throw errors.internal('Could not load message.');
  return { message: mapMessage(saved), participantIds };
}

export async function markRead(
  viewerId: string,
  conversationId: string,
  lastReadMessageId?: string,
): Promise<{ lastReadAt: string; participantIds: string[]; otherUserId: string }> {
  const { participantIds, otherUserId } = await assertMember(conversationId, viewerId);

  if (lastReadMessageId) {
    const owned = await one<{ id: string }>(
      'select id from messages where id = $1 and conversation_id = $2',
      [lastReadMessageId, conversationId],
    );
    if (!owned) throw errors.notFound('Message not found.');
  }

  const row = await one<{ last_read_at: Date }>(
    `update conversation_participants
        set last_read_at = now(),
            last_read_message_id = coalesce($3::uuid, last_read_message_id)
      where conversation_id = $1 and user_id = $2
      returning last_read_at`,
    [conversationId, viewerId, lastReadMessageId ?? null],
  );
  if (!row) throw errors.notFound('Conversation not found.');

  return { lastReadAt: row.last_read_at.toISOString(), participantIds, otherUserId };
}

export async function deleteMessage(
  viewerId: string,
  messageId: string,
): Promise<{ conversationId: string; messageId: string; deletedAt: string; participantIds: string[] }> {
  const existing = await one<{ conversation_id: string; sender_id: string }>(
    'select conversation_id, sender_id from messages where id = $1',
    [messageId],
  );
  if (!existing) throw errors.notFound('Message not found.');
  if (existing.sender_id !== viewerId) {
    throw errors.forbidden('You can only delete your own messages.');
  }

  const { participantIds } = await assertMember(existing.conversation_id, viewerId);
  const row = await one<{ deleted_at: Date }>(
    'update messages set deleted_at = now() where id = $1 and deleted_at is null returning deleted_at',
    [messageId],
  );
  if (!row) throw errors.notFound('Message not found.');

  return {
    conversationId: existing.conversation_id,
    messageId,
    deletedAt: row.deleted_at.toISOString(),
    participantIds,
  };
}
