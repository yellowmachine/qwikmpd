import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$, useStore } from "@builder.io/qwik";
import { server$, type RequestHandler } from "@builder.io/qwik-city";
import { type StatusData, type QueueData, getMpdClient } from "~/server/mpd";


export const streamFromServer = server$(async function* () {
  const mpd = await getMpdClient(this);

  for await (const msg of await mpd.subscribe()) {
    yield msg;
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  
  const isConnected = useSignal(false);
  const reconnectAttempts = useSignal(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useSignal(false);
  const response = useSignal<ReturnType<typeof streamFromServer> | null>(null);

  const state = useStore<Partial<StatusData>>({volume: 5, state: 'pause'});
  const queue = useStore<QueueData>({queue: [], currentSong: ''});

  const connectToStream = $(async () => {

    if (isConnecting.value) return; // Evitar conexiones simultáneas
    isConnecting.value = true;

    try {
      console.log('Iniciando stream...');
      response.value = streamFromServer();

      isConnected.value = true;
      reconnectAttempts.value = 0;

      for await (const value of await response.value) {
        if(value.type === 'status') {
            state.volume = value.data.volume;
            state.state = value.data.state;
        }else if(value.type === 'queue') {
            queue.queue = value.data.queue;
            queue.currentSong = value.data.currentSong;
        }
      }
    } catch (error) {
      console.error('Error en stream:', error);
      isConnected.value = false;
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        handleReconnect();
      }
    } finally {
      isConnecting.value = false;
    }
  });

  const handleReconnect = $(() => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++;
      setTimeout(connectToStream, 2000);
    }
  });

  useOnDocument('visibilitychange', $(async () => {
    if (document.visibilityState === 'visible') {
      connectToStream();
    } else {
      (await response.value)?.return();
      isConnected.value = false;
    }
  }));

  useVisibleTask$(({ cleanup }) => {
    connectToStream();
    cleanup(async () => (await response.value)?.return());
  });

  return (
    <div>
      <header>MPD Controller</header>
      <div>
        Conectado: {isConnected.value ? 'Sí' : 'No'} | Intentos de reconexión: {reconnectAttempts.value}
      </div>
      <div>
        Estado: {state.state} | Volumen: {state.volume}
      </div>
      <Slot />
    </div>
  );
});
