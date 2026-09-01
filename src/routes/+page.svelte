<script lang="ts">
	import { page } from '$app/state';
	import seal from '$lib/assets/itopsy-logo.png';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import GalleryGrid from '$lib/components/GalleryGrid.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filterKey = $derived(JSON.stringify(data.filters));

	const description =
		'A public archive of satirical case studies on companies, products, people, and institutions that have been opened up, examined, and found guilty of something.';
	const ogImage = $derived(`${page.url.origin}${seal}`);
</script>

<svelte:head>
	<title>ITopsy — Satirical Case Studies</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={page.url.origin + page.url.pathname} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="ITopsy" />
	<meta property="og:title" content="ITopsy — Satirical Case Studies" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={page.url.origin + page.url.pathname} />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="ITopsy — Satirical Case Studies" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
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
