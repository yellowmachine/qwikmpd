import * as v from 'valibot';

export const Host = v.object({
  ip: v.pipe(
    v.string(),
    v.nonEmpty('Please enter server IP.'),
    v.ip(),
  )
});

export const SetupSchema = v.object({
  server: Host
});

export type SetupForm = v.InferInput<typeof SetupSchema>;
