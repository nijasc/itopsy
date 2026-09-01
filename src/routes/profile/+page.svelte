<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';
	import { Icon, thumbsUpIcon, messageSquareIcon } from '$lib/icons';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const severityLabel: Record<string, string> = {
		mild: 'Mild',
		medium: 'Medium',
		savage: 'Savage'
	};

	const roleTitle: Record<string, string> = {
		owner: 'Editor-in-Chief',
		admin: 'Staff Investigator',
		user: 'Registered Whistleblower'
	};

	$effect(() => {
		if (form?.success) {
			toaster.success({
				title: 'Credentials reissued',
				description: 'Your new password has been notarized. Try not to forget it this time.'
			});
		}
	});
</script>

<svelte:head>
	<title>Your Dossier — Brandopsy</title>
</svelte:head>

<main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
	<header class="card bg-surface-100-900 flex items-center gap-4 p-6">
		<div
			class="bg-primary-500 text-primary-contrast-500 flex size-16 items-center justify-center rounded-full text-xl font-bold"
		>
			{data.account?.email.slice(0, 2).toUpperCase()}
		</div>
		<div>
			<h1 class="text-xl font-semibold">{data.account?.email}</h1>
			<p class="text-surface-600-400 text-sm">
				{data.account && roleTitle[data.account.role]} &middot; on file since {data.account?.createdAt.toLocaleDateString()}
			</p>
		</div>
	</header>

	<Tabs defaultValue="liked">
		<Tabs.List>
			<Tabs.Trigger value="liked">
				<Icon nodes={thumbsUpIcon} class="size-4" /> Endorsements Filed ({data.likedStudies.length})
			</Tabs.Trigger>
			<Tabs.Trigger value="comments">
				<Icon nodes={messageSquareIcon} class="size-4" /> Testimony Given ({data.comments.length})
			</Tabs.Trigger>
			<Tabs.Trigger value="settings">Credentials</Tabs.Trigger>
			<Tabs.Indicator />
		</Tabs.List>

		<Tabs.Content value="liked">
			{#if data.likedStudies.length === 0}
				<p class="text-surface-600-400 py-8 text-center text-sm">
					No endorsements on record. Either you're impartial, or you haven't read anything.
				</p>
			{:else}
				<ul class="mt-4 flex flex-col gap-2">
					{#each data.likedStudies as study (study.slug)}
						<li class="card bg-surface-100-900 flex items-center justify-between gap-4 p-4">
							<div>
								<a href={resolve('/study/[slug]', { slug: study.slug })} class="anchor font-medium">
									{study.title}
								</a>
								<p class="text-surface-600-400 text-xs">
									{study.subject} &middot; {severityLabel[study.severity]}
								</p>
							</div>
							<span class="badge preset-tonal">{study.likeCount} co-signers</span>
						</li>
					{/each}
				</ul>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="comments">
			{#if data.comments.length === 0}
				<p class="text-surface-600-400 py-8 text-center text-sm">
					No testimony given. The tribunal is disappointed but not surprised.
				</p>
			{:else}
				<ul class="mt-4 flex flex-col gap-2">
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
		</Tabs.Content>

		<Tabs.Content value="settings">
			<p class="text-surface-600-400 mt-4 text-sm">
				Changing your password does not change who you are as a person.
			</p>
			<form
				method="POST"
				action="?/changePassword"
				use:enhance
				class="mt-4 flex max-w-sm flex-col gap-4"
			>
				<label class="label">
					<span class="label-text">Current password</span>
					<input type="password" name="currentPassword" required class="input" />
				</label>
				<label class="label">
					<span class="label-text">New password</span>
					<input type="password" name="newPassword" required minlength="8" class="input" />
				</label>
				{#if form?.error}
					<p class="text-error-500 text-sm" role="alert">{form.error}</p>
				{/if}
				<button type="submit" class="btn preset-filled-primary-500">Reissue Credentials</button>
			</form>
		</Tabs.Content>
	</Tabs>
</main>
