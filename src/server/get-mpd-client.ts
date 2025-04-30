import { RequestEvent, RequestEventBase } from '@builder.io/qwik-city';
import mpdApi, { type MPDApi } from 'mpd-api';
import { getDb } from './db';
import WaitQueue from 'wait-queue';
import { formatSongArray, Song } from '~/api/song';
import { executeSSHServer } from '~/api/ssh';

export type MPDClient = MPDApi.ClientAPI;


class Mpd{
    private client: MPDClient | null = null;
    private subscriptors: Record<number, WaitQueue<MPDEvent>> = {};
    private id = 0;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private connecting = false;
    private mpdServer: string | null = null;
    private initializingPromise: Promise<void> | null = null;

    setMpdServer(mpdServer: string){
        this.mpdServer = mpdServer
    }

    async initialize() {
      if (this.initializingPromise) {
        return this.initializingPromise;
      }
      this.initializingPromise = (async () => {
        this.connecting = true;
        try {
            if (!this.client) {
                this.connecting = true;
                this.client = await mpdApi.connect({ host: this.mpdServer!, port: 6600 });
                console.log('MPD listo para recibir eventos.');
                this.reconnectAttempts = 0;
                this.connecting = false;

                this.client.on('system', (eventName: string) => {
                    if(eventName === 'player' || eventName === 'mixer'){
                        const palyerData = this.client?.api.status as unknown as PlayerData;
                        this.broadcast({type: 'player', data: palyerData});

                        const queueData = this.client?.api.queue as unknown as QueueData;
                        this.broadcast({type: 'queue', data: queueData});
                    }else if(eventName === 'playlist'){
                        const queueData = this.client?.api.queue as unknown as QueueData;
                        this.broadcast({type: 'queue', data: queueData});
                    }else if(eventName === 'mixer'){
                        
                    }
                });
        
                this.client.on('error', (err) => {
                    console.error('Error en MPD:', err);
                    this.tryReconnect();
                });
        
                this.client.on('close', () => {
                    console.log('Conexión MPD cerrada');
                    this.tryReconnect();
                });
            }
        } catch (error) {
            this.reconnectAttempts++;
            console.error(`Error al conectar MPD (intento ${this.reconnectAttempts}):`, error);
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                throw new Error('Máximo número de intentos de reconexión alcanzado.');
            }
            // Esperar 2 segundos antes de reintentar
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
         finally {
          this.connecting = false;
          this.initializingPromise = null;
        }
      })();
      return this.initializingPromise;
    }

    private async tryReconnect() {
        //if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        //  console.error('Máximo número de intentos de reconexión alcanzado.');
        //  return;
        //}
        this.reconnectAttempts++;
        console.log(`Intento de reconexión #${this.reconnectAttempts}`);
        try {
          await this.initialize();
        } catch (error) {
          console.error('Error en reconexión:', error);
          setTimeout(() => this.tryReconnect(), 2000);
        }
    }      

    private async addListener(){
        const id = this.id++;
        const queue = new WaitQueue<MPDEvent>();
        this.subscriptors[id] = queue;
        return { id, queue };
    }
    private removeListener(id: number){
        delete this.subscriptors[id];

    }
    private broadcast(msg: MPDEvent){
        for(const q of Object.values(this.subscriptors)){
            q.push(msg);
        }
    }

    async *subscribe() {
        const { id, queue } = await this.addListener();
        
        try {
          while (true) {
            yield await queue.pop();
          }
        } finally {
          this.removeListener(id);
        }
    }

    async play(pos?: number) {
        await this.client?.api.playback.play(''+pos || '0');
    }

    async pause() {
        await this.client?.api.playback.pause();
    }   

    async stop() {
        await this.client?.api.playback.stop();
    }

    async next() {
        await this.client?.api.playback.next();
    }   

    async previous() {
        await this.client?.api.playback.prev();
    }

    async seek(seconds: number) {
        await this.client?.api.playback.seek(''+seconds);
    }

    async setVolume(volume: number) {
        await this.client?.api.playback.setvol(''+volume);
    }

    async add(uri: string) {
        await this.client?.api.queue.add(uri);
    }

    async remove(uri: string) {
        await this.client?.api.queue.delete(uri);
    }

    async clear() {
        await this.client?.api.queue.clear();
    }

    async load(name: string) {
        await this.client?.api.playlists.load(name);
    }

    async playHere(path: string){
        await this.clear();
        await this.load(path);
        await this.play();
    }
    async list(secret: string, path: string){
        const mpcPlaylist = await executeSSHServer('mpc -f "%artist% - %title% - %id% - %file% - %time%" listall "' + path + '"', secret);
        const files = formatSongArray(mpcPlaylist).filter(item => path !== '' && item.uri.startsWith(path));
        const currentSong = await executeSSHServer('mpc current -f "%file%"', secret);
            
        const result = await this.client?.api.db.listall(path) as ListAllItem[];
        const directories = result.
        filter(item => typeof item.directory === 'string' && item.directory.startsWith(path)).
        map(item => item.directory).filter(item => item !== undefined)
        
        return {files, directories, currentSong};
    }
    
}

type ListAllItem = { file?: string; directory?: string };


export type QueueData = {queue: Song[], currentSong: string};
type QueueEvent = { type: 'queue', data: QueueData}

export type PlayerData = {volume: number, state: 'playing' | 'paused' | 'stopped'};
type PlayerEvent = { type: 'player', data: PlayerData}

export type MPDEvent = QueueEvent | PlayerEvent;

let mpdClient: Mpd | null = null;

interface Env {
    [key: string]: string;
}

export async function queueMsg(secret: string): Promise<QueueData> { 
    let msg;
    try {
      const mpcPlaylist = await executeSSHServer('mpc -f "%artist% \\ %title% \\ %id% \\ %file% \\ %time%" playlist', secret);
      const queue = formatSongArray(mpcPlaylist);
      const currentSong = await executeSSHServer('mpc current -f "%file%"', secret);
      
      msg = {queue, currentSong};
    } catch {
      msg = {queue: [], currentSong: ''};
    }
    return msg;
  }
  
export async function playlistMsg(secret: string){
    return await queueMsg(secret);
}
  
export const getMpdClient = async (requestEvent: RequestEventBase<{env: Env}>) => {
    if(!mpdClient){
        const mpdServer = requestEvent.env.get('MPD_SERVER')!;
        mpdClient = new Mpd();
        mpdClient.setMpdServer(mpdServer);
        await mpdClient.initialize();
    }

    const secret = requestEvent.env.get('SECRET')!;
    return new Proxy(mpdClient, {
        get(target, prop, receiver) {
          if (prop === 'list') {
            return (path: string) => target.list(secret, path);
          }
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
}