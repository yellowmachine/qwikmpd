import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from "@builder.io/qwik-city";
import { listPlaylist, loadPlaylist } from "#mpd";

export const useLibraryData = routeLoader$(async () => {
    return await listPlaylist();
});
   

export default component$(() => {

    const initialData = useLibraryData();

    return (
        <>
            <h1 class="text-3xl text-brand-300 mb-4">Playlists</h1>
            <div>
                {initialData.value.map((playlist) => (
                    <div onClick$={() => loadPlaylist(playlist.playlist)} 
                        class="mb-2 cursor-pointer text-brand-500" 
                        key={playlist.playlist}>{playlist.playlist}
                    </div>
                ))}
            </div>
        </>
    );
})