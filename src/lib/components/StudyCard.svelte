<script lang="ts">
	import { resolve } from '$app/paths';
	import StudyThumbnail from './StudyThumbnail.svelte';

	let {
		study
	}: {
		study: {
			slug: string;
			title: string;
			subject: string;
			dek: string;
			htmlContent: string;
			tags: string[];
			severity: string;
			likeCount: number;
			commentCount: number;
		};
	} = $props();

	const severityLabel: Record<string, string> = {
		mild: 'Mild',
		medium: 'Medium',
		savage: 'Savage'
	};
</script>

<a
	href={resolve('/study/[slug]', { slug: study.slug })}
	class="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-md"
>
	<div class="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
		<StudyThumbnail html={study.htmlContent} />
	</div>
	<div class="flex flex-1 flex-col gap-2 p-4">
		<div class="flex items-center justify-between gap-2 text-xs text-neutral-500">
			<span>{study.subject}</span>
			<span class="rounded-full bg-neutral-100 px-2 py-0.5">{severityLabel[study.severity]}</span>
		</div>
		<h2 class="text-lg font-semibold group-hover:underline">{study.title}</h2>
		<p class="line-clamp-2 flex-1 text-sm text-neutral-600">{study.dek}</p>
		<div class="flex flex-wrap gap-1 text-xs text-neutral-500">
			{#each study.tags as tag (tag)}
				<span class="rounded bg-neutral-100 px-1.5 py-0.5">{tag}</span>
			{/each}
		</div>
		<div class="flex gap-3 text-xs text-neutral-500">
			<span>{study.likeCount} likes</span>
			<span>{study.commentCount} comments</span>
		</div>
	</div>
</a>
