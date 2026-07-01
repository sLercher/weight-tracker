<script>
	/** @type {{ goalWeight?: number | null, showInTable?: boolean }} */
	let { goalWeight = $bindable(null), showInTable = $bindable(false) } = $props();
</script>

<div
	class="mx-1 mt-3 rounded-xl border border-(--wt-border) bg-(--wt-surface) px-4 py-3 text-sm text-(--wt-text)"
>
	<div class="text-md uppercase tracking-[0.16em] text-(--wt-muted)">Target weight</div>

	<div class="my-2 flex flex-col gap-2">
		<label class="sr-only" for="goal-weight">Goal weight</label>
		<input
			id="goal-weight"
			type="number"
			step="0.1"
			bind:value={goalWeight}
			class="w-full rounded-lg border border-(--wt-border) bg-(--wt-surface) px-3 py-2 text-(--wt-text) outline-none transition-colors focus:border-(--wt-accent)"
		/>

		<label class="relative inline-flex cursor-pointer items-center">
			<input type="checkbox" class="peer sr-only" bind:checked={showInTable} />
			<div
				class="group peer ring-0 bg-(--wt-surface-raised) after:bg-white rounded-full duration-300 w-8 h-4 after:duration-300 peer-checked:bg-(--wt-accent) after:rounded-full after:absolute after:h-3 after:w-3 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-3 peer-hover:after:scale-95"
			></div>
			<p class="ml-2 text-sm text-(--wt-muted)">Show in table</p>
		</label>
	</div>
</div>
