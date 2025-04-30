import { component$, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Player } from "~/components/player/Player";
import { storesContext } from "./layout";


export default component$(() => {

  const stores = useContext(storesContext);

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Can't wait to see what you build with qwik!
        <br />
        <Player 
          state={stores.state.state}
          volume={stores.state.volume} 
          currentElapsed={stores.state.time.elapsed} 
          total={stores.state.time.total} />
      </div>
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
