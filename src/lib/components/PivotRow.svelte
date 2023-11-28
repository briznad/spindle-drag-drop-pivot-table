<script
	lang="ts"
	context="module"
>
	import type { PivotTable } from '$types/pivot-table';

	import PivotRowLabel from '$components/PivotRowLabel.svelte';
</script>


<script lang="ts">
	export let pivotTable : PivotTable;
</script>


<style lang="scss">
	.row-container,
	.row-header {
		display: flex;
	}

	.row-container {
		flex-direction: column;
		flex-wrap: wrap;
	}

	.row-header {
		flex-basis: 100%;
	}

	.row-field {
		flex: 1;
	}
</style>


<div class="row-container">
	<div class="row-header">
		{#each pivotTable.dimensions.row.fields as field }
			<div class="row-field">
				{ field }
			</div>
		{/each}
	</div>

	<PivotRowLabel object={ pivotTable.values } />
</div>
