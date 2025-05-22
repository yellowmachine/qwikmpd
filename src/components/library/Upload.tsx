import { component$, useSignal } from '@builder.io/qwik';

interface UploadProps {
  base: string;
}

export const Upload =  component$<UploadProps>(({ base }) => {
  const status = useSignal<{ success: boolean; message: string } | null>(null);

    const hasFiles = useSignal(false);


  return (
    <section>
      <form
        method="POST"
        enctype="multipart/form-data"
        class="flex flex-col gap-4"
        onSubmit$={async (ev) => {
          ev.preventDefault();
          const form = ev.target as HTMLFormElement;
          const formData = new FormData(form);

          try {
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            const result = await response.json();
            if (result.success) {
              status.value = { success: true, message: result.message || 'Files uploaded successfully.' };
              form.reset();
            } else {
              status.value = { success: false, message: result.error || 'Error uploading files.' };
            }
          } catch (error) {
            status.value = { success: false, message: 'Error uploading files.' };
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
      {status.value && (
        <p class={status.value.success ? 'text-green-600' : 'text-red-600'}>
          {status.value.message}
        </p>
      )}
    </section>
  );
});
