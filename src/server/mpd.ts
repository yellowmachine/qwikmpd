import { RequestEvent, RequestEventBase, server$ } from '@builder.io/qwik-city';
import mpdApi, { type MPDApi } from 'mpd-api';
import WaitQueue from 'wait-queue';
import { formatSongArray, Song } from '~/lib/song';
import { executeSSHServer } from '~/server/ssh';


export type MPDClient = MPDApi.ClientAPI;


class Mpd{
    private client: MPDClient | null = null;
    private subscriptors: Record<number, WaitQueue<MPDEvent>> = {};
    private id = 0;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    //private connecting = false;
    private mpdServer: string | null = null;
    private initializingPromise: Promise<void> | null = null;

    setMpdServer(mpdServer: string){
        this.mpdServer = mpdServer
    }

    async initialize(secret: string) {
      if (this.initializingPromise) {
        return this.initializingPromise;
      }
      this.initializingPromise = (async () => {
        //this.connecting = true;
        try {
            if (!this.client) {
                //this.connecting = true;
                console.log('Conectando MPD...');
                this.client = await mpdApi.connect({ host: this.mpdServer!, port: 6600 });
                console.log('MPD listo para recibir eventos.');
                this.reconnectAttempts = 0;
                //this.connecting = false;

                const statusData = this.client?.api.status as unknown as StatusData;
                this.broadcast({type: 'status', data: statusData});

                const queueData = await queueMsg(secret);
                this.broadcast({type: 'queue', data: queueData});

                this.client.on('system', async (eventName: string) => {
                    if(eventName === 'player' || eventName === 'mixer'){
                        const statusData = this.client?.api.status as unknown as StatusData;
                        this.broadcast({type: 'status', data: statusData});

                        //const queueData = await queueMsg(secret);
                        //this.broadcast({type: 'queue', data: queueData});
                    }else if(eventName === 'playlist'){
                        const queueData = await queueMsg(secret);
                        this.broadcast({type: 'queue', data: queueData});
                    }
                });
        
                this.client.on('error', (err) => {
                    console.error('Error en MPD:', err);
                    this.tryReconnect(secret);
                });
        
                this.client.on('close', () => {
                    console.log('Conexión MPD cerrada');
                    this.tryReconnect(secret);
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
          //this.connecting = false;
          this.initializingPromise = null;
        }
      })();
      return this.initializingPromise;
    }

    private async tryReconnect(secret: string) {
        this.reconnectAttempts++;
        console.log(`Intento de reconexión #${this.reconnectAttempts}`);
        try {
          await this.initialize(secret);
        } catch (error) {
          console.error('Error en reconexión:', error);
          setTimeout(() => this.tryReconnect(secret), 2000);
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

    secret(){
        return null;
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

type StatusEvent = { type: 'status', data: StatusData}

export type MPDEvent = QueueEvent | StatusEvent;

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
      //msg = {queue: [], currentSong: ''};
    } catch {
      msg = {queue: [], currentSong: ''};
    }
    return msg;
  }
  
export async function playlistMsg(secret: string){
    return await queueMsg(secret);
}
  
export const getMpdClient = async (requestEvent: RequestEventBase<{env: Env}>) => {

    const secret = requestEvent.env.get('SECRET')!;

    if(!mpdClient){
        const mpdServer = requestEvent.env.get('MPD_SERVER')!;
        mpdClient = new Mpd();
        mpdClient.setMpdServer(mpdServer);
        await mpdClient.initialize(secret);
    }

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

export type StatusData = {
    currentSong: {
      title: string,
      artist: string
    },
    volume: number;
    repeat: boolean;
    random: boolean;
    single: boolean;
    consume: boolean;
    playlist: number;
    playlistlength: number;
    mixrampdb: number;
    state: 'play' | 'stop' | 'pause';
    song: number;
    songid: number;
    time: {
      elapsed: number;
      total: number;
    };
    elapsed: number;
    bitrate: string;
    audio: {
      sampleRate: number;
      bits: number;
      channels: number;
      sample_rate_short: {
        value: number;
        unit: 'kHz';
      };
    };
    nextsong: number;
    nextsongid: number;
  };

// 1. Define el tipo con los métodos públicos que quieres exponer
type MpdMethods = {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  add: (uri: string) => Promise<void>;
  remove: (uri: string) => Promise<void>;
  clear: () => Promise<void>;
  load: (name: string) => Promise<void>;
  playHere: (path: string) => Promise<void>;
  // Agrega más métodos si es necesario
};

// 2. Extraemos las claves para controlar qué métodos exponer
const exposedMethods = Object.keys({
  play: null,
  pause: null,
  stop: null,
  next: null,
  previous: null,
  seek: null,
  setVolume: null,
  add: null,
  remove: null,
  clear: null,
  load: null,
  playHere: null,
}) as (keyof MpdMethods)[];

// 3. Tipo para las funciones server$ que exponen esos métodos
type ServerFunction<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => ReturnType<F>;

// 4. Definimos el tipo para el proxy con funciones server$
type ServerMpdApi = {
  [K in keyof MpdMethods]: ServerFunction<MpdMethods[K]>;
};

// 5. Creamos el proxy que genera automáticamente funciones server$
export const mpdServerApi: ServerMpdApi = new Proxy({} as ServerMpdApi, {
  get(_, prop: string) {
    if (!exposedMethods.includes(prop as keyof MpdMethods)) {
      throw new Error(`Método ${prop} no está expuesto en mpdServerApi`);
    }
    return server$(async function (this: RequestEventBase<{env: Env}>, ...args: any[]) {
      const mpd: Mpd = await getMpdClient(this);
      // @ts-ignore: accedemos dinámicamente al método
      return mpd[prop](...args);
    });
  },
});