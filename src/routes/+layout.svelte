<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { AppBar, Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppBar class="border-surface-200-800 border-b">
	<AppBar.Toolbar class="mx-auto max-w-6xl grid-cols-[auto_1fr_auto] px-4">
		<AppBar.Lead>
			<a href={resolve('/')} class="text-xl font-bold tracking-tight">🗞️ Brandopsy</a>
		</AppBar.Lead>
		<AppBar.Headline></AppBar.Headline>
		<AppBar.Trail class="items-center gap-3">
			<LightSwitch />
			{#if data.user}
				<UserMenu user={data.user} />
			{:else}
				<a href={resolve('/login')} class="btn btn-sm preset-tonal">Log in</a>
				<a href={resolve('/signup')} class="btn btn-sm preset-filled-primary-500">Sign up</a>
			{/if}
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>

{@render children()}

<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast}>
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				{#if toast.description}
					<Toast.Description>{toast.description}</Toast.Description>
				{/if}
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>
