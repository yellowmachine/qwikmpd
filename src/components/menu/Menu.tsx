import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { LuMenu, LuSettings } from '@qwikest/icons/lucide';

const MenuLinks = ({ location, menuItems }: { location: any, menuItems: any[]}) => (
  <>
    {menuItems.map(({ href, label }) => (
      <li key={href} class="p-2 cursor-pointer hover:bg-brand-200">
        <Link
          href={href}
          class={`text-brand-500 ${
            location.url.pathname === href ? 'font-bold' : ''
          }`}
        >
          {label}
        </Link>
      </li>
    ))}
    <li>
      <Link href="/update" class="text-brand-500">
        <LuSettings class="w-8 h-8" />
      </Link>
    </li>
  </>
);


export const Menu = component$(() => {
  const location = useLocation();
  const showPopup = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => location.url.pathname);
    showPopup.value = false;
  });

  const menuItems = [
    { href: '/queue', label: 'Reproductor' },
    { href: '/library', label: 'Biblioteca' },
    { href: '/playlists', label: 'Playlists' },
    { href: '/clients', label: 'Altavoces' },
  ];

  return (
    <nav class="mb-4 mt-4 border border-brand-300 border-2 flex justify-between items-center px-4">
      {/* Título a la izquierda */}
      <div class="font-bold text-xl text-brand-500">westernMPD</div>
      {/* Menú a la derecha */}
      <div class="flex items-center">
        <ul class="hidden md:flex gap-4 list-none p-0">
          <MenuLinks location={location} menuItems={menuItems} />
        </ul>
        <div class="relative">
          <button
            class="block md:hidden p-2 text-brand-500 cursor-pointer"
            onClick$={() => (showPopup.value = !showPopup.value)}
            aria-label="Abrir menú"
          >
            <LuMenu class="w-8 h-8" />
          </button>
          {/* Popup menú móvil */}
          {showPopup.value && (
            <div class="absolute right-0 top-full mt-2 z-50">
              <div class="bg-white rounded shadow-lg p-6">
                <ul class="flex flex-col gap-4">
                  <MenuLinks location={location} menuItems={menuItems} />
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
  
});
