<script
	lang="ts"
	context="module"
>
	import type { Item } from '$types/item';
	import type { MeasurementType, Measurement } from '$types/measurement';

	import { closeOutline } from 'ionicons/icons';

	import { HEK } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId } from '$stores/user';

	import EditItemMeasurement from '$components/EditItemMeasurement.svelte';
</script>


<script lang="ts">
	export let type : 'list' | 'recipe';
	export let id   : string;
	export let item : Item;

	let temp : { quantity : number, description : string, measurementType : MeasurementType, measurement : Measurement };

	function reset(
		quantity?        : number,
		measurementType? : MeasurementType,
		measurement?     : Measurement,
		description?     : string,
	) : void {
		temp = {
			quantity        : quantity ?? item.quantity,
			measurementType : measurementType ?? item.measurementType,
			measurement     : measurement ?? item.measurement,
			description     : description ?? item.description,
		};
	}

	$: reset(item.quantity, item.measurementType, item.measurement, item.description);

	let modalElement : HTMLIonModalElement;

	function handleInput(event : any) {
		const name : 'quantity' | 'description' = event.target?.name;

		let value : undefined | number | string = event.detail?.value;

		if (name === 'quantity') {
			value = parseFloat(value as string);

			if (isNaN(value)) {
				value = undefined;
			}
		}

		temp = {
			...temp,
			[ name ] : value,
		};
	}

	let editItemMeasurementComponent : EditItemMeasurement;

	let isPopoverActive : boolean = false;

	function handleMeasurementUpdate(event : any) : void {
		temp = {
			...temp,
			...event.detail,
		};
	}

	function dismissPopover() : void {
		editItemMeasurementComponent.dismiss();
	}

	let saveClicked : boolean;

	async function save() : Promise<void> {
		saveClicked = true;

		await firestore.updateItem(type, id, item.id, $userId || '', temp);

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
	id="editItemModalTrigger{ item.id }"
	button={ true }
	detail={ false }
>
	<ion-label>Edit item</ion-label>
</ion-item>

<ion-modal
	bind:this={ modalElement }
	trigger="editItemModalTrigger{ item.id }"
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

			<ion-title>Edit Item</ion-title>

			<ion-buttons slot="end">
				<ion-button
					strong={ true }
					disabled={ saveClicked || temp.quantity == null || !temp.measurementType || !temp.measurement || !temp.description || (item.quantity === temp.quantity && item.measurementType === temp.measurementType && item.measurement === temp.measurement && item.description === temp.description) }
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
					label="Quantity (not scaled)"
					label-placement="stacked"
					placeholder="Enter number"
					value={ item.quantity }
					required={ true }
					disabled={ saveClicked }
					debounce={ 250 }
					on:ionInput={ handleInput }
				></ion-input>
			</ion-item>

			<EditItemMeasurement
				bind:this={ editItemMeasurementComponent }
				measurementType={ temp.measurementType }
				measurement={ temp.measurement }
				quantity={ temp.quantity }
				on:update={ handleMeasurementUpdate }
				on:willPresent={ () => isPopoverActive = true }
				on:willDismiss={ () => isPopoverActive = false }
			/>

			<ion-item>
				<ion-input
					name="description"
					label="Description"
					label-placement="stacked"
					placeholder="Enter text"
					value={ item.description }
					required={ true }
					disabled={ saveClicked }
					debounce={ 250 }
					on:ionInput={ handleInput }
				></ion-input>
			</ion-item>
		</ion-list>
	</div>

	<ion-backdrop
		class="popover-backdrop"
		class:popover-active={ isPopoverActive }
		on:ionBackdropTap|stopPropagation={ dismissPopover }
	></ion-backdrop>
</ion-modal>
