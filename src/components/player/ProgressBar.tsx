import { $, component$, type Signal } from "@builder.io/qwik";
import { formatTime } from "~/lib/song";
import { mpdServerApi as playerApi } from '~/server/mpd';


export interface ProgressBarProps {
    currentElapsed: Signal<number | null>;
    total: number;
}

export default component$(( {total, currentElapsed} : ProgressBarProps) => {
    
    const onInput = $(async (event: Event) => {
        currentElapsed.value = Number((event.target as HTMLInputElement).value);
    });

    const onChange = $(async (event: Event) => {
        //console.log(event);
        //setVolume(Number((event.target as HTMLInputElement).value));
        const newElapsed = Number((event.target as HTMLInputElement).value);
        await playerApi.seek(newElapsed);
    });
    
    return (
        <>
            <div class="max-w-md">
                <input
                    id="player-range"
                    type="range"
                    min="0"
                    max={total}
                    step="1"
                    value={currentElapsed.value ?? 0}
                    class="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer dark:bg-orange-500"
                    onInput$={onInput}
                    onChange$={onChange}
                />

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTime(currentElapsed.value)} / {formatTime(total)}</span>
                    {total && 
                        <span>{formatTime(total - (currentElapsed.value ?? 0))}</span>
                    }
                </div>
            </div>
        </>
    );
})