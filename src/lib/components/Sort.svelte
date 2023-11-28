<script
	lang="ts"
	context="module"
>
	import type { SortBy } from '$types/sort-by';

	import { swapVertical, checkmark } from 'ionicons/icons';

	import { objectEntries } from 'briznads-helpers';

	import { HEK } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId } from '$stores/user';

	import ScaleSortTriggerButton from '$components/ScaleSortTriggerButton.svelte';
	import PopoverListHeader from '$components/PopoverListHeader.svelte';
</script>


<script lang="ts">
	export let type   : 'list' | 'recipe';
	export let id     : string;
	export let sortBy : SortBy;

	const optionsMap : { [ key in SortBy ] : string | undefined } = {
		added        : 'Order Added',
		alphabetical : undefined,
		custom       : undefined,
	};

	function update(newSortBy : SortBy) : void {
		firestore.updateListOrRecipe(type, id, $userId || '', {
			sortBy : newSortBy,
		});
	}
</script>


<style lang="scss">
	ion-popover {
		ion-label {
			text-transform: capitalize;
		}
	}
</style>


<ScaleSortTriggerButton
	id="sortPopoverTrigger"
	text={ optionsMap[sortBy] ?? sortBy }
	icon={ swapVertical }
/>

<ion-popover
	trigger="sortPopoverTrigger"
	dismiss-on-select={ true }
>
	<ion-list>
		<PopoverListHeader>sort by</PopoverListHeader>

		{#each objectEntries(optionsMap) as [ key, value ], index }
			<ion-item
				button={ true }
				detail={ false }
				disabled={ sortBy === key }
				lines={ index === Object.keys(optionsMap).length - 1 ? 'none' : undefined }
				on:click={ () => update(key) }
				on:keydown={ (e) => HEK(e, () => update(key)) }
			>
				<ion-label>{ value ?? key }</ion-label>

				{#if sortBy === key }
					<ion-icon
						slot="end"
						icon={ checkmark }
					></ion-icon>
				{/if}
			</ion-item>
		{/each}
	</ion-list>
</ion-popover>
