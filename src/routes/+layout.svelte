<script lang="ts">
	import '../app.css';
	import icon from '$lib/assets/itopsy-icon.png';
	import { resolve } from '$app/paths';
	import { AppBar, Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={icon} />
</svelte:head>

<AppBar
	class="border-surface-200-800 bg-surface-50-950/90 sticky top-0 z-40 border-b shadow-sm backdrop-blur"
>
	<AppBar.Toolbar class="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center px-4 py-2.5">
		<AppBar.Lead>
			<a href={resolve('/')} class="flex items-center gap-2.5">
				<img src={icon} alt="ITopsy" class="size-8" />
				<span class="text-xl leading-none font-bold tracking-tight">ITopsy</span>
			</a>
		</AppBar.Lead>
		<AppBar.Headline></AppBar.Headline>
		<AppBar.Trail class="flex items-center justify-end gap-3">
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
