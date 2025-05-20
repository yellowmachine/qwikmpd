import { $, component$, useSignal } from "@builder.io/qwik";
import { ActionButton } from "~/components/action-button/action-button";
import { playLiveTwitch } from "~/server/mpd";


export default component$(() => {
  const name = useSignal<string>("");
  const loading = useSignal(false);

  const onStream = $(async () => {
    try {
      loading.value = true;  
      await playLiveTwitch(name.value);
    } finally {
      loading.value = false;
    }
  });
  
  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-3xl font-bold text-brand-500">Twitch</h1>
      <input value={name.value} onInput$={(e) => {
          name.value = (e.target as HTMLInputElement).value;
        }}
        type="text" placeholder="Enter Twitch Username" class="mt-4 p-2 border border-gray-300 rounded" />
      <ActionButton action={onStream} successMessage='Stream created'>
          <button class="bg-brand-600 text-white px-6 py-2 rounded ml-4 cursor-pointer mt-2" 
              disabled={loading.value}
              >
                  Stream here!
                  {loading.value && (
                      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
          </button>
          <style>
              {`
              .animate-spin {
                  animation: spin 1s linear infinite;
              }
              @keyframes spin {
                  to { transform: rotate(360deg); }
              }
              `}
          </style>
      </ActionButton>
    </div>
  );
});