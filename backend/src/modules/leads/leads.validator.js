import { z } from 'zod';

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required').optional().or(z.literal('')),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    title: z.string().optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted']).optional(),
    source: z.enum(['website', 'referral', 'cold_call', 'social', 'advertisement', 'event', 'other']).optional(),
    leadScore: z.number().optional(),
    estimatedValue: z.number().optional(),
    notes: z.string().optional(),
    owner: z.string().optional()
  })
});
