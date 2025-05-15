import { $, component$, type Signal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { formatTime } from "~/lib/song";
import { seek as mpdseek } from '~/server/mpd';

const seek = server$(async function(elapsed: number) {
    await mpdseek(elapsed);
})


export interface ProgressBarProps {
    elapsed: Signal<number | null>;
    total: number;
}

export default component$(( {total, elapsed} : ProgressBarProps) => {
    
    const onInput = $(async (event: Event) => {
        elapsed.value = Number((event.target as HTMLInputElement).value);
    });

    const onChange = $(async (event: Event) => {
        const newElapsed = Number((event.target as HTMLInputElement).value);
        await seek(newElapsed);
    });
    
    return (
        <>
            <div class="w-full">
                <input
                    id="player-range"
                    type="range"
                    min="0"
                    max={total}
                    step="1"
                    value={elapsed.value ?? 0}
                    class="w-full h-2 bg-brand-200 accent-orange-500 rounded-lg appearance-none cursor-pointer"
                    onInput$={onInput}
                    onChange$={onChange}
                />

                <div class="flex justify-between mt-1 text-xs text-brand-500">
                    <span>{formatTime(elapsed.value)} / {formatTime(total)}</span>
                    {total && 
                        <span>{formatTime(total - (elapsed.value ?? 0))}</span>
                    }
                </div>
            </div>
        </>
    );
})