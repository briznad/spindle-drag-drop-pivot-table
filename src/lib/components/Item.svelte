<script
	lang="ts"
	context="module"
>
	import type { Item } from '$types/item';

	import { ellipsisVertical } from 'ionicons/icons';

	import { getFraction } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId, user } from '$stores/user';

	import ItemMeasurement from '$components/ItemMeasurement.svelte';
	import EditItem from '$components/EditItem.svelte';
	import ScaleToItem from '$components/ScaleToItem.svelte';
</script>


<script lang="ts">
	export let type : 'list' | 'recipe';
	export let id   : string;
	export let item : Item;

	function handleCheckChange(event : any) : void {
		updateItem({ checked : event.detail?.checked });
	}

	function updateItem(update : Partial<Item>) : Promise<boolean> {
		return firestore.updateItem(type, id, item.id, $userId || '', update);
	}

	function getDisplayQuantity(quantity : number, showFractions? : boolean) : string {
		return showFractions
			? getFraction(quantity)
			: quantity.toString();
	}

	let alertElement : HTMLIonAlertElement;

	function initAlertButtons(alertElement : HTMLIonAlertElement) : void {
		if (!alertElement) {
			return;
		}

		alertElement.buttons = [
			{
				text : 'Cancel',
				role : 'cancel',
			},
			{
				text    : 'Confirm',
				role    : 'confirm',
				handler : () => firestore.deleteItem(type, id, item.id, $userId || ''),
			},
		];
	}

	$: initAlertButtons(alertElement);
</script>


<style lang="scss">
	ion-checkbox {
    --border-radius: 6px;
  }

	// .quantity,
	// .description {
	// 	margin-top: 3px;
	// 	margin-bottom: 3px;
	// 	padding: 3px;
	// }

	// .quantity {
	// 	margin-left: 1px; // don't cut off outline when editing
	// }

	.description {
		flex-grow: 1;
		// margin-right: 1px; // don't cut off outline when editing

		&:not(:focus) {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.quantity + & {
			padding-left: 0.5em;
		}
	}

	.options-popover-trigger {
		--padding-start: 0;
		--padding-end: 0;

		margin: 0;
	}
</style>


<ion-item>
	<ion-checkbox
		slot="start"
		name="checked"
		aria-label="item checked off"
		checked={ item.checked }
		on:ionChange={ handleCheckChange }
	></ion-checkbox>

	<span
		class="quantity"
	>
		{ getDisplayQuantity(item.displayedQuantity ?? item.quantity, ($user || {}).settings?.showFractions) }
	</span>

	{#if item.measurement !== 'undefined' }
		<ItemMeasurement
			{ type }
			{ id }
			{ item }
		/>
	{/if}

	<span
		class="description"
		title={ item.description }
	>
		{ item.description }
	</span>

	<ion-button
		id="optionsPopoverTrigger{ item.id }"
		class="options-popover-trigger"
		slot="end"
		aria-label="show edit main info modal"
		fill="clear"
		color="medium"
	>
		<ion-icon
			slot="icon-only"
			icon={ ellipsisVertical }
		></ion-icon>
	</ion-button>

	<ion-reorder slot="end"></ion-reorder>

	<ion-popover
		trigger="optionsPopoverTrigger{ item.id }"
		dismiss-on-select={ true }
	>
		<ion-list>
			<EditItem
				{ type }
				{ id }
				{ item }
			/>

			<ScaleToItem
				{ type }
				{ id }
				{ item }
			/>

			<ion-item
				id="deleteItemConfirmTrigger{ item.id }"
				button={ true }
				detail={ false }
				lines="none"
			>
				<ion-label color="danger">Delete item</ion-label>
			</ion-item>
		</ion-list>
	</ion-popover>

	<ion-alert
		bind:this={ alertElement }
		trigger="deleteItemConfirmTrigger{ item.id }"
		header="Confirm Delete"
		message="Are you sure you want to delete this item?"
	></ion-alert>
</ion-item>
