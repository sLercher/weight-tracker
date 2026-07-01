<script>
	import { asset } from '$app/paths';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap"
	/>
	<link rel="manifest" href={asset('/manifest.json')} />
	<link rel="apple-touch-icon" href={asset('/icons/icon-192.svg')} />
	<meta name="theme-color" content="#ff5600" />
</svelte:head>
{@render children()}
