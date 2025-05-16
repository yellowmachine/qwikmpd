import { Library } from "~/components/library/Library";
import { component$, useContext } from '@builder.io/qwik';
import { routeLoader$ } from "@builder.io/qwik-city";
import { list, update } from "#mpd";
import { storesContext } from "../layout";

export const useLibraryData = routeLoader$(async () => {
    await update();
    const result = await list('');
    return {file: result.files, directory: result.directories};
});

export default component$(() => {

    const initialData = useLibraryData();
    const {queue, elapsed} = useContext(storesContext);

    function totalCurrentSong() {
      const current = queue.queue.find(item => item.uri === queue.currentSong);
      return (current?.time || 0) as number;
    }

    return (
        <>
            <Library initialData={initialData.value} currentSong={ {uri: queue.currentSong, total: totalCurrentSong(), elapsed: elapsed.value }} />
        </>
    );
})