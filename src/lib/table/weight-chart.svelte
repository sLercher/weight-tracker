<script>
	import { onMount } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		Filler,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, Filler, Tooltip, Legend);

	/**
	 * @type {{
	 * entries?: Array<{id: number, value: number, date: Date}>,
	 * trendPoints?: Array<{x: number, y: number}>,
	 * yBounds?: {min: number, max: number},
	 * selectedEntryId?: number | null,
	 * goalWeight?: number | null,
	 * showGoalInTable?: boolean,
	 * onSelect?: (id: number | null) => void
	 * }}
	 */
	let {
		entries = [],
		trendPoints = [],
		yBounds = { min: 0, max: 100 },
		selectedEntryId = null,
		goalWeight = null,
		showGoalInTable = false,
		onSelect = () => {}
	} = $props();

	/** @type {HTMLCanvasElement | null} */
	let canvasEl = $state(null);
	/** @type {import('chart.js').Chart<'line', {x: number, y: number}[]> | null} */
	let chart = null;
	let previousDataFingerprint = '';

	const tickFormatter = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit'
	});

	const tooltipDateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	const palette = {
		accent: '#FB4C00',
		accentSoft: '#141412',
		goal: '#22C55E',
		surfaceDark: '#141412',
		text: '#F6F6F6',
		muted: '#dbd7d7',
		grid: '#43423E'
	};

	function renderOrUpdateChart() {
		if (!canvasEl) {
			return;
		}

		const points = entries.map((entry) => ({
			x: entry.date.getTime(),
			y: Number(entry.value)
		}));

		if (points.length === 0) {
			if (chart) {
				chart.destroy();
				chart = null;
			}
			previousDataFingerprint = '';
			return;
		}

		const effectiveGoalWeight = showGoalInTable ? goalWeight : null;

		const dataFingerprint = JSON.stringify({
			points,
			trendPoints,
			yBounds,
			goalWeight: effectiveGoalWeight
		});

		const chartMinX = points[0]?.x;
		const chartMaxX = points[points.length - 1]?.x;
		const hasGoal =
			effectiveGoalWeight != null &&
			Number.isFinite(Number(effectiveGoalWeight)) &&
			chartMinX != null &&
			chartMaxX != null;
		const goal = hasGoal ? Number(effectiveGoalWeight) : null;

		/** @type {import('chart.js').ChartDataset<'line', {x: number, y: number}[]>[]} */
		const datasets = [];

		if (hasGoal && goal != null) {
			datasets.push(
				{
					label: 'Goal range lower',
					data: [
						{ x: chartMinX, y: goal - 1 },
						{ x: chartMaxX, y: goal - 1 }
					],
					parsing: false,
					borderWidth: 0,
					pointRadius: 0,
					fill: false,
					order: -2
				},
				{
					label: 'Goal range upper',
					data: [
						{ x: chartMinX, y: goal + 1 },
						{ x: chartMaxX, y: goal + 1 }
					],
					parsing: false,
					borderWidth: 0,
					pointRadius: 0,
					fill: '-1',
					backgroundColor: 'rgba(34, 197, 94, 0.18)',
					order: -2
				},
				{
					label: 'Goal',
					data: [
						{ x: chartMinX, y: goal },
						{ x: chartMaxX, y: goal }
					],
					parsing: false,
					borderColor: palette.goal,
					borderWidth: 2,
					pointRadius: 0,
					fill: false,
					tension: 0,
					order: -1
				}
			);
		}

		/** @type {import('chart.js').ChartData<'line', {x: number, y: number}[]>} */
		const data = {
			datasets: [
				...datasets,
				{
					label: 'Weight',
					data: points,
					parsing: false,
					borderColor: palette.accent,
					backgroundColor: 'rgba(251, 76, 0, 0.2)',
					fill: true,
					tension: 0.3,
					borderWidth: 3,
					pointBackgroundColor: (ctx) =>
						entries[ctx.dataIndex]?.id === selectedEntryId ? palette.accent : palette.surfaceDark,
					pointBorderColor: palette.accent,
					pointBorderWidth: 3,
					pointHitRadius: 14,
					pointRadius: 5,
					pointHoverRadius: 7,
					order: 1,
					clip: false
				},
				{
					label: 'Trend',
					data: trendPoints,
					parsing: false,
					borderColor: '#3972B7',
					borderWidth: 3,
					borderDash: [6, 6],
					pointRadius: 0,
					fill: false,
					tension: 0.35,
					order: 0
				}
			]
		};

		/** @type {import('chart.js').ChartOptions<'line'>} */
		const options = {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: 'nearest',
				intersect: true
			},
			onClick: (_event, activeElements, chartInstance) => {
				if (!activeElements.length) {
					onSelect(null);
					return;
				}

				const { datasetIndex, index } = activeElements[0];
				const selectedDataset = chartInstance?.data?.datasets?.[datasetIndex];
				if (selectedDataset?.label !== 'Weight') {
					onSelect(null);
					return;
				}

				onSelect(entries[index]?.id ?? null);
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: true,
					callbacks: {
						title: (context) => {
							const value = context[0]?.parsed?.x;
							if (value == null) {
								return '';
							}
							return tooltipDateTimeFormatter.format(new Date(Number(value)));
						},
						label: (context) => {
							const value = context.parsed.y;
							if (value == null) {
								return '';
							}
							return `${value.toFixed(1)} kg`;
						}
					}
				}
			},
			scales: {
				x: {
					type: 'linear',
					min: points[0]?.x,
					max: points[points.length - 1]?.x,
					grid: {
						color: palette.grid
					},
					ticks: {
						color: palette.muted,
						callback: (value) => tickFormatter.format(new Date(Number(value)))
					}
				},
				y: {
					min: yBounds.min,
					max: yBounds.max,
					grid: {
						color: palette.grid
					},
					ticks: {
						color: palette.muted
					}
				}
			}
		};

		if (!chart) {
			chart = new Chart(canvasEl, {
				type: 'line',
				data,
				options
			});
			previousDataFingerprint = dataFingerprint;
			return;
		}

		const isSelectionOnlyUpdate = previousDataFingerprint === dataFingerprint;
		if (isSelectionOnlyUpdate) {
			chart.update('none');
			return;
		}

		chart.data = data;
		chart.options = options;
		chart.update();
		previousDataFingerprint = dataFingerprint;
	}

	onMount(() => {
		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	$effect(() => {
		renderOrUpdateChart();
	});
</script>

<div class="h-72 rounded-xl border border-(--wt-border) bg-(--wt-surface) p-3 sm:h-80">
	<canvas bind:this={canvasEl}></canvas>
</div>
