import { $, component$, useSignal  } from '@builder.io/qwik';
import { getMpdClient } from '~/server/mpd';
import PlayerButton from './PlayerButton';
import { LuPause, LuPlay } from '@qwikest/icons/lucide';
import { server$ } from '@builder.io/qwik-city';



export interface PlayerProps {
    currentElapsed: number | null;
    total: number;
    volume: number;
    state: 'play' | 'stop' | 'pause';
}

const serverPlay = server$(async function(){
    const mpd = await getMpdClient(this);
    await mpd.play();
})

const serverPause = server$(async function(){
    const mpd = await getMpdClient(this);
    await mpd.pause();
})

export const Player = component$(( props: PlayerProps  ) => {

    const elapsed = useSignal(props.currentElapsed ?? 0);

    const play = $(async () => {
        await serverPlay();
    });

    const pause = $(async () => {
        await serverPause();
    });

    return (
        <>
            <div class="flex items-center gap-4 border-2 rounded-md p-4 w-max bg-white text-orange-500 dark:bg-orange-500 dark:text-white">
                <PlayerButton onClick$={ props.state === 'play' ? pause : play}>
                    {props.state === 'play' ? <LuPause /> : <LuPlay />} 
                </PlayerButton>
                 
            </div>
        </>
        
    );
});


