import { Library } from "~/components/library/Library";
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from "@builder.io/qwik-city";
import { list } from "#mpd";

export const useLibraryData = routeLoader$(async () => {
    const result = await list('');
    return {file: result.files, directory: result.directories};
});
   

export default component$(() => {

    const initialData = useLibraryData();

    return (
        <>
            <h1>Library</h1>
            <Library initialData={initialData.value} />
        </>
    );
})