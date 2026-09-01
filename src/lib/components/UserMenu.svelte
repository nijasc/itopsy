<script lang="ts">
	import { resolve } from '$app/paths';
	import { Avatar, Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import {
		Icon,
		userIcon,
		layoutDashboardIcon,
		usersIcon,
		logOutIcon,
		fileTextIcon
	} from '$lib/icons';

	let {
		user
	}: {
		user: { email: string; role: 'owner' | 'admin' | 'user' };
	} = $props();

	let open = $state(false);
	const initials = $derived(user.email.slice(0, 2).toUpperCase());

	const roleTitle: Record<string, string> = {
		owner: 'Editor-in-Chief',
		admin: 'Staff Investigator',
		user: 'Registered Whistleblower'
	};
</script>

<Popover {open} onOpenChange={(details) => (open = details.open)}>
	<Popover.Trigger class="btn-icon" aria-label="Open credentials menu">
		<Avatar class="size-9 shrink-0 overflow-hidden rounded-full">
			<Avatar.Fallback
				class="bg-primary-500 text-primary-contrast-500 flex size-full items-center justify-center text-sm font-semibold"
			>
				{initials}
			</Avatar.Fallback>
		</Avatar>
	</Popover.Trigger>
	<Portal>
		<Popover.Positioner>
			<Popover.Content class="card bg-surface-100-900 w-60 p-2 shadow-xl">
				<div class="border-surface-200-800 mb-2 border-b px-2 pb-2">
					<p class="truncate text-sm font-medium">{user.email}</p>
					<p class="text-surface-600-400 text-xs">{roleTitle[user.role]}</p>
				</div>
				<nav class="flex flex-col gap-1">
					<a
						href={resolve('/profile')}
						onclick={() => (open = false)}
						class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-sm"
					>
						<Icon nodes={userIcon} class="size-4" /> My Dossier
					</a>
					{#if user.role === 'admin' || user.role === 'owner'}
						<a
							href={resolve('/admin/studies')}
							onclick={() => (open = false)}
							class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-sm"
						>
							<Icon nodes={layoutDashboardIcon} class="size-4" /> Editorial Desk
						</a>
					{/if}
					{#if user.role === 'admin' || user.role === 'owner'}
						<a
							href={resolve('/admin/audit')}
							onclick={() => (open = false)}
							class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-sm"
						>
							<Icon nodes={fileTextIcon} class="size-4" /> Admin Audit Log
						</a>
					{/if}
					{#if user.role === 'owner'}
						<a
							href={resolve('/admin/users')}
							onclick={() => (open = false)}
							class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-sm"
						>
							<Icon nodes={usersIcon} class="size-4" /> Personnel Files
						</a>
						<a
							href={resolve('/admin/owner-audit')}
							onclick={() => (open = false)}
							class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-sm"
						>
							<Icon nodes={fileTextIcon} class="size-4" /> Owner Audit Log
						</a>
					{/if}
					<form method="POST" action={resolve('/logout')} class="contents">
						<button
							type="submit"
							class="hover:preset-tonal flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
						>
							<Icon nodes={logOutIcon} class="size-4" /> Resign in Protest
						</button>
					</form>
				</nav>
			</Popover.Content>
		</Popover.Positioner>
	</Portal>
</Popover>
