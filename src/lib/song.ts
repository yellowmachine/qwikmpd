export type Song = {
    artist: string;
    title: string;
    id: number;
    uri: string;
    time: string;
};


export function formatSong(line: string) {
    const [artist, title, id, uri, time] = line.trim().split('\\').map(c => c.trim());
    return { artist: artist || '', title: title || uri || '', id: parseInt(id), uri: uri || '', time: time || '' };
}

export function formatSongArray(stdout: string) {
    if(stdout.trim() === '') return [];
    
    const lines = stdout.trim().split('\n');
    const songs = lines.map(line => {
        return formatSong(line);
    });
    return songs;
}