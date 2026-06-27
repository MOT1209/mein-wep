// User-facing model picker options. The `id` maps to backend providers
// resolved in lib/models.ts (resolveProvider). Keep ids in sync with that file.

export interface ChatModelOption {
  id: string;
  name: string;
  desc: string;
  badge?: string;
  vision?: boolean;
}

export const CHAT_MODELS: ChatModelOption[] = [
  { id: 'auto', name: 'KING2 تلقائي', desc: 'يختار أفضل نموذج لكل سؤال', badge: 'موصى به' },
  { id: 'opencode-zen', name: 'OpenCode Zen', desc: 'Claude / GPT / Gemini — جودة عالية', badge: 'الأقوى' },
  { id: 'gemini', name: 'Gemini 2.5 Flash', desc: 'قوي ويفهم الصور', badge: 'رؤية', vision: true },
  { id: 'groq', name: 'Groq Llama', desc: 'استجابة فائقة السرعة', badge: 'سريع' },
  { id: 'openrouter', name: 'GLM 4.5 Air', desc: 'إبداعي ومتوازن' },
];

export function getChatModel(id: string): ChatModelOption {
  return CHAT_MODELS.find((m) => m.id === id) ?? CHAT_MODELS[0];
}
