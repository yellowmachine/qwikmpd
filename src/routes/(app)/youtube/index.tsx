import { component$, useSignal, $ } from '@builder.io/qwik';
import { Link, server$ } from '@builder.io/qwik-city';

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

const searchYouTubeChannels: (name: string) => Promise<YouTubeChannel[]> = server$(async function(
  name: string
): Promise<YouTubeChannel[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=10&q=${encodeURIComponent(
    name
  )}&key=${this.env.get('YOUTUBE_API_KEY')}`;

  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    channelId: item.snippet.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails
  }));
})


export default component$(() => {
  const query = useSignal('');
  const results = useSignal<YouTubeChannel[]>([]);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

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

  return (
    <div class="max-w-md mx-auto p-4">
      <h1 class="text-2xl mb-4">Buscar canales de YouTube</h1>
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
        {results.value.map((channel) => (
          <li key={channel.channelId} class="flex items-center gap-2 border p-2 rounded">
            <img
              width={100}
              height={100}
              src={channel.thumbnails.high?.url || channel.thumbnails.medium?.url || channel.thumbnails.default?.url}
              alt={channel.title}
              class="w-10 h-10 rounded"
            />
            <div class="flex-1">
              <div class="font-bold text-brand-700">{channel.title}</div>
              <div class="text-xs text-brand-500">{channel.description}</div>
            </div>
            <Link
              href={`/youtube/${channel.channelId}`}
              class="bg-brand-600 text-white px-2 py-1 rounded"
            >
              Goto
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});