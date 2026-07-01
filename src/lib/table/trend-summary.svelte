<script>
	/** @type {{ trendLabel?: string, trendSlopeLabel?: string }} */
	let { trendLabel = 'Not enough data', trendSlopeLabel = 'n/a' } = $props();
</script>

<div
	class="mx-1 mt-3 rounded-xl border border-(--wt-border) bg-(--wt-surface) px-4 py-3 text-sm text-(--wt-text)"
>
	<div class="text-md uppercase tracking-[0.16em] text-(--wt-muted)">Trend</div>
	<div class="mt-1 text-base font-semibold text-(--wt-accent-soft)">{trendLabel}</div>
	<div class="mt-1 text-sm text-(--wt-muted)">Slope: {trendSlopeLabel}</div>
</div>
