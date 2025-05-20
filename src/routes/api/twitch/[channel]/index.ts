import type { RequestHandler } from '@builder.io/qwik-city';
import { execSync, spawn } from 'child_process';

export const onGet: RequestHandler = async (event) => {
  const { channel } = event.params;

  // 1. Obtener la URL HLS con yt-dlp
  let hlsUrl: string;
  try {
    hlsUrl = execSync(`yt-dlp -g https://www.twitch.tv/${channel}`, { encoding: 'utf-8' }).trim();
    if (!hlsUrl.startsWith('http')) throw new Error('URL inválida');
  } catch (err: any) {
    // Si el canal no existe, yt-dlp devuelve un error específico
    if (err.message.includes('Unable to extract channel id')) {
      event.text(404, 'Canal no encontrado');
    } else {
      event.text(500, 'No se pudo obtener el stream de Twitch');
    }
    return;
  }

  // 2. Lanzar ffmpeg y exponer el audio como stream HTTP
  event.status(200); 
  event.headers.set('Content-Type', 'audio/mpeg');
  event.headers.set('Transfer-Encoding', 'chunked');

  const writableStream = event.getWritableStream();
  const writer = writableStream.getWriter();

  // ffmpeg process
  const ffmpeg = spawn('ffmpeg', [
    '-i', hlsUrl,
    '-loglevel', 'error', // o 'quiet'
    '-vn',
    '-acodec', 'libmp3lame',
    '-ar', '44100',
    '-ac', '2',
    '-f', 'mp3',
    'pipe:1'
  ]);

  // Escribir los datos de ffmpeg en el writer de la web stream
  ffmpeg.stdout.on('data', async (chunk: Buffer) => {
    // Espera a que el chunk se escriba antes de continuar
    await writer.write(new Uint8Array(chunk));
  });

  ffmpeg.on('error', (err) => {
    console.error('Error en ffmpeg:', err);
    writer.abort(err); // Cierra el writer con error
  });

  ffmpeg.stdout.on('end', () => {
    writer.close();
  });

  ffmpeg.stderr.on('data', (data) => {
    // Opcional: logging de errores de ffmpeg
    console.error(data.toString());
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg finalizado con código ${code}`);
      writer.abort(new Error(`ffmpeg exited with code ${code}`));
    } else {
      writer.close();
    }
  });

  // Si el cliente cierra la conexión, matar ffmpeg
  (writableStream as any).closed?.then(() => {
    ffmpeg.kill('SIGINT');
  });
};
