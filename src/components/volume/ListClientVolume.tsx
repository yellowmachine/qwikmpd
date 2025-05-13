import { component$ } from "@builder.io/qwik";
import ClientVolumeBar from "./ClientVolumeBar";

export interface ListClientVolumeProps {
    clients: { id: string, name: string, initialVolume: number }[]
}

export default component$(({clients}: ListClientVolumeProps) => {

  return (
    <div>
      {clients.map((client) => (
        <div key={client.id} class="mb-4">
          <div class="font-bold mb-1">{client.name}</div>
          <ClientVolumeBar volume={client.initialVolume} clientId={client.id} />
        </div>
      ))}
    </div>
  );
});
