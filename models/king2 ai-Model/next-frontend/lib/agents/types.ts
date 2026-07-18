// =============================================================================
// KING2 AI — SABAgent Types
// =============================================================================

export type AgentStatus =
  | 'idle'
  | 'loading_memory'
  | 'planning'
  | 'thinking'
  | 'executing_tool'
  | 'analyzing'
  | 'generating_answer'
  | 'error'
  | 'done'
  | 'cancelled';

export interface AgentStep {
  id: string;
  type: 'reason' | 'plan' | 'tool_call' | 'tool_result' | 'analysis' | 'final_answer';
  content: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface AgentPlan {
  goal: string;
  steps: {
    step: number;
    action: string;
    tool?: string | null;
    expectedOutcome: string;
  }[];
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (args: any) => Promise<string>;
  /** Whether this tool can be executed in parallel with other tools */
  parallelSafe?: boolean;
  /** Estimated max execution time in ms (for timeout calculation) */
  timeout?: number;
}

export interface ToolCall {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCallId?: string;
  toolName?: string;
}

export interface AgentContext {
  userId: string;
  conversationId?: string;
  preferences?: {
    language?: string;
    creativity?: number;
    maxSteps?: number;
  };
  memory?: {
    shortTerm: AgentMessage[];
    longTerm: string[];
    preferences: Record<string, any>;
  };
}

export interface AgentConfig {
  maxSteps: number;
  model: string;
  temperature: number;
  streaming: boolean;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  maxSteps: 10,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  streaming: true,
};

// ── Streaming Event Types ─────────────────────────────────────────────

export type AgentEventType =
  | 'status'
  | 'text'
  | 'step_start'
  | 'step_update'
  | 'step_end'
  | 'tool_call'
  | 'tool_result'
  | 'error'
  | 'done'
  | 'plan';

export interface AgentEvent {
  type: AgentEventType;
  content: any;
  timestamp: string;
}

// ── Tool Execution Result ─────────────────────────────────────────────

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
  toolName: string;
}
