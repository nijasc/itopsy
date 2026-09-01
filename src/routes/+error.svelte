<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — ITopsy</title>
</svelte:head>

<main
	class="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center"
>
	<p class="text-surface-300-700 text-5xl font-bold">{page.status}</p>
	<h1 class="text-lg font-semibold">
		{page.status === 404 ? 'Case File Not Found' : 'An Irregularity Has Occurred'}
	</h1>
	<p class="text-surface-600-400 text-sm">
		{page.status === 404
			? "Our forensic accountants searched every filing cabinet and came up empty. The record you're looking for may have been shredded, sealed, or never existed."
			: (page.error?.message ?? 'Something has gone wrong, and several people are being blamed.')}
	</p>
	<a href={resolve('/')} class="btn preset-tonal mt-2">Return to the Registry</a>
</main>
