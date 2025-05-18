import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
//import type { SettingsForm } from '~/lib/schemas';
import AwaitLock from 'await-lock';
import { server$ } from '@builder.io/qwik-city';


type Video = {
  videoId: string;
  channelTitle: string;
}

//export type Data = SettingsForm;
export type Data = {
  setupDone: boolean;
  volume: number;
  youtube: {
    favorites: Video[];
  }
}

const dbFile = 'data/db.json';

const defaultData: Data = {
  /*server: { ip: '127.0.0.1' },
  clients: [],
  setupDone: false,
  volume: 50,
  latency: 100,
  */
  setupDone: true,
  volume: 50,
  youtube: {
    favorites: [],
  }
};

class LowdbAdapter {
  db: Low<Data>;
  lock: AwaitLock;
  
  constructor(filename = dbFile) {
    const adapter = new JSONFile<Data>(filename);
    this.db = new Low<Data>(adapter, defaultData);
    this.lock = new AwaitLock();  
  }

  async load() {
    await this.db.read();
  }

  async getData() {
    await this.load();
    return this.db.data as Data;

  }

  async setData(data: Partial<Data>) { 
    await this.lock.acquireAsync();
    try{
      await this.load();
      this.db.data = { ...this.db.data!, ...data };
      await this.db.write();
    }finally{
      this.lock.release();
    }
  }

  async getVolume() {
    return (await this.getData()).volume;
  }

  async setVolume(value: number) {
    await this.setData({ volume: value });
  }

  async getYoutubeFavorites() {
    return (await this.getData()).youtube.favorites;
  }
  async addYoutubeFavorite(video: Video) {
    const data = await this.getData();
    if (!data.youtube.favorites.map(v => v.videoId).includes(video.videoId)) {
      await this.setData({...data, youtube: { ...data.youtube, favorites: [...data.youtube.favorites, video] } });
    }
  }
  async removeYoutubeFavorite(videoId: string) {
    const data = await this.getData();
    if (data.youtube.favorites.map( v=> v.videoId).includes(videoId)) {
      const favorites = data.youtube.favorites.filter((video) => video.videoId !== videoId);
      await this.setData({ ...data, youtube: { ...data.youtube, favorites } });
    }
  }

  async getSetupDone() {
    return true;
    //const data = await this.getData();
    //return data.setupDone;
  }

  async setSetupDone({ip}: {ip: string}) {

    await this.setData({ 
        setupDone: true, 
        //server: { ip },
      });
  }

  async init() {
    await this.db.read();
    if (!this.db.data) {
      this.db.data = defaultData;
      await this.db.write();
    }
  }
  
}

let adapter: LowdbAdapter | null = null;

export async function getDb() {
  if(!adapter){
    adapter = new LowdbAdapter();
    await adapter.init();
  }
  return adapter;
}

export const addYoutubeFavorite = server$(async function(video: Video) {
  const db = await getDb();
  await db.addYoutubeFavorite(video);
})

export const removeYoutubeFavorite = server$(async function(videoId: string){
  const db = await getDb();
  await db.removeYoutubeFavorite(videoId);
})

export const getYoutubeFavorites = server$(async function(){
  const db = await getDb();
  return await db.getYoutubeFavorites();
})