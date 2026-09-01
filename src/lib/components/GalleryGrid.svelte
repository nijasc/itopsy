<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import StudyCard from './StudyCard.svelte';

	let {
		studies: initialStudies,
		nextCursor: initialCursor
	}: {
		studies: {
			slug: string;
			title: string;
			subject: string;
			dek: string;
			htmlContent: string;
			tags: string[];
			severity: string;
			likeCount: number;
			commentCount: number;
		}[];
		nextCursor: string | null;
	} = $props();

	// Captured once per mount; the parent forces a remount (via #key) whenever
	// the active filters change, so this intentionally doesn't react to prop updates.
	let studies = $state(initialStudies);
	let nextCursor = $state(initialCursor);
	let loadingMore = $state(false);

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const params = new SvelteURLSearchParams(page.url.searchParams);
			params.set('cursor', nextCursor);
			const res = await fetch(`/api/studies?${params.toString()}`);
			const result: { studies: typeof studies; nextCursor: string | null } = await res.json();
			studies = [...studies, ...result.studies];
			nextCursor = result.nextCursor;
		} finally {
			loadingMore = false;
		}
	}
</script>

{#if studies.length === 0}
	<p class="py-16 text-center text-neutral-500">No case studies match these filters.</p>
{:else}
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each studies as study (study.slug)}
			<StudyCard {study} />
		{/each}
	</div>
{/if}

{#if nextCursor}
	<div class="flex justify-center py-4">
		<button
			type="button"
			onclick={loadMore}
			disabled={loadingMore}
			class="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
		>
			{loadingMore ? 'Loading…' : 'Load more'}
		</button>
	</div>
{/if}
