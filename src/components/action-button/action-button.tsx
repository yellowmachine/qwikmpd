import { component$, useStore, $, Slot, type QRL } from '@builder.io/qwik';

export interface ActionButtonProps {
  action: QRL<(event: Event) => Promise<void>>;
  successMessage?: string;
  warningMessage?: string;
}

export const ActionButton = component$<ActionButtonProps>(({ action, successMessage, warningMessage }) => {
  const state = useStore({
    loading: false,
    error: null as string | null,
    success: false,
    warning: warningMessage
  });

  const handleClick = $(async (event: Event) => {
    if (state.loading) 
      return;
    state.loading = true;
    state.error = null;
    state.success = false;

    try {
        if(warningMessage){
          state.warning = warningMessage
        }
        await action(event);
        state.success = true;
      setTimeout(() => {
        state.success = false;
      }, 2500);
    } catch (e) {
      console.log(e)
      state.error = e instanceof Error ? e.message : String(e);
      setTimeout(() => {
        state.error = null;
      }, 2500);
    } finally {
      state.loading = false;
      state.warning = ""
    }
  });

  return (
    <div class="relative inline-block">
      <span onClick$={handleClick} style={{ cursor: state.loading ? 'not-allowed' : 'pointer', opacity: state.loading ? '0.6' : '1' }}>
        <Slot />
      </span>

      {state.success && (
        <div class="absolute top-full top-1/2 -translate-y-1/2 ml-4 min-w-[100px] px-4 py-2 rounded shadow-lg text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          {successMessage}
        </div>
      )}

      {state.warning && (
        <div onClick$={() => state.warning = ""} 
          class="cursor-pointer absolute top-full top-1 -translate-y ml-4 min-w-[100px] px-4 py-2 rounded shadow-lg text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
          {warningMessage}
        </div>
      )}

      {state.error && (
        <div class="absolute top-full top-1/2 -translate-y-1/2 ml-4 min-w-[100px] px-4 py-2 rounded shadow-lg text-sm font-medium bg-red-100 text-red-800 border border-red-300">
          {state.error}
        </div>
      )}
    </div>
  );
});
