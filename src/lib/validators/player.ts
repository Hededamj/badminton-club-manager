import { z } from 'zod'

export const createPlayerSchema = z.object({
  name: z.string().min(2, 'Navn skal være mindst 2 tegn').max(255, 'Navn må højst være 255 tegn'),
  email: z.string().email('Ugyldig email').optional().or(z.literal('')),
  phone: z.string().max(20, 'Telefonnummer må højst være 20 tegn').optional().or(z.literal('')),
  holdsportId: z.string().max(255).optional().or(z.literal('')),
  level: z.number().min(0, 'Niveau skal være mindst 0').max(5000, 'Niveau må højst være 5000').default(1500),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  isActive: z.boolean().default(true),
})

export const updatePlayerSchema = createPlayerSchema.partial()

export const importPlayersSchema = z.object({
  playerData: z.string().min(1, 'Indsæt spillerdata fra Holdsport'),
})

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>
export type ImportPlayersInput = z.infer<typeof importPlayersSchema>
