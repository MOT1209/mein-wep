export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  is_disabled: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SearchUserRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  last_seen_at: Date | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  deleted_at: Date | null;
  created_at: Date;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername?: string;
  body: string | null;
  status: 'sent' | 'delivered' | 'read';
  deleted: boolean;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  type: 'private' | 'group';
  createdAt: string;
  participant: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: string | null;
  };
  lastMessage: MessageDto | null;
  unreadCount: number;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  expiresIn: number;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at.toISOString(),
  };
}

export function toPublicProfile(row: SearchUserRow): Omit<PublicUser, 'email' | 'createdAt'> & {
  isOnline: boolean;
  lastSeenAt: string | null;
} {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: null,
    avatarUrl: row.avatar_url,
    isOnline: false,
    lastSeenAt: row.last_seen_at ? row.last_seen_at.toISOString() : null,
  };
}
