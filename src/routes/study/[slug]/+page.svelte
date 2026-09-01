<script lang="ts">
	import { resolve } from '$app/paths';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.study.title} — Brandopsy</title>
</svelte:head>

<div class="flex h-screen flex-col">
	<header class="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
		<div class="flex flex-col">
			<a href={resolve('/')} class="text-xs text-neutral-500 hover:underline"
				>&larr; Back to gallery</a
			>
			<h1 class="text-lg font-semibold">{data.study.title}</h1>
		</div>
		{#if data.study.status === 'draft'}
			<span class="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Draft</span>
		{/if}
	</header>
	<div class="flex-1">
		<SandboxedStudy html={data.study.htmlContent} />
	</div>
</div>
