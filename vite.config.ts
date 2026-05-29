import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'ChatGPT Conversation Width Sliders',
        namespace: 'https://chatgpt.com/',
        version: '0.1.0',
        description:
          'Adjust the width and position of ChatGPT conversation content with some sliders.',
        match: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
        grant: 'none',
      },
    }),
  ],
  build: {
    minify: false,
  },
});
