import { component$, useSignal } from '@builder.io/qwik';


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
  const showMore = useSignal(false);

  return (
    <section>
      <form method="POST" 
             action="/library/" 
             enctype="multipart/form-data">
        <input type="hidden" name="base" value={base} />
        <input
            type="file"
            name="file"
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
          <button
            type="button"
            onClick$={() => {
              showMore.value = !showMore.value;
            }} 
            class="text-red-600 hover:text-red-800 font-bold py-2 px-4 rounded border-dashed focus:outline-none focus:shadow-outline border-2 border-red-500"  
          >{showMore.value ? 'Hide' : 'Show more...'}</button>
              {showMore.value && (
                <>
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
                <div class="mt-2 text-sm text-gray-700">
                Files selected: <span class="font-mono">{selectedFiles.value}</span>
              </div>
              <button disabled={!hasFiles.value}
                type="submit"
                class="disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Upload files
              </button>
            </>
              )}
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
