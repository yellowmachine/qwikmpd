import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$ } from "@builder.io/qwik";
import { server$, type RequestHandler } from "@builder.io/qwik-city";
import { getMpdClient } from "~/server/get-mpd-client";

export const streamFromServer = server$(async function* () {
  const mpd = await getMpdClient();
  const { id, queue } = await mpd.addListener();

  let running = true;
  try {
    while (running) {
      const msg = await queue.pop();
      try {
        yield msg;
      } catch (error) {
        console.error(error);
        running = false;
      }
    }
  } finally {
    mpd.removeListener(id);
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  const message = useSignal<string[]>([]);
  const isConnected = useSignal(false);
  const reconnectAttempts = useSignal(0);
  const maxReconnectAttempts = 5;
  const controller = useSignal<AbortController | null>(null);
  const isConnecting = useSignal(false);

  const connectToStream = $(async () => {
    if (isConnecting.value) return; // Evitar conexiones simultáneas
    isConnecting.value = true;

    try {
      controller.value?.abort();
      controller.value = new AbortController();
      const response = await streamFromServer(controller.value.signal);

      isConnected.value = true;
      reconnectAttempts.value = 0;
      message.value = [];

      for await (const value of response) {
        message.value = [...message.value, value];
        // Opcional: limitar tamaño del array
        if (message.value.length > 100) {
          message.value.shift();
        }
      }
    } catch (error) {
      console.error('Error en stream:', error);
      isConnected.value = false;
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        setTimeout(connectToStream, 2000);
      }
    } finally {
      isConnecting.value = false;
    }
  });

  useOnDocument('visibilitychange', $(() => {
    if (document.visibilityState === 'visible') {
      connectToStream();
    } else {
      controller.value?.abort();
      isConnected.value = false;
    }
  }));

  useVisibleTask$(({ cleanup }) => {
    connectToStream();
    cleanup(() => controller.value?.abort());
  });

  return (
    <div>
      <header>MPD Controller</header>
      <div>
        Conectado: {isConnected.value ? 'Sí' : 'No'} | Intentos de reconexión: {reconnectAttempts.value}
      </div>
      <div>
        {message.value.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <Slot />
    </div>
  );
});
