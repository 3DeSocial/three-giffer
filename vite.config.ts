import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';

const config: UserConfig = {
	plugins: [sveltekit(),crossOriginIsolation()],

};

export default config;
