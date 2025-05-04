import { access } from 'node:fs/promises';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type { SettingsForm } from '~/lib/schemas';

export type Data = SettingsForm;
const dbFile = 'data/db.json';

const defaultData: Data = {
  server: { ip: '127.0.0.1' },
  clients: [],
  setupDone: false,
  volume: 50,
  latency: 100,
};

class LowdbAdapter {
  db: Low<Data>;
  
  constructor(filename = dbFile) {
    const adapter = new JSONFile<Data>(filename);
    this.db = new Low<Data>(adapter, defaultData);
  }

  async load() {
    await this.db.read();
  }

  async getData() {
    await this.load();
    //return stripPasswords(this.db.data!);
    return this.db.data as Data;

  }

  async getDataWithPassword(): Promise<Data> { 
    await this.load();
    return this.db.data as Data;
  }

  async setData(data: Partial<Data>) { 
    await this.load();
    this.db.data = { ...this.db.data!, ...data };
    await this.db.write();
  }

  async getVolume() {
    return (await this.getData()).volume;
  }

  async setVolume(value: number) {
    await this.setData({ volume: value });
  }

  async getSetupDone() {
    const data = await this.getData();
    return data.setupDone;
  }

  async setSetupDone({ip}: {ip: string}) {

    await this.setData({ 
        setupDone: true, 
        server: { ip },
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
