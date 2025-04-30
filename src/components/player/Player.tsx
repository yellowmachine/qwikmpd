import { component$, $ } from '@builder.io/qwik';
import { LuPlay, LuPause, LuVolume, LuVolume1, LuVolume2 } from "@qwikest/icons/lucide";
import { mpdServerApi as playerApi } from '~/server/mpd';

export default component$(() => {

    const play = $(async () => {
        await playerApi.play();
    });

    const pause = $(async () => {
        await playerApi.pause();
    });

    const next = $(async () => {
        await playerApi.next();
    });

    const previous = $(async () => {
        await playerApi.previous();
    });

    const setVolume = $(async (value: number) => {
        await playerApi.setVolume(value);
    });

    return (
        <ul>
            <li>
                <button onClick$={play}>
                    <LuPlay />
                </button>
            </li>
            <li>
                <button onClick$={pause}>
                    <LuPause />
                </button>
            </li>
            <li><LuVolume /></li>
            <li><LuVolume1 /></li>
            <li><LuVolume2 /></li> 
        </ul>
    );
});
