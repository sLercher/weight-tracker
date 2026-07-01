/** @typedef {'7d' | '1m' | '3m' | '6m' | '1y'} Range */

/**
 * @param {Array<{id: number, value: number, date: Date | string}>} entries
 */
export function normalizeEntries(entries) {
	return [...entries]
		.map((entry) => ({ ...entry, date: new Date(entry.date) }))
		.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * @param {Array<{id: number, value: number, date: Date}>} entries
 * @param {Range} range
 */
export function filterEntriesByRange(entries, range) {
	if (entries.length === 0) {
		return entries;
	}

	const cutoff = new Date();
	if (range === '7d') {
		cutoff.setDate(cutoff.getDate() - 7);
	} else if (range === '1m' || range === '3m' || range === '6m') {
		const monthOffset = Number(range[0]);
		cutoff.setMonth(cutoff.getMonth() - monthOffset);
	} else {
		cutoff.setFullYear(cutoff.getFullYear() - 1);
	}

	return entries.filter((entry) => entry.date.getTime() >= cutoff.getTime());
}

/**
 * @param {Array<{id: number, value: number, date: Date}>} filteredEntries
 */
export function buildTrendModel(filteredEntries) {
	if (filteredEntries.length < 2) {
		return null;
	}

	const points = filteredEntries.map((entry) => ({
		x: entry.date.getTime(),
		y: Number(entry.value)
	}));

	const n = points.length;
	const sumX = points.reduce((acc, p) => acc + p.x, 0);
	const sumY = points.reduce((acc, p) => acc + p.y, 0);
	const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
	const sumX2 = points.reduce((acc, p) => acc + p.x * p.x, 0);

	const denominator = n * sumX2 - sumX * sumX;
	if (denominator === 0) {
		return null;
	}

	const slope = (n * sumXY - sumX * sumY) / denominator;
	const intercept = (sumY - slope * sumX) / n;
	const msPerWeek = 7 * 24 * 60 * 60 * 1000;

	return {
		slope,
		slopePerWeek: slope * msPerWeek,
		intercept,
		line: points.map((p) => ({ x: p.x, y: slope * p.x + intercept }))
	};
}

/**
 * @param {Array<{id: number, value: number, date: Date}>} filteredEntries
 */
export function getYBounds(filteredEntries) {
	if (filteredEntries.length === 0) {
		return { min: 0, max: 100 };
	}

	const values = filteredEntries.map((entry) => Number(entry.value));
	const min = Math.min(...values);
	const max = Math.max(...values);
	const padding = Math.max(1, (max - min) * 0.2);

	return {
		min: Math.floor(min - padding),
		max: Math.ceil(max + padding)
	};
}

/**
 * @param {Array<{x: number, y: number}>} trendPoints
 */
export function getTrendLabel(trendPoints) {
	if (trendPoints.length < 2) {
		return 'Not enough data';
	}

	const start = trendPoints[0].y;
	const end = trendPoints[trendPoints.length - 1].y;
	const delta = end - start;

	if (delta < -0.1) {
		return 'Losing weight';
	}
	if (delta > 0.1) {
		return 'Gaining weight';
	}
	return 'Stable trend';
}

/**
 * @param {number | null | undefined} slopePerWeek
 */
export function getTrendSlopeLabel(slopePerWeek) {
	if (slopePerWeek == null) {
		return 'n/a';
	}

	const sign = slopePerWeek > 0 ? '+' : '';
	return `${sign}${slopePerWeek.toFixed(2)} kg/week`;
}
