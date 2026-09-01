<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Manage studies — Brandopsy admin</title>
</svelte:head>

<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Studies</h1>
		<a
			href={resolve('/admin/studies/new')}
			class="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
		>
			New study
		</a>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full min-w-[720px] text-left text-sm">
			<thead class="border-b border-neutral-200 text-neutral-500">
				<tr>
					<th class="py-2 pr-4">Title</th>
					<th class="py-2 pr-4">Status</th>
					<th class="py-2 pr-4">Severity</th>
					<th class="py-2 pr-4">Likes</th>
					<th class="py-2 pr-4">Comments</th>
					<th class="py-2 pr-4">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.studies as study (study.id)}
					<tr class="border-b border-neutral-100">
						<td class="py-2 pr-4">
							<a href={resolve('/study/[slug]', { slug: study.slug })} class="hover:underline">
								{study.title}
							</a>
						</td>
						<td class="py-2 pr-4 capitalize">{study.status}</td>
						<td class="py-2 pr-4 capitalize">{study.severity}</td>
						<td class="py-2 pr-4">{study.likeCount}</td>
						<td class="py-2 pr-4">{study.commentCount}</td>
						<td class="py-2 pr-4">
							<div class="flex gap-2">
								<a
									href={resolve('/admin/studies/[id]/edit', { id: String(study.id) })}
									class="text-neutral-600 hover:underline"
								>
									Edit
								</a>
								<form method="POST" action="?/setStatus" use:enhance>
									<input type="hidden" name="id" value={study.id} />
									<input
										type="hidden"
										name="status"
										value={study.status === 'published' ? 'draft' : 'published'}
									/>
									<button type="submit" class="text-neutral-600 hover:underline">
										{study.status === 'published' ? 'Unpublish' : 'Publish'}
									</button>
								</form>
								<form
									method="POST"
									action="?/delete"
									use:enhance={({ cancel }) => {
										if (!confirm(`Delete "${study.title}"? This cannot be undone.`)) cancel();
									}}
								>
									<input type="hidden" name="id" value={study.id} />
									<button type="submit" class="text-red-600 hover:underline">Delete</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
