// src/components/mpd-listener.tsx
import { component$, useStore, useTask$ } from '@builder.io/qwik';

export default component$(() => {
  const state = useStore({
    events: [] as any[],
    status: 'disconnected',
  });

  useTask$(({ cleanup }) => {
    state.status = 'connecting';
    const eventSource = new EventSource('/mpd-events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      state.events = [...state.events, data];
    };

    eventSource.onopen = () => {
      state.status = 'connected';
    };

    eventSource.onerror = () => {
      state.status = 'error';
    };

    cleanup(() => {
      eventSource.close();
    });
  });

  return (
    <div>
      <p>Estado: {state.status}</p>
      <ul>
        {state.events.map((event, i) => (
          <li key={i}>{JSON.stringify(event)}</li>
        ))}
      </ul>
    </div>
  );
});
