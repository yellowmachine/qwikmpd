import { component$, type QRL } from "@builder.io/qwik";
import { SongList } from "../song/SongList";
import type { AudioFileMetadata } from "~/server/mpd";


export interface BaseProps {
    history: string[],
    directories: string[],
    files: AudioFileMetadata[],
    goPath: QRL<(path: string) => void>,
    goBack: QRL<() => void>
}

export const Base = component$(({history, directories, files, goPath, goBack}: BaseProps) => {

    return (
        <>
            {history.length > 1 && 
                <button class="" onClick$={goBack} >[..]</button>
            }
            {directories.map((dir) => (
                <div key={dir} class="mb-2 cursor-pointer bg-brand-200 hover:bg-brand-300">
                    <button onClick$={() => goPath(dir)}>{dir}</button>
                </div>
                
            ))}
            <SongList songs={files} />
        </>
    );
})