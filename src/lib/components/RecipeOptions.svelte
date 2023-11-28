<script
	lang="ts"
	context="module"
>
	import { options, closeOutline } from 'ionicons/icons';

	import { HEK } from '$utilities/helper';

	import { firestore } from '$services/firestore';

	import { userId, user } from '$stores/user';
	import { recipe } from '$stores/recipe';

	import ChunkyLabel from '$components/ChunkyLabel.svelte';
	import Sort from '$components/Sort.svelte';
	import Scale from '$components/Scale.svelte';
</script>


<script lang="ts">
	const {
		id,
		sortBy,
		scale,
	} = recipe;

	let modalElement : HTMLIonModalElement;

	function handleToggleChange(event : any) : void {
		const name  : 'showFractions' | 'showAbbreviations' = event.target?.name;
		const value : boolean                               = event.detail?.checked;

		firestore.updateUserSettings($userId || '', { [ name ] : value });
	}
</script>


<style lang="scss">
	.modal-trigger-button {
		max-width: 26px;

		ion-icon {
			min-width: 1em;
			transform: rotate(-90deg);
		}
	}

	.buttons-wrapper,
	.button-wrapper {
		display: flex;
		align-items: center;
	}

	.button-wrapper {
		+ .button-wrapper {
			&::before {
				content: '';
				display: block;
				width: 0.5px;
				height: 1.5em;
				margin-left: 2px;
				margin-right: 2px;
				background-color: #d7d8da;
			}
		}
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


<ion-item
	color="light"
	lines="full"
>
	<ion-button
		id="settingsModalTrigger"
		class="modal-trigger-button"
		slot="start"
		aria-label="show settings modal"
		fill="clear"
	>
		<ion-icon
			slot="icon-only"
			icon={ options }
		></ion-icon>
	</ion-button>

	<div
	class="buttons-wrapper"
		slot="end"
	>
		<div class="button-wrapper">
			<Scale
				type="recipe"
				id={ $id }
				scale={ $scale }
			/>
		</div>

		<div class="button-wrapper">
			<Sort
				type="recipe"
				id={ $id }
				sortBy={ $sortBy }
			/>
		</div>
	</div>
</ion-item>

<ion-modal
	bind:this={ modalElement }
	trigger="settingsModalTrigger"
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

			<ion-title>Settings</ion-title>
		</ion-toolbar>

		<ion-list>
			<ion-item>
				<ion-toggle
					checked={ ($user || {}).settings?.showFractions }
					name="showFractions"
					on:ionChange={ handleToggleChange }
				>
					<ChunkyLabel>Show Fractions</ChunkyLabel>
				</ion-toggle>
			</ion-item>

			<ion-item>
				<ion-toggle
					checked={ ($user || {}).settings?.showAbbreviations }
					name="showAbbreviations"
					on:ionChange={ handleToggleChange }
				>
					<ChunkyLabel>Show Abbreviations</ChunkyLabel>
				</ion-toggle>
			</ion-item>
		</ion-list>
	</div>
</ion-modal>
