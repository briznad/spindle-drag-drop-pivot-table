<script
	lang="ts"
	context="module"
>
	import { add } from 'ionicons/icons';

	import { HEK } from '$utilities/helper';
	import { parseItems } from '$utilities/parse-items';

	import { firestore } from '$services/firestore';

	import { userId } from '$stores/user';
</script>


<script lang="ts">
	export let type : 'list' | 'recipe';
	export let id   : string;

	let value     : string | undefined;
	let tempValue : string | undefined;

	let saving : boolean = false;

	function handlePaste(event : any) : void {
		tempValue = event?.clipboardData?.getData('text') ?? '';

		save();
	}

	function handleInput(event : any) : void {
		tempValue = event.detail?.value;
	}

	function handleChange() : void {
		save();
	}

	function handleClick() : void {
		save();
	}

	async function save() : Promise<void> {
		value = (tempValue ?? '').trim();

		if (!value || saving) {
			return;
		}

		saving = true;

		// split on newlines or carriage returns
		const valueArr = value.split(/\n|\r/)
			.map((item : string) => (item ?? '').trim())
			.filter((item : string) => item);

		const parsedItems = parseItems(valueArr);

		if (parsedItems.length === 0) {
			saving = false;

			return;
		}

		try {
			await firestore.addItems(type, id, $userId || '', parsedItems);

			value     = undefined;
			tempValue = undefined;
		} catch (error) {
			console.error(error);
		}

		saving = false;
	}
</script>


<style lang="scss">
	ion-item {
		&:not(:first-child) {
			margin-top: 10px
		}
	}

	ion-button {
		max-width: 26px;
	}

	ion-icon {
		min-width: 1em;
	}

	ion-textarea {
		--padding-top: 13px;
	}

	ion-note {
		font-size: 12px;
		color: var(--ion-color-step-550, #737373);
	}

	.helper-text {
		--min-height: 0;

		[slot="start"] {
			width: 26px;
		}
	}
</style>


<ion-item
	disabled={ saving }
>
	<ion-button
		slot="start"
		aria-label="add item"
		fill="clear"
		color={ tempValue ? 'primary' : 'dark' }
		disabled={ !tempValue }
		on:click={ handleClick }
		on:keydown={ (e) => HEK(e, handleClick) }
	>
		<ion-icon
			slot="icon-only"
			icon={ add }
		></ion-icon>
	</ion-button>

	<ion-input
		{ value }
		type="text"
		aria-label="new item"
		placeholder="New item"
		debounce={ 100 }
		on:paste|preventDefault={ handlePaste }
		on:ionInput={ handleInput }
		on:ionChange={ handleChange }
	></ion-input>
</ion-item>

<!-- <ion-item
	class="helper-text"
	lines="none"
>
	<div slot="start"></div>

	<ion-note>
		To add multiple items enter each item on a new line.
	</ion-note>
</ion-item> -->
