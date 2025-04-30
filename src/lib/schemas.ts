// src/lib/schemas.ts
import { z } from 'zod';

export const SetupSchema = z.object({
  ip: z.string().min(1, 'IP es requerida'),
  username: z.string().min(1, 'Usuario es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});


export type SetupForm = z.infer<typeof SetupSchema>;