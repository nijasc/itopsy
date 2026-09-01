<script lang="ts">
	import { enhance } from '$app/forms';
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
	<title>Personnel Files — ITopsy admin</title>
</svelte:head>

<main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
	<div>
		<h1 class="text-2xl font-semibold">Personnel Files</h1>
		<p class="text-surface-600-400 text-sm">
			Grant or revoke investigative clearance. Choose wisely; there is no HR department.
		</p>
	</div>

	{#if form?.error}
		<p class="text-error-500 text-sm" role="alert">{form.error}</p>
	{/if}

	<div class="card bg-surface-100-900 table-wrap p-4">
		<table class="table caption-bottom">
			<thead>
				<tr>
					<th>Email</th>
					<th>Clearance</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-tonal">
				{#each data.users as u (u.id)}
					<tr>
						<td>{u.email}</td>
						<td>{roleTitle[u.role]}</td>
						<td>
							{#if u.role === 'owner'}
								<span class="text-surface-500">&mdash;</span>
							{:else if u.role === 'admin'}
								<form
									method="POST"
									action="?/setRole"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											toaster.warning({
												title: 'Clearance revoked',
												description: `${u.email} has been demoted to Registered Whistleblower.`
											});
										};
									}}
								>
									<input type="hidden" name="id" value={u.id} />
									<input type="hidden" name="role" value="user" />
									<button type="submit" class="text-surface-600-400 hover:underline">
										Revoke clearance
									</button>
								</form>
							{:else}
								<form
									method="POST"
									action="?/setRole"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											toaster.success({
												title: 'Clearance granted',
												description: `${u.email} is now a Staff Investigator.`
											});
										};
									}}
								>
									<input type="hidden" name="id" value={u.id} />
									<input type="hidden" name="role" value="admin" />
									<button type="submit" class="text-surface-600-400 hover:underline">
										Grant clearance
									</button>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
