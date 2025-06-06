import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { list, update, type Release, searchGroupReleases } from "#mpd";
import { SongList } from "../song/SongList";
import type { Song } from '~/lib/types';
import PlayHere from "../player/PlayHere";
import { ActionButton } from "../action-button/action-button";
import { playUri, createFolder, downloadYoutubeAudio } from "#mpd";
import { LuFolder, LuTrash2 } from "@qwikest/icons/lucide";
import { useNavigate } from "@builder.io/qwik-city";
import { Upload } from "./Upload";
import { useLocation } from '@builder.io/qwik-city';


const loadPath = async function(path: string){
    const result = await list(path);
    return {file: result.files, directory: result.directories};
}

const playThis = $(async function ({uri}: {pos: number, uri: string | undefined}){
    if(uri)
        await playUri(uri);
})

export interface LibraryProps {
    data: {file: Song[], directory: string[]},
    currentSong: {
        uri: string;
        elapsed: number;
        total: number;
    }
}

export const Library = component$(({data, currentSong}: LibraryProps) => {

    const loc = useLocation();
    const folderName = useSignal<string>('');
    const showModal = useSignal(false);
    //const showModalTagger = useSignal(false);
    const urlInput = useSignal('');
    const navigate = useNavigate();
    //const artist = useSignal('');
    //const album = useSignal('');
    //const groups = useSignal<ReleaseGroup[]>([]);
    const activeGroupId = useSignal<string | null>(null);
    const releases = useSignal<Release[]>([]);
    const showMore = useSignal(false);

    const openModal = $(() => {
        urlInput.value = '';
        showModal.value = true;
    });

    const closeModal = $(() => {
        showModal.value = false;
    });

    const currentFolder = $(() => {
        return loc.url.searchParams.get('path') || '';
    })

    const onAccept = $(async () => {
        const folder = await currentFolder();
        await downloadYoutubeAudio(urlInput.value, folder);
        navigate('/update')
        closeModal();
    });

    /*
    const searchTags = $(async () => {
        groups.value = await tagOptions({artist: artist.value, album: album.value});
    });

    const tagHere = $(async (releaseId: string) => {
        const folder = await currentFolder();
        await tag({folderTag: folder, artist: groups.value[0]["artist-credit"][0].artist.name, releaseId});
        await loadAndRefresh$();
        showModalTagger.value = false;
        artist.value = '';
        album.value = '';
        activeGroupId.value = null;
        groups.value = [];
        releases.value = [];
    })
    */
    const goPath$ = $(async (path: string) => {
        navigate(`/library?path=${encodeURIComponent(path)}`);
    })

    const loadAndRefresh$ = $(async () => {
        const result = await loadPath(await currentFolder());
        data.file = result.file;
        data.directory = result.directory;
    })

    const goBack$ = $(async () => {
        loc.prevUrl ? window.history.back() : navigate('/')
    })

    const createFolder$ = $(async () => {
        const base = await currentFolder()
        await createFolder(base, folderName.value);
        await loadAndRefresh$();
        await goPath$(`${base === "" ? "" : base + '/'}${folderName.value}`);
    })

    const updateLibrary = $(async () => {
        await update();
        await loadAndRefresh$();
    })

    useTask$(async ({track}) => {
        track(() => activeGroupId.value);
        if (activeGroupId.value) {
            releases.value = await searchGroupReleases(activeGroupId.value);
        }
    })

    const CreateFolder = () => (
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
                        class="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded disabled:opacity-50 cursor-pointer"
                        onClick$={createFolder$}
                        disabled={!folderName.value.trim()}
                    >
                        Create folder
                    </button>
                </div>
    )

    const Youtube = () => (
        <>
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
                        <ActionButton action={onAccept} warningMessage="you can see the progress on the console">
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
        </>
    )

    return (
        <>
            <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4 gap-4">
                <div class="text-brand-300">
                    <div class="flex-1 flex">
                        {data.file.length > 0 && 
                        <PlayHere path={loc.url.searchParams.get('path') || ''} />
                        }
                    </div>
                    <ActionButton action={$(() => updateLibrary())} successMessage="ok">
                        <button class="mb-2 cursor-pointer bg-brand-300 hover:bg-brand-300 p-2 rounded text-brand-500 text-xl ml-2">
                            Update database
                        </button>
                    </ActionButton>
                    <button
                        type="button"
                        onClick$={() => {
                        showMore.value = !showMore.value;
                        }} 
                        class="ml-2 text-red-600 hover:text-red-800 font-bold py-2 px-4 rounded border-dashed focus:outline-none focus:shadow-outline border-2 border-red-500"  
                    >{showMore.value ? 'Hide' : 'Show more...'}</button>
                    {showMore.value && (
                        <div class="flex flex-col md:flex-row items-center gap-2">
                            <CreateFolder />
                            <Upload base={loc.url.searchParams.get('path') || ''} />
                            <Youtube />
                        </div>
                    )}
                </div>
            </div>
            {loc.url.searchParams.get('path') !== '' && loc.url.searchParams.get('path') !== null && 
                <div class="p-2">
                    <button class="mb-2 p-2 cursor-pointer bg-brand-200 hover:bg-brand-300 text-white" onClick$={goBack$} >[..]</button>
                    <span class="mb-2 p-2 text-brand-500 text-xl">{currentFolder()}</span>
                </div>
            }
            {data.directory.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-300 hover:bg-brand-300 p-2 text-white text-xl">
                    <button class="cursor-pointer w-full" onClick$={() => goPath$(dir)}>
                        <LuFolder />{dir}<LuTrash2 />
                    </button>
                </div>
                
            ))}
            <SongList playThis={playThis} songs={data.file} currentSong={currentSong} />
        </>
    );
})
