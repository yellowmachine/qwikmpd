import { component$, $, type Signal } from '@builder.io/qwik';
import { LuPlay, LuPause } from "@qwikest/icons/lucide";
import { mpdServerApi as playerApi } from '~/server/mpd';
import ProgressBar from './ProgressBar';
import PlayerButton from './PlayerButton';

export interface PlayerProps {
    currentElapsed: Signal<number | null>;
    total: number;
}

export const Player = component$(( props: PlayerProps ) => {

    const play = $(async () => {
        await playerApi.play();
    });

    const pause = $(async () => {
        await playerApi.pause();
    });

    return (
        <>
            <div class="flex items-center gap-4 border-2 rounded-md p-4 w-max bg-white text-orange-500 dark:bg-orange-500 dark:text-white">
                {props.currentElapsed.value ?
                <PlayerButton onClick$={pause}>
                    <LuPause />
                </PlayerButton>
                :
                <PlayerButton onClick$={play}>
                    <LuPlay />
                </PlayerButton>
                } 
            </div>
            <ProgressBar total={props.total} currentElapsed={props.currentElapsed} />
        </>
        
    );
});
