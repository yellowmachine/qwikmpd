import * as v from 'valibot';

export const Host = v.object({
  ip: v.pipe(
    v.string(),
    v.nonEmpty('Please enter server IP.'),
    v.ip(),
  ),
  username: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your username.'),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.'),
  ),
});

export const settingsSchema = v.object({
  server: Host,
  clients: v.array(
    Host
  ),
  global: v.object({
    latency: v.pipe(v.number(), v.minValue(0, "Latencia debe ser positiva"))
  })
});

export type Settings = v.InferInput<typeof settingsSchema>;
