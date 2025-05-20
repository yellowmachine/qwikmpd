import { routeLoader$, server$ } from '@builder.io/qwik-city';

export type Channel = {
  channelId: string;
  channelTitle: string;
  thumbnail?: string;  
}

export type YoutubeVideo = {
  thumbnails: {
    default: {
      url: string;
    };
    medium: {
      url: string;
    };
    high: {
      url: string;
    };
  };
  channelId: string;
  channelTitle: string;
  tittle: string;
  description: string;
  title: string;
  videoId: string;
};


export const useFavorites = routeLoader$(async () => {
  const { getYoutubeFavorites } = await import('~/server/db.server');
  return await getYoutubeFavorites();
});

export const addYoutubeFavorite$ = server$(async function(channel: Channel) {
  const { addYoutubeFavorite } = await import('~/server/db.server');
  return await addYoutubeFavorite(channel);
});

export const removeYoutubeFavorite$ = server$(async function(channelId: string) {
  const { removeYoutubeFavorite } = await import('~/server/db.server');
  return await removeYoutubeFavorite(channelId);
});