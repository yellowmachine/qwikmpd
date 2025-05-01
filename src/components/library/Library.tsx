import { $, component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { type AudioFileMetadata, mpdServerApi } from "#mpd";
import {Base} from "./Base";
import { useInitialData } from "~/routes/(app)/library";

const loadPath = server$(async function(path: string){
    return await mpdServerApi.list(path);
})

export const Library = component$(() => {

    const initialData = useInitialData();

    const history = useSignal<string[]>(['']);
    const files = useSignal<AudioFileMetadata[]>(initialData.value.file);
    const directories = useSignal<string[]>(initialData.value.directory);

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