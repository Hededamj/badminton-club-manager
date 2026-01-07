import { z } from 'zod'

export const createTrainingSchema = z.object({
  name: z.string().min(1, 'Navn er påkrævet'),
  date: z.string().min(1, 'Dato er påkrævet'),
  startTime: z.string().optional(),
  courts: z.number().min(1, 'Mindst 1 bane påkrævet').max(10, 'Maksimum 10 baner').default(6),
  matchesPerCourt: z.number().min(1).max(10).default(3),
  playerIds: z.array(z.string()).min(4, 'Mindst 4 spillere påkrævet'),
})

export const updateTrainingSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  courts: z.number().min(1).max(10).optional(),
  matchesPerCourt: z.number().min(1).max(10).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>
