<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let {
		facets,
		filters
	}: {
		facets: { tags: { tag: string; count: number }[] };
		filters: { tags: string[]; severity: string[]; search: string; sort: string };
	} = $props();

	const SEVERITIES = ['mild', 'medium', 'savage'] as const;
	const SORTS = [
		{ value: 'newest', label: 'Newest' },
		{ value: 'most-liked', label: 'Most liked' },
		{ value: 'most-discussed', label: 'Most discussed' }
	];

	function updateParams(mutate: (params: SvelteURLSearchParams) => void) {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.delete('cursor');
		mutate(params);
		// Relative query-string-only navigation on the current page — no base path involved.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	function toggleTag(tag: string) {
		updateParams((params) => {
			const current = params.getAll('tag');
			params.delete('tag');
			if (current.includes(tag)) {
				current.filter((t) => t !== tag).forEach((t) => params.append('tag', t));
			} else {
				[...current, tag].forEach((t) => params.append('tag', t));
			}
		});
	}

	function toggleSeverity(severity: string) {
		updateParams((params) => {
			const current = params.getAll('severity');
			params.delete('severity');
			if (current.includes(severity)) {
				current.filter((s) => s !== severity).forEach((s) => params.append('severity', s));
			} else {
				[...current, severity].forEach((s) => params.append('severity', s));
			}
		});
	}

	function setSort(sort: string) {
		updateParams((params) => params.set('sort', sort));
	}

	function onSearchSubmit(event: SubmitEvent) {
		event.preventDefault();
		const value = (new FormData(event.currentTarget as HTMLFormElement).get('q') as string) ?? '';
		updateParams((params) => {
			if (value.trim()) params.set('q', value.trim());
			else params.delete('q');
		});
	}
</script>

<div class="flex flex-col gap-4 border-b border-neutral-200 pb-4">
	<form onsubmit={onSearchSubmit} class="flex gap-2">
		<input
			type="search"
			name="q"
			placeholder="Search case studies…"
			value={filters.search}
			class="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
		/>
		<button type="submit" class="rounded bg-neutral-900 px-4 py-2 text-sm text-white">Search</button
		>
	</form>

	<div class="flex flex-wrap items-center gap-4">
		<div class="flex flex-wrap gap-2">
			{#each SEVERITIES as severity (severity)}
				<button
					type="button"
					onclick={() => toggleSeverity(severity)}
					class="rounded-full border px-3 py-1 text-xs capitalize"
					class:bg-neutral-900={filters.severity.includes(severity)}
					class:text-white={filters.severity.includes(severity)}
					class:border-neutral-900={filters.severity.includes(severity)}
					class:border-neutral-300={!filters.severity.includes(severity)}
				>
					{severity}
				</button>
			{/each}
		</div>

		<select
			value={filters.sort}
			onchange={(e) => setSort((e.currentTarget as HTMLSelectElement).value)}
			class="rounded border border-neutral-300 px-2 py-1 text-xs"
		>
			{#each SORTS as sortOption (sortOption.value)}
				<option value={sortOption.value}>{sortOption.label}</option>
			{/each}
		</select>
	</div>

	{#if facets.tags.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each facets.tags as { tag, count } (tag)}
				<button
					type="button"
					onclick={() => toggleTag(tag)}
					class="rounded-full border px-3 py-1 text-xs"
					class:bg-neutral-900={filters.tags.includes(tag)}
					class:text-white={filters.tags.includes(tag)}
					class:border-neutral-900={filters.tags.includes(tag)}
					class:border-neutral-300={!filters.tags.includes(tag)}
				>
					{tag} <span class="text-neutral-400">({count})</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
