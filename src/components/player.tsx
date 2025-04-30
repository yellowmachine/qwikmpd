import { component$ } from '@builder.io/qwik';
import { ActionButton } from './action-button';
import { $ } from '@builder.io/qwik';
import { getMpdClient } from '~/server/get-mpd-client';
import { server$ } from '@builder.io/qwik-city';

const play = server$(async function(){
  const mpd = await getMpdClient(this);
  await mpd.play();
})

const pause = server$(async function(){
  const mpd = await getMpdClient(this);
  await mpd.pause();
})

const previous = server$(async function(){
  const mpd = await getMpdClient(this);
  await mpd.previous();
})

const next = server$(async function(){
  const mpd = await getMpdClient(this);
  await mpd.next();
})


export default component$(() => {
  return (
    <>
    <ActionButton action={$(() => play())} successMessage={"ok!"}>
      <button class="px-4 py-2 bg-blue-600 text-white rounded">Play</button>
    </ActionButton>
    <ActionButton action={$(() => pause())} successMessage={"ok!"}>
      <button class="px-4 py-2 bg-blue-600 text-white rounded">Pause</button>
    </ActionButton>
    <ActionButton action={$(() => previous())} successMessage={"ok!"}>
      <button class="px-4 py-2 bg-blue-600 text-white rounded">Anterior</button>
    </ActionButton>
    <ActionButton action={$(() => next())} successMessage={"ok!"}>
      <button class="px-4 py-2 bg-blue-600 text-white rounded">Siguiente</button>
    </ActionButton>
    </>
  );
});
