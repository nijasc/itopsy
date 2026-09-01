<script lang="ts">
	import seal from '$lib/assets/itopsy-logo.png';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import GalleryGrid from '$lib/components/GalleryGrid.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filterKey = $derived(JSON.stringify(data.filters));
</script>

<svelte:head>
	<title>ITopsy — Satirical case studies</title>
</svelte:head>

<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
	<header class="flex items-center gap-4">
		<img src={seal} alt="ITopsy official seal" class="size-20 shrink-0 md:size-24" />
		<div class="flex flex-col gap-2">
			<h1 class="text-3xl font-bold">The ITopsy Registry</h1>
			<p class="text-surface-600-400">
				A public archive of companies, products, people, and institutions that have been opened up,
				examined, and found guilty of something. No refunds.
			</p>
		</div>
	</header>

	<FilterBar facets={data.facets} filters={data.filters} />

	{#key filterKey}
		<GalleryGrid studies={data.studies} nextCursor={data.nextCursor} />
	{/key}
</main>
