import { component$,  } from '@builder.io/qwik';
import type { Song as TSong } from '~/lib/song';
import { Song } from './Song';

export interface SongListProps {
  songs: TSong[];
  currentSong: {
    uri: string;
    elapsed: number;
    total: number;
  } | null
}

export const SongList = component$<SongListProps>(( {songs, currentSong} ) => {
    return (
        <>
            <div class="">
                {songs.map((song) => (
                    <div class="border border-2 border-brand-300 mb-2" key={song.uri}>
                        <Song song={song} currentSong={currentSong} pos={songs.indexOf(song)} />
                    </div>
                ))}
            </div>
        </>
    )
});