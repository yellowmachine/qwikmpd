import { $, component$, type QRL, useSignal } from "@builder.io/qwik"
import { ActionButton } from "../action-button/action-button"
import { generateM3U } from "~/server/mpd";
import { Link } from "@builder.io/qwik-city";
import type { YoutubeVideo } from "~/server/youtube";

export type YoutubeVideoProps = {
    onAdd: QRL<() => void>;
    onRemove: QRL<() => void>;
    isFavorite: boolean;
    video: YoutubeVideo
}

export default component$(( props : YoutubeVideoProps) => {       
    const generating = useSignal(false);

    const onGenerate = $(async () => {
        try{
            generating.value = true;
            await generateM3U({videoId: props.video.videoId, title: props.video.title, channelTitle: props.video.channelTitle});
        }
        finally{
            generating.value = false;
        }
      });
    
    return (
        <>
        <div class="flex flex-col md:flex-row">
              <Link href={`/youtube/${props.video.channelId}`} class="text-sm text-brand-600">
                <img
                    width={100}
                    height={100}
                    src={props.video.thumbnails.default?.url || props.video.thumbnails.medium?.url || props.video.thumbnails.high?.url}
                    alt={props.video.title}
                    class="w-10 h-10 rounded"
                />
              </Link>
                <div class="">
                  {props.isFavorite ? 
                  <span onClick$={() => props.onAdd()} class="cursor-pointer">❤️</span> : 
                  <span onClick$={() => props.onRemove()} class="cursor-pointer">🤍</span>}
                    <div class="font-bold text-brand-700">{props.video.title}</div>
                    <div class="text-xs text-brand-500">{props.video.description}</div>
                </div>
            </div>
        <a class="bg-blue-600 text-white px-6 py-2 rounded ml-4" 
                    href={`https://www.youtube.com/watch?v=${props.video.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer">
                    Watch on YouTube
                </a>
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