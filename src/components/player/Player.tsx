import { component$, $, useVisibleTask$, useSignal } from '@builder.io/qwik';
import { LuPlay, LuPause } from "@qwikest/icons/lucide";
import { mpdServerApi as playerApi } from '~/server/mpd';
import ProgressBar from './ProgressBar';
import PlayerButton from './PlayerButton';
import { Volume } from '../volume/Volume';


export interface PlayerProps {
    currentElapsed: number | null;
    total: number;
    volume: number;
    state: 'play' | 'stop' | 'pause';
}

export const Player = component$(( props: PlayerProps ) => {

    const elapsed = useSignal(props.currentElapsed ?? 0);    

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track, cleanup }) => {
        const [state, currentElapsed] = track(() => [ props.state, props.currentElapsed]);
    
        elapsed.value = currentElapsed ?? 0;
     
        if (currentElapsed == null || state === 'stop' || state === 'pause') {
          return;
        }
    
        const interval = setInterval(() => {
          elapsed.value = Math.min(elapsed.value + 1, props.total);
        }, 1000);
    
        cleanup(() => clearInterval(interval));
      });

    const play = $(async () => {
        await playerApi.play();
    });

    const pause = $(async () => {
        await playerApi.pause();
    });

    const setVolume = $(async (value: number) => {
        await playerApi.setVolume(value);
    })

    return (
        <>
            <div class="flex items-center gap-4 border-2 rounded-md p-4 w-max bg-white text-orange-500 dark:bg-orange-500 dark:text-white">
                {props.currentElapsed ?
                <PlayerButton onClick$={pause}>
                    <LuPause />
                </PlayerButton>
                :
                <PlayerButton onClick$={play}>
                    <LuPlay />
                </PlayerButton>
                }
                <Volume volume={props.volume} onVolumeChange$={setVolume} /> 
            </div>
            <ProgressBar total={props.total} currentElapsed={elapsed} />
        </>
        
    );
});


