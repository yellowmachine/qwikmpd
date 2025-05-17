import { $, component$, useSignal } from "@builder.io/qwik"
import { ActionButton } from "../action-button/action-button"
import { generateM3U } from "~/server/mpd";

export type YoutubeVideoProps = {
    videoId: string;
    title: string;
    description: string;
    channelTitle: string;
}

export default component$((props: YoutubeVideoProps) => {       
    const generating = useSignal(false);

    const onGenerate = $(async () => {
        try{
            generating.value = true;
            await generateM3U({...props});
        }
        finally{
            generating.value = false;
        }
      });
    
    return (
        <>
        <ActionButton action={$(() => onGenerate())} successMessage='Stream created'>
            <button class="bg-brand-600 text-white px-6 py-2 rounded ml-4 cursor-pointer" 
                disabled={generating.value}
                >
                    Stream here!
                    {generating.value && (
                        <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
            </button>
            <style>
                {`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </ActionButton>
        </>
    )
})