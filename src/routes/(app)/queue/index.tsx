import { component$ } from '@builder.io/qwik';
import {
    useContext
} from '@builder.io/qwik';
import { storesContext } from '../layout';
import { SongList } from '~/components/song/SongList';
import { Player } from '~/components/player/Player';
import { IsPlaying } from '~/components/player/IsPlaying';

export default component$(() => {
    const {queue, state} = useContext(storesContext);
    return (
      <>
        <IsPlaying isPlaying={state.state === 'play'} />
        <Player state={state.state} total={state.time?.total || 0} volume={state.volume} />
        <div>Volumen en Child: {state.volume}</div>
        <div>Canción actual: {queue.currentSong}</div>
        <SongList songs={queue.queue} />
      </>
    );
  }
);
