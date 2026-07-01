import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/** @param {string | undefined} value */
function normalizeBasePath(value) {
	if (!value || value === '/') return '';

	const trimmed = value.replace(/^\/+|\/+$/g, '');
	if (!trimmed) return '';

	return /** @type {`/${string}`} */ (`/${trimmed}`);
}

const basePath = normalizeBasePath(process.env.BASE_PATH);

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: adapter({
				fallback: '404.html'
			}),
			paths: {
				base: basePath
			}
		})
	]
});
