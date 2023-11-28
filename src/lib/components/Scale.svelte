<script
	lang="ts"
	context="module"
>
	import { closeOutline, checkmark, resize } from 'ionicons/icons';

	import { HEK, getFraction, round } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId, user } from '$stores/user';

	import ScaleSortTriggerButton from '$components/ScaleSortTriggerButton.svelte';
	import PopoverListHeader from '$components/PopoverListHeader.svelte';
    import type { User } from '$types/user';


	const optionsList : number[] = [
		0.25,
		0.33333,
		0.5,
		0.66667,
		0.75,
		1,
		1.5,
		2,
		3,
		4,
	];
</script>


<script lang="ts">
	export let type  : 'list' | 'recipe';
	export let id    : string;
	export let scale : number | undefined;

	let tempScale : number | undefined;

	function reset(passedScale? : number) : void {
		tempScale = passedScale ?? scale;
	}

	$: reset(scale);

	function getButtonText($user : null | false | User, scale : undefined | number) : string {
		const showFractions = ($user || {}).settings?.showFractions;

		let displayScale = showFractions
			? getFraction(scale ?? 1)
			: (scale ?? 1).toString();

		if ((scale ?? 1) >= 1) {
			displayScale += 'x';
		}

		return displayScale;
	}

	let modalElement : HTMLIonModalElement;

	function handleDidDismiss() : void {
		reset();
	}

	function update(value : number) : void {
		firestore.updateListOrRecipe(type, id, $userId || '', {
			scale : value,
		});
	}

	function handleCustomInput(event : any) {
		tempScale = parseFloat(event.detail?.value) || undefined;
	}

	let saveClicked : boolean;

	async function saveCustom() : Promise<void> {
		saveClicked = true;

		await firestore.updateListOrRecipe(type, id, $userId || '', {
			scale : tempScale ?? 1,
		});

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

	ion-title {
		text-transform: capitalize;
	}
</style>


<ScaleSortTriggerButton
	id="scalePopoverTrigger"
	text={ getButtonText($user, scale) }
	icon={ resize }
	allcaps={ false }
/>

<ion-popover
	trigger="scalePopoverTrigger"
	dismiss-on-select={ true }
>
	<ion-list>
		<PopoverListHeader>scale by</PopoverListHeader>

		{#each optionsList as option }
			<ion-item
				button={ true }
				detail={ false }
				disabled={ saveClicked || round(scale ?? 1) === option }
				on:click={ () => update(option) }
				on:keydown={ (e) => HEK(e, () => update(option)) }
			>
				<ion-label>{ ($user || {}).settings?.showFractions ? getFraction(option) : option }</ion-label>

				{#if round(scale ?? 1) === option }
					<ion-icon
						slot="end"
						icon={ checkmark }
					></ion-icon>
				{/if}
			</ion-item>
		{/each}

		<ion-item
			lines="none"
			button={ true }
			detail={ false }
			disabled={ saveClicked }
			on:click={ () => modalElement.present() }
			on:keydown={ (e) => HEK(e, () => modalElement.present()) }
		>
			<ion-label>Custom</ion-label>

			{#if scale !== undefined && !optionsList.includes(round(scale)) }
				<ion-icon
					slot="end"
					icon={ checkmark }
				></ion-icon>
			{/if}
		</ion-item>
	</ion-list>
</ion-popover>

<ion-modal
	bind:this={ modalElement }
	on:didDismiss={ handleDidDismiss }
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

			<ion-title>Scale { type }</ion-title>

			<ion-buttons slot="end">
				<ion-button
					disabled={ saveClicked || !tempScale || scale === tempScale }
					on:click={ saveCustom }
					on:keydown={ (e) => HEK(e, saveCustom) }
				>
					Save
				</ion-button>
			</ion-buttons>
		</ion-toolbar>

		<ion-content>
			<ion-list>
				<ion-item>
					<ion-input
						value={ scale }
						type="number"
						min={ 0.001 }
						label="Scale by"
						label-placement="stacked"
						placeholder="Enter number"
						required={ true }
						disabled={ saveClicked }
						debounce={ 500 }
						on:ionInput={ handleCustomInput }
					></ion-input>
				</ion-item>
			</ion-list>
		</ion-content>
	</div>
</ion-modal>
