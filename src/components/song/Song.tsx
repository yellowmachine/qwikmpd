import { component$, useSignal,  } from '@builder.io/qwik';
import type { Song as TSong } from '~/lib/song';
import { SongPopUp } from './SongPopup';

export interface SongProps {
  song: TSong;
}

export const Song = component$<SongProps>(( {song} ) => {

    const show = useSignal(false);

    return (
        <>
            <div onMouseEnter$={() => show.value = true} onMouseLeave$={() => show.value = false} 
                class="cursor-pointer gap-2 p-3 rounded transition-all bg-white hover:bg-brand-100 dark:bg-gray-800 border border-brand-300 dark:hover:bg-gray-700">
                <button 
                    aria-label="cancion"
                    class="flex items-center justify-between w-full md:w-1/2 max-w-md mx-auto cursor-pointer relative"
                    >
                    <span class={`font-medium text-orange-600`}>
                        {song.title}
                    </span>
                    <span class="text-xs text-gray-400">
                        ({song.artist})
                    </span>
                    <span class="text-xs text-gray-400">
                        {song.time}
                    </span>
                    {show.value ? <SongPopUp /> : null}  
                </button>
            </div>
        </>
    )
});