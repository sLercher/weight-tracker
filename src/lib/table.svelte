<script>
	import {
		getEntries,
		updateEntry,
		deleteEntry,
		loadGoalSettings,
		saveGoalSettings
	} from '$lib/db.js';
	import RangeSelector from '$lib/table/range-selector.svelte';
	import TrendSummary from '$lib/table/trend-summary.svelte';
	import SelectedPointCard from '$lib/table/selected-point-card.svelte';
	import WeightChart from '$lib/table/weight-chart.svelte';
	import TargetRange from './table/target-range.svelte';
	import {
		normalizeEntries,
		filterEntriesByRange,
		buildTrendModel,
		getYBounds,
		getTrendLabel,
		getTrendSlopeLabel
	} from '$lib/table/chart-logic.js';

	let { refreshKey = 0, newestEntryId = null } = $props();

	/** @type {Array<{id: number, value: number, date: Date | string}>} */
	let entries = $state([]);
	let isLoading = $state(true);
	let loadError = $state('');
	/** @type {number | null} */
	let selectedEntryId = $state(null);
	/** @type {number | null} */
	let goalWeight = $state(null);
	let showGoalInTable = $state(false);
	let hasHydratedGoalSettings = $state(false);
	/** @type {'7d' | '1m' | '3m' | '6m' | '1y'} */
	let range = $state('7d');

	const sortedEntries = $derived.by(() => normalizeEntries(entries));
	const filteredEntries = $derived.by(() => filterEntriesByRange(sortedEntries, range));
	const trendModel = $derived.by(() => buildTrendModel(filteredEntries));
	const trendPoints = $derived.by(() => trendModel?.line ?? []);
	const trendLabel = $derived.by(() => getTrendLabel(trendPoints));
	const trendSlopeLabel = $derived.by(() => getTrendSlopeLabel(trendModel?.slopePerWeek));
	const visibleGoalWeight = $derived.by(() => (showGoalInTable ? goalWeight : null));
	const yBounds = $derived.by(() => {
		const bounds = getYBounds(filteredEntries);
		if (visibleGoalWeight == null || Number.isNaN(Number(visibleGoalWeight))) {
			return bounds;
		}

		const low = Number(visibleGoalWeight) - 1;
		const high = Number(visibleGoalWeight) + 1;

		return {
			min: Math.min(bounds.min, Math.floor(low - 0.5)),
			max: Math.max(bounds.max, Math.ceil(high + 0.5))
		};
	});

	const selectedEntry = $derived.by(() => {
		if (selectedEntryId == null) {
			return null;
		}
		return filteredEntries.find((entry) => entry.id === selectedEntryId) ?? null;
	});

	/** @type {number} */
	let requestVersion = 0;

	async function loadEntries() {
		const currentRequest = ++requestVersion;
		isLoading = true;
		loadError = '';

		try {
			const result = await getEntries();
			if (currentRequest !== requestVersion) {
				return;
			}

			entries = result;
		} catch {
			if (currentRequest !== requestVersion) {
				return;
			}

			loadError = 'Could not load entries. Please refresh and try again.';
		} finally {
			if (currentRequest === requestVersion) {
				isLoading = false;
			}
		}
	}

	async function hydrateGoalSettings() {
		try {
			const settings = await loadGoalSettings();
			goalWeight = settings.goalWeight;
			showGoalInTable = settings.showInTable;
		} finally {
			hasHydratedGoalSettings = true;
		}
	}

	/**
	 * @param {number} id
	 * @param {number} value
	 * @param {Date} date
	 */
	async function handleSaveSelected(id, value, date) {
		await updateEntry(id, { value, date });
		await loadEntries();
	}

	/**
	 * @param {number} id
	 */
	async function handleDeleteSelected(id) {
		await deleteEntry(id);
		selectedEntryId = null;
		await loadEntries();
	}

	$effect(() => {
		refreshKey;
		loadEntries();
	});

	$effect(() => {
		hydrateGoalSettings();
	});

	$effect(() => {
		if (newestEntryId == null) {
			return;
		}

		selectedEntryId = newestEntryId;
	});

	$effect(() => {
		if (selectedEntryId == null) {
			return;
		}

		if (!filteredEntries.some((entry) => entry.id === selectedEntryId)) {
			selectedEntryId = null;
		}
	});

	$effect(() => {
		if (!hasHydratedGoalSettings) {
			return;
		}

		saveGoalSettings({
			goalWeight,
			showInTable: showGoalInTable
		});
	});
</script>

<div
	class="rounded-2xl border border-(--wt-border) bg-(--wt-surface) p-3 shadow-[0_14px_42px_rgba(0,0,0,0.2),0_0_0_1px_rgba(251,76,0,0.06)]"
>
	{#if loadError}
		<div class="flex h-72 items-center justify-center text-sm text-(--wt-danger)">
			{loadError}
		</div>
	{:else if isLoading && sortedEntries.length === 0}
		<div class="flex h-72 items-center justify-center text-sm text-(--wt-muted)">
			Loading entries...
		</div>
	{:else if sortedEntries.length > 0}
		<RangeSelector value={range} onChange={(nextRange) => (range = nextRange)} />

		<WeightChart
			entries={filteredEntries}
			{trendPoints}
			{yBounds}
			{selectedEntryId}
			goalWeight={visibleGoalWeight}
			{showGoalInTable}
			onSelect={(id) => (selectedEntryId = id)}
		/>

		<div class="grid grid-cols-2">
			<TrendSummary {trendLabel} {trendSlopeLabel} />
			<TargetRange bind:goalWeight bind:showInTable={showGoalInTable} />
		</div>

		<SelectedPointCard
			{selectedEntry}
			onSave={handleSaveSelected}
			onDelete={handleDeleteSelected}
		/>
	{:else}
		<div class="flex h-72 items-center justify-center text-sm text-(--wt-muted)">
			No data found...
		</div>
	{/if}
</div>
