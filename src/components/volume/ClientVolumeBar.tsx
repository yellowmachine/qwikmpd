import { $, component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

// Puedes adaptar esto a tu backend, aquí te muestro cómo sería la llamada fetch
const setVolume = server$(async (clientId: string, percent: number) => {
  await fetch('http://snapserver.casa:1780/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "Client.SetVolume",
      params: {
        id: clientId,
        volume: { percent }
      }
    })
  });
});

export interface VolumeBarProps {
    volume: number;
    clientId: string;
}

export default component$(({ volume, clientId }: VolumeBarProps) => {

    const internalVolume = useSignal(volume);

    const onInput = $(async (event: Event) => {
        internalVolume.value = Number((event.target as HTMLInputElement).value);
    });

    const onChange = $(async (event: Event) => {
        const newVolume = Number((event.target as HTMLInputElement).value);
        await setVolume(clientId, newVolume);
    });

    return (
        <div class="w-full flex items-center gap-2">
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={internalVolume.value}
                class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-500"
                onInput$={onInput}
                onChange$={onChange}
            />
            <span class="text-xs w-8 text-right">{internalVolume.value}%</span>
        </div>
    );
});
