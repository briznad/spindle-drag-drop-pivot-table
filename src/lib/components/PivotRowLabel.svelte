<script
	lang="ts"
	context="module"
>
	import { objectEntries } from 'briznads-helpers';

	import PivotRowLabel from '$components/PivotRowLabel.svelte';
</script>


<script lang="ts">
	export let dimension : string;
	export let object : any;
</script>


<style lang="scss">
	.row-container,
	.row-header {
		display: flex;
	}

	.row-container {
		flex-direction: row;
	}

	.row-label {
		flex: 1;
	}
</style>


{#each objectEntries(object) as [ key, value ] }
	<div class="row-container">
		<div class="row-label">
			{ key }

			{#if value.values }
				<PivotRowLabel
					object={ value }
					dimension={ dimension }
				/>
			{/if}
		</div>
	</div>
{/each }
