import { component$,  } from '@builder.io/qwik';
import type { Song as TSong } from '~/lib/song';
import { Song } from './Song';

export interface SongListProps {
  songs: TSong[];
}

export const SongList = component$<SongListProps>(( {songs} ) => {
    return (
        <>
            <div class="border border-2 border-brand-300">
                {songs.map((song) => (
                    <Song song={song} currentSong={null} key={song.uri} />
                ))}
            </div>
        </>
    )
});