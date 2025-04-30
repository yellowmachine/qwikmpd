import { component$ } from "@builder.io/qwik";

export interface IsPlayingProps {
    isPlaying: boolean
}

export const IsPlaying = component$((props: IsPlayingProps) => {
    
    return (
        <>
            { props.isPlaying && 
             <>
                <h1
                    class="text-6xl font-extrabold leading-[1.2] text-transparent bg-clip-text
                    bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400
                    animate-gradient mb-4"
                    style="background-size: 200% 200%;"
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
                `}
                </style>
            </>
            }
        </>
    )
})
