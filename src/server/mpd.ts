import { RequestEventBase, server$ } from '@builder.io/qwik-city';
import mpdApi, { type MPDApi } from 'mpd-api';
import WaitQueue from 'wait-queue';
import { formatSongArray, Song } from '~/lib/song';

export type MPDClient = MPDApi.ClientAPI;

export function toBeIncluded(entry: string) {
  if(entry.startsWith('/')){
    entry = entry.slice(1);
  } 
  if(entry !== '' && !entry.includes('/'))
    return entry;
  return null;
}

export function getFirstLevel(array: {directory: string, file: string[]}[], ruta: string) {
  // Inicializa sets para evitar duplicados
  const dirs = new Set();
  const files = new Set();

  // Normaliza la ruta para evitar problemas de barra final
  const rutaNorm = ruta.replace(/\/$/, "");

  array.forEach(entry => {
    if (entry.directory === rutaNorm) {
      (entry.file || []).forEach(f => {
        let rel = f.slice(rutaNorm.length);
        const include = toBeIncluded(rel);
        if(include) 
          files.add(include);
      });
    }
    
    if (entry.directory.startsWith(rutaNorm)) {
      let resto = entry.directory.slice(rutaNorm.length);
      const include = toBeIncluded(resto);
      if(include)
        dirs.add(include);
    }
  });

  return {
    directories: Array.from(dirs) as string[],
    files: Array.from(files) as string[]
  };
}


class Mpd{
    private client: MPDClient | null = null;
    private subscriptors: Record<number, WaitQueue<MPDEvent>> = {};
    private id = 0;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    //private connecting = false;
    private mpdServer: string | null = null;
    private initializingPromise: Promise<void> | null = null;

    constructor(mpdServer: string){
      this.mpdServer = mpdServer
    }

    async getQueueMsg(){
        const list = await this.client?.api.queue.info() as AudioFile[];
        const status = await this.client?.api.status.get() as StatusData;
        const current = list.find(item => item.pos === status?.song);
        
        return {queue: formatSongArray(list), currentSong: current?.file || ''};
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

                const queueData = await this.getQueueMsg();
                this.broadcast({type: 'queue', data: queueData});

                this.client.on('system', async (eventName: string) => {
                    if(eventName === 'player' || eventName === 'mixer'){
                        const statusData = this.client?.api.status as unknown as StatusData;
                        this.broadcast({type: 'status', data: statusData});

                        //const queueData = await queueMsg(secret);
                        //this.broadcast({type: 'queue', data: queueData});
                    }else if(eventName === 'playlist'){
                        //const queueData = await queueMsg(secret);
                        //this.broadcast({type: 'queue', data: queueData});
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

    async list(path: string){
        const list = await this.client?.api.db.lsinfo(path) as LsInfo;
        const status = await this.client?.api.status.get() as StatusData;
        const current = list.file.find(item => item.title === status.currentSong?.title);
        
        return { directories: list.directory.map(d => d.directory), files: formatSongArray(list.file), file: list.file, currentSong: current?.title};
    }
    
}

export const playHere = server$(async function(path: string){
    const client = await getMpdClient(this);
    return await client.playHere(path);
})

export const list = server$(async function(path: string){
  const client = await getMpdClient(this);
  return await client.list(path);
})

export type QueueData = {queue: Song[], currentSong: string};
type QueueEvent = { type: 'queue', data: QueueData}

type StatusEvent = { type: 'status', data: StatusData}

export type MPDEvent = QueueEvent | StatusEvent;

let mpdClient: Mpd | null = null;

interface Env {
    [key: string]: string;
}

interface AudioFileFormat {
  container?: string;
  codec?: string;
  codecProfile?: string;
  tagTypes?: string[];
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  bitsPerSample?: number;
  lossless?: boolean;
  numberOfChannels?: number;
  creationTime?: Date;
  modificationTime?: Date;
  trackGain?: number;
  albumGain?: number;
}

export interface AudioFileMetadata {
  file: string;
  last_modified: string; // ISO 8601 string
  format: AudioFileFormat;
  title: string;
  artist: string;
  album: string;
  genre: string;
  albumartist: string;
  composer: string;
  disc: number;
  date: string;
  track: number;
  time: number;
  duration: number;
}

export type LsInfo = {playlist: [], file: AudioFileMetadata[], directory: {directory: string, last_modified: string}[]};

type Format = {
  sample_rate: number;
  bits: number;
  channels: number;
  sample_rate_short: Record<string, any>; // No se especifica la forma exacta, por eso se usa Record
  original_value: string;
}

export type AudioFile = {
  file: string;
  last_modified: string; // ISO 8601 string, podría usarse también Date si se parsea
  format: Format;
  artist: string;
  title: string;
  time: number;
  duration: number;
  pos: number;
  id: number;
}

  
export const getMpdClient = async (requestEvent: RequestEventBase<{env: Env}>) => {

    const secret = requestEvent.env.get('SECRET')!;

    if(!mpdClient){
        const mpdServer = requestEvent.env.get('MPD_SERVER')!;
        mpdClient = new Mpd(mpdServer);
        await mpdClient.initialize(secret);
    }
    return mpdClient;
}

export type StatusData = {
    currentSong?: {
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
    time?: {
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

export const emptyStatus: StatusData = {
    volume: 75,
    repeat: false,
    random: true,
    single: false,
    consume: false,
    playlist: 2,
    playlistlength: 10,
    mixrampdb: 0,
    state: 'play',
    song: 5,
    songid: 123,
    time: {
      elapsed: 120,
      total: 360
    },
    elapsed: 120.5,
    bitrate: "192",
    audio: {
      sampleRate: 48000,
      bits: 24,
      channels: 2,
      sample_rate_short: {
        value: 48,
        unit: 'kHz'
      }
    },
    nextsong: 6,
    nextsongid: 124
  };
  
