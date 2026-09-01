<script lang="ts">
	// Local stand-in for @lucide/svelte's per-icon deep imports, which fail to
	// SSR under this project's toolchain (Vite SSR resolves the un-compiled
	// .svelte source instead of the compiled .js for `@lucide/svelte/icons/*`).
	// Renders the same path data lucide-svelte ships, with no external dependency.
	type Node = [tag: string, attrs: Record<string, string>];

	let { nodes, class: className = '' }: { nodes: Node[]; class?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	{#each nodes as [tag, attrs] (tag + JSON.stringify(attrs))}
		<svelte:element this={tag} {...attrs} />
	{/each}
</svg>
