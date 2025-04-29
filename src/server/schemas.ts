import { z } from 'zod';

const passwordField = z.string().optional() //.nullable()
  .transform(val => val === "" || val === undefined ? null : val)
  .nullable()
  .refine(val => val === null || val.length > 0, "Contraseña obligatoria");

export const hostSchema = z.object({
  ip: z.string().ip().min(1, "IP obligatoria"),
  username: z.string().min(1, "Usuario obligatorio"),
  password: z.string().min(1, "Password obligatorio")
})

export const settingsSchema = z.object({
  server: z.object({
    ip: z.string().ip().min(1, "IP obligatoria"),
    username: z.string().min(1, "Usuario obligatorio"),
    password: passwordField
  }),
  clients: z.array(
    z.object({
      ip: z.string().min(1, "IP obligatoria"),
      username: z.string().min(1, "Usuario obligatorio"),
      password: passwordField
    })
  ),
  global: z.object({
    latency: z.number().min(0, "Latencia debe ser positiva")
  })
});

export type Settings = z.infer<typeof settingsSchema>;

type ServerWithPassword = Omit<Settings['server'], 'password'> & { password: string };
type ClientWithPassword = Omit<Settings['clients'][number], 'password'> & { password: string };

export type SettingsWithPassword = Omit<Settings, 'server' | 'clients'> & {
  server: ServerWithPassword;
  clients: ClientWithPassword[];
};
