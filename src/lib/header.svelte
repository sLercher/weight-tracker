<script>
	let { text, subtitle = 'Track progress with daily entries and trend insights' } = $props();
</script>

<header
	class="relative overflow-hidden rounded-2xl border border-(--wt-border) bg-(--wt-surface) px-5 py-5"
>
	<div class="relative flex flex-wrap items-start justify-between gap-4">
		<div>
			<p class="text-[10px] uppercase tracking-[0.24em] text-(--wt-muted)">Weight Journal</p>
			<h1
				class="display-font mt-2 text-2xl font-semibold leading-tight text-(--wt-text) sm:text-3xl"
			>
				{text}
			</h1>
			<p class="mt-2 max-w-xl text-sm text-(--wt-muted)">{subtitle}</p>
		</div>
	</div>
</header>
