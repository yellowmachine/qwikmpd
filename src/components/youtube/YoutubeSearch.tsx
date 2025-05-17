import { component$, useSignal, $, type QRL } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { Combobox } from '@qwik-ui/headless';

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

// Hook de debounce
export const useDebouncer = <A extends readonly unknown[], R>(
  fn: QRL<(...args: A) => R>,
  delay: number,
): QRL<(...args: A) => void> => {
  const timeoutId = useSignal<number>();
  return $((...args: A): void => {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = window.setTimeout((): void => {
      // @ts-expect-error Qwik QRL typing issue, see https://github.com/QwikDev/qwik/issues/7553
      void fn(...args);
    }, delay);
  });
};

const searchYouTubeChannels = server$(async function(
  q: string
): Promise<YouTubeVideo[]> {

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=10&q=${encodeURIComponent(q
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

interface AutocompleteProps {
  onSelect$: QRL<(value: string) => void>;
}

export default component$((props: AutocompleteProps) => {
    const options = useSignal<YouTubeVideo[]>([
    ]);
  
    const displayValue = useSignal('');
    const loading = useSignal(false);


  const handleChange$ = $(async (value: string) => {
        displayValue.value = value;
        props.onSelect$(value);
    });

const fetchOptions = $(async (query: string) => {
    loading.value = true;
    const result = await searchYouTubeChannels(query);
    options.value = result
    loading.value = false;
  });

    const debouncedFetch = useDebouncer(fetchOptions, 1000);

  return (
    <div class="relative w-full max-w-md mx-auto mt-8">
      <Combobox.Root
        onChange$={handleChange$}
        bind:displayValue={displayValue}
      >
        <Combobox.Label class="block mb-1 font-semibold text-brand-600">Search videos on youtube</Combobox.Label>
        <Combobox.Control>
          <Combobox.Input
            class="border border-2 border-brand-200 rounded px-3 py-2 text-brand-700"
            placeholder="Escribe para buscar..."
            onInput$={async e => {
              const val = (e.target as HTMLInputElement).value;
              displayValue.value = val || '';
              await debouncedFetch(val);
            }}
          />
          <Combobox.Trigger class="bg-brand-500 hover:bg-brand-600 text-white px-3 cursor-pointer ml-2 rounded">
            search
          </Combobox.Trigger>  
        </Combobox.Control>
        <Combobox.Popover class="absolute z-10 mt-1 bg-white border border-2 border-brand-200 rounded shadow-lg">
          {options.value.map((opt) => (
            <Combobox.Item
              key={opt.videoId}
              value={opt.videoId}
              class="cursor-pointer px-4 py-2 hover:bg-gray-100"
            >
              <Combobox.ItemLabel>{opt.title}</Combobox.ItemLabel>
               <div>
                    <span class="text-xs text-gray-400">{opt.channelTitle}</span>
                </div>
            </Combobox.Item>
          ))}
        </Combobox.Popover>
      </Combobox.Root>
    </div>
  );
});
