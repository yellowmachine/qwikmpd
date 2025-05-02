import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$, useStore, type Signal } from "@builder.io/qwik";
import { server$  } from "@builder.io/qwik-city";
import { type StatusData, type QueueData, subscribe, emptyStatus } from "~/server/mpd";
import {
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';

export const streamFromServer = server$(async function* () {
  for await (const msg of await subscribe()) {
    yield msg;
  }
});


export const storesContext = createContextId<{queue: QueueData, state: StatusData, elapsed: Signal<number>}>('stores');

export default component$(() => {
  
  const ready = useSignal(false);
  const warning = useSignal('');
  const isConnected = useSignal(false);
  const reconnectAttempts = useSignal(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useSignal(false);
  const response = useSignal<ReturnType<typeof streamFromServer> | null>(null);

  const state = useStore<StatusData>(emptyStatus);
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
        }else if( value.type === 'warning') {
            warning.value = value.data;
        } else if( value.type === 'ready') {
            ready.value = value.data;
        } else {
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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    connectToStream();
    cleanup(async () => (await response.value)?.return());
  });

  const elapsed = useSignal(state.time?.elapsed || 0);
  useContextProvider(storesContext, {queue, state, elapsed});

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const [statePlayer] = track(() => [ state.state]);

    elapsed.value = state.time?.elapsed || 0;
 
    //time?.elapsed == null ||
    if (statePlayer === 'stop' || statePlayer === 'pause') {
        if(statePlayer === 'stop') 
          elapsed.value = 0;
      return;
    }

    const interval = setInterval(() => {
      elapsed.value++;
    }, 1000);

    cleanup(() => {
      //elapsed.value = 0;
      clearInterval(interval)
    });
  });

  return (
    <div>
      <div class={`text-white ${ready.value ? 'text-green-500' : 'text-red-500'} text-green-500`}>{ready.value ? 'MPD Conectado' : 'MPD Desconectado'}</div>
      <div class="text-red-500">{warning.value}</div>
      <div class="text-brand-500 mb-4">
        Conectado: {isConnected.value ? 'Sí' : 'No'} | Intentos de reconexión: {reconnectAttempts.value}
      </div>
      <div class="text-brand-500 mb-4">
        Estado: {state.state} | Volumen: {state.volume}
      </div>
      <Slot />
    </div>
  );
});
