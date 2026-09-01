<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — Brandopsy</title>
</svelte:head>

<main
	class="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center"
>
	<p class="text-5xl font-bold text-neutral-300">{page.status}</p>
	<p class="text-neutral-600">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href={resolve('/')} class="mt-2 text-sm underline">Back to the gallery</a>
</main>
