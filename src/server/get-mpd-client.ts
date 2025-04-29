import mpdApi, { type MPDApi } from 'mpd-api';
import { getDb } from './db';

export type MPDClient = MPDApi.ClientAPI;

export async function getMPDClient() {
    const db = await getDb();
    const serverIp = (await db.getData()).admin?.server.ip || 'localhost';
    try{
        return await mpdApi.connect({ host: serverIp, port: 6600 });
    }catch(e){
        return await mpdApi.connect({ host: 'localhost', port: 6600 });
    }
}
