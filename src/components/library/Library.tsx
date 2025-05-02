import { $, component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { type AudioFileMetadata, getMpdClient } from "#mpd";
import { SongList } from "../song/SongList";


const loadPath = server$(async function(path: string){
    const result = await (await getMpdClient(this)).list(path);
    return {file: result.files, directory: result.directories};
    //return await mpdServerApi.list(path);
})

export interface LibraryProps {
    initialData: {file: AudioFileMetadata[], directory: string[]}
}

export const Library = component$(({initialData}: LibraryProps) => {

    const history = useSignal<string[]>(['']);
    const files = useSignal<AudioFileMetadata[]>(initialData.file);
    const directories = useSignal<string[]>(initialData.directory);

    const goPath = $(async (path: string) => {
        const result = await loadPath(path);
        files.value = result.file;
        directories.value = result.directory;
        history.value = [...history.value, path];
    })

    const goBack = $(async () => {
        history.value.pop();
        const result = await loadPath(history.value[history.value.length - 1]);
        files.value = result.file;
        directories.value = result.directory;
    })

    return (
        <>
            {history.value.length > 1 && 
                <button class="mb-2 cursor-pointer bg-brand-200 hover:bg-brand-300" onClick$={goBack} >[..]</button>
            }
            {directories.value.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-200 hover:bg-brand-300">
                    <button class="cursor-pointer" onClick$={() => goPath(dir)}>{dir}</button>
                </div>
                
            ))}
            <SongList songs={files.value} />
        </>
    );
})