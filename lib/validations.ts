import { z } from 'zod';

export const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  evidence: z.string().min(10),
  severity: z.number().min(1).max(5),
  ratingCategoryId: z.number(),
  userId: z.number()
});

export const commentSchema = z.object({
  content: z.string().min(3).max(1000),
  userId: z.number(),
  nomineeId: z.number().optional(),
  institutionId: z.number().optional()
});

export const searchSchema = z.object({
  query: z.string().min(2),
  type: z.enum(['all', 'nominees', 'institutions']).optional()
});

export const nomineeSchema = z.object({
  name: z.string().min(2),
  positionId: z.number(),
  institutionId: z.number(),
  districtId: z.number(),
  evidence: z.string().min(10),
  ratings: z.array(ratingSchema)
});