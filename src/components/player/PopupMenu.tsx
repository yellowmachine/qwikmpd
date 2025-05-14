import { $, component$ } from "@builder.io/qwik";
import { ActionButton } from "../action-button/action-button";
import { shuffle, repeat, single } from '~/server/mpd';

export interface PopupMenuProps {
    repeat: boolean;
    single: boolean;
}


export const PopupMenu = component$((props: PopupMenuProps) => {
    const onRepeat = $(async () => {
        await repeat(!props.repeat);
    })

    const onShuffle = $(async () => {
        await shuffle();
    });

    const onSingle = $(async () => {
        await single(!props.single);
    });

    return <>
        <div aria-label="acciones" role="menu" class="absolute right-0 top-full mt-2 z-50">
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
                    <ActionButton action={onSingle} successMessage="yes, ok" >
                        <button class="bg-white text-gray-600 hover:bg-gray-300 transition px-4 rounded" >
                            single
                        </button>
                    </ActionButton>
                </div>
            </div>
      </div>
    </>
});