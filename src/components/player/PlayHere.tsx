import { component$, $ } from '@builder.io/qwik';
import confetti from 'canvas-confetti';
import { playHere } from '~/server/mpd';
//import { LuPlay, LuPause, LuVolume, LuVolume1, LuVolume2 } from "@qwikest/icons/lucide";

export interface PlayHereProps {
  path: string;
}

export default component$((props: PlayHereProps) => {
  // Función para lanzar confetti, envuelta en $ para lazy loading
  const launchConfetti = $(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    playHere(props.path);
  });

  return (
    <>
      <button class="cursor-pointer border border-2 border-brand-300 px-4 py-2 text-3xl font-extrabold leading-[1.2] text-transparent bg-clip-text
                    bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400
                    animate-gradient mb-4"
                    style="background-size: 200% 200%;"  
        onClick$={launchConfetti}>
          Play here! 🎉
      </button>
      <style>{`
        @keyframes gradient-x {
            0%, 100% {
            background-position: 0% 50%;
            }
            50% {
            background-position: 100% 50%;
            }
        }
        .animate-gradient {
            animation: gradient-x 3s ease-in-out infinite;
        }
    `}
    </style>
  </>
  );
});
