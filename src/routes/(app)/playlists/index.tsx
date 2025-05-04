import { $, component$ } from '@builder.io/qwik';
import { routeLoader$ } from "@builder.io/qwik-city";
import { listPlaylist, loadPlaylist } from "#mpd";
import { ActionButton } from '~/components/action-button/action-button';

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
                    <div key={playlist.playlist}>
                        <ActionButton  
                            action={$(() => loadPlaylist(playlist.playlist))} successMessage="loaded!" >
                            <div 
                                class="mb-2 cursor-pointer text-brand-500" 
                            >
                                {playlist.playlist}
                            </div>
                        </ActionButton>
                    </div>
                ))}
            </div>
        </>
    );
})