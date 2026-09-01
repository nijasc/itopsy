<script lang="ts">
	import { resolve } from '$app/paths';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';
	import CommentThread from '$lib/components/CommentThread.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.study.title} — Brandopsy</title>
</svelte:head>

{#key data.study.id}
	<div class="flex flex-col">
		<header class="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
			<div class="flex flex-col">
				<a href={resolve('/')} class="text-xs text-neutral-500 hover:underline"
					>&larr; Back to gallery</a
				>
				<h1 class="text-lg font-semibold">{data.study.title}</h1>
			</div>
			<div class="flex items-center gap-3">
				{#if data.study.status === 'draft'}
					<span class="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
						>Draft</span
					>
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
			<h2 class="mb-4 text-lg font-semibold">Discussion</h2>
			<CommentThread
				comments={data.comments}
				currentUser={data.user}
				canComment={data.user !== null}
			/>
		</section>
	</div>
{/key}
