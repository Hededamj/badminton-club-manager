import { z } from 'zod'

export const tournamentFormats = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
] as const

export const createTournamentSchema = z.object({
  name: z.string().min(1, 'Navn er påkrævet'),
  startDate: z.string().min(1, 'Startdato er påkrævet'),
  endDate: z.string().optional(),
  format: z.enum(tournamentFormats),
  description: z.string().optional(),
})

export const updateTournamentSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(tournamentFormats).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().optional(),
})

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>
