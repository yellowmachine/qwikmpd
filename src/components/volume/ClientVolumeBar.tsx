import { $, component$, useSignal, useStore } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

const setVolume = server$(async function (clientId: string, percent: number){
  const snapserverUrl = this.env.get('SNAPSERVER_URL') || 'snapserver';
  
  await fetch(`http://${snapserverUrl}:1780/jsonrpc`, {
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
    const debounceStore = useStore({ timeoutId: undefined as any });
    
    const debouncedSetVolume = $(async (newVolume: number) => {
      if (debounceStore.timeoutId) {
        clearTimeout(debounceStore.timeoutId);
      }
      debounceStore.timeoutId = setTimeout(async () => {
        await setVolume(clientId, newVolume);
      }, 50);
    });


    const onInput = $(async (event: Event) => {
        const newVolume = Number((event.target as HTMLInputElement).value);
        internalVolume.value = newVolume;
        await debouncedSetVolume(newVolume);
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
                class="w-full h-2 bg-brand-200 accent-orange-500 rounded-lg appearance-none cursor-pointer"
                onInput$={onInput}
                onChange$={onChange}
            />
            <span class="text-sm w-8 text-right text-brand-500">{internalVolume.value}%</span>
        </div>
    );
});
