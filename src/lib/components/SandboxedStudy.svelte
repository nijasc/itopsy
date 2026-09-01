<script lang="ts">
	// The one place in the codebase allowed to render a study's raw HTML.
	// sandbox="allow-scripts" WITHOUT "allow-same-origin" is required: it lets
	// a study run its own JS while permanently blocking that script from
	// reading cookies or reaching the parent frame/app origin. Never add
	// allow-same-origin here — combined with allow-scripts it would let a
	// study's script escape the sandbox.
	let { html }: { html: string } = $props();

	let loaded = $state(false);
</script>

<div class="bg-surface-950 relative h-full w-full">
	{#if !loaded}
		<div class="bg-surface-100-900 absolute inset-0 flex items-center justify-center">
			<div class="flex flex-col items-center gap-3">
				<div
					class="border-surface-300-700 border-t-primary-500 size-8 animate-spin rounded-full border-4"
				></div>
				<p class="text-surface-600-400 text-xs">Retrieving sealed exhibit…</p>
			</div>
		</div>
	{/if}
	<iframe
		title="Case study"
		sandbox="allow-scripts"
		srcdoc={html}
		onload={() => (loaded = true)}
		class="h-full w-full border-0 {loaded
			? 'opacity-100'
			: 'opacity-0'} transition-opacity duration-300"
	></iframe>
</div>
