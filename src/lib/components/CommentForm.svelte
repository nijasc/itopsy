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
		placeholder={parentId ? 'File your rebuttal…' : 'Enter your testimony for the record…'}
		class="textarea"></textarea>
	<div>
		<button type="submit" disabled={submitting} class="btn preset-filled-primary-500">
			{parentId ? 'Submit Rebuttal' : 'Submit Testimony'}
		</button>
	</div>
</form>
