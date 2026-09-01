<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		action = '?/comment',
		parentId,
		onSubmitted
	}: {
		action?: string;
		parentId?: number;
		onSubmitted?: () => void;
	} = $props();

	let submitting = $state(false);
</script>

<form
	method="POST"
	{action}
	class="flex flex-col gap-2"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			submitting = false;
			await update();
			if (result.type === 'success') onSubmitted?.();
		};
	}}
>
	{#if parentId}
		<input type="hidden" name="parentId" value={parentId} />
	{/if}
	<textarea
		name="body"
		required
		rows={parentId ? 2 : 3}
		placeholder={parentId ? 'Write a reply…' : 'Add a comment…'}
		class="rounded border border-neutral-300 px-3 py-2 text-sm"></textarea>
	<div>
		<button
			type="submit"
			disabled={submitting}
			class="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
		>
			{parentId ? 'Reply' : 'Comment'}
		</button>
	</div>
</form>
