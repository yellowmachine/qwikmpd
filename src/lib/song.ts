import { AudioFile, AudioFileMetadata } from "~/server/mpd";

export type Song = {
    artist: string;
    title: string;
    uri?: string;
    time: string | number;
};


export function formatSong(line: string) {
    const [artist, title, id, uri, time] = line.trim().split('\\').map(c => c.trim());
    return { artist: artist || '', title: title || uri || '', id: parseInt(id), uri: uri || '', time: time || '' };
}

export function stripFolder(file: string) {
    return file.split('/')[1]
}

export function formatSongArray(audios: (AudioFileMetadata | AudioFile)[]) {
    return audios.map(audio => (
        {
            artist: audio.artist,
            title: audio.title || stripFolder(audio.file),
            uri: audio.file,
            time: audio.time
        }
    )) as Song[]
}

export function formatTime(seconds: number | null | undefined | string) {
    if(typeof seconds === 'string') return seconds;
    if (!seconds) return '';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }