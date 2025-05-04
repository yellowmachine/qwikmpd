import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export const Menu = component$(() => {
  const location = useLocation();

  const menuItems = [
    { href: '/queue', label: 'Cola' },
    { href: '/library', label: 'Biblioteca' },
    { href: '/playlists', label: 'Playlists' },
    { href: '/admin', label: 'Configuración' },
  ];

  return (
    <nav class="mb-4 mt-4 border border-brand-300 border-2">
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0 }}>
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
      </ul>
    </nav>
  );
});
