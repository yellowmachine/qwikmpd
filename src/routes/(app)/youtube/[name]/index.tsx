import { $, component$, useSignal } from '@builder.io/qwik';
import { getChannelVideos } from '~/server/mpd';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import YoutubeVideo from '~/components/youtube/YoutubeVideo';
import { 
  useFavorites, 
  type Channel,
  //addYoutubeFavorite$, 
  type YoutubeVideo as YT,
  //removeYoutubeFavorite$ 
} from '~/server/youtube';


const addYoutubeFavorite$ = server$(async function(channel: Channel) {
  const { addYoutubeFavorite } = await import('~/server/db.server');
  return await addYoutubeFavorite(channel);
});

const removeYoutubeFavorite$ = server$(async function(channelId: string) {
  const { removeYoutubeFavorite } = await import('~/server/db.server');
  return await removeYoutubeFavorite(channelId);
});

export {useFavorites} from '~/server/youtube'

export const useVideos = routeLoader$(async (event) => {
  
  const channelId = event.params.name || 'TU_CHANNEL_ID_POR_DEFECTO';
  
  if(!channelId)
    return []
  return await getChannelVideos(channelId);
});


export default component$(() => {
  const favorites  = useFavorites(); 
  const videos = useVideos();
  const localFavorites = useSignal(favorites.value);

  const isFavorite = (channelId: string) => {
    return localFavorites.value.some((favorite) => favorite.channelId === channelId);
  };

  const onAdd = $(async (video: YT) => {
    const newFavorites = await addYoutubeFavorite$({
      channelId: video.channelId, 
      channelTitle: video.channelTitle, 
      thumbnail: video.thumbnails.default.url
    });
    localFavorites.value = newFavorites;
  })

  const onRemove = $(async (channelId: string) => {
    const newFavorites = await removeYoutubeFavorite$(channelId)
    localFavorites.value = newFavorites;
  })

  return (
    <div>
      <h1 class="text-3xl text-brand-300 mb-4">Last videos</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {videos.value.map((video) => (
              <div class="border border-2 border-brand-300 rounded-md p-4"
                key={video.videoId}
              >
                <YoutubeVideo 
                  video={video}
                  onAdd={$(() => onAdd(video))}
                  onRemove={$(() => onRemove(video.channelId))}
                  isFavorite={isFavorite(video.channelId)} 
                />
              </div>
            ))}
          </div>
    </div>
  );
});
