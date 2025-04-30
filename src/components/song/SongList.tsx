import { component$,  } from '@builder.io/qwik';
import type { Song as TSong } from '~/lib/song';
import { Song } from './Song';

export interface SongListProps {
  songs: TSong[];
}

export const SongList = component$<SongListProps>(( {songs} ) => {
    return (
        <>
            <ul class="mt-4">
                {songs.map((song) => (
                <li class="mb-4"><Song song={song} key={song.uri} /></li>
                ))}
            </ul>
        </>
    )
});