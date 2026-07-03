<script>
	import Tag from '$lib/tags/tag.svelte';

	let { selectedTags = [], onChange = () => {} } = $props();

	const tags = [
		'Before eating',
		'After eating',
		'Before workout',
		'After workout',
		'With clothes',
		'Without clothes'
	];

	/** @param {string} tag */
	function isSelected(tag) {
		return selectedTags.includes(tag);
	}

	/** @param {string} tag @param {boolean} checked */
	function toggleTag(tag, checked) {
		const nextTags = checked
			? [...new Set([...selectedTags, tag])]
			: selectedTags.filter((selectedTag) => selectedTag !== tag);

		onChange(nextTags);
	}

	/** @param {string} tag */
	function createToggleHandler(tag) {
		/** @param {boolean} checked */
		return (checked) => toggleTag(tag, checked);
	}
</script>

<div class="flex flex-wrap gap-1 my-2">
	{#each tags as tag}
		<Tag text={tag} checked={isSelected(tag)} onToggle={createToggleHandler(tag)} />
	{/each}
</div>
