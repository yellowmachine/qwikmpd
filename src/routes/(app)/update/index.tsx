import { $, component$, useContext, useSignal } from '@builder.io/qwik';
import { Console } from '~/components/console/Console';
import { storesContext } from '~/routes/(app)/layout';
import { updateAppViaSSHStream, shutdown$, reboot$ } from '~/server/mpd';

export default component$(() => {
    const { logs } = useContext(storesContext);
    const updating = useSignal(false);
    const dangerEnabled = useSignal(false);

    const update = $(async () => {
        await updateAppViaSSHStream();
    });

    return <>
        <button onClick$={update} disabled={updating.value}
            class="px-4 py-2 bg-brand-600 text-white rounded cursor-pointer mb-2">
                Actualizar app (dura varios minutos)
        </button>
        <Console logs={logs.value} />
        {/* Danger Zone */}
      <div class="border-2 border-red-500 rounded-md p-4 mt-8 bg-red-50">
        <h3 class="text-lg font-semibold text-red-700 mb-2">Zona de peligro</h3>
        <div class="flex items-center mb-4">
          <input
            id="danger-toggle"
            type="checkbox"
            checked={dangerEnabled.value}
            onChange$={() => (dangerEnabled.value = !dangerEnabled.value)}
            class="mr-2 accent-red-600"
          />
          <label for="danger-toggle" class="text-red-600 font-medium">
            Habilitar botones de peligro
          </label>
        </div>
        <div class="flex gap-4">
          <button
            class="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!dangerEnabled.value}
            onClick$={() => shutdown$()}
          >
            Apagar
          </button>
          <button
            class="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!dangerEnabled.value}
            onClick$={() => reboot$()}
          >
            Reiniciar
          </button>
        </div>
      </div>
    </>
});
