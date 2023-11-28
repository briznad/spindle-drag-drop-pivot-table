<script
	lang="ts"
	context="module"
>
	import type { Settings } from '$types/user';
	import type { MeasurementType, Measurement } from '$types/measurement';

	import { checkmark } from 'ionicons/icons';

	import { createEventDispatcher } from 'svelte';

	import { HEK } from '$utilities/helper';
	import { pluralizeMeasurement, getMeasurementsByType, getMeasurementAbbreviation, getMeasurementTypes } from '$utilities/measurement';

	import { user } from '$stores/user';

	import PopoverListHeader from '$components/PopoverListHeader.svelte';


	type OptionPayload = {
		measurement  : Measurement;
		displayValue : string;
	};
</script>


<script lang="ts">
	export let measurementType : MeasurementType;
	export let measurement     : Measurement;
	export let quantity        : number;

	let popoverElement : HTMLIonPopoverElement;

	export function dismiss() : Promise<boolean> {
		return popoverElement.dismiss();
	}

	const dispatch = createEventDispatcher();

	function getOptionsList(type : MeasurementType, quantity : number, settings? : Settings) : OptionPayload[] {
		return getMeasurementsByType(type)
			.filter((measurement : Measurement) => measurement !== 'undefined')
			.map((measurement : Measurement) : OptionPayload => ({
				measurement,
				displayValue : getDisplayValue(type, measurement, quantity, settings),
			}));
	}

	function getDisplayValue(type : MeasurementType, measurement : Measurement, quantity? : number, settings? : Settings) : string {
		const abbreviation = settings?.showAbbreviations && getMeasurementAbbreviation(measurement, type);

		return (abbreviation || (measurement + pluralizeMeasurement(measurement, quantity ?? 0)));
	}

	function update(measurementType : MeasurementType, measurement : Measurement) : void {
		dispatch('update', {
			measurementType,
			measurement,
		});
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

		<div class="measurement-value">{ measurement != undefined && measurement !== 'undefined' ? getDisplayValue(measurementType, measurement, quantity, ($user || {}).settings) : 'Select' }</div>
	</ion-label>
</ion-item>


<ion-popover
	bind:this={ popoverElement }
	dismiss-on-select={ true }
	on:willPresent
	on:willDismiss
>
	<ion-list>
		{#each getMeasurementTypes() as type, index }
			{ @const list = getOptionsList(type, quantity, ($user || {}).settings) }

			<PopoverListHeader>{ type }</PopoverListHeader>

			{#each list as payload, groupIndex }
				<ion-item
					button={ true }
					detail={ false }
					lines={ list.length - 1 === groupIndex ? getMeasurementTypes().length - 1 === index ? 'none' : 'full' : undefined }
					disabled={ payload.measurement === measurement }
					on:click={ () => update(type, payload.measurement) }
					on:keydown={ (e) => HEK(e, () => update(type, payload.measurement)) }
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
		{/each}
	</ion-list>
</ion-popover>
