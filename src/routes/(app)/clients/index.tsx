import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import ListClientVolume from '~/components/volume/ListClientVolume';

export interface SnapcastClient {
    config: {
      instance: number;
      latency: number;
      name: string;
      volume: {
        muted: boolean;
        percent: number;
      };
    };
    connected: boolean;
    host: {
      arch: string;
      ip: string;
      mac: string;
      name: string;
      os: string;
    };
    id: string;
    lastSeen: {
      sec: number;
      usec: number;
    };
    snapclient: {
      name: string;
      protocolVersion: number;
      version: string;
    };
  }


export function mapClient(client: SnapcastClient): { id: string; name: string; initialVolume: number } {
    return {
      id: client.id,
      name: client.id, // El id será "arriba" si usaste -n arriba
      initialVolume: client.config.volume.percent,
    };
  }
export const useSnapClients = routeLoader$<SnapcastClient[]>(async () => {
    const res = await fetch('http://snapserver.casa:1780/jsonrpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "Server.GetStatus"
      })
    });
  
    const data = await res.json();
  
    // Extrae y filtra solo los clientes conectados
    const clients = data.result?.server?.groups
      ?.flatMap((group: any) => group.clients)
      .filter((client: any) => client.connected)
      ?? [];
  
    return clients;
  });

export default component$(() => {
    const clients = useSnapClients();
  
    return (
      <div>
        <h2 class="text-2xl mb-6 text-brand-500">Clientes Snapcast</h2>
        <ListClientVolume clients={clients.value.map(mapClient)} />
      </div>
    );
  });