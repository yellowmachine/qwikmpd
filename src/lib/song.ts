import type { AudioFile, AudioFileMetadata, Song } from "./types";

function formatSong(line: string) {
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
            time: audio.time,
            name: audio.name,
            album: audio.album
        }
    )) as Song[]
}

export function formatTime(seconds: number | null | undefined | string) {
    if (typeof seconds === 'string') return seconds;
    if (!seconds && seconds !== 0) return '';
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
  
    if (hrs > 0) {
      return `${hrs}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    } else {
      return `${min}:${sec.toString().padStart(2, '0')}`;
    }
  }
  