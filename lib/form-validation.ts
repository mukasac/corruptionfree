import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schemas
const ratingFormSchema = z.object({
  ratings: z.array(z.object({
    categoryId: z.number(),
    score: z.number().min(1).max(5),
    evidence: z.string().min(10)
  })).min(1),
  generalEvidence: z.string().min(20)
});

const nomineeFormSchema = z.object({
  name: z.string().min(2),
  position: z.string(),
  institution: z.string(),
  district: z.string(),
  evidence: z.string().min(20)
});

// Form hooks
export function useRatingForm() {
  return useForm({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      ratings: [],
      generalEvidence: ''
    }
  });
}

export function useNomineeForm() {
  return useForm({
    resolver: zodResolver(nomineeFormSchema),
    defaultValues: {
      name: '',
      position: '',
      institution: '',
      district: '',
      evidence: ''
    }
  });
}

// Form components
export function FormError({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 mt-1">{message}</p>
  );
}

export function FormField({ 
  label, 
  error, 
  children 
}: { 
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {children}
      </label>
      {error && <FormError message={error} />}
    </div>
  );
}