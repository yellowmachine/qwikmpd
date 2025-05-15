import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$, useStore, type Signal } from "@builder.io/qwik";
import { type QueueData, subscribe, type MPDEvent, emptyStatus, 
//  getMpdClient 
} from "~/server/mpd";
import type { StatusData } from "~/lib/types";
import {  useContextProvider,  createContextId } from '@builder.io/qwik';
import { Menu } from "~/components/menu/Menu";
import { type LogEntry } from "~/components/console/Console";


export const storesContext = createContextId<{queue: QueueData, state: StatusData, logs: Signal<LogEntry[]>, elapsed: Signal<number>}>('stores');

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
  const logs = useSignal<LogEntry[]>([]);

  
  useContextProvider(storesContext, {queue, state, elapsed, logs});

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
            setTimeout(() => warning.value = '', 5000);
            break;
          case 'ready':
            ready.value = value.data;
            break;
          case 'stdout':
            logs.value = [...logs.value, value];
            break
          case 'stderr':
            logs.value = [...logs.value, value];
            break
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
        await handleReconnection();
      }
    } finally {
      isConnecting.value = false;
    }
  });

  const handleReconnection = $(async () => {
    reconnectAttempts.value++;
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++;
      setTimeout(() => connectToStream(), 2000);
    }
  });

  useOnDocument('visibilitychange', $(async () => {
    if (document.visibilityState === 'visible') {
      connectToStream();
    } else {
      isConnected.value = false;
      return stream.value;
    }
  }));

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({cleanup}) => {
    connectToStream();
    cleanup(async () => {
      (await stream.value)?.return();
    })
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({track}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_] = track(() => [state.songid]);
    //console.log(_)
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
      if(state.time?.total !== undefined && elapsed.value >= state.time.total) {
        elapsed.value = 0
      }
    }, 1000);

    cleanup(() => {
      //elapsed.value = 0;
      clearInterval(interval)
    });
  });

  return (
    <div class="bg-brand-50">
      <div class="text-red-500">
        {warning.value}
      </div>
      <Menu />
      <Slot />
    </div>
  );
});
