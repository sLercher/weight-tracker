import Dexie from 'dexie';

/** @typedef {{ id: number, value: number, date: Date, tags: string[] }} WeightEntry */
/** @typedef {Omit<WeightEntry, 'id'>} NewWeightEntry */
/** @typedef {{ id: 'goal-settings', goalWeight: number | null, showInTable: boolean }} GoalSettingsRecord */

const ENTRY_TABLE = 'entries';
const SETTINGS_TABLE = 'settings';
const GOAL_SETTINGS_ID = 'goal-settings';

export const db = new Dexie('weight-db');

db.version(2).stores({
	[ENTRY_TABLE]: '++id,date',
	[SETTINGS_TABLE]: 'id'
});

db.version(3)
	.stores({
		[ENTRY_TABLE]: '++id,date',
		[SETTINGS_TABLE]: 'id'
	})
	.upgrade(async (tx) => {
		await tx
			.table(ENTRY_TABLE)
			.toCollection()
			.modify((entry) => {
				if (!Array.isArray(entry.tags)) {
					entry.tags = [];
				}
			});
	});

/** @param {unknown} tags */
function sanitizeTags(tags) {
	if (!Array.isArray(tags)) {
		return [];
	}

	const cleaned = tags
		.map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
		.filter(Boolean);

	return [...new Set(cleaned)];
}

/** @returns {import('dexie').Table<WeightEntry, number, NewWeightEntry>} */
function entriesTable() {
	return db.table(ENTRY_TABLE);
}

/** @returns {import('dexie').Table<GoalSettingsRecord, string, GoalSettingsRecord>} */
function settingsTable() {
	return db.table(SETTINGS_TABLE);
}

/**
 * Saves a new weight value with the current timestamp.
 *
 * @param {number} value Weight value in kg.
 * @param {string[]} [tags] Optional tags for context.
 * @returns {Promise<number>} Newly inserted row id.
 */
export async function addEntry(value, tags = []) {
	if (!Number.isFinite(value)) {
		throw new TypeError('Weight value must be a finite number.');
	}

	/** @type {NewWeightEntry} */
	const newEntry = {
		value,
		date: new Date(),
		tags: sanitizeTags(tags)
	};

	return entriesTable().add(newEntry);
}

/**
 * Updates one entry.
 *
 * @param {number} id Entry id.
 * @param {{ value?: number, date?: Date, tags?: string[] }} changes Updated fields.
 * @returns {Promise<number>} Number of modified rows.
 */
export async function updateEntry(id, changes) {
	/** @type {{ value?: number, date?: Date, tags?: string[] }} */
	const normalizedChanges = { ...changes };
	if (changes.tags !== undefined) {
		normalizedChanges.tags = sanitizeTags(changes.tags);
	}

	return entriesTable().update(id, normalizedChanges);
}

/**
 * Deletes one entry.
 *
 * @param {number} id Entry id.
 * @returns {Promise<void>}
 */
export async function deleteEntry(id) {
	return entriesTable().delete(id);
}

/**
 * Returns all entries sorted by date descending (newest first).
 *
 * @returns {Promise<WeightEntry[]>}
 */
export async function getEntries() {
	return entriesTable().orderBy('date').reverse().toArray();
}

/**
 * Stores goal-related chart settings.
 *
 * @param {{ goalWeight: number | null, showInTable: boolean }} settings
 * @returns {Promise<void>}
 */
export async function saveGoalSettings(settings) {
	const parsedGoalWeight =
		settings.goalWeight == null ? null : Number.isFinite(Number(settings.goalWeight)) ? Number(settings.goalWeight) : Number.NaN;

	if (Number.isNaN(parsedGoalWeight)) {
		throw new TypeError('Goal weight must be null or a finite number.');
	}

	await settingsTable().put({
		id: GOAL_SETTINGS_ID,
		goalWeight: parsedGoalWeight,
		showInTable: Boolean(settings.showInTable)
	});
}

/**
 * Loads goal-related chart settings.
 *
 * @returns {Promise<{ goalWeight: number | null, showInTable: boolean }>}
 */
export async function loadGoalSettings() {
	const record = await settingsTable().get(GOAL_SETTINGS_ID);
	if (!record) {
		return {
			goalWeight: null,
			showInTable: false
		};
	}

	return {
		goalWeight: record.goalWeight,
		showInTable: record.showInTable
	};
}
