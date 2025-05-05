import { component$, $, useContext } from '@builder.io/qwik';
import { LuPlay, LuPause, LuStopCircle, LuVolume1, LuVolume2, LuArrowLeft, LuArrowRight } from "@qwikest/icons/lucide";
import { play, pause, setVolume, stop, prev, next, resume } from '~/server/mpd';
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

    const onPrev = $(async () => {
        await prev();
    });

    const onNext = $(async () => {
        await next();
    });

    const onPlay = $(async () => {
        if(props.state === 'pause')
            await resume();
        else
            await play();
    });

    const onPause = $(async () => {
        await pause();
    });

    const onStop = $(async () => {
        await stop();
    });

    const onSetVolume = $(async (value: number) => {
        await setVolume(value);
    })

    return (
        <div class="flex flex-col items-center">
            <div class="flex items-center gap-4 border-2 rounded-md p-4 bg-white text-orange-500 dark:bg-orange-500 dark:text-white mb-4">
                <PlayerButton onClick$={() => onPrev()}>
                    <LuArrowLeft class="w-8 h-8" />
                </PlayerButton>
               
                {(props.state === 'play' || props.state === 'pause') &&
                    <PlayerButton onClick$={onStop}>
                        <LuStopCircle class="w-8 h-8" />
                    </PlayerButton>
                }
                {props.state === 'play' ?
                    <PlayerButton onClick$={onPause}>
                        <LuPause class="w-8 h-8" />
                    </PlayerButton>
                    :
                    <PlayerButton onClick$={onPlay}>
                        <LuPlay class="w-8 h-8" />
                    </PlayerButton>
                }
                <PlayerButton onClick$={() => onSetVolume(props.volume - 10)}>
                    <LuVolume1 class="w-8 h-8" />
                </PlayerButton>
                <Volume volume={props.volume} onVolumeChange$={onSetVolume} />
                
                <PlayerButton onClick$={() => onSetVolume(props.volume + 10)}>
                    <LuVolume2 class="w-8 h-8" />
                </PlayerButton>

                <PlayerButton onClick$={() => onNext()}>
                    <LuArrowRight class="w-8 h-8" />
                </PlayerButton> 
            </div>
            <ProgressBar total={props.total} elapsed={elapsed} />
        </div>
    );
});


