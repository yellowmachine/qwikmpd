import { $, component$, useSignal } from "@builder.io/qwik";
import { list, update } from "#mpd";
import { SongList } from "../song/SongList";
import type { Song } from '~/lib/types';
import PlayHere from "../player/PlayHere";
import { ActionButton } from "../action-button/action-button";
import { playUri, createFolder, downloadYoutubeAudio } from "#mpd";
import { LuFolder, LuTrash2 } from "@qwikest/icons/lucide";
import { useNavigate } from "@builder.io/qwik-city";


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
    const folderName = useSignal<string>('');
    const showModal = useSignal(false);
    const urlInput = useSignal('');
    const navigate = useNavigate();

    const openModal = $(() => {
        urlInput.value = '';
        showModal.value = true;
    });

    const closeModal = $(() => {
        showModal.value = false;
    });

    const currentFolder = $(() => {
        return history.value[history.value.length - 1];
    })

    const onAccept = $(async () => {
        const folder = await currentFolder();
        await downloadYoutubeAudio(urlInput.value, folder);
        navigate('/update')
        closeModal();
    });


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
    })

    const createFolder$ = $(async () => {
        await createFolder(history.value[history.value.length - 1], folderName.value);
        await loadAndRefresh$();
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
                        Update database
                    </button>
                    </ActionButton>
                </h1>
                <button
                    class="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 ml-2 cursor-pointer"
                    onClick$={openModal}
                >
                    Download from YouTube
                </button>
                <div class="relative">
                    {showModal.value && (
                    <div
                        class="absolute right-0 top-full mt-2 z-50"
                        onClick$={closeModal}
                        >
                        <div
                            class="bg-white p-4 rounded shadow-lg max-w-md w-full"
                            onClick$={(e) => e.stopPropagation()}
                        >
                            <h2 class="text-lg font-bold mb-2 text-brand-500">Paste Youtube URL</h2>
                            <input
                            type="text"
                            class="border p-2 w-full mb-4"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={urlInput.value}
                            onInput$={(e) => (urlInput.value = (e.target as HTMLInputElement).value)}
                            />
                            <div class="flex justify-end space-x-2">
                                <button
                                    class="px-4 py-2 bg-brand-300 rounded hover:bg-brand-400 text-white"
                                    onClick$={closeModal}
                                >
                                    Cancel
                                </button>
                                <ActionButton action={onAccept} warningMessage="you can see the progress on the console (click to close this)">
                                    <button
                                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick$={onAccept}
                                    >
                                        Download
                                    </button>
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
            {history.value.length > 1 && 
                <div class="p-2">
                    <button class="mb-2 p-2 cursor-pointer bg-brand-200 hover:bg-brand-300 text-white" onClick$={goBack$} >[..]</button>
                    <span class="mb-2 p-2 text-brand-500 text-xl">{history.value.join('/')}</span>
                </div>
            }
            <div>
            <div class="flex items-center space-x-2 mb-2">
                <input
                    type="text"
                    class="border p-2 flex-1 border border-2 border-brand-200 rounded placeholder-orange-300 focus:outline-none"
                    value={folderName.value}
                    onInput$={$((e) => {
                        const target = e.target as HTMLInputElement;
                        folderName.value = target.value;
                    })}
                    placeholder="Folder name"
                />
                <button
                    class="p-2 bg-brand-200 hover:bg-brand-300 text-white rounded disabled:opacity-50 cursor-pointer"
                    onClick$={createFolder$}
                    disabled={!folderName.value.trim()}
                >
                    Create folder
                </button>
                </div>
            </div>
            {directories.value.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-300 hover:bg-brand-300 p-2 text-white text-xl">
                    <button class="cursor-pointer w-full" onClick$={() => goPath$(dir)}>
                        <LuFolder />{dir}<LuTrash2 />
                    </button>
                </div>
                
            ))}
            <SongList playThis={playThis} songs={files.value} currentSong={null} />
        </>
    );
})