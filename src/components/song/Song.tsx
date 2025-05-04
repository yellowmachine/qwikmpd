import { $, component$, useSignal, useStore,  } from '@builder.io/qwik';
import { formatTime, type Song as TSong } from '~/lib/song';
import { SongPopUp } from './SongPopup';
import { playThis } from '~/server/mpd';

export interface SongProps {
  pos: number;
  song: TSong;
  currentSong: {
    uri: string;
    elapsed: number;
    total: number;
  } | null;
}

export const Song = component$<SongProps>(( {song, currentSong, pos} ) => {

    const show = useSignal(false);
    const state = useStore({ clicked: false });


    const playThisSong = $(async () => {
        state.clicked = true;
        await playThis(pos);
        setTimeout(() => {
            state.clicked = false;
        }, 500);
    })

    return (
        <>
            { song.uri &&song.uri === currentSong?.uri ?  
                <div class="col-span-full bg-yellow-100 p-4">
                    <div class="flex items-center gap-2">
                    <span class="text-blue-600 font-bold animate-pulse">●</span>
                    <span class={`font-medium text-lg text-orange-600`}>{song.title}</span>
                    <span class="text-xs text-blue-400 ml-2">({song.artist})</span>
                    <span class="text-blue-500">
                        {formatTime(currentSong.elapsed)} / {formatTime(currentSong.total)}
                    </span>
                    </div>
                    
                    <div class="h-2 mt-2 bg-blue-100 rounded">
                        <div
                            class="h-2 bg-blue-500 rounded transition-all"
                            style={{
                                width: currentSong.total
                                ? `${Math.min(100, ((currentSong.elapsed || 0) / currentSong.total) * 100)}%`
                                : '0%',
                            }}
                        ></div>
                    </div>
                </div> 
                : 
                <>
                    <style>{`
                        @keyframes flash-bg {
                        0% { background-color: transparent; }
                        50% { background-color: #fbbf24; } /* amarillo-400 de Tailwind */
                        100% { background-color: transparent; }
                        }
                        .flash-bg {
                        animation: flash-bg 0.4s ease-in-out;
                        }
                    `}</style>

                    <div
                        class={`cursor-pointer gap-2 p-3 rounded transition-all bg-white hover:bg-brand-100
                                dark:bg-gray-800 border border-brand-300 dark:hover:bg-gray-700
                                ${state.clicked ? 'flash-bg' : ''}`}
                    >
                        <button
                        onClick$={playThisSong}
                        aria-label="cancion"
                        class="flex items-center justify-between w-full md:w-1/2 max-w-md mx-auto cursor-pointer relative"
                        >
                        <span class="font-medium text-orange-600">{song.title}</span>
                        <span class="text-xs text-gray-400">({song.artist})</span>
                        <span class="text-xs text-gray-400">{formatTime(song.time)}</span>
                        {show.value ? <SongPopUp /> : null}
                        </button>
                    </div>
                    </>
            }
        </>
    )
});