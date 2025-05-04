import { access } from 'node:fs/promises';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type { SettingsForm } from '~/lib/schemas';

export type Data = SettingsForm;
const dbFile = 'data/db.json';

class LowdbAdapter {
  db: Low<Data | null>;
  
  constructor(filename = dbFile) {
    this.db = new Low(new JSONFile<Data | null>(filename), null);
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

  async initialize() {
    try {
      await access(dbFile); 
      await this.db.read();
    } catch (err) {
      this.db.data = {} as Data;
      await this.db.write();
    }
  }
  
}

let adapter: LowdbAdapter | null = null;

export async function getDb() {
  if(!adapter){
    adapter = new LowdbAdapter();
    await adapter.initialize();
  }
  return adapter;
}
