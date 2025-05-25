import type { RequestHandler } from '@builder.io/qwik-city';
import { updateAppViaSSHStream } from '~/server/mpd';

export const onPost: RequestHandler = async ({ request, json }) => {
  try {
    const body = await request.json();
    if(body && body.nv) {
        await updateAppViaSSHStream();
        json(200, { success: true, message: 'Updating...'});
    }else{
        json(400, { success: false, error: 'Invalid request'});
    }
  } catch (error) {
    json(500, { success: false, error: 'Error' });
  }
};
