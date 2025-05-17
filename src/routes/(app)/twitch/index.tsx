import { $, component$ } from "@builder.io/qwik";
import { playLiveTwitch } from "~/server/mpd";


export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-3xl font-bold text-brand-500">Twitch</h1>
      <button onClick$={$(() => {
        playLiveTwitch("pazos64");
      })} 
        class="mt-4 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition duration-300">
        Escuchar Streamer temporal (pazos64)
      </button>
      <button onClick$={$(() => {
        playLiveTwitch("jino_destroyer");
      })} 
        class="mt-4 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition duration-300">
        JiNo_DesTroYeR
      </button>
    </div>
  );
});