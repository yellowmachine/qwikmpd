import * as v from 'valibot';
import setup from '~/routes/setup';

const IPRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export const Host = v.object({
  ip: v.string(),
});

export const SettingsSchema = v.object({
  server: Host,
  clients: v.array(Host),
  volume: v.number(),
  latency: v.number(),
  setupDone: v.boolean(),
});

export type SettingsForm = v.InferInput<typeof SettingsSchema>;
