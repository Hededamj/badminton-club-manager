import { z } from 'zod'

export const tournamentFormats = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
] as const

export const tournamentMatchTypes = [
  'MENS_DOUBLES',
  'WOMENS_DOUBLES',
  'MIXED_DOUBLES',
  'SINGLES',
] as const

export const createTournamentSchema = z.object({
  name: z.string().min(1, 'Navn er påkrævet'),
  startDate: z.string().min(1, 'Startdato er påkrævet'),
  endDate: z.string().optional(),
  format: z.enum(tournamentFormats),
  matchTypes: z.array(z.enum(tournamentMatchTypes)).min(1, 'Vælg mindst én kamptype'),
  description: z.string().optional(),
}).refine(
  (data) => {
    // Validate that SINGLES cannot be combined with doubles types
    const hasSingles = data.matchTypes.includes('SINGLES')
    const hasDoubles = data.matchTypes.some(t =>
      t === 'MENS_DOUBLES' || t === 'WOMENS_DOUBLES' || t === 'MIXED_DOUBLES'
    )
    return !(hasSingles && hasDoubles)
  },
  {
    message: 'Single kan ikke kombineres med double-typer (HD, DD, MD)',
    path: ['matchTypes'],
  }
)

export const updateTournamentSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(tournamentFormats).optional(),
  matchTypes: z.array(z.enum(tournamentMatchTypes)).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().optional(),
})

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>
