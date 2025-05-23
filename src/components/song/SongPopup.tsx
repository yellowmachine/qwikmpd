import { $, component$ } from "@builder.io/qwik";
import { ActionButton } from "../action-button/action-button";

export const SongPopUp = component$(() => {
    const f = $(async () => {
        
    })
    return <>
        <div aria-label="acciones" role="menu" class="absolute left-0 top-full mt-2 z-50">
            <div class="bg-white rounded-lg shadow-lg p-4 w-40">
                <div class="flex flex-col gap-2">
                    <ActionButton action={f} successMessage="ok" >
                        <button class="bg-white text-gray-600 hover:bg-gray-300 transition px-4 rounded" >
                            play
                        </button>
                    </ActionButton>
                    <ActionButton action={f} successMessage="yes, ok" >
                        <button class="bg-white text-gray-600 hover:bg-gray-300 transition px-4 rounded" >
                            remove from playlist
                        </button>
                    </ActionButton>
                </div>
            </div>
      </div>
    </>
});