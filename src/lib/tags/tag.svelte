<script>
	let { checked = false, text = 'hallo welt', onToggle = () => {} } = $props();
</script>

<label class="relative inline-flex cursor-pointer items-center">
	<input
		type="checkbox"
		class="peer sr-only"
		{checked}
		onchange={(event) => onToggle(Boolean(event.currentTarget?.checked))}
	/>
	<div
		class="w-full border border-(--wt-border) text-(--wt-border) text-sm rounded-full px-2 py-1 group peer peer-checked:border-(--wt-accent) peer-checked:text-(--wt-accent)"
	>
		{text}
	</div>
</label>
