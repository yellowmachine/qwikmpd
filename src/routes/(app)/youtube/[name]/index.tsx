import { component$ } from '@builder.io/qwik';
import { getChannelVideos, generateM3U } from '~/server/mpd';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useVideos = routeLoader$(async (event) => {
  const channelId = event.params.name || 'TU_CHANNEL_ID_POR_DEFECTO';
  
  if(!channelId)
    return []
  return await getChannelVideos(channelId);
});


export default component$(() => {
   
  const videos = useVideos();

  return (
    <div>
      <h1 class="text-3xl text-brand-300 mb-4">Last videos</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {videos.value.map((video) => (
              <div class="border border-2 border-brand-300 rounded-md p-4"
                key={video.videoId}
                
              >
                <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                  <img
                    width={200}
                    height={100}
                    src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
                    alt={video.title}
                    style={{ width: '100%', borderRadius: '6px' }}
                  />
                </a>
                <h3 style={{ fontSize: '1rem', margin: '0.5rem 0' }}>
                  {video.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
                <a class="bg-blue-600 text-white px-6 py-2 rounded mt-4 mr-4" 
                   href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                   target="_blank" 
                   rel="noopener noreferrer">
                      Watch on YouTube
                </a>
                <button class="bg-brand-600 text-white px-6 py-2 rounded mt-4" onClick$={() => generateM3U(video.videoId)}>Stream here!</button>
              </div>
            ))}
          </div>
    </div>
  );
});
