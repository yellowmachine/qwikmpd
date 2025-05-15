import { $, component$, useContext, useSignal } from '@builder.io/qwik';
import { Console } from '~/components/console/Console';
import { storesContext } from '~/routes/(app)/layout';
import { updateAppViaSSHStream } from '~/server/mpd';

export default component$(() => {
    const { logs } = useContext(storesContext);
    const updating = useSignal(false);

    const update = $(async () => {
        await updateAppViaSSHStream();
    });

    return <>
        <button onClick$={update} disabled={updating.value}
            class="px-4 py-2 bg-brand-600 text-white rounded cursor-pointer mb-2">
                Actualizar app (dura varios minutos)
        </button>
        <Console logs={logs.value} />
    </>
});
