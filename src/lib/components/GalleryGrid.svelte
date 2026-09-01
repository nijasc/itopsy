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
			language: string;
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
	<p class="text-surface-600-400 py-16 text-center text-sm">
		No case studies match these filters. Either the guilty went free, or you typed something wrong.
	</p>
{:else}
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each studies as study (study.slug)}
			<StudyCard {study} />
		{/each}
	</div>
{/if}

{#if nextCursor}
	<div class="flex justify-center py-4">
		<button type="button" onclick={loadMore} disabled={loadingMore} class="btn preset-tonal">
			{loadingMore ? 'Subpoenaing more records…' : 'Reveal More Evidence'}
		</button>
	</div>
{/if}
