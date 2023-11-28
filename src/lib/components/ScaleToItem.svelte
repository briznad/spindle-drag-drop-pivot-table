<script
	lang="ts"
	context="module"
>
	import type { Item } from '$types/item';
	import type { Measurement } from '$types/measurement';

	import { closeOutline } from 'ionicons/icons';

	import { HEK, round } from '$utilities/helper';
	import { getMeasurementConversion } from '$utilities/measurement';

	import { firestore } from '$services/firestore';

	import { userId } from '$stores/user';

	import ScaleToItemMeasurement from '$components/ScaleToItemMeasurement.svelte';
</script>


<script lang="ts">
	export let type : 'list' | 'recipe';
	export let id   : string;
	export let item : Item;

	let temp : { quantity? : number, measurement? : Measurement } = {};

	function reset(passedQuantity? : number, passedDescription? : string) : void {
		temp = {};
	}

	let modalElement : HTMLIonModalElement;

	let scaleToItemMeasurementComponent : ScaleToItemMeasurement;

	let isPopoverActive : boolean = false;

	function dismissPopover() : void {
		scaleToItemMeasurementComponent.dismiss();
	}

	function handleInput(event : any) {
		const name : 'quantity' = event.target?.name;

		let value : undefined | number = parseFloat(event.detail?.value);

		if (isNaN(value)) {
			value = undefined;
		}

		temp = {
			...temp,
			[ name ] : value,
		};
	}

	function handleMeasurementUpdate(event : any) : void {
		temp = {
			...temp,
			measurement : event.detail,
		};
	}

	let saveClicked : boolean;

	async function save() : Promise<void> {
		if (temp.quantity == null || !temp.measurement) {
			return;
		}

		saveClicked = true;

		let quantity : number = item.quantity;

		if (item.measurement !== temp.measurement) {
			const from = getMeasurementConversion(item.measurement, item.measurementType) ?? 1;
			const to = getMeasurementConversion(temp.measurement, item.measurementType) ?? 1;

			quantity = item.quantity / from * to;
		}

		const scale : number = temp.quantity / quantity;

		await firestore.updateListOrRecipe(type, id, $userId || '', { scale });

		if (item.measurement !== temp.measurement) {
			await firestore.updateItem(type, id, item.id, $userId || '', {
				quantity,
				measurement : temp.measurement,
			});
		}

		await modalElement.dismiss();

		saveClicked = false;
	}
</script>


<style lang="scss">
	ion-modal {
    --height: auto;
		--border-radius: 10px 10px 0 0;

		align-items: flex-end;
  }

	.modal-content {
		height: 33.333vh;
	}

	.close-button {
		--padding-start: 0;
		--padding-end: 0;
	}

	.popover-backdrop {
		pointer-events: none;
		background-color: #000;
		opacity: 0;
		z-index: 10;
		transition: opacity 200ms ease;

		&.popover-active {
			pointer-events: auto;
			opacity: 0.1;
		}
	}
</style>


<ion-item
	id="scaleToItemModalTrigger{ item.id }"
	button={ true }
	detail={ false }
>
	<ion-label>Scale { type === 'recipe' ? 'recipe' : 'group' } to item</ion-label>
</ion-item>

<ion-modal
	bind:this={ modalElement }
	trigger="scaleToItemModalTrigger{ item.id }"
	can-dismiss={ !isPopoverActive }
	on:willDismiss={ dismissPopover }
	on:didDismiss={ () => reset() }
	on:ionBackdropTap={ dismissPopover }
>
	<div class="modal-content">
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-button
					class="close-button"
					color="medium"
					title="close modal"
					on:click={ () => modalElement.dismiss() }
					on:keydown={ (e) => HEK(e, () => modalElement.dismiss()) }
				>
					<ion-icon
						slot="icon-only"
						icon={ closeOutline }
					></ion-icon>
				</ion-button>
			</ion-buttons>

			<ion-title>Scale { type === 'recipe' ? 'Recipe' : 'Group' } to Item</ion-title>

			<ion-buttons slot="end">
				<ion-button
					strong={ true }
					disabled={ saveClicked || temp.quantity == null || !temp.measurement }
					on:click={ save }
					on:keydown={ (e) => HEK(e, save) }
				>
					Save
				</ion-button>
			</ion-buttons>
		</ion-toolbar>

		<ion-list>
			<ion-item>
				<ion-input
					name="quantity"
					type="number"
					label="Quantity"
					label-placement="stacked"
					placeholder="Enter number"
					required={ true }
					disabled={ saveClicked }
					debounce={ 250 }
					on:ionInput={ handleInput }
				></ion-input>
			</ion-item>

			<ScaleToItemMeasurement
				bind:this={ scaleToItemMeasurementComponent }
				measurementType={ item.measurementType }
				measurement={ temp.measurement }
				quantity={ temp.quantity }
				on:update={ handleMeasurementUpdate }
				on:willPresent={ () => isPopoverActive = true }
				on:willDismiss={ () => isPopoverActive = false }
			/>
		</ion-list>
	</div>

	<ion-backdrop
		class="popover-backdrop"
		class:popover-active={ isPopoverActive }
		on:ionBackdropTap|stopPropagation={ dismissPopover }
	></ion-backdrop>
</ion-modal>
