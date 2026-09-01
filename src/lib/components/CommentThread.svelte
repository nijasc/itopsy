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
	<div class="flex flex-col gap-1 {isReply ? 'border-surface-200-800 ml-8 border-l pl-4' : ''}">
		{#if comment.isDeleted}
			<p class="text-surface-500 text-sm italic">[retracted under advice of counsel]</p>
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
				<textarea name="body" required rows="2" class="textarea">{comment.body}</textarea>
				<div class="flex gap-2">
					<button type="submit" class="btn btn-sm preset-filled-primary-500">Amend Testimony</button
					>
					<button type="button" onclick={() => (editingId = null)} class="btn btn-sm preset-tonal">
						Withdraw
					</button>
				</div>
			</form>
		{:else}
			<div class="text-surface-600-400 flex items-baseline gap-2 text-xs">
				<span class="text-surface-800-200 font-medium">{displayName(comment.authorEmail)}</span>
				<span>{comment.createdAt.toLocaleDateString()}</span>
				{#if comment.editedAt}<span>(amended)</span>{/if}
			</div>
			<p class="text-sm whitespace-pre-wrap">{comment.body}</p>
			<div class="text-surface-600-400 flex gap-3 text-xs">
				{#if !isReply && canComment}
					<button onclick={() => (replyingTo = replyingTo === comment.id ? null : comment.id)}>
						Rebut
					</button>
				{/if}
				{#if canEdit(comment)}
					<button onclick={() => (editingId = comment.id)}>Amend</button>
				{/if}
				{#if currentUser && (currentUser.id === comment.authorId || canModerate())}
					<form method="POST" action="?/deleteComment" use:enhance>
						<input type="hidden" name="commentId" value={comment.id} />
						<button type="submit">Retract</button>
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
		<p class="text-surface-600-400 text-sm">
			<a href={resolve('/login')} class="anchor">Log in</a> to submit sworn testimony.
		</p>
	{/if}

	{#if comments.length === 0}
		<p class="text-surface-600-400 text-sm">
			No testimony has been entered into the record. The court awaits.
		</p>
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
