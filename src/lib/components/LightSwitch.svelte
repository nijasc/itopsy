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

<Switch {checked} {onCheckedChange} aria-label="Toggle dark mode">
	<Switch.Control>
		<Switch.Thumb>
			{#if checked}
				<Icon nodes={moonIcon} class="size-3" />
			{:else}
				<Icon nodes={sunIcon} class="size-3" />
			{/if}
		</Switch.Thumb>
	</Switch.Control>
	<Switch.HiddenInput />
</Switch>
