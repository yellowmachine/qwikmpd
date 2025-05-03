import { component$, type QRL, Slot } from '@builder.io/qwik';

export interface PlayerButtonProps {
    onClick$?: QRL<() => void>
}

export default component$(( {onClick$}: PlayerButtonProps ) => {

    return (
        <>
            <div class="">
                <button onClick$={onClick$}
                    class=""
                    
                >
                    <Slot />
                </button>
                 
            </div>
        </>
        
    );
});
