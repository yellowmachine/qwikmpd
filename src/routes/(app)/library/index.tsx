import { Library } from "~/components/library/Library";
import { component$, useContext } from '@builder.io/qwik';
import { type RequestHandler,  routeLoader$ } from "@builder.io/qwik-city";
import { list, update } from "#mpd";
import { storesContext } from "../layout";
import fs from 'fs';
import path from 'path';


export const onPost: RequestHandler = async ({request, redirect }) => {
  const formData = await request.formData();
  const files = formData.getAll('file') as File[];
  const base = formData.get('base') as string;

  if (!base || files.length === 0){
    throw redirect(302, '/library');
    return
  }
    
  const uploadDir = path.join('./music', base);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  for (const file of files) {
    const dest = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(dest, buffer);
  }
  
  throw redirect(302, '/library/?path=' + base);
};

export const useLibraryData = routeLoader$(async ({ url }) => {
  await update();
  const path = url.searchParams.get('path') || '';
  const result = await list(path);
  return { file: result.file, directory: result.directories };
});

export default component$(() => {

    const data = useLibraryData();
    const {queue, elapsed} = useContext(storesContext);

    function totalCurrentSong() {
      const current = queue.queue.find(item => item.uri === queue.currentSong);
      return (current?.time || 0) as number;
    }

    return (
        <>
            <Library data={data.value} currentSong={ {uri: queue.currentSong, total: totalCurrentSong(), elapsed: elapsed.value }} />
        </>
    );
})