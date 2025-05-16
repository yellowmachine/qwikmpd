import { component$, useSignal, $ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { ActionButton } from '~/components/action-button/action-button';
import { generateM3U } from '~/server/mpd';

/*
type YouTubeChannel = {
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  };
};
*/

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; width?: number; height?: number };
    medium?: { url: string; width?: number; height?: number };
    high?: { url: string; width?: number; height?: number };
  };
  channelId: string;
  channelTitle: string;
  publishedAt: string;
};


const searchYouTubeChannels = server$(async function(
  q: string
): Promise<YouTubeVideo[]> {

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q    
  )}&key=${this.env.get('YOUTUBE_API_KEY')}`;

  //const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=10&q=${encodeURIComponent(q
  //)}&key=${this.env.get('YOUTUBE_API_KEY')}`;

  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    channelId: item.snippet.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails
  }));
})


export default component$(() => {
  const query = useSignal('');
  const results = useSignal<YouTubeVideo[]>([]);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const generating = useSignal(false);

  const handleSearch = $(async () => {
    error.value = null;
    loading.value = true;
    results.value = [];
    try {
      results.value = await searchYouTubeChannels(query.value);
    } catch (e: any) {
      error.value = e.message || 'Error al buscar canales';
    }
    loading.value = false;
  });

  const onGenerate = $(async (videoId: string) => {
    try{
        generating.value = true;
        await generateM3U(videoId);
    }catch(err){
        console.log(err)
        //throw err;
    }
    finally{
        generating.value = false;
    }
  });

  return (
    <div class="max-w-md mx-auto p-4">
      <h1 class="text-2xl mb-4 text-brand-600">Search videos</h1>
      <div class="flex gap-2 mb-4">
        <input
          class="px-2 py-1 flex-1 border border-2 border-brand-300 rounded text-brand-500"
          type="text"
          placeholder="Nombre del canal"
          bind:value={query}
          onKeyDown$={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          class="bg-blue-600 text-white px-4 py-1 rounded"
          onClick$={handleSearch}
          disabled={loading.value}
        >
          {loading.value ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {error.value && <div class="text-red-600 mb-2">{error.value}</div>}
      <ul class="space-y-2">
        {results.value.map((video) => (
          <li key={video.channelId} class="border p-2 rounded border-2 border-brand-300">
            <div class="flex items-center gap-2">
                <img
                    width={100}
                    height={100}
                    src={video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url}
                    alt={video.title}
                    class="w-10 h-10 rounded"
                />
                <div class="">
                    <div class="font-bold text-brand-700">{video.title}</div>
                    <div class="text-xs text-brand-500">{video.description}</div>
                </div>
            </div>
            <div class="mt-2">
                {/*
                <Link
                    href={`/youtube/${video.channelId}`}
                    class="bg-brand-600 text-white px-2 py-1 rounded"
                >
                Go to channel
                </Link>*/}
                <a class="bg-blue-600 text-white px-6 py-2 rounded ml-4" 
                    href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer">
                    Watch on YouTube
                </a>
                <ActionButton action={$(() => onGenerate(video.videoId))} successMessage='Stream created'>
                    <button class="bg-brand-600 text-white px-6 py-2 rounded ml-4 cursor-pointer" 
                        disabled={generating.value}
                        >
                            Stream here!
                            {generating.value && (
                                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                    </button>
                </ActionButton>
                <style>
                {`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
            </div>            
          </li>
        ))}
      </ul>
    </div>
  );
});