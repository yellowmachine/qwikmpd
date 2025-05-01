import { component$, Slot } from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";

function isSetupDone() {
  return false;
}

export const onRequest: RequestHandler = async ({ redirect, url }) => {
  // Evita la redirección en la propia página de configuración
  if (url.pathname.startsWith('/setup')) {
    return;
  }

  if (!isSetupDone()) {
    throw redirect(308, '/setup');
  }
};

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {

  return (
    <div class="mx-auto max-w-3xl px-4 sm:px-6 md:w-1/2">
      <Slot />
    </div>
  );
});
