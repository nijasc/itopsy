<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav
	class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800"
>
	<a href={resolve('/')} class="font-semibold">Brandopsy</a>
	<div class="flex items-center gap-4">
		{#if data.user}
			{#if data.user.role === 'admin' || data.user.role === 'owner'}
				<a href={resolve('/admin/studies')} class="hover:underline">Admin</a>
			{/if}
			{#if data.user.role === 'owner'}
				<a href={resolve('/admin/users')} class="hover:underline">Users</a>
			{/if}
			<form method="POST" action={resolve('/logout')}>
				<button type="submit" class="hover:underline">Log out</button>
			</form>
		{:else}
			<a href={resolve('/login')} class="hover:underline">Log in</a>
			<a href={resolve('/signup')} class="hover:underline">Sign up</a>
		{/if}
	</div>
</nav>

{@render children()}
