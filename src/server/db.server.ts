import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import AwaitLock from 'await-lock';

export type Channel = {
  channelId: string;
  channelTitle: string;
  thumbnail?: string;  
}

//export type Data = SettingsForm;
export type Data = {
  clients: {
    ip: string;
  }[];
  server: {
    ip: string;
  };
  volume: number;
  latency: number;
  setupDone: boolean;
  youtube: {
    favorites: Channel[];
  }
}

const dbFile = process.env.NODE_ENV === 'production' ? '/app/data/db.json' : 'data/db.json' 

const defaultData: Data = {
  server: { ip: '127.0.0.1' },
  clients: [],
  latency: 100,
  setupDone: true,
  volume: 50,
  youtube: {
    favorites: [],
  }
};

class LowdbAdapter {
  db!: Low<Data>;
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
  async addYoutubeFavorite(channel: Channel) {
    const data = await this.getData();
    if (!data.youtube.favorites.map(v => v.channelId).includes(channel.channelId)) {
      await this.setData({...data, youtube: { ...data.youtube, favorites: [...data.youtube.favorites, channel] } });
    }
    return await this.getYoutubeFavorites();
  }
  async removeYoutubeFavorite(channelId: string) {
    const data = await this.getData();
    if (data.youtube.favorites.map( v=> v.channelId).includes(channelId)) {
      const favorites = data.youtube.favorites.filter((video) => video.channelId !== channelId);
      await this.setData({ ...data, youtube: { ...data.youtube, favorites } });
    }
    return await this.getYoutubeFavorites();
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

export const addYoutubeFavorite = async function(channel: Channel) {
  const db = await getDb();
  return await db.addYoutubeFavorite(channel);
}

export const removeYoutubeFavorite = async function(channelId: string){
  const db = await getDb();
  return await db.removeYoutubeFavorite(channelId);
}

export const getYoutubeFavorites = async function(){
  const db = await getDb();
  return await db.getYoutubeFavorites();
}