import { $, component$, useSignal } from "@builder.io/qwik";
import { list, update } from "#mpd";
import { SongList } from "../song/SongList";
import type { Song } from '~/lib/types';
import PlayHere from "../player/PlayHere";
import { ActionButton } from "../action-button/action-button";
import { playUri } from "#mpd";
import { LuFolder } from "@qwikest/icons/lucide";


const loadPath = async function(path: string){
    const result = await list(path);
    return {file: result.files, directory: result.directories};
}

const playThis = $(async function ({uri}: {pos: number, uri: string | undefined}){
    if(uri)
        await playUri(uri);
})

export interface LibraryProps {
    initialData: {file: Song[], directory: string[]}
}

export const Library = component$(({initialData}: LibraryProps) => {

    const history = useSignal<string[]>(['']);
    const files = useSignal<Song[]>(initialData.file);
    const directories = useSignal<string[]>(initialData.directory);

    const goPath$ = $(async (path: string) => {
        const result = await loadPath(path);
        files.value = result.file;
        directories.value = result.directory;
        history.value = [...history.value, path];
    })

    const loadAndRefresh$ = $(async () => {
        const result = await loadPath(history.value[history.value.length - 1]);
        files.value = result.file;
        directories.value = result.directory;
    })

    const goBack$ = $(async () => {
        history.value.pop();
        await loadAndRefresh$();
        //const result = await loadPath(history.value[history.value.length - 1]);
        //files.value = result.file;
        //directories.value = result.directory;
    })

    const updateLibrary = $(async () => {
        await update();
        await loadAndRefresh$();
    })

    return (
        <>
            <div class="flex items-center justify-between mb-4">
                {/* PlayHere centrado verticalmente y al final */}
                <div class="flex-1 flex justify-end">
                    {files.value.length > 0 && 
                    <PlayHere path={history.value[history.value.length - 1]} />
                    }
                </div>
                {/* Botón Actualizar base de datos */}
                <h1 class="text-3xl text-brand-300">
                    <ActionButton action={$(() => updateLibrary())} successMessage="ok">
                    <button class="mb-2 cursor-pointer bg-brand-300 hover:bg-brand-300 p-2 rounded text-brand-500 text-xl ml-2">
                        Actualizar base de datos
                    </button>
                    </ActionButton>
                </h1>
            </div>
            {history.value.length > 1 && 
                <div class="p-2">
                    <button class="mb-2 p-2 cursor-pointer bg-brand-200 hover:bg-brand-300 text-white" onClick$={goBack$} >[..]</button>
                    <span class="mb-2 p-2 text-brand-500 text-xl">{history.value.join('/')}</span>
                </div>
            }
            {directories.value.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-300 hover:bg-brand-300 p-2 text-white text-xl">
                    <button class="cursor-pointer w-full" onClick$={() => goPath$(dir)}><LuFolder />{dir}</button>
                </div>
                
            ))}
            <SongList playThis={playThis} songs={files.value} currentSong={null} />
        </>
    );
})