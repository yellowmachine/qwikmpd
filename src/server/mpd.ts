import { RequestEventBase, server$ } from '@builder.io/qwik-city';
import { ServerError } from '@builder.io/qwik-city/middleware/request-handler';
import mpdApi, { type MPDApi } from 'mpd-api';
import { s } from 'vitest/dist/reporters-5f784f42.js';
import WaitQueue from 'wait-queue';
import { formatSongArray, Song } from '~/lib/song';

//export type MPDClient = MPDApi.ClientAPI;

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

//// wrapper reconnect////////
type MpClientFunction<Args extends any[], R> = (...args: Args) => Promise<R>;

export function withMpdReconnect<Args extends any[], R>(
  fn: MpClientFunction<Args, R>,
  maxRetries = 3,
  retryDelayMs = 300
) {
  return async function wrapped(this: any, ...args: Args): Promise<R> {
    let attempt = 0;
    let client: MPDApi.ClientAPI | null = null;

    while (attempt < maxRetries) {
      client = await getMpdClient(this);
      if (!client) {
        attempt++;
        await delay(retryDelayMs);
        continue;
      }

      try {
        // Aquí client ya no es null, así que podemos pasar sin problema
        return await fn(...args);
      } catch (error: any) {
        if (isConnectionError(error)) {
          attempt++;
          await delay(retryDelayMs);
          continue;
        }
        throw error;
      }
    }

    attemptReconnectionInBackground(this);
    throw new ServerError(503, "No se pudo conectar al servidor MPD. Intentando reconectar.");
  };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isConnectionError(error: any): boolean {
  return error.message?.includes("ECONNREFUSED") || error.message?.includes("timeout");
}

async function attemptReconnectionInBackground(context: any) {
  try {
    await getMpdClient(context, { forceReconnect: true });
  } catch (e) {
    console.error("Reconexión en background fallida:", e);
  }
}

///////////

let client: MPDApi.ClientAPI | null = null;
let subscriptors: Record<number, WaitQueue<MPDEvent>> = {};
let id = 0;
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;
let initializingPromise: Promise<MPDApi.ClientAPI> | null = null;

async function connectClient(serverUrl: string) {
  if (initializingPromise) {
    return initializingPromise;
  }

  initializingPromise = (async (): Promise<MPDApi.ClientAPI> => {
    reconnectAttempts = 0;

    while (reconnectAttempts < maxReconnectAttempts) {
      try {
        if (!client) {
          console.log('Conectando MPD...', serverUrl);
          const c = await mpdApi.connect({ host: serverUrl, port: 6600 });
          console.log('MPD listo para recibir eventos.');

          client = c; // salvo que los broadcast los saque al que llamo, debo hacer client = c

          await broadcast({ type: 'ready', data: true });
          const statusData = await c.api.status.get() as unknown as StatusData;
          await broadcast({ type: 'status', data: statusData });

          const queueData = await getQueueMsg(c);
          await broadcast({ type: 'queue', data: queueData });

          // Manejo de eventos para reconexión automática
          c.on('system', async (eventName: string) => {
            if (eventName === 'player' || eventName === 'mixer') {
              const statusData = client?.api.status.get() as unknown as StatusData;
              await broadcast({ type: 'status', data: statusData });
            }
          });

          // En vez de llamar a tryReconnect, manejamos reconexión aquí
          c.on('error', async (err) => {
            console.error('Error en MPD:', err);
            await broadcast({ type: 'ready', data: false });
            await reconnect();
          });

          c.on('close', async () => {
            console.log('Conexión MPD cerrada');
            //broadcast({ type: 'ready', data: false });
            await reconnect();
          });

          reconnectAttempts = 0; // conexión exitosa, reset contador
          
          return c;
        } else {
          return client;
        }
      } catch (error) {
        await broadcast({ type: 'warning', data: 'No se pudo conectar al servidor MPD. Intentando reconectar.' });

        reconnectAttempts++;
        console.error(`Error al conectar MPD (intento ${reconnectAttempts}):`, error);

        if (reconnectAttempts >= maxReconnectAttempts) {
          throw new Error('Máximo número de intentos de reconexión alcanzado.');
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Máximo número de intentos de reconexión alcanzado.');
  })();

  return initializingPromise;

  // Función interna para reconectar con control de intentos
  async function reconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('No se puede reconectar: máximo de intentos alcanzado.');
      await broadcast({ type: 'warning', data: 'No se puede reconectar:.maxcdn de intentos alcanzado.' });
      client = null;
      return;
    }
    reconnectAttempts++;
    client = null; // Fuerza nueva conexión
    console.log(`Intentando reconectar MPD (intento ${reconnectAttempts})...`);
    try {
      client = await connectClient(serverUrl);
      await broadcast({ type: 'ready', data: true });
    } catch (e) {
      console.error('Error durante la reconexión:', e);
      await broadcast({ type: 'warning', data: 'Error durante la reconexión...' });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await reconnect();
    }
  }
}

async function getQueueMsg(client?: MPDApi.ClientAPI) {
  const list = await client?.api.queue.info() as AudioFile[];
  const status = await client?.api.status.get() as StatusData;
  const current = list.find(item => item.pos === status?.song);
  
  return {queue: formatSongArray(list), currentSong: current?.file || ''};
}

async function broadcast(msg: MPDEvent){ //deberia ser async
  for(const q of Object.values(subscriptors)){
      await q.push(msg);
  }
}

async function addListener(){
  const _id = id++;
  const queue = new WaitQueue<MPDEvent>();
  subscriptors[_id] = queue;
  return { id: _id, queue };
}

function removeListener(id: number){
  delete subscriptors[id];

}

export const subscribe = server$(async function *f(){
  const { id, queue } = await addListener();
        
  try {
    while (true) {
      const msg = await queue.pop();
      yield msg
    }
  } finally {
    removeListener(id);
  }
})

export const queue = server$(async function(){
  const client = await getMpdClient(this);
  const msg = await getQueueMsg(client);
  return msg;
}) 

export const list = server$(async function(path: string){
    const client = await getMpdClient(this);
    const list = await client?.api.db.lsinfo(path) as LsInfo;
    const status = await client?.api.status.get() as StatusData;
    const current = list.file.find(item => item.title === status.currentSong?.title);
        
    return { directories: list.directory.map(d => d.directory), files: formatSongArray(list.file), file: list.file, currentSong: current?.title};
})

export const add = server$(async function(path: string){
    const client = await getMpdClient(this);
    await client?.api.queue.add(path);
})

export const remove = server$(async function(path: string){
    const client = await getMpdClient(this);
    await client?.api.queue.delete(path);
})

const load = server$(async function(path: string){
    const client = await getMpdClient(this);
    const list = await client?.api.db.lsinfo(path) as LsInfo;
    
    const uris = list.file.map(f => f.file);
    for(let uri of uris){
      await add(uri);
    }
  })

export const clear = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.queue.clear();
})

export const playHere = server$(withMpdReconnect(async function(path: string){
    await clear();
    await load(path);
    await play();
}))

export const play = server$(async function(pos?: number){
    const client = await getMpdClient(this);
    await client?.api.playback.play((pos || 0) as unknown as string);
})

export const stop = server$(async function(){
    const client = await getMpdClient(this);
    await client?.api.playback.stop();
})

export const pause = server$(async function(){
    const client = await getMpdClient(this);
    await client?.api.playback.pause();
})

export const next = server$(async function(){
    const client = await getMpdClient(this);
    await client?.api.playback.next();
})

export const prev = server$(async function(){
    const client = await getMpdClient(this);
    await client?.api.playback.prev();
})

export const seek = server$(async function(seconds: number){
    const client = await getMpdClient(this);
    await client?.api.playback.seek(''+seconds);
})

export const setVolume = server$(async function(volume: number){
    const client = await getMpdClient(this);
    await client?.api.playback.setvol(''+volume);
})


export type QueueData = {queue: Song[], currentSong: string};
type QueueEvent = { type: 'queue', data: QueueData}
type StatusEvent = { type: 'status', data: StatusData}
type WarningEvent = { type: 'warning', data: string}
type ReadyEvent = { type: 'ready', data: boolean}

export type MPDEvent = QueueEvent | StatusEvent | WarningEvent | ReadyEvent;


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

export const getMpdClient = async (
  requestEvent: RequestEventBase<{ env: Env }>,
  options: { forceReconnect?: boolean } = {forceReconnect: false},
) => {
  //const secret = requestEvent.env.get('SECRET')!;

  if (options?.forceReconnect) {
    // Forzar reinicialización: limpia la instancia actual
    client = null;
  }

  if (!client) {
    const serverUrl = requestEvent.env.get('MPD_SERVER')!;
    client = await connectClient(serverUrl);
  }
  return client;
};


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
    
  };
  
