<script lang="ts">
	import { resolve } from '$app/paths';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';
	import CommentThread from '$lib/components/CommentThread.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.study.title} — ITopsy</title>
</svelte:head>

{#key data.study.id}
	<div class="flex flex-col">
		<header
			class="border-surface-200-800 flex items-center justify-between gap-4 border-b px-4 py-3"
		>
			<div class="flex flex-col">
				<a href={resolve('/')} class="anchor text-xs">&larr; Return to the Registry</a>
				<h1 class="text-lg font-semibold">{data.study.title}</h1>
			</div>
			<div class="flex items-center gap-3">
				{#if data.study.status === 'draft'}
					<span class="badge preset-tonal-warning">Sealed Record</span>
				{/if}
				<LikeButton
					liked={data.liked}
					likeCount={data.study.likeCount}
					canLike={data.user !== null}
				/>
			</div>
		</header>

		<div class="h-[80vh] w-full">
			<SandboxedStudy html={data.study.htmlContent} />
		</div>

		<section class="mx-auto w-full max-w-3xl px-4 py-8">
			<h2 class="mb-1 text-lg font-semibold">Public Testimony</h2>
			<p class="text-surface-600-400 mb-4 text-xs">
				Statements below are unsworn and almost certainly biased.
			</p>
			<CommentThread
				comments={data.comments}
				currentUser={data.user}
				canComment={data.user !== null}
			/>
		</section>
	</div>
{/key}
