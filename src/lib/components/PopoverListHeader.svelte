<script
	lang="ts"
	context="module"
>
	import ChunkyLabel from '$components/ChunkyLabel.svelte';
</script>


<script lang="ts">
	export let allcaps : boolean = true;
</script>


<style lang="scss">
	.popover-list-header {
		--min-height: 0;

		:global(.chunky-label) {
			opacity: 0.75;
		}
	}
</style>


<ion-item
	class="popover-list-header"
	lines="full"
>
	<ion-label>
		<ChunkyLabel { allcaps }>
			<slot></slot>
		</ChunkyLabel>
	</ion-label>
</ion-item>
