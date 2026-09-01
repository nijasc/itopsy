<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Manage users — Brandopsy admin</title>
</svelte:head>

<main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
	<h1 class="text-2xl font-semibold">Users</h1>

	{#if form?.error}
		<p class="text-sm text-red-600" role="alert">{form.error}</p>
	{/if}

	<div class="overflow-x-auto">
		<table class="w-full min-w-[480px] text-left text-sm">
			<thead class="border-b border-neutral-200 text-neutral-500">
				<tr>
					<th class="py-2 pr-4">Email</th>
					<th class="py-2 pr-4">Role</th>
					<th class="py-2 pr-4">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as u (u.id)}
					<tr class="border-b border-neutral-100">
						<td class="py-2 pr-4">{u.email}</td>
						<td class="py-2 pr-4 capitalize">{u.role}</td>
						<td class="py-2 pr-4">
							{#if u.role === 'owner'}
								<span class="text-neutral-400">&mdash;</span>
							{:else if u.role === 'admin'}
								<form method="POST" action="?/setRole" use:enhance>
									<input type="hidden" name="id" value={u.id} />
									<input type="hidden" name="role" value="user" />
									<button type="submit" class="text-neutral-600 hover:underline"
										>Demote to user</button
									>
								</form>
							{:else}
								<form method="POST" action="?/setRole" use:enhance>
									<input type="hidden" name="id" value={u.id} />
									<input type="hidden" name="role" value="admin" />
									<button type="submit" class="text-neutral-600 hover:underline"
										>Promote to admin</button
									>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
