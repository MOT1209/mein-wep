import { z } from 'zod';

export const createVocabularySchema = z.object({
  body: z.object({
    word: z.string().min(1).max(200),
    translation: z.string().min(1).max(200),
    phonetic: z.string().max(200).default(''),
    category: z.string().max(100).default('General'),
    exampleSentence: z.string().optional(),
    exampleTranslation: z.string().optional(),
    audioUrl: z.string().url().optional(),
  }),
  params: z.object({
    langCode: z.string(),
  }),
});

export const createFlashcardSchema = z.object({
  body: z.object({
    frontWord: z.string().min(1).max(200),
    backTranslation: z.string().min(1).max(200),
    exampleSentence: z.string().optional(),
    phonetic: z.string().max(200).default(''),
  }),
  params: z.object({
    langCode: z.string(),
  }),
});
