import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: {
          '': 'ChatGPT Conversation Width Sliders',
          'zh-CN': 'ChatGPT 对话框宽度滑块',
        },
        namespace: 'https://chatgpt.com/',
        version: '0.1.0',
        license: 'MIT',
        description: {
          '':
            'Adjust the width and position of ChatGPT conversation content with some sliders.',
          'zh-CN': '调整 ChatGPT 对话框的宽度。',
        },
        match: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
        grant: 'none',
      },
    }),
  ],
  build: {
    minify: false,
  },
});
