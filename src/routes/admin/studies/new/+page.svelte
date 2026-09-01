<script lang="ts">
	import { enhance } from '$app/forms';
	import HtmlEditor from '$lib/components/HtmlEditor.svelte';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let htmlContent = $state('<!doctype html>\n<html>\n<head></head>\n<body>\n</body>\n</html>');
</script>

<svelte:head>
	<title>New study — Brandopsy admin</title>
</svelte:head>

<main class="flex h-screen flex-col gap-4 p-4">
	<h1 class="text-xl font-semibold">New study</h1>

	<form method="POST" use:enhance class="flex flex-1 flex-col gap-4 overflow-hidden">
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<label class="flex flex-col gap-1 text-sm">
				<span>Title</span>
				<input name="title" required class="rounded border border-neutral-300 px-2 py-1" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Subject</span>
				<input name="subject" required class="rounded border border-neutral-300 px-2 py-1" />
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Severity</span>
				<select name="severity" class="rounded border border-neutral-300 px-2 py-1">
					<option value="mild">Mild</option>
					<option value="medium" selected>Medium</option>
					<option value="savage">Savage</option>
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span>Status</span>
				<select name="status" class="rounded border border-neutral-300 px-2 py-1">
					<option value="draft" selected>Draft</option>
					<option value="published">Published</option>
				</select>
			</label>
			<label class="col-span-2 flex flex-col gap-1 text-sm md:col-span-2">
				<span>Tags (comma-separated)</span>
				<input name="tags" class="rounded border border-neutral-300 px-2 py-1" />
			</label>
			<label class="col-span-2 flex flex-col gap-1 text-sm md:col-span-2">
				<span>Dek</span>
				<input name="dek" required class="rounded border border-neutral-300 px-2 py-1" />
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
				Create study
			</button>
		</div>
	</form>
</main>
