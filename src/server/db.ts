import { access } from 'node:fs/promises';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type { Settings } from './schemas';


export type Data = { volume: number, setupDone: boolean, admin: Settings };

const dbFile = 'data/db.json';


function stripPasswords(data: Data) {
  if (!data.admin) return data;
  const { server, clients, ...restAdmin } = data.admin;

  const { password, ...serverSinPassword } = server;
  const clientsSinPassword = clients.map(({ password, ...clientSinPassword }) => clientSinPassword);

  return {
    ...data,
    admin: {
      ...restAdmin,
      server: serverSinPassword,
      clients: clientsSinPassword
    }
  };
}

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
    return stripPasswords(this.db.data!);
  }

  async getDataWithPassword(): Promise<Data> { // password are returned encrypted
    await this.load();
    return this.db.data as Data;
  }

  async setData(data: Partial<Data>) { // password come encrypted
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
    return true; //(await this.getData()).setupDone;
  }

  async setSetupDone({ip, username, password}: {ip: string, username: string, password: string}) {
    // password comes encrypted
    await this.setData({ 
        setupDone: true, 
        admin: { global: { latency: 100 }, 
                clients: [],
                server: { ip, username, password } } });
  }

  async initialize() {
    try {
      await access(dbFile); 
      await this.db.read();
    } catch (err) {
      this.db.data = null;
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
