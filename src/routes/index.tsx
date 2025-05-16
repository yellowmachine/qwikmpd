import { $, component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
//import Welcome from "~/components/Welcome";
import confetti from 'canvas-confetti';

export default component$(() => {

  const launchConfetti = $(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    });

  return (
    <>
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
      `}</style>
      <h1
        class={`text-5xl font-extrabold leading-[1.2] text-transparent bg-clip-text
                bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400
                animate-gradient mb-4 transition-opacity duration-700`}
        style={{
            backgroundSize: '200% 200%',
            opacity: 1,
            pointerEvents: 'auto',
            }}
        >
        <Link onClick$={launchConfetti} 
          class="cursor-pointer"
          href="/queue">
          Click & <p/>let's play some music!
        </Link>
      </h1>
    </>
  );
});

export const head: DocumentHead = {
  title: "WesternMPD Music App",
  meta: [
    {
      name: "description",
      content: "play music with WesternMPD",
    },
  ],
};
