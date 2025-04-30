import mpdApi, { type MPDApi } from 'mpd-api';
//import { getDb } from './db';
import WaitQueue from 'wait-queue';

export type MPDClient = MPDApi.ClientAPI;


class Mpd{
    private client: MPDClient | null = null;
    private subscriptors: Record<number, WaitQueue<string>> = {};
    private id = 0;

    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private connecting = false;
    private initializingPromise: Promise<void> | null = null;

    async initialize() {
      if (this.initializingPromise) {
        return this.initializingPromise;
      }
      this.initializingPromise = (async () => {
        this.connecting = true;
        try {
            if (!this.client) {
                this.connecting = true;
                this.client = await mpdApi.connect({ host: 'localhost', port: 6600 });
                console.log('MPD listo para recibir eventos.');
                this.reconnectAttempts = 0;
                this.connecting = false;

                this.client.on('system', (eventName: string) => {
                    this.broadcast(eventName);
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

      async tryReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Máximo número de intentos de reconexión alcanzado.');
          return;
        }
        this.reconnectAttempts++;
        console.log(`Intento de reconexión #${this.reconnectAttempts}`);
        try {
          await this.initialize();
        } catch (error) {
          console.error('Error en reconexión:', error);
          setTimeout(() => this.tryReconnect(), 2000);
        }
      }
      

    private waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
          const check = () => {
            if (this.client && !this.connecting) {
              resolve();
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              reject(new Error('No se pudo conectar a MPD'));
            } else {
              setTimeout(check, 100); // Reintentar cada 100ms
            }
          };
          check();
        });
      }
      

    async addListener(){
        // Esperar hasta que la conexión esté lista
        if (!this.client || this.connecting) {
            await this.waitForConnection(); // función que espera o rechaza según reconexión
        }
        const id = this.id++;
        const queue = new WaitQueue<string>();
        this.subscriptors[id] = queue;
        return { id, queue };
    }
    removeListener(id: number){
        delete this.subscriptors[id];

    }
    broadcast(msg: string){
        for(const q of Object.values(this.subscriptors)){
            q.push(msg);
        }
    }
}


let mpdClient: Mpd | null = null;

export const getMpdClient = async () => {
    if(!mpdClient){
        mpdClient = new Mpd();
        await mpdClient.initialize();
    }
    return mpdClient;
}
