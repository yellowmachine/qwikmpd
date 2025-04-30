import { component$, $ } from '@builder.io/qwik';
import confetti from 'canvas-confetti';
import { LuPlay, LuPause, LuVolume, LuVolume1, LuVolume2 } from "@qwikest/icons/lucide";


export default component$(() => {
  // Función para lanzar confetti, envuelta en $ para lazy loading
  const launchConfetti = $(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  });

  return (
    <button onClick$={launchConfetti}>
      Lanzar Confetti <LuPlay /> <LuPause /> <LuVolume /> <LuVolume1 /> <LuVolume2 /> 
    </button>
  );
});
