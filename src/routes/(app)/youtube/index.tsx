import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const name = 'UCDptIDyUZvphf_9FLfrDjBw';

  return (
    <div>
      <h1>Debug /youtube</h1>
      <Link class="bg-brand-600 text-white px-6 py-2 rounded mt-4" href={`/youtube/${name}`}>Ir a /youtube/{name}</Link>
    </div>
  );
});