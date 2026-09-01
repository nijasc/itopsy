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
			class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-50"
			class:border-neutral-900={optimisticLiked}
			class:bg-neutral-900={optimisticLiked}
			class:text-white={optimisticLiked}
			class:border-neutral-300={!optimisticLiked}
		>
			<span>{optimisticLiked ? '♥' : '♡'}</span>
			<span>{optimisticCount}</span>
		</button>
	</form>
{:else}
	<a
		href={resolve('/login')}
		class="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm"
	>
		<span>♡</span>
		<span>{likeCount}</span>
	</a>
{/if}
