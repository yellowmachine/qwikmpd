import { $, component$, useSignal } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import fs from 'fs';
import path from 'path';

export const onPost = server$(async function ({ request }) { // a porbar cuando tenga tiempo
  // Obtener el formData del request
  const formData = await request.formData();
  const base = formData.get('base') as string;
  const file = formData.get('file') as File;

  if (!base || !file) {
    return new Response(JSON.stringify({ error: 'Missing base or file' }), { status: 400 });
  }

  // Crear el directorio si no existe
  const uploadDir = path.join('/app/music', base);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Guardar el archivo
  const dest = path.join(uploadDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(dest, buffer);

  return new Response(JSON.stringify({ ok: true, filename: file.name }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
interface UploadProps {
  base: string;
}

export const Upload =  component$<UploadProps>(({ base }) => {
  const status = useSignal<{ success: boolean; message: string } | null>(null);
  const hasFiles = useSignal(false);
  const counter = useSignal(0);
  const totalFiles = useSignal(0);
  const fileInputRef = useSignal<HTMLInputElement>();
  const selectedFiles = useSignal<string>('');

   const put = $(async (file: File) => {
      const formData = new FormData();
      formData.append('base', base);
      formData.append('file', file);
      
      const apiUrl = import.meta.env.PUBLIC_FIX_UPLOAD_URL;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error uploading ${file.name}`);
      }
      counter.value++;
  });

  return (
    <section>
      <form preventdefault:submit
        class="flex flex-col gap-4"
        onSubmit$={async () => {
          counter.value = 0;
          status.value = null;
          const files = fileInputRef.value?.files;
          if (!files || files.length === 0) {
            // error
            return;
          }else{
            totalFiles.value = files.length;
            if (files.length === 0) {
              status.value = { success: false, message: 'No files selected' };
              return;
            }

            try {
              await Promise.all(Array.from(files).map(file => put(file)));
              status.value = { success: true, message: 'Files uploaded!' };
              console.log('¡Todos los archivos subidos!');
            } catch (error) {
              status.value = { success: false, message: 'Error uploading files' };
              console.error('Error subiendo archivos:', error);
            }
          }
        }}
      >
        <input
            type="file"
            ref={fileInputRef}
            multiple
            class="hidden"
            onChange$={(ev) => {
              const input = ev.target as HTMLInputElement;
              hasFiles.value = !!input.files && input.files.length > 0;
              if (input.files && input.files.length > 0) {
                selectedFiles.value = Array.from(input.files).map(f => f.name).join(', ');
              } else {
                selectedFiles.value = '';
              }
            }}
          />
          <div
            class="flex flex-col items-center justify-center border-2 border-dashed border-red-500 rounded-lg p-8 cursor-pointer transition hover:bg-red-50"
            onClick$={() => fileInputRef.value?.click()}
          >
            <svg class="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-red-600 font-semibold text-lg">Click here to upload</span>
            <span class="text-sm text-gray-500 mt-2">Supported formats: mp3, wav, etc.</span>
          </div>
         {selectedFiles.value && (
            <div class="mt-2 text-sm text-gray-700">
              Files selected: <span class="font-mono">{selectedFiles.value}</span>
            </div>
        )}
        <button disabled={!hasFiles.value}
          type="submit"
          class="disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload files
        </button>
      </form>
      {counter.value > 0 && (
        <p class="text-sm text-gray-600">
          {counter.value} file{counter.value > 1 ? 's' : ''} of {totalFiles.value} uploaded
        </p>
      )}
      {status.value && (
        <p class={status.value.success ? 'text-green-600' : 'text-red-600'}>
          {status.value.message}
        </p>
      )}
    </section>
  );
});
