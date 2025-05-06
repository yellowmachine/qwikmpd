import { $, component$, useSignal } from "@builder.io/qwik";
import { list, update } from "#mpd";
import { SongList } from "../song/SongList";
import type { Song } from '~/lib/types';
import PlayHere from "../player/PlayHere";
import { ActionButton } from "../action-button/action-button";


const loadPath = async function(path: string){
    const result = await list(path);
    return {file: result.files, directory: result.directories};
}

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

    const goBack$ = $(async () => {
        history.value.pop();
        const result = await loadPath(history.value[history.value.length - 1]);
        files.value = result.file;
        directories.value = result.directory;
    })

    const updateLibrary = $(async () => {
        await update();
    })

    return (
        <>
            {files.value.length > 0 && 
                <PlayHere path={history.value[history.value.length - 1]} />
            }
            {history.value.length > 1 && 
                <div class="p-2">
                    <button class="mb-2 p-2 cursor-pointer bg-brand-200 hover:bg-brand-300 text-white" onClick$={goBack$} >[..]</button>
                    <span class="mb-2 p-2 text-brand-500 text-xl">{history.value.join('/')}</span>
                </div>
            }
            <h1 class="text-3xl text-brand-300 mb-4">
                <span>Library</span>
                <ActionButton action={$(() => updateLibrary())} successMessage="ok">
                    <div class="mb-2 cursor-pointer bg-red-200 hover:bg-brand-300 p-2 text-white text-xl float float-right">
                        Actualizar base de datos
                    </div>
                </ActionButton>
            </h1>
            {directories.value.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-200 hover:bg-brand-300 p-2 text-white text-xl">
                    <button class="cursor-pointer" onClick$={() => goPath$(dir)}>{dir}</button>
                </div>
                
            ))}
            <SongList songs={files.value} currentSong={null} />
        </>
    );
})