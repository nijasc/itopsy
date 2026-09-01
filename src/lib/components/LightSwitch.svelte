<script lang="ts">
	import { onMount } from 'svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Icon, sunIcon, moonIcon } from '$lib/icons';

	let checked = $state(false);

	onMount(() => {
		checked = document.documentElement.getAttribute('data-mode') === 'dark';
	});

	function onCheckedChange(event: { checked: boolean }) {
		const mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
		checked = event.checked;
	}
</script>

<!--
	Skeleton's Switch is fully headless (no built-in CSS at all), so the
	track/thumb sizing, colors, and slide transition are all defined here.
-->
<Switch {checked} {onCheckedChange} aria-label="Toggle dark mode" class="inline-flex items-center">
	<Switch.Control
		class="bg-surface-300-700 data-[state=checked]:bg-primary-500 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors"
	>
		<Switch.Thumb
			class="bg-surface-50-950 flex size-5 translate-x-0.5 items-center justify-center rounded-full text-black shadow transition-transform data-[state=checked]:translate-x-[1.375rem]"
		>
			{#if checked}
				<Icon nodes={moonIcon} class="size-3.5" />
			{:else}
				<Icon nodes={sunIcon} class="size-3.5" />
			{/if}
		</Switch.Thumb>
	</Switch.Control>
	<Switch.HiddenInput />
</Switch>
