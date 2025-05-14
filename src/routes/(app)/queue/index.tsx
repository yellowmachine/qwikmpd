import { $, component$, useTask$ } from '@builder.io/qwik';
import { useContext } from '@builder.io/qwik';
import { storesContext } from '../layout';
import { SongList } from '~/components/song/SongList';
import { Player } from '~/components/player/Player';
import { IsPlaying } from '~/components/player/IsPlaying';
import { routeLoader$ } from '@builder.io/qwik-city';
import { queue } from '~/server/mpd';
import { playThis as play } from '#mpd';

export const useQueueData = routeLoader$(async () => {
    return await queue();
});
   
const playThis = $(async function ({pos}: {pos: number, uri: string | undefined}){
  await play(pos);
})

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
      <div>
          <div class="flex justify-center">
            <IsPlaying isPlaying={state.state === 'play'} />
          </div>
          <div class="flex justify-center sticky top-0 bg-brand-50 z-10">
            <Player repeat={state.repeat} state={state.state} total={totalCurrentSong()} volume={state.volume} />
          </div>
          <SongList playThis={playThis}
            songs={queue.queue} 
            currentSong={ { uri: queue.currentSong, elapsed: elapsed.value, total: totalCurrentSong()} } />
      </div>
    );
  }
);
