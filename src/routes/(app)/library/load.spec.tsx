import { describe, test, vi, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { QwikCityMockProvider } from '@builder.io/qwik-city';
import Page from './index';


vi.mock('#mpd', () => ({
  mpdServerApi: {
    list: vi.fn().mockResolvedValue({
      directory: ['mock-dir'],
      file: [{ title: 'Mock Song', artist: 'Mock Artist' }],
    }),
  },
}));

describe('Library Route Loader', () => {
  test('Carga datos correctamente', async () => {
    const { screen, render } = await createDOM();

    await render(
      <QwikCityMockProvider
      >
        <Page />
      </QwikCityMockProvider>
    );
    expect(screen.outerHTML).toContain('mock-dir');

  });
});
