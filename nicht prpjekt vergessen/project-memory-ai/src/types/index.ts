export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Studio Types
export type StudioTab = 'video' | 'thumbnail' | 'factory' | 'audio';

export interface AudioSettings {
  voiceId: string;
  stability: number;
  similarity: number;
}

export interface AudioHistoryItem {
  url: string;
  text: string;
  voiceName: string;
  timestamp: number;
  duration?: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'video' | 'thumbnail' | 'audio' | 'text';
  url?: string;
  content?: string;
  prompt: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface VideoLayer {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  label: string;
  active: boolean;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

export interface VideoTimeline {
  duration: number;
  currentTime: number;
  layers: VideoLayer[];
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  updated_at: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  github_url?: string;
  website_url?: string;
  status: ProjectStatus;
  color: string;
  local_path?: string;
  last_activity: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Activity {
  id: string;
  project_id: string;
  action: string;
  entity_type: 'task' | 'note' | 'file' | 'project';
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// OpenRouter Types
export type OpenRouterType = 'chat' | 'image' | 'video';
export type OpenRouterModel = 
  | 'gemma-4-27b-at'
  | 'gemma-4-27b'
  | 'claude-3.5-sonnet'
  | 'gpt-4o'
  | 'stabilityai/sd-xl'
  | 'runway-gen-2';

export interface OpenRouterRequest {
  prompt: string;
  model?: OpenRouterModel;
  type: OpenRouterType;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterModelInfo {
  id: string;
  name: string;
  description: string;
}
