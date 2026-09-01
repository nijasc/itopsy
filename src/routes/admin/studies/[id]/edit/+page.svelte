<script lang="ts">
	import { enhance } from '$app/forms';
	import HtmlEditor from '$lib/components/HtmlEditor.svelte';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Captured once per mount; saving redirects back to this same route, and the
	// editor's own in-memory value already reflects what was just saved.
	let htmlContent = $state(data.study.htmlContent);
</script>

<svelte:head>
	<title>Edit {data.study.title} — Brandopsy admin</title>
</svelte:head>

<main class="flex h-screen flex-col gap-4 p-4">
	<h1 class="text-xl font-semibold">Edit study</h1>

	<form method="POST" use:enhance class="flex flex-1 flex-col gap-4 overflow-hidden">
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<label class="flex flex-col gap-1 text-sm">
				<span>Title</span>
				<input
					name="title"
					required
					value={data.study.title}
					class="rounded border border-neutral-300 px-2 py-1"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Subject</span>
				<input
					name="subject"
					required
					value={data.study.subject}
					class="rounded border border-neutral-300 px-2 py-1"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Severity</span>
				<select name="severity" class="rounded border border-neutral-300 px-2 py-1">
					{#each ['mild', 'medium', 'savage'] as s (s)}
						<option value={s} selected={data.study.severity === s}>{s}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Status</span>
				<select name="status" class="rounded border border-neutral-300 px-2 py-1">
					{#each ['draft', 'published'] as s (s)}
						<option value={s} selected={data.study.status === s}>{s}</option>
					{/each}
				</select>
			</label>
			<label class="col-span-2 flex flex-col gap-1 text-sm md:col-span-2">
				<span>Tags (comma-separated)</span>
				<input
					name="tags"
					value={data.study.tags.join(', ')}
					class="rounded border border-neutral-300 px-2 py-1"
				/>
			</label>
			<label class="col-span-2 flex flex-col gap-1 text-sm md:col-span-2">
				<span>Dek</span>
				<input
					name="dek"
					required
					value={data.study.dek}
					class="rounded border border-neutral-300 px-2 py-1"
				/>
			</label>
		</div>

		{#if form?.error}
			<p class="text-sm text-red-600" role="alert">{form.error}</p>
		{/if}

		<input type="hidden" name="htmlContent" value={htmlContent} />

		<div class="grid flex-1 grid-cols-1 gap-4 overflow-auto md:grid-cols-2 md:overflow-hidden">
			<div class="overflow-hidden rounded border border-neutral-300">
				<HtmlEditor bind:value={htmlContent} />
			</div>
			<div class="overflow-hidden rounded border border-neutral-300">
				<SandboxedStudy html={htmlContent} />
			</div>
		</div>

		<div>
			<button type="submit" class="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
				Save changes
			</button>
		</div>
	</form>
</main>
