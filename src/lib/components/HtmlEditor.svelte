<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { html } from '@codemirror/lang-html';
	import { oneDark } from '@codemirror/theme-one-dark';

	let {
		value = $bindable(''),
		onchange
	}: {
		value?: string;
		onchange?: (value: string) => void;
	} = $props();

	let container: HTMLDivElement;
	let view: EditorView | undefined;

	onMount(() => {
		view = new EditorView({
			parent: container,
			state: EditorState.create({
				doc: value,
				extensions: [
					basicSetup,
					html(),
					oneDark,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							value = update.state.doc.toString();
							onchange?.(value);
						}
					})
				]
			})
		});
	});

	onDestroy(() => view?.destroy());
</script>

<div bind:this={container} class="h-full min-h-[400px] overflow-auto text-sm"></div>
