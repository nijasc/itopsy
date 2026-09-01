<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { toaster } from '$lib/toaster';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const isOwner = $derived(data.user?.role === 'owner');

	function canEdit(authorId: string) {
		return isOwner || data.user?.id === authorId;
	}
</script>

<svelte:head>
	<title>The Editorial Desk — ITopsy</title>
</svelte:head>

<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">The Editorial Desk</h1>
			<p class="text-surface-600-400 text-sm">Every case file, open or sealed, in one ledger.</p>
		</div>
		<a href={resolve('/admin/studies/new')} class="btn preset-filled-primary-500">
			Open a New Case
		</a>
	</div>

	<div class="card bg-surface-100-900 table-wrap p-4">
		<table class="table caption-bottom">
			<thead>
				<tr>
					<th>Case</th>
					<th>Author</th>
					<th>Status</th>
					<th>Language</th>
					<th>Severity</th>
					<th>Co-signers</th>
					<th>Depositions</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-tonal">
				{#each data.studies as study (study.id)}
					<tr>
						<td>
							<a href={resolve('/study/[slug]', { slug: study.slug })} class="anchor">
								{study.title}
							</a>
						</td>
						<td class="text-surface-600-400 text-xs">{study.authorEmail}</td>
						<td>
							<span
								class="badge {study.status === 'published'
									? 'preset-tonal-success'
									: 'preset-tonal-warning'}"
							>
								{study.status === 'published' ? 'Published' : 'Sealed'}
							</span>
						</td>
						<td>{study.language === 'de' ? 'Deutsch' : 'English'}</td>
						<td class="capitalize">{study.severity}</td>
						<td>{study.likeCount}</td>
						<td>{study.commentCount}</td>
						<td>
							<div class="flex gap-3 text-sm">
								{#if canEdit(study.authorId)}
									<a
										href={resolve('/admin/studies/[id]/edit', { id: String(study.id) })}
										class="anchor"
									>
										Edit
									</a>
									<form
										method="POST"
										action="?/setStatus"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												toaster.success({
													title: study.status === 'published' ? 'Case sealed' : 'Case published',
													description: `"${study.title}" is now ${study.status === 'published' ? 'sealed' : 'public'}.`
												});
											};
										}}
									>
										<input type="hidden" name="id" value={study.id} />
										<input
											type="hidden"
											name="status"
											value={study.status === 'published' ? 'draft' : 'published'}
										/>
										<button type="submit" class="text-surface-600-400 hover:underline">
											{study.status === 'published' ? 'Seal' : 'Publish'}
										</button>
									</form>
								{:else}
									<span class="text-surface-500 text-xs italic">Not yours</span>
								{/if}
								{#if isOwner}
									<form
										method="POST"
										action="?/delete"
										use:enhance={({ cancel }) => {
											if (!confirm(`Permanently destroy the case file "${study.title}"?`)) cancel();
											return async ({ update }) => {
												await update();
												toaster.error({
													title: 'Case destroyed',
													description: `"${study.title}" has been shredded.`
												});
											};
										}}
									>
										<input type="hidden" name="id" value={study.id} />
										<button type="submit" class="text-error-500 hover:underline">Destroy</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.totalPages > 1}
		<div class="flex items-center justify-center gap-3 text-sm">
			<!-- Same-page pagination; a dynamic query string can't match resolve()'s literal route union. -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<a
				href={`${resolve('/admin/studies')}?page=${Math.max(1, data.page - 1)}`}
				class="btn btn-sm preset-tonal {data.page <= 1 ? 'pointer-events-none opacity-40' : ''}"
			>
				&larr; Previous
			</a>
			<span class="text-surface-600-400">Page {data.page} of {data.totalPages}</span>
			<a
				href={`${resolve('/admin/studies')}?page=${Math.min(data.totalPages, data.page + 1)}`}
				class="btn btn-sm preset-tonal {data.page >= data.totalPages
					? 'pointer-events-none opacity-40'
					: ''}"
			>
				Next &rarr;
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	{/if}
</main>
