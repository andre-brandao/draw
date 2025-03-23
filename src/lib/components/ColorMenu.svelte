<script lang="ts">
	import { appState } from '$lib/global.svelte';
	import type { Tool } from '../../types';

	// Available colors
	const colors = [
		'#000000', // black
		'#FF0000', // red
		'#00FF00', // green
		'#0000FF', // blue
		'#FFFF00', // yellow
		'#FF00FF', // magenta
		'#00FFFF', // cyan
		'#FFFFFF' // white
	];
</script>

<div class="">
	<div class="color-grid">
		{#each colors as color}
			<div
				class="color-swatch"
				style:background-color={color}
				class:active={appState.currentColor === color}
				onclick={() => appState.changeColor(color)}
			></div>
		{/each}
	</div>
	<div style="display: flex; align-items: center;">
		Current:
		<input
			type="color"
			value={appState.currentColor}
			oninput={(e) => {
				const value = (e.target as HTMLInputElement).value;

				appState.changeColor(value);
			}}
			class="color-picker"
		/>
	</div>
</div>

<style>
	.color-swatch:hover {
		transform: scale(1.1);
	}

	.color-swatch.active {
		border: 2px solid #333;
		transform: scale(1.1);
	}

	.color-picker {
		width: 100%;
		height: 15px;
		padding: 0;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 8px;
		margin-bottom: 8px;
	}

	.color-swatch {
		width: 15px;
		height: 15px;
		border-radius: 4px;
		border: 1px solid #ddd;
		cursor: pointer;
		transition: transform 0.2s;
	}
</style>
