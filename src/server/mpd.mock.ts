export const list = async function(path: string){
    return {
        directory: ['mock-dir'],
        files: [{ title: 'Mock Song', artist: 'Mock Artist' }],
    };
}