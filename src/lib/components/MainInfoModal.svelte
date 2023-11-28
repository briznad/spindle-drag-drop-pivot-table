<script
	lang="ts"
	context="module"
>
	import { closeOutline, createOutline } from 'ionicons/icons';

	import { HEK } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId } from '$stores/user';
</script>


<script lang="ts">
	export let type        : 'list' | 'recipe';
	export let id          : string;
	export let title       : string;
	export let description : string | undefined = undefined;

	let temp : { title : string, description? : string };

	function reset(passedTitle? : string, passedDescription? : string) : void {
		temp = {
			title       : passedTitle ?? title,
			description : passedDescription ?? description,
		}
	}

	$: reset(title, description);

	let modalElement : HTMLIonModalElement;

	function handleDidDismiss() : void {
		reset();
	}

	function handleInput(event : any) {
		const name  : 'title' | 'description' = event.target?.name;

		temp = {
			...temp,
			[ name ] : event.detail?.value,
		};
	}

	let saveClicked : boolean;

	async function save() : Promise<void> {
		saveClicked = true;

		await firestore.updateListOrRecipe(type, id, $userId || '', temp);

		await modalElement.dismiss();

		saveClicked = false;
	}
</script>


<style lang="scss">
	.main-info-modal-trigger {
		--padding-start: 0.5em;
		--padding-end: 0.5em;

		margin: 0;
		vertical-align: baseline;
		font-size: 12px;
	}

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
</style>


<ion-button
	id="mainInfoModalTrigger"
	class="main-info-modal-trigger"
	aria-label="show edit main info modal"
	fill="clear"
	size="small"
>
	<ion-icon
		slot="icon-only"
		icon={ createOutline }
	></ion-icon>
</ion-button>

<ion-modal
	bind:this={ modalElement }
	trigger="mainInfoModalTrigger"
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

			<ion-title>Edit Main Info</ion-title>

			<ion-buttons slot="end">
				<ion-button
					disabled={ saveClicked || !temp.title || (title === temp.title && description === temp.description) }
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
					name="title"
					label="Title"
					label-placement="stacked"
					placeholder="Enter text"
					value={ title }
					required={ true }
					disabled={ saveClicked }
					debounce={ 250 }
					on:ionInput={ handleInput }
				></ion-input>
			</ion-item>

			<ion-item>
				<ion-textarea
					name="description"
					label="Description"
					label-placement="stacked"
					placeholder="Enter text"
					value={ description }
					disabled={ saveClicked }
					debounce={ 250 }
					on:ionInput={ handleInput }
				></ion-textarea>
			</ion-item>
		</ion-list>
	</div>
</ion-modal>
