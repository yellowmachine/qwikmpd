import { component$, type QRL } from '@builder.io/qwik';
//import { VolumeBar } from './VolumeBar';


export interface VolumeProps {
  volume: number;
  onVolumeChange$?: QRL<(v: number) => void>;
}

export const Volume = component$(( {volume} : VolumeProps) => {

    return <>
        <span class="text-xl">{volume}</span>
        {/*<VolumeBar onVolumeChange$={onVolumeChange$} volume={volume} />*/}
    </>
});