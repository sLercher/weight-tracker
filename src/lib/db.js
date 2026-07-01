import Dexie from 'dexie';

/** @typedef {{ id: number, value: number, date: Date }} WeightEntry */
/** @typedef {Omit<WeightEntry, 'id'>} NewWeightEntry */

const ENTRY_TABLE = 'entries';

export const db = new Dexie('weight-db');

db.version(1).stores({
	[ENTRY_TABLE]: '++id,date'
});

/** @returns {import('dexie').Table<WeightEntry, number, NewWeightEntry>} */
function entriesTable() {
	return db.table(ENTRY_TABLE);
}

/**
 * Saves a new weight value with the current timestamp.
 *
 * @param {number} value Weight value in kg.
 * @returns {Promise<number>} Newly inserted row id.
 */
export async function addEntry(value) {
	if (!Number.isFinite(value)) {
		throw new TypeError('Weight value must be a finite number.');
	}

	/** @type {NewWeightEntry} */
	const newEntry = {
		value,
		date: new Date()
	};

	return entriesTable().add(newEntry);
}

/**
 * Updates one entry.
 *
 * @param {number} id Entry id.
 * @param {{ value?: number, date?: Date }} changes Updated fields.
 * @returns {Promise<number>} Number of modified rows.
 */
export async function updateEntry(id, changes) {
	return entriesTable().update(id, changes);
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
