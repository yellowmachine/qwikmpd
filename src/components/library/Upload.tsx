import { $, component$, useSignal } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { Client } from 'minio';

export const getPresignedUrl = server$(async function(bucket, filename){
  const minioClient = new Client({
  endPoint: 'minio.casa',
  port: 9000,
  useSSL: false,
  accessKey: this.env.get('MINIO_ROOT_USER'),
  secretKey: this.env.get('MINIO_ROOT_PASSWORD'),
});
  const url = await minioClient.presignedPutObject(bucket, filename, 60 * 10); // 10 minutos de validez
  return url;
});


interface UploadProps {
  base: string;
}

export const Upload =  component$<UploadProps>(({ base }) => {
  const status = useSignal<{ success: boolean; message: string } | null>(null);
  const hasFiles = useSignal(false);
  const counter = useSignal(0);
  const totalFiles = useSignal(0);

  const put = $(async (file: File) => {
    const url = await getPresignedUrl(base, file.name);

    await fetch(url, {
      method: 'PUT',
      body: file,
    });
    counter.value++;
  })

  return (
    <section>
      <form
        method="POST"
        enctype="multipart/form-data"
        class="flex flex-col gap-4"
        onSubmit$={async (ev) => {
          ev.preventDefault();
          counter.value = 0;
          const form = ev.target as HTMLFormElement;
          const formData = new FormData(form);
          const files = formData.getAll('files') as File[];
          totalFiles.value = files.length;
          const uploadPromises = files.map(file => put(file));
          
          try {
            await Promise.all(uploadPromises);
            status.value = { success: true, message: 'Files uploaded!' };
            console.log('¡Todos los archivos subidos!');
          } catch (error) {
            status.value = { success: false, message: 'Error uploading files' };
            console.error('Error subiendo archivos:', error);
          }
        }}
      >
        <input type="hidden" name="base" value={base} />
        <input
          type="file"
          name="files"
          multiple
          class="block"
           onChange$={(ev) => {
            const input = ev.target as HTMLInputElement;
            hasFiles.value = !!input.files && input.files.length > 0;
          }}
        />
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
