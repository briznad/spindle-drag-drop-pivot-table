<script
	lang="ts"
	context="module"
>
	import type { Settings } from '$types/user';
	import type { MeasurementType, Measurement } from '$types/measurement';

	import { checkmark } from 'ionicons/icons';

	import { createEventDispatcher } from 'svelte';

	import { HEK } from '$utilities/helper';
	import { getMeasurementsByType, pluralizeMeasurement, getMeasurementAbbreviation } from '$utilities/measurement';

	import { user } from '$stores/user';

	import PopoverListHeader from '$components/PopoverListHeader.svelte';


	type OptionPayload = {
		measurement  : Measurement;
		displayValue : string;
	};
</script>


<script lang="ts">
	export let measurementType : MeasurementType;
	export let measurement     : undefined | Measurement;
	export let quantity        : undefined | number;

	let popoverElement : HTMLIonPopoverElement;

	export function dismiss() : Promise<boolean> {
		return popoverElement.dismiss();
	}

	const dispatch = createEventDispatcher();

	function getOptionsList(quantity? : number, settings? : Settings) : OptionPayload[] {
		return getMeasurementsByType(measurementType)
		.filter((measurement : Measurement) => measurement !== 'undefined')
			.map((measurement : Measurement) : OptionPayload => ({
				measurement,
				displayValue : getDisplayValue(measurement, quantity, settings),
			}));
	}

	function getDisplayValue(measurement : Measurement, quantity? : number, settings? : Settings) : string {
		const abbreviation = settings?.showAbbreviations && getMeasurementAbbreviation(measurement, measurementType);

		return (abbreviation || (measurement + pluralizeMeasurement(measurement, quantity ?? 0)));
	}

	function update(measurement : Measurement) : void {
		dispatch('update', measurement);
	}
</script>


<style lang="scss">
	.measurement-label {
		font-size: 0.75rem;
	}

	.measurement-value {
		margin-top: 5px;
		text-decoration-line: underline;
		text-decoration-style: dotted;
		text-decoration-color: #92949c;
		color: #666;

		&.has-measurement {
			color: #000;
		}
	}

	ion-popover {
		--width: fit-content;
	}
</style>


<ion-item
	button={ true }
	detail={ false }
	on:click={ () => popoverElement.present() }
	on:keydown={ (e) => HEK(e, () => popoverElement.present()) }
>
	<ion-label>
		<div class="measurement-label">Measurement</div>

		<div
			class="measurement-value"
			class:has-measurement={ measurement != null }
		>{ measurement != null ? getDisplayValue(measurement, quantity, ($user || {}).settings) : 'Select' }</div>
	</ion-label>
</ion-item>


<ion-popover
	bind:this={ popoverElement }
	dismiss-on-select={ true }
	on:willPresent
	on:willDismiss
>
	<ion-list>
		<PopoverListHeader>convert measurement</PopoverListHeader>

		{#each getOptionsList(quantity, ($user || {}).settings) as payload, index }
			<ion-item
				button={ true }
				detail={ false }
				disabled={ payload.measurement === measurement }
				lines={ getMeasurementsByType(measurementType).length - 1 === index ? 'none' : undefined }
				on:click={ () => update(payload.measurement) }
				on:keydown={ (e) => HEK(e, () => update(payload.measurement)) }
			>
				<ion-label>{ payload.displayValue }</ion-label>

				{#if payload.measurement === measurement }
					<ion-icon
						slot="end"
						icon={ checkmark }
					></ion-icon>
				{/if}
			</ion-item>
		{/each}
	</ion-list>
</ion-popover>
