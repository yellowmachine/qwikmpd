import { component$ } from '@builder.io/qwik';
import { type RequestEventLoader, routeLoader$ } from '@builder.io/qwik-city';
import ListClientVolume from '~/components/volume/ListClientVolume';
import type { SnapcastClient } from '~/lib/types';

function mapClient(client: SnapcastClient): { id: string; name: string; initialVolume: number } {
    return {
      id: client.id,
      name: client.id,
      initialVolume: client.config.volume.percent,
    };
}

export const useSnapClients = routeLoader$<{ id: string; name: string; initialVolume: number }[]>(async (event: RequestEventLoader) => {
    const snapserverUrl = event.env.get('SNAPSERVER_URL') || 'snapserver';

    const res = await fetch(`http://${snapserverUrl}:1780/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "Server.GetStatus"
      })
    });
  
    const data = await res.json();
  
    const clients = data.result?.server?.groups
      ?.flatMap((group: any) => group.clients)
      .filter((client: any) => client.connected)
      ?? [];
  
    return clients.map(mapClient);
  });

export default component$(() => {
    const clients = useSnapClients();
  
    return (
      <div>
        <h2 class="text-2xl mb-6 text-brand-500">Clientes Snapcast</h2>
        <ListClientVolume clients={clients.value} />
      </div>
    );
  });