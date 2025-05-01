import { routeLoader$ } from "@builder.io/qwik-city";
import { mpdServerApi } from "#mpd";
import { Library } from "~/components/library/Library";
import { component$ } from '@builder.io/qwik';


export const useInitialData = routeLoader$(async () => {
    return await mpdServerApi.list('');
});

export default component$(() => {

    return (
        <>
            <h1>Library</h1>
            <Library />
        </>
    );
})