import { RequestEventBase, server$ } from '@builder.io/qwik-city';
import { ServerError } from '@builder.io/qwik-city/middleware/request-handler';
import mpdApi, { type MPDApi } from 'mpd-api';
import WaitQueue from 'wait-queue';
import { formatSongArray } from '~/lib/song';
import type { Song } from '~/lib/types';
import { getDb } from './db';
import type { StatusData, LsInfo, AudioFile } from '~/lib/types';
import { spawn } from "child_process";



export const execCommand = server$(async (cmd: string) => {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execProm = promisify(exec);
  return await execProm(cmd);
});

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
type MpClientFunction<Args extends any[], R> = (this: RequestEventBase, client: MPDApi.ClientAPI, ...args: Args) => Promise<R>;

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
        return await fn.apply(this, [client, ...args]);
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

function getTimestamp(): number {
  return Date.now();
}

const getEmptySubscriptorsHash = () => {
  return {
    warning: null,
    ready: null,
    queue: null,
    status: null,
    stderr: null,
    stdout: null
  }
}


///////////

let client: MPDApi.ClientAPI | null = null;
let subscriptors: Record<number, WaitQueue<MPDEvent>> = {};
type SHash = Record<MPDEvent['type'], number | null>
let subscriptorsHash: Record<number, SHash> = {};
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

          c.on('system', async (eventName: string) => {
            //console.log('Evento system:', eventName);
            if (eventName === 'player' || eventName === 'mixer' || eventName === 'playlist') {
              try {
                const timestamp = markSendIntentBroadcast(['status', 'queue']);
                const statusData = client?.api.status.get() as unknown as StatusData;
                await broadcast({ type: 'status', data: statusData }, timestamp);
                const queueData = await getQueueMsg(c);
                await broadcast({ type: 'queue', data: queueData }, timestamp);
              } catch (error) {
                console.error('Error manejando evento system:', error);
              }
            }
          });
          
          c.on('error', async (err) => {
            try {
              const timestamp = markSendIntentBroadcast('ready');
              console.error('Error en MPD:', err);
              await broadcast({ type: 'ready', data: false }, timestamp);
              await reconnect();
            } catch (error) {
              console.error('Error manejando el evento error:', error);
              // Opcional: lógica adicional para manejar fallos en broadcast o reconnect
            }
          });
          
          c.on('close', async () => {
            try {
              console.log('Conexión MPD cerrada');
              await reconnect();
            } catch (error) {
              console.error('Error manejando el evento close:', error);
            }
          });
          

          reconnectAttempts = 0; // conexión exitosa, reset contador
          
          return c;
        } else {
          return client;
        }
      } catch (error) {
        const timestamp = markSendIntentBroadcast('warning');
        await broadcast({ 
          type: 'warning', 
          data: 'No se pudo conectar al servidor MPD. Intentando reconectar.' },
        timestamp);

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
    const timestamp = markSendIntentBroadcast('warning');
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('No se puede reconectar: máximo de intentos alcanzado.');
      await broadcast({ 
        type: 'warning', 
        data: 'No se puede reconectar:.maxcdn de intentos alcanzado.' }, timestamp,
      );
      client = null;
      return;
    }
    reconnectAttempts++;
    client = null; // Fuerza nueva conexión
    console.log(`Intentando reconectar MPD (intento ${reconnectAttempts})...`);
    try {
      client = await connectClient(serverUrl);
      await broadcast({ type: 'ready', data: true }, timestamp);
    } catch (e) {
      console.error('Error durante la reconexión:', e);
      await broadcast({ type: 'warning', data: 'Error durante la reconexión...' }, timestamp);
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

async function broadcast(msg: MPDEvent, timestampt: number){ //deberia ser async
  //for(const q of Object.values(subscriptors)){
  //    await q.push(msg);
  //}
  for(const [id, queue] of Object.entries(subscriptors)){
    await send(Number(id), msg, timestampt);
  }
}

async function addListener(){
  const _id = id++;
  const queue = new WaitQueue<MPDEvent>();
  subscriptors[_id] = queue;
  subscriptorsHash[_id] = getEmptySubscriptorsHash();
  return { id: _id, queue };
}

function removeListener(id: number){
  delete subscriptors[id];
  delete subscriptorsHash[id];

}

async function send(clientId: number, event: MPDEvent, originTimestamp: number) {
  const h = subscriptorsHash[clientId];
  const timestamp = h[event.type]; 
  if(timestamp === originTimestamp){
    await subscriptors[clientId].push(event);
  }
}

function markSendIntentBroadcast(eventType: MPDEvent['type'] | MPDEvent['type'][]): number {
  const timestamp = getTimestamp(); 

  const events = Array.isArray(eventType) ? eventType : [eventType];

  for (const h of Object.values(subscriptorsHash)) {
    for(const event of events){
      h[event] = timestamp;
    }  
  }

  return timestamp;
}


function markSendIntent(clienteId: number, eventType: MPDEvent['type'] | MPDEvent['type'][]) {
  const timestamp = getTimestamp();
  
  const h = subscriptorsHash[clienteId];
  const events = Array.isArray(eventType) ? eventType : [eventType];
  for(const event of events){
    h[event] = timestamp;
  }
  return timestamp;
}


export const subscribe = server$(async function *f(){
  const { id, queue } = await addListener();

  this.cookie.set('listenerId', id.toString(), {
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  });
  

  const timestamp = markSendIntent(id, ['status', 'queue']);

  const client = await getMpdClient(this);
  const statusData = client.api.status.get() as unknown as StatusData;
  const queueData = await getQueueMsg(client);

  await send(id, { type: 'status', data: statusData }, timestamp);
  await send(id, { type: 'queue', data: queueData }, timestamp);
        
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

export const update = server$(async function(){
  const client = await getMpdClient(this);
  await client.api.db.update();
})

export const list = server$(async function(path: string){
    const client = await getMpdClient(this);
    const list = await client?.api.db.lsinfo(path) as LsInfo;
    const status = await client?.api.status.get() as StatusData;
    const current = list.file.find(item => item.title === status.currentSong?.title);
        
    return { directories: list.directory.map(d => d.directory), files: formatSongArray(list.file), file: list.file, currentSong: current?.title};
})

export const listPlaylist = server$(async function(){
    const client = await getMpdClient(this);
    const list = await client?.api.playlists.get();
    return list as {playlist: string}[];
})

export const loadPlaylist = server$(async function(name: string){
    const client = await getMpdClient(this);
    await clear();
    await client.api.playlists.load(name);
})

export const add = server$(async function(path: string){
    //const listenerIdCookie = this.cookie.get('listenerId');
    //const listenerId = listenerIdCookie?.number;
    // ahora puedo mandar un mensaje personalizado al usuario

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

export const playHere = server$(withMpdReconnect(async function(client: MPDApi.ClientAPI,path: string){
    await clear();
    await load(path);
    await play();
}))

export const play = server$(withMpdReconnect(async function(client: MPDApi.ClientAPI, pos?: number){
    await client.api.playback.play((pos || 0) as unknown as string);
    const db = await getDb();
    const clients = (await db.getData()).clients;
    //for(let c of clients){
    //  await restartSnapclient(c.ip);
    //}
}))

export const playThis = server$(async function(pos: number){
    const client = await getMpdClient(this);
    try{
      await client.api.playback.play(pos as unknown as string);
    }catch(e){
      const timestamp = markSendIntentBroadcast('warning');
      await broadcast({ type: 'warning', data: 'Error al reproducir la cancion' }, timestamp);
      console.log(e);
    }
    
})

export const playUri = server$(async function(uri: string){
  try{
    await clear();
    await add(uri);
    await play();
  }catch(e){
    console.log(e);
  }
  
})

export const shuffle = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.queue.shuffle();
})

export const repeat = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.playback.repeat();
})

export const stop = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.playback.stop();
})

export const pause = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.playback.pause();
})

export const resume = server$(async function(){
  const client = await getMpdClient(this);
  await client.api.playback.resume();
})

export const next = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.playback.next();
})

export const prev = server$(async function(){
    const client = await getMpdClient(this);
    await client.api.playback.prev();
})

export const seek = server$(async function(seconds: number){
    const client = await getMpdClient(this);
    await client.api.playback.seekcur(''+seconds);
})

export const setVolume = server$(async function(volume: number){
    if(volume < 0 || volume > 100) return;
    const client = await getMpdClient(this);
    await client.api.playback.setvol(''+volume);
})

export const updateLog = server$(async function(type: 'stdout' | 'stderr', data: string){
  const timestamp = markSendIntentBroadcast(type);
  await broadcast({ type, data }, timestamp);
})

export const updateAppViaSSHStream = server$(function (){
    const host = this.env.get('SSH_HOST');
    const user = this.env.get('SSH_USER');
    const scriptPath = this.env.get('SCRIPT_UPDATE_APP_PATH');

    if(!scriptPath) {
        throw "No se ha configurado la ruta del script de actualización";
    }
  
    const ssh = spawn("ssh", [`${user}@${host}`, scriptPath]);

    ssh.stdout.on("data", (data) => {
        updateLog("stdout", data.toString());
    });

    ssh.stderr.on("data", (data) => {
        updateLog("stderr", data.toString());
    });

    ssh.on("close", (code) => {
        updateLog("stdout", `Proceso finalizado con código ${code}\n`);
    });

    ssh.on('error', (err) => {
      console.error('Error en proceso SSH:', err);
      updateLog("stderr", "Error en proceso SSH: " + err.message);
    });
    
});

export type QueueData = {queue: Song[], currentSong: string};
type QueueEvent = { type: 'queue', data: QueueData}
type StatusEvent = { type: 'status', data: StatusData}
type WarningEvent = { type: 'warning', data: string}
type ReadyEvent = { type: 'ready', data: boolean}
type StdoutEvent = { type: 'stdout', data: string}
type StderrEvent = { type: 'stderr', data: string}

export type MPDEvent = QueueEvent | StatusEvent | WarningEvent | ReadyEvent | StdoutEvent | StderrEvent;


//interface Env {
//    [key: string]: string;
//}

export const getMpdClient = async (
  requestEvent: RequestEventBase<QwikCityPlatform>,
  options: { forceReconnect?: boolean } = {forceReconnect: false},
) => {

  if (options?.forceReconnect) {
    // Forzar reinicialización: limpia la instancia actual
    client = null;
  }

  if (!client) {
    const serverUrl = requestEvent.env.get('MPD_SERVER') || 'mpd';
    client = await connectClient(serverUrl);
  }
  return client;
};

export const emptyStatus: StatusData = {
    
} as StatusData;
  
