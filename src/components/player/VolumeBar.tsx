import { component$, useSignal, $, useVisibleTask$, type QRL } from '@builder.io/qwik';

function correctVolume(value: number): number {
  // Ajusta el valor para que esté entre 0 y 100
  return Math.min(100, Math.max(0, value));
}

export interface VolumeBarProps {
  volume: number;
  onVolumeChange?: QRL<(v: number) => void>;
}

export const VolumeBar = component$(( {volume, onVolumeChange} : VolumeBarProps) => {
  const internalVolume = useSignal(volume);
  const tempVolume = useSignal(volume);
  const dragging = useSignal(false);
  const container = useSignal<HTMLElement>();

  // Actualiza el volumen externo si cambia la prop
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    internalVolume.value = volume;
    tempVolume.value = volume;
  });

  // Función para obtener la coordenada Y del evento
  const getY = $((event: MouseEvent | TouchEvent) => {
    if ('touches' in event) {
      return event.touches[0].clientY;
    }
    return event.clientY;
  });

  
  // Maneja el inicio del drag
  const startDrag = $((event: MouseEvent | TouchEvent) => {
    dragging.value = true;
    //window.addEventListener('mousemove', onDrag as any);
    //window.addEventListener('mouseup', stopDrag as any);
    //window.addEventListener('touchmove', onDrag as any);
    //window.addEventListener('touchend', stopDrag as any);
    event.preventDefault();
  });

  /*
  // Maneja el drag
  const onDrag = $(async (event: MouseEvent | TouchEvent) => {
    if (!dragging.value) return;
    const y = await getY(event);
    const rect = container.value?.getBoundingClientRect();
    if (rect) {
      tempVolume.value = correctVolume(((rect.bottom - y) / rect.height) * 100);
    }
  });

  // Maneja el fin del drag
  const stopDrag = $(() => {
    if (dragging.value) {
      dragging.value = false;
      internalVolume.value = tempVolume.value;
      onVolumeChange?.(internalVolume.value);
      //window.removeEventListener('mousemove', onDrag as any);
      //window.removeEventListener('mouseup', stopDrag as any);
      //window.removeEventListener('touchmove', onDrag as any);
      //window.removeEventListener('touchend', stopDrag as any);
    }
  });
  */

  // Maneja click en la barra interior
  const handleVolumeClick = $(async (event: MouseEvent | TouchEvent) => {
    const y = await getY(event);
    const rect = container.value?.getBoundingClientRect();
    if (rect) {
      internalVolume.value = correctVolume(((rect.bottom - y) / rect.height) * 100);
      tempVolume.value = internalVolume.value;
      onVolumeChange?.(internalVolume.value);
    }
  });

  // Maneja click en la barra exterior
  const handleVolumeClickOuter = $((event: MouseEvent) => {
    const y = event.clientY;
    // Aquí asumimos que el botón exterior está justo después del interior
    const rect = container.value?.getBoundingClientRect();
    if (rect) {
      internalVolume.value = correctVolume(((rect.bottom - y) / rect.height) * 100);
      tempVolume.value = internalVolume.value;
      onVolumeChange?.(internalVolume.value);
    }
  });

  return (
    <div
      class="absolute bg-gray-200 rounded-lg p-2 shadow-md"
      style={{ top: '100%', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div class="flex flex-col items-center relative">
        <button
          aria-label="Cambiar volumen"
          class="w-3 h-40 bg-gray-400 rounded-lg relative"
          ref={container}
          onClick$={handleVolumeClick}
        />
        <button
          aria-label="Cambiar volumen"
          class="absolute w-3 bg-gray-600 rounded-lg"
          onClick$={handleVolumeClickOuter}
          onMouseDown$={startDrag}
          onTouchStart$={startDrag}
          style={{
            height: `${dragging.value ? tempVolume.value : internalVolume.value}%`,
            bottom: '0',
          }}
        />
      </div>
    </div>
  );
});
