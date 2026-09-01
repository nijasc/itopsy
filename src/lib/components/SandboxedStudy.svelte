<script lang="ts">
	// The one place in the codebase allowed to render a study's raw HTML.
	// sandbox="allow-scripts" WITHOUT "allow-same-origin" is required: it lets
	// a study run its own JS while permanently blocking that script from
	// reading cookies or reaching the parent frame/app origin. Never add
	// allow-same-origin here — combined with allow-scripts it would let a
	// study's script escape the sandbox.
	let { html }: { html: string } = $props();
</script>

<iframe title="Case study" sandbox="allow-scripts" srcdoc={html} class="h-full w-full border-0"
></iframe>
