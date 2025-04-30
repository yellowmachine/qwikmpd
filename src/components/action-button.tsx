import { component$, useStore, $, Slot, type QRL } from '@builder.io/qwik';

interface ActionButtonProps {
  action: QRL<(event: Event) => Promise<void>>;
  successMessage?: string;
}

export const ActionButton = component$<ActionButtonProps>(({ action, successMessage }) => {
  const state = useStore({
    loading: false,
    error: null as string | null,
    success: false,
  });

  const handleClick = $(async (event: Event) => {
    if (state.loading) return;
    state.loading = true;
    state.error = null;
    state.success = false;

    try {
        await action(event);
        state.success = true;
      setTimeout(() => {
        state.success = false;
      }, 2500);
    } catch (e) {
      state.error = e instanceof Error ? e.message : String(e);
      setTimeout(() => {
        state.error = null;
      }, 2500);
    } finally {
      state.loading = false;
    }
  });

  return (
    <div class="relative inline-block">
      <span onClick$={handleClick} style={{ cursor: state.loading ? 'not-allowed' : 'pointer', opacity: state.loading ? '0.6' : '1' }}>
        <Slot />
      </span>

      {state.success && (
        <div class="absolute left-full top-1/2 -translate-y-1/2 ml-4 min-w-[100px] px-4 py-2 rounded shadow-lg text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          {successMessage}
        </div>
      )}

      {state.error && (
        <div class="absolute left-full top-1/2 -translate-y-1/2 ml-4 min-w-[100px] px-4 py-2 rounded shadow-lg text-sm font-medium bg-red-100 text-red-800 border border-red-300">
          {state.error}
        </div>
      )}
    </div>
  );
});
