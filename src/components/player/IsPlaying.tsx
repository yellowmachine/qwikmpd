import { component$, useStore, useTask$ } from "@builder.io/qwik";

export interface IsPlayingProps {
    isPlaying: boolean
}

export const IsPlaying = component$((props: IsPlayingProps) => {
    
    const state = useStore({
        visible: props.isPlaying,
        opacity: props.isPlaying ? 1 : 0,
      });
    
      useTask$(({ track }) => {
        track(() => props.isPlaying);
    
        if (props.isPlaying) {
          state.visible = true;
          state.opacity = 1;
        } else {
          state.opacity = 0;
          setTimeout(() => {
            state.visible = false;
          }, 700); // duración igual a la transición CSS
        }
      });

    return (
        <>{state.visible &&
            <>
                <h1
                    class={`text-6xl font-extrabold leading-[1.2] text-transparent bg-clip-text
                            bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400
                            animate-gradient mb-4 transition-opacity duration-700`}
                    style={{
                        backgroundSize: '200% 200%',
                        opacity: state.opacity,
                        pointerEvents: state.opacity === 1 ? 'auto' : 'none',
                        }}
                >
                    Playing!
                </h1>

                <style>{`
                    @keyframes gradient-x {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    }
                    .animate-gradient {
                    animation: gradient-x 3s ease-in-out infinite;
                    }
                `}</style>
            </>
        }
        </>
    )
})
