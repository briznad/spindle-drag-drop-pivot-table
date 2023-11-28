<script
	lang="ts"
	context="module"
>
	import { deepCopy, sleep } from 'briznads-helpers';

	import { firestore } from '$services/firestore';

	import { recipe } from '$stores/recipe';
	import { userId } from '$stores/user';

	import Item from '$components/Item.svelte';
</script>


<script lang="ts">
	const {
		id,
		sortBy,
		items,
	} = recipe;

	async function handleReorder(event : any) : Promise<void> {
		const { complete, from, to } = event.detail;

		let customOrder = ($items ?? [])
			.map(item => item.id);

		console.debug(customOrder);

		customOrder = await complete(customOrder);

		// const [ traveler ] = customOrder.splice(from, 1);

		// customOrder.splice(to, 0, traveler);

		console.debug(from, to);

		console.debug(customOrder);

		await sleep(1000);

		firestore.updateListOrRecipe('recipe', $id, $userId || '', {
			customOrder,
		});
	}
</script>


<style lang="scss"></style>


{#if ($items ?? []).length > 0 }
	<ion-reorder-group
		disabled={ $sortBy !== 'custom' }
		on:ionItemReorder={ handleReorder }
	>
		{#each $items ?? [] as item }
			<Item
				type="recipe"
				id={ $id }
				{ item }
			/>
		{/each}
	</ion-reorder-group>
{/if}
