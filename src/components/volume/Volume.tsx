import { component$, type QRL } from '@builder.io/qwik';
import { VolumeBar } from '../player/VolumeBar';


export interface VolumeProps {
  volume: number;
  onVolumeChange$?: QRL<(v: number) => void>;
}

export const Volume = component$(( {volume, onVolumeChange$} : VolumeProps) => {

    return <>
        <span class="text-brand-500 text-xl">{volume}</span>
        <VolumeBar onVolumeChange$={onVolumeChange$} volume={volume} />
    </>
});