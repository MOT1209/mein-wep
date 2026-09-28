import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(64).optional(),
    bio: z.string().trim().max(160).nullable().optional(),
    avatarUrl: z
      .string()
      .trim()
      .max(500)
      .refine(
        (v) => v === '' || v.startsWith('https://') || v.startsWith('/') || v.startsWith('http://'),
        'Avatar must be an absolute URL or a path starting with "/".',
      )
      .nullable()
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update.');
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const searchSchema = z.object({
  q: z.string().trim().min(1, 'Search term is required.').max(64),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SearchInput = z.infer<typeof searchSchema>;

export const usernameParamSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(32),
});
