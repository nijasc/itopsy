<script lang="ts">
	import { enhance } from '$app/forms';
	import HtmlEditor from '$lib/components/HtmlEditor.svelte';
	import SandboxedStudy from '$lib/components/SandboxedStudy.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let htmlContent = $state('<!doctype html>\n<html>\n<head></head>\n<body>\n</body>\n</html>');
</script>

<svelte:head>
	<title>Open a New Case — ITopsy admin</title>
</svelte:head>

<main class="flex h-screen flex-col gap-4 p-4">
	<div>
		<h1 class="text-xl font-semibold">Open a New Case</h1>
		<p class="text-surface-600-400 text-sm">
			State your findings. Cite no sources. Feel free to editorialize.
		</p>
	</div>

	<form method="POST" use:enhance class="flex flex-1 flex-col gap-4 overflow-hidden">
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<label class="label text-sm">
				<span class="label-text">Title</span>
				<input name="title" required class="input" />
			</label>
			<label class="label text-sm">
				<span class="label-text">Subject</span>
				<input name="subject" required class="input" />
			</label>
			<label class="label text-sm">
				<span class="label-text">Severity of Offense</span>
				<select name="severity" class="select">
					<option value="mild">Mild</option>
					<option value="medium" selected>Medium</option>
					<option value="savage">Savage</option>
				</select>
			</label>
			<label class="label text-sm">
				<span class="label-text">Status</span>
				<select name="status" class="select">
					<option value="draft" selected>Sealed (draft)</option>
					<option value="published">Published</option>
				</select>
			</label>
			<label class="label text-sm">
				<span class="label-text">Language</span>
				<select name="language" class="select">
					<option value="en" selected>English</option>
					<option value="de">Deutsch</option>
				</select>
			</label>
			<label class="label col-span-2 text-sm md:col-span-2">
				<span class="label-text">Tags (comma-separated)</span>
				<input name="tags" class="input" />
			</label>
			<label class="label col-span-2 text-sm md:col-span-2">
				<span class="label-text">Dek</span>
				<input name="dek" required class="input" />
			</label>
		</div>

		{#if form?.error}
			<p class="text-error-500 text-sm" role="alert">{form.error}</p>
		{/if}

		<input type="hidden" name="htmlContent" value={htmlContent} />

		<div class="grid flex-1 grid-cols-1 gap-4 overflow-auto md:grid-cols-2 md:overflow-hidden">
			<div class="border-surface-200-800 overflow-hidden rounded-lg border">
				<HtmlEditor bind:value={htmlContent} />
			</div>
			<div class="border-surface-200-800 overflow-hidden rounded-lg border">
				<SandboxedStudy html={htmlContent} />
			</div>
		</div>

		<div>
			<button type="submit" class="btn preset-filled-primary-500">File the Case</button>
		</div>
	</form>
</main>
