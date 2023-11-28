<script
	lang="ts"
	context="module"
>
	import ChunkyLabel from '$components/ChunkyLabel.svelte';
</script>


<script lang="ts">
	export let text    : string;
	export let id      : string;
	export let icon    : string;
	export let allcaps : boolean = true;
</script>


<style lang="scss">
	ion-button {
		margin: 0;

		:global(.chunky-label) {
			color: inherit;
			font-size: inherit;
		}

		ion-icon {
			margin-inline-start: 0.2em;
			font-size: 1.2em;
		}
	}
</style>


<ion-button
	{ id }
	class="scale-sort-trigger-button"
	fill="clear"
>
	<ChunkyLabel { allcaps }>{ text }</ChunkyLabel>

	<ion-icon
		slot="end"
		{ icon }
	></ion-icon>
</ion-button>
