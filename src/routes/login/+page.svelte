<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Log in — Brandopsy</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
	<h1 class="text-2xl font-semibold">Log in</h1>

	<form method="POST" class="flex flex-col gap-4">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Email</span>
			<input
				type="email"
				name="email"
				required
				value={form?.email ?? ''}
				class="rounded border border-neutral-300 px-3 py-2"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Password</span>
			<input
				type="password"
				name="password"
				required
				class="rounded border border-neutral-300 px-3 py-2"
			/>
		</label>

		{#if form?.error}
			<p class="text-sm text-red-600" role="alert">{form.error}</p>
		{/if}

		<button type="submit" class="rounded bg-neutral-900 px-4 py-2 text-white"> Log in </button>
	</form>

	<p class="text-sm text-neutral-600">
		Need an account? <a href={resolve('/signup')} class="underline">Sign up</a>
	</p>
</main>
