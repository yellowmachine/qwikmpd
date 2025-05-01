import { component$, $, useContext } from '@builder.io/qwik';
import { LuPlay, LuPause } from "@qwikest/icons/lucide";
import { mpdServerApi as playerApi } from '~/server/mpd';
import ProgressBar from './ProgressBar';
import PlayerButton from './PlayerButton';
import { Volume } from '../volume/Volume';
import { storesContext } from '~/routes/(app)/layout';


export interface PlayerProps {
    total: number;
    volume: number;
    state: 'play' | 'stop' | 'pause';
}

export const Player = component$(( props: PlayerProps ) => {

    const { elapsed } = useContext(storesContext);

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
                {props.state === 'play' ?
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
            <ProgressBar total={props.total} elapsed={elapsed} />
        </>
        
    );
});


