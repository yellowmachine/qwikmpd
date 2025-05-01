import { $, component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { type AudioFileMetadata, mpdServerApi } from "~/server/mpd";
import {Base} from "./Base";

const loadPath = server$(async function(path: string){
    return await mpdServerApi.list(path);
})


export default component$(() => {

    const history = useSignal<string[]>(['']);
    const files = useSignal<AudioFileMetadata[]>([]);
    const directories = useSignal<string[]>([]);

    const goPath = $(async (path: string) => {
        const result = await loadPath(path);
        files.value = result.file;
        directories.value = result.directory;
        history.value = [...history.value, path];
    })

    const goBack = $(async () => {
        history.value.pop();
        const result = await loadPath(history.value[history.value.length - 1]);
        files.value = result.file;
        directories.value = result.directory;
    })

    return (
        <Base 
            history={history.value} 
            directories={directories.value} 
            files={files.value} 
            goPath={goPath} 
            goBack={goBack} />
    );
})