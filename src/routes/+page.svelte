<script
	lang="ts"
	context="module"
>
	import { objectEntries } from 'briznads-helpers';

	import { pivot } from '$stores/pivot';

	import { data as defaultData } from './default_data';

	import PivotRow from '$components/PivotRow.svelte';
</script>


<script lang="ts">
	const {
		data,
		rowFields,
		columnFields,
		valueFields,
		parsedTable,
	} = pivot;

	data.set(defaultData);

	rowFields.set([
		'Product',
		'Scenario',
	]);

	columnFields.set([
		'Year',
	]);

	valueFields.set([
		'Sales',
		'Cost',
		'Profit',
	]);
</script>


<style lang="scss">
	ion-grid {
		--ion-grid-padding: 0;
	}

	.table-header {
		font-weight: bold;
	}

	.table-body {
		max-height: calc(100vh / 4);
		min-height: 100px;
		overflow: auto;
	}
</style>


<ion-header>
	<ion-toolbar>
		<ion-title>Drag 'N Drop Pivot Table</ion-title>
	</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
	<div class="data-table">
		<h2>Data Table</h2>

		<ion-grid class="table-header">
			{#each $data as row, index }
				{#if index === 0 }
					<ion-row>
						{#each Object.keys(row) as key }
							<ion-col>
								{ key }
							</ion-col>
						{/each}
					</ion-row>
				{/if}
			{/each}
		</ion-grid>

		<ion-grid class="table-body">
			{#each $data as row }
				<ion-row>
					{#each Object.values(row) as value }
						<ion-col>
							{ value }
						</ion-col>
					{/each}
				</ion-row>
			{/each}
		</ion-grid>
	</div>

	<div class="pivot-table">
		<h2>Pivot Table</h2>

		<PivotRow pivotTable={ $parsedTable } />
	</div>
</ion-content>
