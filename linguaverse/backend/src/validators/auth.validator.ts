import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100),
    nativeLanguageCode: z.string().max(10).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});
