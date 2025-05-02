import { Library } from "~/components/library/Library";
import { component$ } from '@builder.io/qwik';
import { type RequestEventLoader, routeLoader$ } from "@builder.io/qwik-city";
import { getMpdClient } from "#mpd";

export const useLibraryData = routeLoader$(async (request: RequestEventLoader) => {
    const result = await (await getMpdClient(request)).list('');
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