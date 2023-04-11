import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';

export default {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({
		})
	  }
  };