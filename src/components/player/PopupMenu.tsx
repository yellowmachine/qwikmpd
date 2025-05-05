import { $, component$ } from "@builder.io/qwik";
import { ActionButton } from "../action-button/action-button";
import { shuffle, repeat } from '~/server/mpd';


export const PopupMenu = component$(() => {
    const onRepeat = $(async () => {
        await repeat();
    })

    const onShuffle = $(async () => {
        await shuffle();
    });

    return <>
        <div aria-label="acciones" role="menu" class="absolute left-0 top-full mt-2 z-50">
            <div class="bg-white rounded-lg shadow-lg p-4 w-40">
                <div class="flex flex-col gap-2">
                    <ActionButton action={onShuffle} successMessage="ok" >
                        <button class="bg-white text-gray-600 hover:bg-gray-300 transition px-4 rounded" >
                            shuffle
                        </button>
                    </ActionButton>
                    <ActionButton action={onRepeat} successMessage="yes, ok" >
                        <button class="bg-white text-gray-600 hover:bg-gray-300 transition px-4 rounded" >
                            repeat
                        </button>
                    </ActionButton>
                </div>
            </div>
      </div>
    </>
});