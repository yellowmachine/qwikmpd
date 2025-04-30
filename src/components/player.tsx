import { component$ } from '@builder.io/qwik';
import { ActionButton } from './action-button/action-button';
import { $ } from '@builder.io/qwik';
import { getMpdClient } from '~/server/mpd';
import { server$ } from '@builder.io/qwik-city';

const play = server$(async function(){
  const mpd = await getMpdClient(this);
  await mpd.play();
})

const xplay = $(async () => {
  await play();
});


export default component$(() => {
  return (
    <>
      <ActionButton action={xplay} successMessage={"ok!"}>
        <button class="px-4 py-2 bg-blue-600 text-white rounded">Play</button>
      </ActionButton>
    </>
  );
});
