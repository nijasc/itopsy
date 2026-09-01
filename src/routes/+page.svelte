<script lang="ts">
	import FilterBar from '$lib/components/FilterBar.svelte';
	import GalleryGrid from '$lib/components/GalleryGrid.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filterKey = $derived(JSON.stringify(data.filters));
</script>

<svelte:head>
	<title>Brandopsy — Satirical case studies</title>
</svelte:head>

<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
	<header class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold">Brandopsy</h1>
		<p class="text-neutral-600">Satirical case studies of brands, products, and institutions.</p>
	</header>

	<FilterBar facets={data.facets} filters={data.filters} />

	{#key filterKey}
		<GalleryGrid studies={data.studies} nextCursor={data.nextCursor} />
	{/key}
</main>
