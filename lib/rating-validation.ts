import { z } from 'zod';

export const ratingSubmissionSchema = z.object({
  ratings: z.array(z.object({
    ratingCategoryId: z.number(),
    score: z.number().min(1).max(5),
    severity: z.number().min(1).max(5),
    evidence: z.string().min(10).max(1000),
  })).min(1),
  evidence: z.string().min(10).max(2000),
});

export const validateRatingSubmission = (data: unknown) => {
  try {
    return { data: ratingSubmissionSchema.parse(data), error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        data: null, 
        error: error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message
        }))
      };
    }
    return { data: null, error: ['Invalid submission'] };
  }
};