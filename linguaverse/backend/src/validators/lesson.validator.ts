import { z } from 'zod';

export const createLanguageSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(10),
    name: z.string().min(1).max(100),
    nativeName: z.string().min(1).max(100),
    direction: z.enum(['LTR', 'RTL']).default('LTR'),
    status: z.enum(['active', 'beta', 'planned', 'archived']).default('active'),
    flagEmoji: z.string().max(10).optional(),
  }),
});

export const createUnitSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(20),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    sortOrder: z.number().int().min(0).default(0),
  }),
  params: z.object({
    langCode: z.string(),
    levelCode: z.string(),
  }),
});

export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    category: z.string().max(100).optional(),
    xpReward: z.number().int().min(1).default(20),
    orderIndex: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(false),
    coverImageUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
  params: z.object({
    unitId: z.string().uuid(),
  }),
});

export const createExerciseSchema = z.object({
  body: z.object({
    type: z.enum([
      'vocabulary', 'grammar', 'listening', 'reading',
      'writing', 'speaking', 'conversation', 'quiz', 'flashcard',
    ]),
    prompt: z.string().min(1),
    targetText: z.string().default(''),
    correctAnswer: z.string().default(''),
    optionsJson: z.any().default([]),
    explanation: z.string().default(''),
    phoneticText: z.string().default(''),
    audioUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    passageText: z.string().optional(),
    sortOrder: z.number().int().min(0).default(0),
    xpReward: z.number().int().min(1).default(10),
    isPublished: z.boolean().default(false),
  }),
  params: z.object({
    lessonId: z.string().uuid(),
  }),
});
