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
	<title>Re-examine {data.study.title} — ITopsy admin</title>
</svelte:head>

<main class="flex h-screen flex-col gap-4 p-4">
	<div>
		<h1 class="text-xl font-semibold">Re-examine the Case</h1>
		<p class="text-surface-600-400 text-sm">New evidence may be submitted at any time.</p>
	</div>

	<form method="POST" use:enhance class="flex flex-1 flex-col gap-4 overflow-hidden">
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<label class="label text-sm">
				<span class="label-text">Title</span>
				<input name="title" required value={data.study.title} class="input" />
			</label>
			<label class="label text-sm">
				<span class="label-text">Subject</span>
				<input name="subject" required value={data.study.subject} class="input" />
			</label>
			<label class="label text-sm">
				<span class="label-text">Severity of Offense</span>
				<select name="severity" class="select">
					{#each ['mild', 'medium', 'savage'] as s (s)}
						<option value={s} selected={data.study.severity === s}>{s}</option>
					{/each}
				</select>
			</label>
			<label class="label text-sm">
				<span class="label-text">Status</span>
				<select name="status" class="select">
					<option value="draft" selected={data.study.status === 'draft'}>Sealed (draft)</option>
					<option value="published" selected={data.study.status === 'published'}>Published</option>
				</select>
			</label>
			<label class="label text-sm">
				<span class="label-text">Language</span>
				<select name="language" class="select">
					<option value="en" selected={data.study.language === 'en'}>English</option>
					<option value="de" selected={data.study.language === 'de'}>Deutsch</option>
				</select>
			</label>
			<label class="label col-span-2 text-sm md:col-span-2">
				<span class="label-text">Tags (comma-separated)</span>
				<input name="tags" value={data.study.tags.join(', ')} class="input" />
			</label>
			<label class="label col-span-2 text-sm md:col-span-2">
				<span class="label-text">Dek</span>
				<input name="dek" required value={data.study.dek} class="input" />
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
			<button type="submit" class="btn preset-filled-primary-500">Amend the Record</button>
		</div>
	</form>
</main>
