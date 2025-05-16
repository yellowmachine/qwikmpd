import { component$ } from '@builder.io/qwik';

export const Footer = component$(() => (
    <footer class="w-full text-center py-4 border-t border-gray-300 text-sm text-gray-600">
    <a
      href="https://www.perplexity.ai/"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center justify-center hover:underline"
    >
        Powered by 
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg"
        alt="Perplexity AI logo"
        class="w-20 h-5 ml-2"
        width={24}
        height={24}
      />
    </a>
    <p />
    <a href="http://www.freepik.com">App icon designed by macrovector / Freepik</a>
  </footer>
));
