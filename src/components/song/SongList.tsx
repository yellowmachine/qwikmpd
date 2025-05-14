import { component$, type QRL  } from '@builder.io/qwik';
import type { Song as TSong } from '~/lib/types';
import { Song } from './Song';

export interface SongListProps {
  songs: TSong[];
  playThis: QRL<({pos, uri}: {pos: number, uri: string | undefined}) => Promise<void>>;
  currentSong: {
    uri: string;
    elapsed: number;
    total: number;
  } | null
}

export const SongList = component$<SongListProps>(( {songs, currentSong, playThis} ) => {
    return (
        <>
            <div class="">
                {songs.map((song) => (
                    <div class="border border-2 border-brand-300 mb-2" key={song.uri}>
                        <Song playThis={playThis} song={song} currentSong={currentSong} pos={songs.indexOf(song)} />
                    </div>
                ))}
            </div>
        </>
    )
});