import { $, component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import Welcome from "~/components/Welcome";
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
      <Welcome />
      <Link onClick$={launchConfetti} class="text-xl bg-brand-500 text-white p-2 rounded cursor-pointer" href="/queue">
        Vamos a disfrutar de la música!
      </Link>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
