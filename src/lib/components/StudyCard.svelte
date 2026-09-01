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
			language: string;
			likeCount: number;
			commentCount: number;
		};
	} = $props();

	const severityPreset: Record<string, string> = {
		mild: 'preset-tonal-success',
		medium: 'preset-tonal-warning',
		savage: 'preset-tonal-error'
	};
	const severityLabel: Record<string, string> = {
		mild: 'Mild Offense',
		medium: 'Medium Offense',
		savage: 'Savage Offense'
	};
	const languageFlag: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };
</script>

<a
	href={resolve('/study/[slug]', { slug: study.slug })}
	class="card bg-surface-100-900 group flex flex-col overflow-hidden transition hover:shadow-lg"
>
	<div class="bg-surface-200-800 relative aspect-[16/10] w-full overflow-hidden">
		<StudyThumbnail html={study.htmlContent} />
	</div>
	<div class="flex flex-1 flex-col gap-2 p-4">
		<div class="text-surface-600-400 flex items-center justify-between gap-2 text-xs">
			<span>{languageFlag[study.language]} {study.subject}</span>
			<span class="badge {severityPreset[study.severity]}">{severityLabel[study.severity]}</span>
		</div>
		<h2 class="text-lg font-semibold group-hover:underline">{study.title}</h2>
		<p class="text-surface-600-400 line-clamp-2 flex-1 text-sm">{study.dek}</p>
		<div class="flex flex-wrap gap-1">
			{#each study.tags as tag (tag)}
				<span class="chip preset-tonal text-xs">{tag}</span>
			{/each}
		</div>
		<div class="text-surface-600-400 flex gap-3 text-xs">
			<span>{study.likeCount} co-signers</span>
			<span>{study.commentCount} depositions</span>
		</div>
	</div>
</a>
