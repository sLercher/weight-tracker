<script>
	import Save from '@lucide/svelte/icons/save';
	import Trash from '@lucide/svelte/icons/trash-2';

	/**
	 * @type {{
	 * selectedEntry?: {id: number, value: number, date: Date} | null,
	 * onSave?: (id: number, value: number, date: Date) => Promise<void> | void,
	 * onDelete?: (id: number) => Promise<void> | void
	 * }}
	 */
	let { selectedEntry = null, onSave = () => {}, onDelete = () => {} } = $props();
	let editValue = $state('');
	let editDate = $state('');
	let isSaving = $state(false);
	let isDeleting = $state(false);

	const dateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	/** @param {Date | string | number} value */
	function toDate(value) {
		if (value instanceof Date) {
			return value;
		}

		if (typeof value === 'number') {
			return new Date(value);
		}

		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (/^\d+$/.test(trimmed)) {
				return new Date(Number(trimmed));
			}
			return new Date(trimmed);
		}

		return new Date(Number.NaN);
	}

	/** @param {Date | string | number} value */
	function formatSelectedDate(value) {
		const date = toDate(value);
		if (Number.isNaN(date.getTime())) {
			return 'Invalid date';
		}
		return dateTimeFormatter.format(date);
	}

	$effect(() => {
		if (selectedEntry) {
			editValue = String(selectedEntry.value);
			editDate = toInputDateTime(selectedEntry.date);
		}
	});

	/** @param {Date | string | number} value */
	function toInputDateTime(value) {
		const date = toDate(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}
		const offsetMinutes = date.getTimezoneOffset();
		const local = new Date(date.getTime() - offsetMinutes * 60_000);
		return local.toISOString().slice(0, 16);
	}

	async function handleSave() {
		if (!selectedEntry) {
			return;
		}

		const parsed = Number(editValue);
		if (Number.isNaN(parsed)) {
			return;
		}

		const parsedDate = new Date(editDate);
		if (Number.isNaN(parsedDate.getTime())) {
			return;
		}

		isSaving = true;
		try {
			await onSave(selectedEntry.id, parsed, parsedDate);
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!selectedEntry) {
			return;
		}

		isDeleting = true;
		try {
			await onDelete(selectedEntry.id);
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if selectedEntry}
	<div
		class="mx-1 mt-2 rounded-xl border border-(--wt-border) bg-(--wt-surface-raised) px-4 py-3 text-sm text-(--wt-text)"
	>
		<div class="text-xs uppercase tracking-[0.16em] text-(--wt-muted)">Selected point</div>
		<div class="mt-1 font-medium text-(--wt-text)">
			{formatSelectedDate(selectedEntry.date)}
		</div>
		<div class="mt-2 space-y-2">
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<label class="sr-only" for="selected-weight">Selected weight</label>
				<input
					id="selected-weight"
					type="number"
					step="0.1"
					bind:value={editValue}
					class="w-full rounded-lg border border-(--wt-border) bg-(--wt-surface) px-3 py-2 text-(--wt-text) outline-none transition-colors focus:border-(--wt-accent)"
				/>
				<label class="sr-only" for="selected-date">Selected timestamp</label>
				<input
					id="selected-date"
					type="datetime-local"
					bind:value={editDate}
					class="w-full rounded-lg border border-(--wt-border) bg-(--wt-surface) px-3 py-2 text-(--wt-text) outline-none transition-colors focus:border-(--wt-accent)"
				/>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					onclick={handleSave}
					disabled={isSaving || isDeleting}
					class="flex w-full items-center justify-center rounded-lg bg-(--wt-accent) px-4 py-3 font-semibold text-white transition-all hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Save size={18} />
				</button>
				<button
					type="button"
					onclick={handleDelete}
					disabled={isSaving || isDeleting}
					class="flex w-full items-center justify-center rounded-lg border border-[color-mix(in_oklab,var(--wt-danger)_65%,black)] bg-transparent px-4 py-3 font-semibold text-(--wt-danger) transition-colors hover:bg-[color-mix(in_oklab,var(--wt-danger)_12%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Trash size={18} />
				</button>
			</div>
		</div>
	</div>
{/if}
