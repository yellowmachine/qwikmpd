import { component$, useTask$ } from '@builder.io/qwik';
import { useContext } from '@builder.io/qwik';
import { storesContext } from '../layout';
import { SongList } from '~/components/song/SongList';
import { Player } from '~/components/player/Player';
import { IsPlaying } from '~/components/player/IsPlaying';
import { routeLoader$ } from '@builder.io/qwik-city';
import { queue } from '~/server/mpd';

export const useQueueData = routeLoader$(async () => {
    return await queue();
});
   

export default component$(() => {
    const {queue, state, elapsed} = useContext(storesContext);
    const initialData = useQueueData();

    useTask$(() => {
      queue.queue = initialData.value.queue;
      queue.currentSong = initialData.value.currentSong;
    })

    function totalCurrentSong() {
      const current = queue.queue.find(item => item.uri === queue.currentSong);
      return (current?.time || 0) as number;
    }
    
    
    return (
      <>
        <IsPlaying isPlaying={state.state === 'play'} />
        <Player state={state.state} total={totalCurrentSong()} volume={state.volume} />
        <SongList 
          songs={queue.queue} 
          currentSong={ { uri: queue.currentSong, elapsed: elapsed.value, total: totalCurrentSong()} } />
      </>
    );
  }
);
