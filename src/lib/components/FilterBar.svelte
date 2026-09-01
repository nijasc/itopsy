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

	// A writable $derived: tracks filters.search (so browser back/forward or
	// other nav that changes the URL's q param stays in sync, since FilterBar
	// persists across gallery navigations and isn't remounted), but can also
	// be reassigned directly as the user types without fighting the binding.
	let searchValue = $derived(filters.search);
	let suggestionsOpen = $state(false);
	let highlightedIndex = $state(-1);

	const suggestions = $derived.by(() => {
		const term = searchValue.trim().toLowerCase();
		const pool = term
			? facets.tags.filter(({ tag }) => tag.toLowerCase().includes(term))
			: facets.tags;
		return pool.slice(0, 8);
	});

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

	function runSearch(value: string) {
		updateParams((params) => {
			if (value.trim()) params.set('q', value.trim());
			else params.delete('q');
		});
	}

	function onSearchSubmit(event: SubmitEvent) {
		event.preventDefault();
		suggestionsOpen = false;
		runSearch(searchValue);
	}

	function pickSuggestion(tag: string) {
		searchValue = tag;
		suggestionsOpen = false;
		highlightedIndex = -1;
		runSearch(tag);
	}

	function onSearchKeydown(event: KeyboardEvent) {
		if (!suggestionsOpen || suggestions.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % suggestions.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
		} else if (event.key === 'Enter' && highlightedIndex >= 0) {
			event.preventDefault();
			pickSuggestion(suggestions[highlightedIndex].tag);
		} else if (event.key === 'Escape') {
			suggestionsOpen = false;
		}
	}
</script>

<div class="border-surface-200-800 flex flex-col gap-4 border-b pb-4">
	<form onsubmit={onSearchSubmit} class="flex gap-2">
		<div class="relative flex-1">
			<input
				type="search"
				name="q"
				autocomplete="off"
				placeholder="Search the registry for wrongdoing… (try a tag, e.g. npm)"
				bind:value={searchValue}
				onfocus={() => (suggestionsOpen = true)}
				onblur={() => setTimeout(() => (suggestionsOpen = false), 120)}
				oninput={() => (highlightedIndex = -1)}
				onkeydown={onSearchKeydown}
				class="input w-full"
			/>
			{#if suggestionsOpen && suggestions.length > 0}
				<ul
					class="card bg-surface-100-900 border-surface-200-800 absolute top-full left-0 z-20 mt-1 w-full border py-1 shadow-xl"
				>
					{#each suggestions as { tag, count }, i (tag)}
						<li>
							<button
								type="button"
								onclick={() => pickSuggestion(tag)}
								class="hover:bg-primary-500 hover:text-primary-contrast-500 flex w-full items-center justify-between px-3 py-1.5 text-left text-sm {i ===
								highlightedIndex
									? 'bg-primary-500 text-primary-contrast-500'
									: ''}"
							>
								<span>{tag}</span>
								<span class="opacity-60">{count}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<button type="submit" class="btn preset-filled-primary-500">Investigate</button>
	</form>

	<div class="flex flex-wrap gap-2">
		{#each LANGUAGES as { value, label } (value)}
			<button
				type="button"
				onclick={() => setLanguage(value)}
				aria-pressed={filters.language === value}
				class="chip {filters.language === value
					? 'preset-filled-primary-500'
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
</div>
