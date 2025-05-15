import { component$, $, useContext, useSignal } from '@builder.io/qwik';
import { LuPlay, LuPause, LuVolume1, LuVolume2, LuArrowLeft, LuArrowRight, LuSquare as Rectangle, LuMenu } from "@qwikest/icons/lucide";
import { play, pause, setVolume, stop, prev, next, resume } from '~/server/mpd';
import ProgressBar from './ProgressBar';
import PlayerButton from './PlayerButton';
import { Volume } from '../volume/Volume';
import { storesContext } from '~/routes/(app)/layout';
import { PopupMenu } from './PopupMenu';


export interface PlayerProps {
    total: number;
    volume: number;
    state: 'play' | 'stop' | 'pause';
    repeat: boolean;
    single: boolean;
}

export const Player = component$(( props: PlayerProps ) => {

    const { elapsed } = useContext(storesContext);
    const showMenu = useSignal(false);

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
        <>
        <style>{`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient-bg {
              background: linear-gradient(90deg, #a78bfa, #f472b6, #facc15);
              background-size: 200% 200%;
              animation: gradient-x 3s ease-in-out infinite;
            }
          `}</style>
        <div class={`flex flex-col items-center`}>
            <div class={`flex items-center gap-2 border-2 rounded-md p-4 mb-4 ${props.state === 'play' ? 'animate-gradient-bg text-orange-100' : 'text-orange-500'}`}>
                {props.repeat && <div class="text-xl text-brand-500">r</div>}
                {props.single && <div class="text-xl text-brand-500">s</div>}
                <PlayerButton onClick$={() => onPrev()}>
                    <LuArrowLeft class="w-8 h-8" />
                </PlayerButton>
               
                {(props.state === 'play' || props.state === 'pause') &&
                    <PlayerButton onClick$={onStop}>
                        <Rectangle class="w-8 h-8" />
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
                <PlayerButton onClick$={() => showMenu.value = !showMenu.value}>
                    <div class="relative">
                        <LuMenu class="w-8 h-8" />
                        {showMenu.value && 
                            <PopupMenu single={props.single} repeat={props.repeat} />
                        }
                    </div>
                </PlayerButton>

            </div>
            <ProgressBar total={props.total} elapsed={elapsed} />
        </div>
        </>
    );
});


