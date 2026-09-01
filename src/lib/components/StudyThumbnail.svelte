<script lang="ts">
	// Gallery-only preview: scripts are fully disabled (sandbox="", no
	// "allow-scripts") and the iframe is scaled down + non-interactive.
	// This is deliberately NOT the same component used on the study
	// detail page — see SandboxedStudy.svelte for the interactive render.
	let { html }: { html: string } = $props();
</script>

<div class="pointer-events-none absolute inset-0 overflow-hidden">
	<iframe
		title="Study preview"
		sandbox=""
		srcdoc={html}
		tabindex="-1"
		class="h-[250%] w-[250%] origin-top-left scale-[0.4]"
	></iframe>
</div>
