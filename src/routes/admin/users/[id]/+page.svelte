<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { toaster } from '$lib/toaster';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const roleTitle: Record<string, string> = {
		owner: 'Editor-in-Chief',
		admin: 'Staff Investigator',
		user: 'Registered Whistleblower'
	};
</script>

<svelte:head>
	<title>Dossier: {data.account.email} — ITopsy admin</title>
</svelte:head>

<main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
	<a href={resolve('/admin/users')} class="anchor w-fit text-xs">&larr; Back to Personnel Files</a>

	<header class="card bg-surface-100-900 flex items-center justify-between gap-4 p-6">
		<div class="flex items-center gap-4">
			<div
				class="bg-primary-500 text-primary-contrast-500 flex size-14 items-center justify-center rounded-full text-lg font-bold"
			>
				{data.account.email.slice(0, 2).toUpperCase()}
			</div>
			<div>
				<h1 class="text-xl font-semibold">{data.account.email}</h1>
				<p class="text-surface-600-400 text-sm">
					{roleTitle[data.account.role]} &middot; on file since {data.account.createdAt.toLocaleDateString()}
				</p>
			</div>
		</div>

		{#if data.isOwnerViewer && data.account.role !== 'owner'}
			<div class="flex gap-2">
				<form
					method="POST"
					action="?/setRole"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							toaster.success({ title: 'Clearance updated' });
						};
					}}
				>
					<input
						type="hidden"
						name="role"
						value={data.account.role === 'admin' ? 'user' : 'admin'}
					/>
					<button type="submit" class="btn btn-sm preset-tonal">
						{data.account.role === 'admin' ? 'Revoke clearance' : 'Grant clearance'}
					</button>
				</form>
				<form
					method="POST"
					action="?/deleteAccount"
					use:enhance={({ cancel }) => {
						if (
							!confirm(
								`Permanently delete ${data.account.email}? This also deletes every case file and comment they authored.`
							)
						) {
							cancel();
						}
						return async ({ update }) => {
							await update();
							toaster.error({ title: 'Account deleted' });
						};
					}}
				>
					<button type="submit" class="btn btn-sm preset-filled-error-500">Delete account</button>
				</form>
			</div>
		{/if}
	</header>

	{#if form?.error}
		<p class="text-error-500 text-sm" role="alert">{form.error}</p>
	{/if}

	<section>
		<h2 class="mb-3 text-lg font-semibold">
			Case Files Authored ({data.authoredStudies.length})
		</h2>
		{#if data.authoredStudies.length === 0}
			<p class="text-surface-600-400 text-sm">No case files on record for this account.</p>
		{:else}
			<div class="card bg-surface-100-900 table-wrap p-4">
				<table class="table caption-bottom">
					<thead>
						<tr>
							<th>Case</th>
							<th>Status</th>
							<th>Severity</th>
							<th>Co-signers</th>
						</tr>
					</thead>
					<tbody class="[&>tr]:hover:preset-tonal">
						{#each data.authoredStudies as study (study.id)}
							<tr>
								<td>
									<a
										href={resolve('/admin/studies/[id]/edit', { id: String(study.id) })}
										class="anchor"
									>
										{study.title}
									</a>
								</td>
								<td>
									<span
										class="badge {study.status === 'published'
											? 'preset-tonal-success'
											: 'preset-tonal-warning'}"
									>
										{study.status === 'published' ? 'Published' : 'Sealed'}
									</span>
								</td>
								<td class="capitalize">{study.severity}</td>
								<td>{study.likeCount}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section>
		<h2 class="mb-3 text-lg font-semibold">Testimony Given ({data.comments.length})</h2>
		{#if data.comments.length === 0}
			<p class="text-surface-600-400 text-sm">No comments on record for this account.</p>
		{:else}
			<ul class="flex flex-col gap-2">
				{#each data.comments as comment (comment.id)}
					<li class="card bg-surface-100-900 p-4">
						<a
							href={resolve('/study/[slug]', { slug: comment.studySlug })}
							class="anchor text-sm font-medium"
						>
							{comment.studyTitle}
						</a>
						<p class="mt-1 text-sm {comment.isDeleted ? 'text-surface-500 italic' : ''}">
							{comment.isDeleted ? '[retracted under advice of counsel]' : comment.body}
						</p>
						<p class="text-surface-600-400 mt-1 text-xs">
							{comment.createdAt.toLocaleDateString()}
						</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
