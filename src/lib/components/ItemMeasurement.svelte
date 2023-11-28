<script
	lang="ts"
	context="module"
>
	import type { Settings } from '$types/user';
	import type { Item } from '$types/item';
	import type { MeasurementType, Measurement } from '$types/measurement';

	import { checkmark } from 'ionicons/icons';

	import { HEK, round, getFraction } from '$utilities/helper';
	import { getMeasurementsByType, pluralizeMeasurement, getMeasurementConversion, getMeasurementAbbreviation } from '$utilities/measurement';

	import { firestore } from '$services/firestore';

	import { userId, user } from '$stores/user';
	import { recipe } from '$stores/recipe';

	import PopoverListHeader from '$components/PopoverListHeader.svelte';


	type OptionPayload = {
		measurement  : Measurement;
		quantity     : number;
		displayValue : string;
		type?        : MeasurementType;
	};
</script>


<script lang="ts">
	export let type : 'list' | 'recipe';
	export let id   : string;
	export let item : Item;

	const {
		scale,
	} = recipe;

	let sourceMeasurement : number;

	$: sourceMeasurement = getMeasurementConversion(item.measurement, item.measurementType) ?? 1;

	let altOption : OptionPayload | undefined;

	function getOptionsList(itemMeasurement : Measurement, quantity : number, settings? : Settings) : OptionPayload[] {
		altOption = undefined;

		return getMeasurementsByType(item.measurementType)
			.filter((measurement : Measurement) => measurement !== 'undefined')
			.map((measurement : Measurement) : OptionPayload => {
				const quantity : number = getQuantity(getMeasurementConversion(measurement, item.measurementType) as number);

				const payload = {
					measurement,
					quantity,
					displayValue : getDisplayValue(settings, undefined, measurement, quantity, true),
				};

				if (['ounce', 'fluid ounce'].includes(measurement)) {
					setAltOption(payload, settings);
				}

				return payload;
			});
	}

	function getQuantity(conversion : number) : number {
		return conversion === undefined || sourceMeasurement === undefined
			? 1
			: item.quantity / sourceMeasurement * conversion;
	}

	function getDisplayValue(settings? : Settings, type? : MeasurementType, measurement? : Measurement, quantity? : number, includeQuantity : boolean = false) : string {
		const calculatedQuantity = (quantity ?? item.quantity) * $scale;

		const thisType = type ?? item.measurementType;
		const thisMeasurement = measurement ?? item.measurement;

		const abbreviation = settings?.showAbbreviations && getMeasurementAbbreviation(thisMeasurement, thisType);

		let displayQuantity : string = '';

		if (includeQuantity && thisType !== 'count') {
			displayQuantity = ' — ';

			displayQuantity += settings?.showFractions
				? getFraction(calculatedQuantity)
				: round(calculatedQuantity).toString();
		}

		return (abbreviation || (thisMeasurement + pluralizeMeasurement(thisMeasurement, calculatedQuantity))) + displayQuantity;
	}

	function setAltOption(payload : OptionPayload, settings? : Settings) : void {
		const measurement = payload.measurement === 'ounce'
			? 'fluid ounce'
			: 'ounce';

		const type = measurement === 'ounce'
			? 'weight'
			: 'volume';

		altOption = {
			...payload,
			measurement,
			type,
			displayValue : getDisplayValue(settings, type, measurement, payload.quantity, true),
		};
	}

	function update(measurement : Measurement, quantity : number, measurementType? : MeasurementType) : void {
		const update : Partial<Item> = {
			measurement,
			quantity,
		};

		if (measurementType) {
			update.measurementType = measurementType;
		}

		firestore.updateItem(type, id, item.id, $userId || '', update);
	}
</script>


<style lang="scss">
	.measurement-popover-trigger {
		margin: 0;
		text-decoration-line: underline;
		text-decoration-style: dotted;
		text-decoration-color: #92949c;
		font-size: 16px;
	}

	ion-popover {
		--width: fit-content;
	}
</style>


<ion-button
	id="measurementPopoverTrigger{ item.id }"
	class="measurement-popover-trigger"
	fill="clear"
	color="dark"
>{ item.measurement ? getDisplayValue(($user || {}).settings) : 'Select measurement' }</ion-button>

<ion-popover
	trigger="measurementPopoverTrigger{ item.id }"
	dismiss-on-select={ true }
>
	<ion-list>
		<PopoverListHeader>convert measurement</PopoverListHeader>

		{#each getOptionsList(item.measurement, item.quantity, ($user || {}).settings) as payload, index }
			<ion-item
				button={ true }
				detail={ false }
				disabled={ payload.measurement === item.measurement }
				lines={ getMeasurementsByType(item.measurementType).length - 1 === index ? 'full' : undefined }
				on:click={ () => update(payload.measurement, payload.quantity) }
				on:keydown={ (e) => HEK(e, () => update(payload.measurement, payload.quantity)) }
			>
				<ion-label>{ payload.displayValue }</ion-label>

				{#if payload.measurement === item.measurement }
					<ion-icon
						slot="end"
						icon={ checkmark }
					></ion-icon>
				{/if}
			</ion-item>
		{/each}

		{#if altOption !== undefined }
			<PopoverListHeader>convert to { altOption.type }</PopoverListHeader>

			<ion-item
				lines="none"
				button={ true }
				detail={ false }
				on:click={ () => update(altOption.measurement, altOption.quantity, altOption.type) }
				on:keydown={ (e) => HEK(e, () => update(altOption.measurement, altOption.quantity, altOption.type)) }
			>
				<ion-label>{ altOption.displayValue }</ion-label>
			</ion-item>
		{/if}
	</ion-list>
</ion-popover>
