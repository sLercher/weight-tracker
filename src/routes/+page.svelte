<script>
	import Header from '$lib/header.svelte';
	import Input from '$lib/input.svelte';
	import Table from '$lib/table.svelte';

	let refreshKey = $state(0);
	/** @type {number | null} */
	let newestEntryId = $state(null);

	/** @param {number | null} id */
	function handleEntryAdded(id) {
		newestEntryId = id;
		refreshKey += 1;
	}
</script>

<main class="relative min-h-dvh w-full overflow-x-clip bg-(--wt-bg) text-(--wt-text)">
	<div class="relative mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:py-10">
		<Header text="Weight tracking" subtitle="Capture entries, watch trends, and manage progress"
		></Header>
		<Input label="Enter current weight in kg" onAdded={handleEntryAdded}></Input>
		<Table {refreshKey} {newestEntryId}></Table>
	</div>
</main>
