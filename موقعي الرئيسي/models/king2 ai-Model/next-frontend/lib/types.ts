export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string | null;
  type: 'PRIVATE' | 'GROUP' | 'CHANNEL';
  isPinned: boolean;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  username: string | null;
  role: 'USER' | 'PREMIUM' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content: string;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  model?: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  provider: string;
  error?: string;
}
