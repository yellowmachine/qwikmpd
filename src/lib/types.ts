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
    name: string;
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
    name: string;
    last_modified: string; // ISO 8601 string, podría usarse también Date si se parsea
    format: Format;
    artist: string;
    title: string;
    time: number;
    duration: number;
    pos: number;
    id: number;
    album: string;
  }

  export type Song = {
    artist: string;
    name: string;
    title: string;
    uri?: string;
    album?: string;
    time: string | number;
};

export interface SnapcastClient {
    config: {
      instance: number;
      latency: number;
      name: string;
      volume: {
        muted: boolean;
        percent: number;
      };
    };
    connected: boolean;
    host: {
      arch: string;
      ip: string;
      mac: string;
      name: string;
      os: string;
    };
    id: string;
    lastSeen: {
      sec: number;
      usec: number;
    };
    snapclient: {
      name: string;
      protocolVersion: number;
      version: string;
    };
  }
