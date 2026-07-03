<script>
	import Send from '@lucide/svelte/icons/send';
	import TagSelection from '$lib/tags/tag-selection.svelte';
	import { addEntry } from '$lib/db.js';

	/** @type {{ label: string, placeholder?: string, onAdded?: (id: number | null) => void | Promise<void> }} */
	let { label, placeholder = '', onAdded = () => {} } = $props();
	let value = $state();
	/** @type {string[]} */
	let selectedTags = $state([]);
	let errorMessage = $state('');

	/** @param {string[]} nextTags */
	function handleTagsChange(nextTags) {
		selectedTags = nextTags;
	}

	/**
	 * Handles the submit event for a new entry.
	 */
	async function handleSubmit() {
		if (isNaN(value)) {
			errorMessage = 'Enter a valid numeric weight first.';
			return;
		}

		errorMessage = '';

		try {
			const id = await addEntry(value, selectedTags);
			await onAdded(id);
			value = null;
			selectedTags = [];
		} catch {
			errorMessage = 'Unable to save your entry. Please try again.';
		}
	}
</script>

<form
	class="w-full rounded-2xl border border-(--wt-border) bg-(--wt-surface) px-4 py-4 shadow-[0_12px_36px_rgba(0,0,0,0.18),0_0_0_1px_rgba(251,76,0,0.08)]"
	onsubmit={(event) => {
		event.preventDefault();
		handleSubmit();
	}}
>
	<label for="weight-input" class="mb-2 block text-sm font-semibold text-(--wt-text)">{label}</label
	>

	<div class="flex w-full gap-3">
		<input
			id="weight-input"
			bind:value
			type="number"
			step="0.1"
			min="0"
			inputmode="decimal"
			autocomplete="off"
			{placeholder}
			aria-invalid={errorMessage.length > 0}
			aria-describedby="weight-input-error"
			class="w-full rounded-xl border border-(--wt-border) bg-(--wt-surface) px-4 py-3 text-(--wt-text) placeholder:text-(--wt-muted)/70 outline-none transition-all focus:border-(--wt-accent) focus:ring-2 focus:ring-(--wt-accent)/20"
		/>

		<button
			type="submit"
			class="flex w-fit items-center justify-center rounded-xl bg-(--wt-accent) px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
			aria-label="Save weight entry"
		>
			<Send size={18} />
		</button>
	</div>

	<TagSelection {selectedTags} onChange={handleTagsChange} />

	<p
		id="weight-input-error"
		class="mt-2 min-h-5 text-xs text-(--wt-danger) {errorMessage ? 'block' : 'hidden'}"
	>
		{errorMessage}
	</p>
</form>
