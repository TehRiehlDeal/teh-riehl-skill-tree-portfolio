<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.ico';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		// Register service worker for PWA support
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('✨ Service Worker registered successfully:', registration.scope);

					// Check for updates periodically
					registration.addEventListener('updatefound', () => {
						const newWorker = registration.installing;
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									console.log('🔄 New service worker available. Refresh to update.');
								}
							});
						}
					});
				})
				.catch((error) => {
					console.warn('Service Worker registration failed:', error);
				});
		}
	});
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href={favicon} />

	<!-- PWA Meta Tags -->
	<meta name="application-name" content="Atlas of Skills" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Atlas of Skills" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="theme-color" content="#ffd700" />

	<!-- Web App Manifest -->
	<link rel="manifest" href="/manifest.webmanifest" />

	<!-- Apple Touch Icons -->
	<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

	<!-- PWA Icons -->
	<link rel="icon" type="image/png" sizes="192x192" href="/icons/pwa-192x192.png" />
	<link rel="icon" type="image/png" sizes="512x512" href="/icons/pwa-512x512.png" />

	<!-- SEO Meta Tags -->
	<meta name="description" content="Interactive portfolio featuring a Path of Exile-inspired skill tree visualization showcasing Kevin Riehl's professional experience, projects, and technical skills." />
	<meta name="keywords" content="portfolio, web developer, software engineer, interactive resume, skill tree" />
	<meta name="author" content="Kevin Riehl" />

	<!-- Open Graph Meta Tags for social sharing -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Kevin Riehl - The Atlas of Skills" />
	<meta property="og:description" content="Interactive portfolio featuring a Path of Exile-inspired skill tree visualization." />
	<meta property="og:url" content="https://tehriehldeal.com" />
	<meta property="og:site_name" content="Atlas of Skills" />
	<!-- Add og:image when screenshots are available -->
	<!-- <meta property="og:image" content="https://tehriehldeal.com/screenshots/preview.png" /> -->

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Kevin Riehl - The Atlas of Skills" />
	<meta name="twitter:description" content="Interactive portfolio featuring a Path of Exile-inspired skill tree visualization." />
	<!-- Add twitter:image when screenshots are available -->
	<!-- <meta name="twitter:image" content="https://tehriehldeal.com/screenshots/preview.png" /> -->
</svelte:head>

{@render children()}
