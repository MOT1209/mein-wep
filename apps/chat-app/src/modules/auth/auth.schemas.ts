import { z } from 'zod';

export const USERNAME_RE = /^[a-z0-9_]{3,32}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_RE, 'Use 3-32 lowercase letters, numbers or underscores.');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.');

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(255),
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(64).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email or username.')
    .max(255),
  password: z.string().min(1, 'Enter your password.').max(72),
});
export type LoginInput = z.infer<typeof loginSchema>;
