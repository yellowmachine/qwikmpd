import { $, component$, Slot, useSignal, useOnDocument, useVisibleTask$ } from "@builder.io/qwik";
import { server$, type RequestHandler } from "@builder.io/qwik-city";
import { getMpdClient } from "~/server/get-mpd-client";


export const streamFromServer = server$(async function* () {
  const mpd = await getMpdClient();
  for await (const msg of mpd.subscribe()) {
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
  const message = useSignal<string[]>([]);
  const isConnected = useSignal(false);
  const reconnectAttempts = useSignal(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useSignal(false);
  const response = useSignal<ReturnType<typeof streamFromServer> | null>(null);

  const connectToStream = $(async () => {

    if (isConnecting.value) return; // Evitar conexiones simultáneas
    isConnecting.value = true;

    try {
      console.log('Iniciando stream...');
      response.value = streamFromServer();
      console.log('Stream iniciado');

      isConnected.value = true;
      reconnectAttempts.value = 0;
      message.value = [];

      for await (const value of await response.value) {
        message.value = [...message.value, value];
        
        if (message.value.length > 100) {
          message.value.shift();
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
        {message.value.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <Slot />
    </div>
  );
});
