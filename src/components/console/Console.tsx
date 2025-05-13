import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

type LogType = 'stdout' | 'stderr';

export interface LogEntry {
  type: LogType;
  data: string;
}

export interface ConsoleProps {
    logs: LogEntry[];
  }

export const Console = component$((props: ConsoleProps) => {
  const containerRef = useSignal<HTMLDivElement>();
  
  // Auto-scroll al fondo cuando llegan logs nuevos
  useVisibleTask$(({ track }) => {
    track(() => props.logs.length);
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  });

  return (
    <div
      ref={containerRef}
      style={{
        background: '#1e1e1e',
        color: '#e5e5e5',
        fontFamily: 'monospace',
        fontSize: '14px',
        padding: '1em',
        borderRadius: '6px',
        height: '600px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {props.logs.map((log, idx) => (
        <div
          key={idx}
          style={{
            color: log.type === 'stderr' ? '#ff5555' : '#ffff00', // amarillo brillante
            fontWeight: log.type === 'stderr' ? 'bold' : 'normal',
          }}
        >
          {log.data}
        </div>
      ))}
    </div>
  );
});
