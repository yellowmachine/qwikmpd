import { component$ } from '@builder.io/qwik';
import { ActionButton } from './action-button';
import { myClientAction } from './action';

export default component$(() => {
  return (
    <ActionButton action={myClientAction} successMessage={"Action executed"}>
      <button class="px-4 py-2 bg-blue-600 text-white rounded">Click me</button>
    </ActionButton>
  );
});
