<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const actionLabel: Record<string, string> = {
		'study.create': 'Opened case',
		'study.edit': 'Amended case',
		'study.publish': 'Published case',
		'study.unpublish': 'Sealed case',
		'study.delete': 'Destroyed case',
		'user.promote': 'Granted clearance',
		'user.demote': 'Revoked clearance',
		'user.delete': 'Deleted account'
	};
	const actionPreset: Record<string, string> = {
		'study.create': 'preset-tonal-success',
		'study.edit': 'preset-tonal',
		'study.publish': 'preset-tonal-success',
		'study.unpublish': 'preset-tonal-warning',
		'study.delete': 'preset-tonal-error',
		'user.promote': 'preset-tonal-success',
		'user.demote': 'preset-tonal-warning',
		'user.delete': 'preset-tonal-error'
	};
</script>

<svelte:head>
	<title>Owner Audit Log — ITopsy admin</title>
</svelte:head>

<main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
	<div>
		<h1 class="text-2xl font-semibold">Owner Audit Log</h1>
		<p class="text-surface-600-400 text-sm">
			The complete, unredacted record. Every deletion, promotion, and demotion, in order.
		</p>
	</div>

	{#if data.log.length === 0}
		<p class="text-surface-600-400 text-sm">No activity on record yet.</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.log as entry (entry.id)}
				<li class="card bg-surface-100-900 flex items-start justify-between gap-4 p-4">
					<div>
						<div class="mb-1 flex items-center gap-2">
							<span class="badge {actionPreset[entry.action] ?? 'preset-tonal'}">
								{actionLabel[entry.action] ?? entry.action}
							</span>
							<span class="text-surface-600-400 text-xs">
								{entry.actorEmail} ({entry.actorRole})
							</span>
						</div>
						<p class="text-sm">{entry.summary}</p>
					</div>
					<span class="text-surface-600-400 shrink-0 text-xs">
						{entry.createdAt.toLocaleString()}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</main>
