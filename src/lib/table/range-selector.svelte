<script>
	/** @typedef {'7d' | '1m' | '3m' | '6m' | '1y'} Range */

	/** @type {{ value?: Range, onChange?: (range: Range) => void }} */
	let { value = '7d', onChange = () => {} } = $props();

	/** @type {Array<{ value: Range, label: string }>} */
	const ranges = [
		{ value: '7d', label: '7D' },
		{ value: '1m', label: '1M' },
		{ value: '3m', label: '3M' },
		{ value: '6m', label: '6M' },
		{ value: '1y', label: '1Y' }
	];
</script>

<div class="mx-1 mb-3 grid w-full grid-cols-5 gap-2 rounded-xl bg-transparent p-1">
	{#each ranges as range (range.value)}
		<button
			type="button"
			onclick={() => onChange(range.value)}
			class={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${value === range.value ? 'border-(--wt-accent) bg-(--wt-accent) text-white' : 'border-(--wt-border) bg-(--wt-surface-raised) text-(--wt-muted) hover:text-(--wt-text)'}`}
		>
			{range.label}
		</button>
	{/each}
</div>
