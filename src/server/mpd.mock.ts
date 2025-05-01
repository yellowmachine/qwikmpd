import { fn } from '@storybook/test';
import * as actual from './mpd';  // Importa todo el módulo original
import type { ServerMpdApi } from './mpd'; // Importa el tipo si lo tienes

export * from './mpd';  // Reexporta todo para mantener tipos y demás exports

// Mockea el objeto completo, sobrescribiendo solo las funciones que quieres mockear
export const mpdServerApi: ServerMpdApi = {
  ...actual.mpdServerApi, // Copia todo lo original
  list: fn().mockResolvedValue({
    directory: ['depeche-mode', 'led-zeppelin'],
    file: [
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        time: '05:00',
        uri: 'led-zeppelin/stairway-to-heaven',
      },
      {
        title: 'Enjoy the silence',
        artist: 'Depeche Mode',
        time: '03:30',
        uri: 'depeche-mode/enjoy-the-silence',
      },
    ],
  }),
  // Si tienes más métodos, mockéalos aquí con fn()
};
