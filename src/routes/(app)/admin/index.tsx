import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { type InitialValues } from '@modular-forms/qwik';
import Admin from '~/components/admin/Admin';
import { type SettingsForm } from '~/lib/schemas';
import { getDb } from '~/server/db';

export const useSettingsLoader = routeLoader$<InitialValues<SettingsForm>>(async () => {
  return {
    clients: [],
    server: {
      ip: '192.168.1.56',
    },
    setupDone: true,
    volume: 50,
    latency: 100
  }
  const db = await getDb();
  return await db.getData();
});

export default component$(() => {
  return <Admin />;
});