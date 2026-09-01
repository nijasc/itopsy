<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import seal from '$lib/assets/itopsy-logo.png';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';
	import CommentThread from '$lib/components/CommentThread.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const severityPreset: Record<string, string> = {
		mild: 'preset-tonal-success',
		medium: 'preset-tonal-warning',
		savage: 'preset-tonal-error'
	};
	const severityLabel: Record<string, string> = {
		mild: 'Mild Offense',
		medium: 'Medium Offense',
		savage: 'Savage Offense'
	};
	const languageFlag: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

	const canonicalUrl = $derived(page.url.origin + page.url.pathname);
	const ogImage = $derived(`${page.url.origin}${seal}`);
	const jsonLd = $derived(
		// Escape angle brackets so a title/dek/tag can't break out of the
		// injected JSON-LD element below.
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: data.study.title,
			description: data.study.dek,
			inLanguage: data.study.language,
			datePublished: data.study.createdAt,
			dateModified: data.study.updatedAt,
			url: canonicalUrl,
			image: ogImage,
			about: data.study.subject,
			keywords: data.study.tags.join(', '),
			publisher: { '@type': 'Organization', name: 'ITopsy' }
		}).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<title>{data.study.title} — ITopsy</title>
	{#if data.study.status === 'published'}
		<meta name="description" content={data.study.dek} />
		<link rel="canonical" href={canonicalUrl} />

		<meta property="og:type" content="article" />
		<meta property="og:site_name" content="ITopsy" />
		<meta property="og:title" content={data.study.title} />
		<meta property="og:description" content={data.study.dek} />
		<meta property="og:url" content={canonicalUrl} />
		<meta property="og:image" content={ogImage} />
		<meta property="article:section" content={data.study.subject} />
		{#each data.study.tags as tag (tag)}
			<meta property="article:tag" content={tag} />
		{/each}

		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content={data.study.title} />
		<meta name="twitter:description" content={data.study.dek} />
		<meta name="twitter:image" content={ogImage} />

		<!-- jsonLd is our own JSON.stringify'd data with angle brackets escaped; -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html '<' + 'script type="application/ld+json">' + jsonLd + '</' + 'script>'}
	{:else}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{#key data.study.id}
	<div class="flex flex-col">
		<header class="bg-surface-100-900 border-surface-200-800 border-b">
			<div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5">
				<a href={resolve('/')} class="anchor flex w-fit items-center gap-1 text-xs">
					&larr; Return to the Registry
				</a>

				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="flex flex-col gap-2">
						<div class="flex flex-wrap items-center gap-2">
							<span class="badge {severityPreset[data.study.severity]}">
								{severityLabel[data.study.severity]}
							</span>
							<span class="badge preset-tonal">
								{languageFlag[data.study.language]}
								{data.study.language === 'de' ? 'Deutsch' : 'English'}
							</span>
							{#if data.study.status === 'draft'}
								<span class="badge preset-tonal-warning">Sealed Record</span>
							{/if}
						</div>
						<h1 class="text-2xl font-bold text-balance">{data.study.title}</h1>
						<p class="text-surface-600-400 text-sm">{data.study.subject}</p>
					</div>

					<LikeButton
						liked={data.liked}
						likeCount={data.study.likeCount}
						canLike={data.user !== null}
					/>
				</div>

				{#if data.study.tags.length > 0}
					<div class="flex flex-wrap gap-1.5">
						{#each data.study.tags as tag (tag)}
							<span class="chip preset-tonal text-xs">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</header>

		<div class="mx-auto w-full max-w-5xl px-4 py-6">
			<div class="border-surface-200-800 overflow-hidden rounded-lg border shadow-sm">
				<div class="bg-surface-200-800 flex items-center gap-2 px-3 py-2">
					<span class="bg-error-500 size-2.5 rounded-full"></span>
					<span class="bg-warning-500 size-2.5 rounded-full"></span>
					<span class="bg-success-500 size-2.5 rounded-full"></span>
					<span class="text-surface-600-400 ml-2 font-mono text-xs">
						exhibit://{data.study.slug}
					</span>
				</div>
				<div class="h-[70vh] min-h-[420px] w-full md:h-[80vh]">
					<SandboxedStudy html={data.study.htmlContent} />
				</div>
			</div>
		</div>

		{#if data.recommendations.length > 0}
			<section class="mx-auto w-full max-w-5xl px-4 pb-10">
				<h2 class="mb-3 text-lg font-semibold">Related Case Files</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each data.recommendations as rec (rec.slug)}
						<a
							href={resolve('/study/[slug]', { slug: rec.slug })}
							class="card bg-surface-100-900 flex flex-col gap-2 p-4 transition hover:shadow-md"
						>
							<div class="text-surface-600-400 flex items-center justify-between text-xs">
								<span>{rec.subject}</span>
								<span class="badge {severityPreset[rec.severity]}">{rec.severity}</span>
							</div>
							<p class="text-sm font-medium">{rec.title}</p>
							<span class="text-surface-600-400 text-xs">{rec.likeCount} co-signers</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<section class="mx-auto w-full max-w-3xl px-4 pb-16">
			<div class="card bg-surface-100-900 p-6">
				<h2 class="mb-1 text-lg font-semibold">Public Testimony</h2>
				<p class="text-surface-600-400 mb-4 text-xs">
					Statements below are unsworn and almost certainly biased.
				</p>
				<CommentThread
					comments={data.comments}
					currentUser={data.user}
					canComment={data.user !== null}
				/>
			</div>
		</section>
	</div>
{/key}
