<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Register — Brandopsy</title>
</svelte:head>

<main class="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
	<div class="card bg-surface-100-900 flex flex-col gap-6 p-6">
		<header>
			<h1 class="text-xl font-semibold">Whistleblower Registration</h1>
			<p class="text-surface-600-400 text-sm">
				Confidentiality not guaranteed. Terms and conditions written by our legal team, who we also
				investigated.
			</p>
		</header>

		<form method="POST" class="flex flex-col gap-4">
			<label class="label">
				<span class="label-text">Email</span>
				<input type="email" name="email" required value={form?.email ?? ''} class="input" />
			</label>
			<label class="label">
				<span class="label-text">Password</span>
				<input type="password" name="password" required minlength="8" class="input" />
			</label>

			{#if form?.error}
				<p class="text-error-500 text-sm" role="alert">{form.error}</p>
			{/if}

			<button type="submit" class="btn preset-filled-primary-500">Submit for Review</button>
		</form>

		<p class="text-surface-600-400 text-sm">
			Already on file? <a href={resolve('/login')} class="anchor">Verify your credentials</a>
		</p>
	</div>
</main>
