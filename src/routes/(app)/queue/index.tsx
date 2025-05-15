import { $, component$, useSignal, useTask$ } from '@builder.io/qwik';
import { useContext } from '@builder.io/qwik';
import { storesContext } from '../layout';
import { SongList } from '~/components/song/SongList';
import { Player } from '~/components/player/Player';
import { IsPlaying } from '~/components/player/IsPlaying';
import { routeLoader$ } from '@builder.io/qwik-city';
import { queue } from '~/server/mpd';
import { playThis as play } from '#mpd';
import { server$ } from '@builder.io/qwik-city';

export const useQueueData = routeLoader$(async () => {
    return await queue();
});
   
const playThis = $(async function ({pos}: {pos: number, uri: string | undefined}){
  await play(pos);
})

export const getLastFmCover = server$(async function(artist: string, album: string){
  // Obtén la API key del entorno
  const apiKey = this.env.get('API_KEY_LASTFM');
  if (!apiKey) throw new Error('No API key configurada');

  const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al consultar Last.fm');

  const data = await res.json();
  // Busca la imagen tamaño medium
  const image = data?.album?.image?.find( (img: any) => img.size === "large")?.['#text'] 
        //|| data?.album?.image?.at(-1)?.['#text'] 
        || null;
  return image;
});


export default component$(() => {
    const {queue, state, elapsed} = useContext(storesContext);
    const initialData = useQueueData();

    const showCover = useSignal(true);

    useTask$(() => {
      queue.queue = initialData.value.queue;
      queue.currentSong = initialData.value.currentSong;
    })

    function totalCurrentSong() {
      const current = queue.queue.find(item => item.uri === queue.currentSong);
      return (current?.time || 0) as number;
    }

    // Signal para la carátula
    const coverUrl = useSignal<string | null>(null);

    useTask$(async ({ track }) => {
      track(() => queue.currentSong);
      if (queue.currentSong) {
        const song = queue.queue.find(item => item.uri === queue.currentSong);
        if(song && song.album) 
          coverUrl.value = await getLastFmCover(song.artist, song.album);
      }
    });

    
    return (
      <>
        <div>
          <div class="flex flex-col md:flex-row md:items-start">
            {/* Columna izquierda: IsPlaying y Player */}
            <div class="flex-1 sticky top-0 bg-brand-50 z-10">
              <div class="flex justify-center position-relative z-1">
                <IsPlaying isPlaying={state.state === 'play'} />
              </div>
              <div class="flex justify-center ">
                <Player
                  single={state.single}
                  repeat={state.repeat}
                  state={state.state}
                  total={totalCurrentSong()}
                  volume={state.volume}
                />
              </div>
            </div>
            {/* Columna derecha: Cover, solo visible si showCover y coverUrl */}
            {showCover.value && coverUrl.value && (
              <div
                onClick$={() => (showCover.value = false)}
                class="flex justify-center md:justify-end md:ml-4 position-relative z-1 cursor-pointer"
              >
                <img
                  src={coverUrl.value}
                  alt="Album cover"
                  width="400"
                  height="400"
                  class="w-1/3 md:w-64"
                />
              </div>
            )}
          </div>
          <SongList
            playThis={playThis}
            songs={queue.queue}
            currentSong={{
              uri: queue.currentSong,
              elapsed: elapsed.value,
              total: totalCurrentSong(),
            }}
          />
        </div>
      </>
    );
  }
);
