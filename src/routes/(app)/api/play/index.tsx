import { type RequestHandler } from '@builder.io/qwik-city';
import { playUri } from '~/server/mpd';
 
export const onPost: RequestHandler = async ({ parseBody, json }) => {

  try{  
    const body = await parseBody() as { uri: string };
    if (!body.uri) {
      json(400, { error: 'Falta el campo uri en el body' });
    }else{
      const { uri } = body;
      await playUri(uri);

      json(200, { playing: true });
    }
  }catch(e){
    json(500, { error: e });
  }
};

//curl -X POST http://localhost:5173/api/play -d '{"uri":"acdc/1. Hells Bells.flac"}' -H "Content-Type: application/json" 