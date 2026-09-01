<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let {
		liked,
		likeCount,
		canLike
	}: {
		liked: boolean;
		likeCount: number;
		canLike: boolean;
	} = $props();

	// Captured once per mount; the study page wraps this in {#key study.id} so
	// navigating between studies remounts it instead of reusing stale state.
	let optimisticLiked = $state(liked);
	let optimisticCount = $state(likeCount);
	let pending = $state(false);
</script>

{#if canLike}
	<form
		method="POST"
		action="?/like"
		use:enhance={() => {
			pending = true;
			optimisticLiked = !optimisticLiked;
			optimisticCount += optimisticLiked ? 1 : -1;
			return async ({ update }) => {
				pending = false;
				await update({ invalidateAll: false });
			};
		}}
	>
		<button
			type="submit"
			disabled={pending}
			aria-pressed={optimisticLiked}
			title="Add your name to this record"
			class="chip disabled:opacity-50 {optimisticLiked
				? 'preset-filled-primary-500'
				: 'preset-outlined-surface-400-600 hover:preset-tonal'}"
		>
			<span>{optimisticLiked ? '✒️' : '🖋️'}</span>
			<span>{optimisticCount} co-signed</span>
		</button>
	</form>
{:else}
	<a href={resolve('/login')} class="chip preset-outlined-surface-400-600 hover:preset-tonal">
		<span>🖋️</span>
		<span>{likeCount} co-signed</span>
	</a>
{/if}
