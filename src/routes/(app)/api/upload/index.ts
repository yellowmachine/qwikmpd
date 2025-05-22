import type { RequestHandler } from '@builder.io/qwik-city';
import { promises as fs } from 'fs';
import path from 'path';
import { update } from '~/server/mpd';

export const onPost: RequestHandler = async ({ request, json }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const base = formData.get('base')?.toString() || '';
    const basePath = process.env.NODE_ENV === 'development' ? path.join('./music', base) : path.join('/app/music', base);

    await fs.mkdir(basePath, { recursive: true });

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Soporta subdirectorios si webkitRelativePath está disponible
      const relativePath = (file as any).webkitRelativePath || file.name;
      const savePath = path.join(basePath, relativePath);
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      await fs.writeFile(savePath, buffer);
    }

    await update();
    json(200, { success: true, message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error while uploading files:', error);
    json(500, { success: false, error: 'Error while uploading files' });
  }
};
