import { component$, type QRL, Slot } from '@builder.io/qwik';

export interface PlayerButtonProps {
    onClick$?: QRL<() => void>
}

export default component$(( {onClick$}: PlayerButtonProps ) => {

    return (
        <>
            <div class="flex items-center gap-4 border-2 rounded-md p-4 w-max bg-white text-orange-500 dark:bg-orange-500 dark:text-white">
                <button onClick$={onClick$}
                    class="flex items-center justify-center rounded-md transition bg-white text-orange-500 dark:bg-orange-500 dark:text-white
                        hover:bg-orange-300 hover:shadow-lg active:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    
                >
                    <Slot />
                </button>
                 
            </div>
        </>
        
    );
});
