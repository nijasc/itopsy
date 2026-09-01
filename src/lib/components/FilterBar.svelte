<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let {
		facets,
		filters
	}: {
		facets: {
			tags: { tag: string; count: number }[];
			languages: { language: string; count: number }[];
		};
		filters: {
			tags: string[];
			severity: string[];
			language: string;
			search: string;
			sort: string;
		};
	} = $props();

	const SEVERITIES = ['mild', 'medium', 'savage'] as const;
	const SORTS = [
		{ value: 'newest', label: 'Freshest Outrage' },
		{ value: 'most-liked', label: 'Most Beloved' },
		{ value: 'most-discussed', label: 'Most Litigated' }
	];
	const LANGUAGES = [
		{ value: 'en', label: 'English' },
		{ value: 'de', label: 'Deutsch' },
		{ value: 'all', label: 'Alle / All' }
	];

	const TAG_PREVIEW_COUNT = 10;
	let tagsExpanded = $state(false);
	// Always keep a currently-active tag visible, even past the preview cutoff,
	// so a user can still see and untoggle it without expanding the whole list.
	const visibleTags = $derived(
		tagsExpanded
			? facets.tags
			: facets.tags.filter((t, i) => i < TAG_PREVIEW_COUNT || filters.tags.includes(t.tag))
	);
	const hiddenTagCount = $derived(Math.max(0, facets.tags.length - visibleTags.length));

	function countFor(language: string) {
		if (language === 'all') return facets.languages.reduce((sum, l) => sum + l.count, 0);
		return facets.languages.find((l) => l.language === language)?.count ?? 0;
	}

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

	function setLanguage(language: string) {
		updateParams((params) => {
			if (language === 'en') params.delete('lang');
			else params.set('lang', language);
		});
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

<div class="border-surface-200-800 flex flex-col gap-4 border-b pb-4">
	<form onsubmit={onSearchSubmit} class="flex gap-2">
		<input
			type="search"
			name="q"
			placeholder="Search the registry for wrongdoing…"
			value={filters.search}
			class="input flex-1"
		/>
		<button type="submit" class="btn preset-filled-primary-500">Investigate</button>
	</form>

	<div class="flex flex-wrap gap-2">
		{#each LANGUAGES as { value, label } (value)}
			<button
				type="button"
				onclick={() => setLanguage(value)}
				aria-pressed={filters.language === value}
				class="chip {filters.language === value
					? 'preset-filled-secondary-500'
					: 'preset-outlined-surface-400-600 hover:preset-tonal'}"
			>
				{label} <span class="opacity-60">({countFor(value)})</span>
			</button>
		{/each}
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<div class="flex flex-wrap gap-2">
			{#each SEVERITIES as severity (severity)}
				<button
					type="button"
					onclick={() => toggleSeverity(severity)}
					aria-pressed={filters.severity.includes(severity)}
					class="chip capitalize {filters.severity.includes(severity)
						? 'preset-filled-primary-500'
						: 'preset-outlined-surface-400-600 hover:preset-tonal'}"
				>
					{severity}
				</button>
			{/each}
		</div>

		<select
			value={filters.sort}
			onchange={(e) => setSort((e.currentTarget as HTMLSelectElement).value)}
			class="select w-auto text-xs"
		>
			{#each SORTS as sortOption (sortOption.value)}
				<option value={sortOption.value}>{sortOption.label}</option>
			{/each}
		</select>
	</div>

	{#if facets.tags.length > 0}
		<div class="flex flex-wrap items-center gap-2">
			{#each visibleTags as { tag, count } (tag)}
				<button
					type="button"
					onclick={() => toggleTag(tag)}
					aria-pressed={filters.tags.includes(tag)}
					class="chip {filters.tags.includes(tag)
						? 'preset-filled-primary-500'
						: 'preset-outlined-surface-400-600 hover:preset-tonal'}"
				>
					{tag} <span class="opacity-60">({count})</span>
				</button>
			{/each}
			{#if hiddenTagCount > 0}
				<button
					type="button"
					onclick={() => (tagsExpanded = true)}
					class="chip preset-tonal-secondary text-xs"
				>
					+{hiddenTagCount} more
				</button>
			{:else if tagsExpanded && facets.tags.length > TAG_PREVIEW_COUNT}
				<button
					type="button"
					onclick={() => (tagsExpanded = false)}
					class="chip preset-tonal-secondary text-xs"
				>
					Show fewer
				</button>
			{/if}
		</div>
	{/if}
</div>
