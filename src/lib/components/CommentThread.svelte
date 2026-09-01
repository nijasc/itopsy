<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import CommentForm from './CommentForm.svelte';
	import { COMMENT_EDIT_WINDOW_MS } from '$lib/schemas/comment';
	import type { CommentWithReplies, CommentRow } from '$lib/server/queries/comments';

	let {
		comments,
		currentUser,
		canComment
	}: {
		comments: CommentWithReplies[];
		currentUser: { id: string; role: 'owner' | 'admin' | 'user' } | null;
		canComment: boolean;
	} = $props();

	let replyingTo = $state<number | null>(null);
	let editingId = $state<number | null>(null);

	function canModerate() {
		if (!currentUser) return false;
		return currentUser.role === 'admin' || currentUser.role === 'owner';
	}

	function canEdit(comment: CommentRow) {
		if (!currentUser || currentUser.id !== comment.authorId) return false;
		return Date.now() - comment.createdAt.getTime() < COMMENT_EDIT_WINDOW_MS;
	}

	function displayName(email: string) {
		return email.split('@')[0];
	}
</script>

{#snippet commentItem(comment: CommentRow, isReply: boolean)}
	<div class="flex flex-col gap-1 {isReply ? 'ml-8 border-l border-neutral-200 pl-4' : ''}">
		{#if comment.isDeleted}
			<p class="text-sm text-neutral-400 italic">[deleted]</p>
		{:else if editingId === comment.id}
			<form
				method="POST"
				action="?/editComment"
				use:enhance={() => {
					return async ({ update }) => {
						editingId = null;
						await update();
					};
				}}
				class="flex flex-col gap-2"
			>
				<input type="hidden" name="commentId" value={comment.id} />
				<textarea
					name="body"
					required
					rows="2"
					class="rounded border border-neutral-300 px-3 py-2 text-sm">{comment.body}</textarea
				>
				<div class="flex gap-2">
					<button type="submit" class="rounded bg-neutral-900 px-3 py-1 text-xs text-white"
						>Save</button
					>
					<button type="button" onclick={() => (editingId = null)} class="text-xs text-neutral-500">
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<div class="flex items-baseline gap-2 text-xs text-neutral-500">
				<span class="font-medium text-neutral-700">{displayName(comment.authorEmail)}</span>
				<span>{comment.createdAt.toLocaleDateString()}</span>
				{#if comment.editedAt}<span>(edited)</span>{/if}
			</div>
			<p class="text-sm whitespace-pre-wrap">{comment.body}</p>
			<div class="flex gap-3 text-xs text-neutral-500">
				{#if !isReply && canComment}
					<button onclick={() => (replyingTo = replyingTo === comment.id ? null : comment.id)}>
						Reply
					</button>
				{/if}
				{#if canEdit(comment)}
					<button onclick={() => (editingId = comment.id)}>Edit</button>
				{/if}
				{#if currentUser && (currentUser.id === comment.authorId || canModerate())}
					<form method="POST" action="?/deleteComment" use:enhance>
						<input type="hidden" name="commentId" value={comment.id} />
						<button type="submit">Delete</button>
					</form>
				{/if}
			</div>
			{#if replyingTo === comment.id}
				<div class="mt-2 ml-8">
					<CommentForm parentId={comment.id} onSubmitted={() => (replyingTo = null)} />
				</div>
			{/if}
		{/if}
	</div>
{/snippet}

<div class="flex flex-col gap-6">
	{#if canComment}
		<CommentForm />
	{:else}
		<p class="text-sm text-neutral-500">
			<a href={resolve('/login')} class="underline">Log in</a> to join the discussion.
		</p>
	{/if}

	{#if comments.length === 0}
		<p class="text-sm text-neutral-500">No comments yet.</p>
	{:else}
		<div class="flex flex-col gap-6">
			{#each comments as comment (comment.id)}
				<div class="flex flex-col gap-3">
					{@render commentItem(comment, false)}
					{#each comment.replies as reply (reply.id)}
						{@render commentItem(reply, true)}
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
