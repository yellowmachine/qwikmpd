import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$, useStore, type Signal } from "@builder.io/qwik";
import { type StatusData, type QueueData, subscribe, emptyStatus, type MPDEvent, getMpdClient } from "~/server/mpd";
import {
  useContextProvider,
  createContextId,
} from '@builder.io/qwik';
import { Menu } from "~/components/menu/Menu";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useInitialData = routeLoader$(async function (request){
  const client = await getMpdClient(request, {forceReconnect: true});
  return {
    status: await client.api.status.get() as unknown as StatusData,
  }
})

export const storesContext = createContextId<{queue: QueueData, state: StatusData, elapsed: Signal<number>}>('stores');

export default component$(() => {
  
  const ready = useSignal(false);
  const warning = useSignal('');
  const isConnected = useSignal(false);
  const reconnectAttempts = useSignal(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useSignal(false);
  const stream = useSignal<Promise<AsyncGenerator<MPDEvent, void, unknown>> | null>(null);
  const state = useStore<StatusData>(emptyStatus);
  const queue = useStore<QueueData>({queue: [], currentSong: ''});
  const elapsed = useSignal(state.time?.elapsed || 0);
  
  useContextProvider(storesContext, {queue, state, elapsed});
  const initialData = useInitialData();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    Object.assign(state, {
      ...initialData.value.status
    });
  })

  const connectToStream = $(async () => {

    if (isConnecting.value) return; // Evitar conexiones simultáneas
    isConnecting.value = true;

    try {
      console.log('Iniciando stream...');

      isConnected.value = true;
      reconnectAttempts.value = 0;

      stream.value = subscribe();

      for await (const value of await stream.value) {

        //console.log(value.data, value.type)
        
        switch (value.type) {
          case 'status':
            Object.assign(state, {
              ...value.data
            });
            break;
          case 'warning':
            warning.value = value.data;
            break;
          case 'ready':
            ready.value = value.data;
            break;
          case 'queue':
            queue.queue = value.data.queue;
            queue.currentSong = value.data.currentSong;
            break;
          default:
              console.error('Unknown value type:', JSON.stringify(value));
              break;
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
      await connectToStream();
    } else {
      isConnected.value = false;
      return stream.value;
    }
  }));

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({cleanup}) => {
    await connectToStream();
    cleanup(async () => {
      (await stream.value)?.return();
    })
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({track}) => {
    const [_] = track(() => [state.songid]);
    console.log(_)
    elapsed.value = 0
  })

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const [statePlayer] = track(() => [state.state]);

    elapsed.value = state.time?.elapsed || 0;
 
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
      <div class="text-red-500">
        {warning.value}
      </div>
      <Menu />
      <Slot />
    </div>
  );
});
