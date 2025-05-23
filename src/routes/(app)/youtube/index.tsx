import { component$, useSignal, $ } from '@builder.io/qwik';
import { Link, server$ } from '@builder.io/qwik-city';
import YoutubeVideo from '~/components/youtube/YoutubeVideo';
import { 
  useFavorites, type Channel,
  //addYoutubeFavorite$, 
  //removeYoutubeFavorite$
 } from '~/server/youtube';
import type { YoutubeVideo as YT } from '~/server/youtube';

export {useFavorites} from '~/server/youtube'


const searchYouTubeChannels = server$(async function(q: string): Promise<YT[]> {

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q    
  )}&key=${this.env.get('YOUTUBE_API_KEY')}`;

  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails
  }));
})

const addYoutubeFavorite$ = server$(async function(channel: Channel) {
  const { addYoutubeFavorite } = await import('~/server/db.server');
  return await addYoutubeFavorite(channel);
});

const removeYoutubeFavorite$ = server$(async function(channelId: string) {
  const { removeYoutubeFavorite } = await import('~/server/db.server');
  return await removeYoutubeFavorite(channelId);
});

export default component$(() => {
  
  const results = useSignal<YT[]>([]);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);
  const favorites  = useFavorites();
  const localFavorites = useSignal(favorites.value);

  const isFavorite = (channelId: string) => {
    return localFavorites.value.some((favorite) => favorite.channelId === channelId);
  };

  const onAdd = $(async (video: YT) => {
    const newFavorites = await addYoutubeFavorite$({channelId: video.channelId, channelTitle: video.channelTitle, thumbnail: video.thumbnails.default.url});
    localFavorites.value = newFavorites;
  })

  const onRemove = $(async (channelId: string) => {
    const newFavorites = await removeYoutubeFavorite$(channelId)
    localFavorites.value = newFavorites;
  })

  const handleSearch = $(async (value: string) => {
    error.value = null;
    loading.value = true;
    results.value = [];
    try {
      results.value = await searchYouTubeChannels(value);
    } catch (e: any) {
      error.value = e.message || 'Error searching YouTube';
    }
    loading.value = false;
  });

  return (
    <div class="max-w-md mx-auto p-4">
      <h1 class="text-2xl mb-4 text-brand-600">Youtube</h1>
      {localFavorites.value.length > 0 && <h2 class="text-lg mb-2 text-brand-600">Favorites</h2>}
      <ul>
      {localFavorites.value.map((favorite) => (
        <li key={favorite.channelId} class="p-2 mt-2">
          <img 
            width={100}
            height={100}
            src={favorite.thumbnail}
            alt={favorite.channelTitle}
            class="w-10 h-10 rounded"
          />
          <Link href={`/youtube/${favorite.channelId}`} class="text-sm text-brand-600">{favorite.channelTitle}</Link>
          <button
            class="bg-red-600 text-white px-2 py-1 rounded ml-2"
            onClick$={() => onRemove(favorite.channelId)}
          >
            Remove
          </button>
        </li>  
      ))}
      </ul>
      <div class="flex gap-2 mb-4">
        {/*<YoutubeSearch onSelect$={handleSearch} />*/}
        <input type="text"
          class="border border-brand-300 rounded p-2 w-full"
          placeholder="Search YouTube"
          onChange$={(e) => {
            handleSearch((e.target as HTMLInputElement).value);
          }}
        />
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded"
          onClick$={() => handleSearch('')}
        >
          Search
        </button>
      </div>
      {error.value && <div class="text-red-600 mb-2">{error.value}</div>}
      <ul class="space-y-2">
        {results.value.map((video) => (
          <li key={video.channelId} class="border p-2 rounded border-2 border-brand-300">
            <div class="mt-2">
                <YoutubeVideo 
                  video={video}
                  onAdd={$(() => onAdd(video))}
                  onRemove={$(() => onRemove(video.channelId))}
                  isFavorite={isFavorite(video.channelId)}
                  />
            </div>            
          </li>
        ))}
      </ul>
    </div>
  );
});