<script lang="ts">
	import { onMount } from 'svelte';
	import { innerHeight, innerWidth } from 'svelte/reactivity/window';
	import type { Tool } from '../types';
	import Canvas from './Canvas.svelte';
	import Toolbar from './Toolbar.svelte';

	// App state
	let selectedTool = $state<Tool>('cursor');
    // Current color
    let currentColor: string = $state('#000000');
    
	let canvasWidth = $state(800);
	let canvasHeight = $state(600);

	// References to canvas methods
	let canvasComponent: any;

	// Handle window resize
	$effect(() => {
		if (innerWidth && innerHeight) {
			canvasWidth = Math.min(1200, (innerWidth.current ?? 0) - 300);
			canvasHeight = Math.min(800, (innerHeight.current ?? 0)	 - 100);
		}
	});

	// Handle toolbar actions
	function handleSelectAll() {
		if (canvasComponent) canvasComponent.selectAll();
	}

	function handleDeselectAll() {
		if (canvasComponent) canvasComponent.deselectAll();
	}

	function handleColorChange(color: string) {
		if (canvasComponent) canvasComponent.changeColor(color);
	}

	onMount(() => {
		// Initialize any app-level setup here
	});
</script>

<main>
	<div class="paint-app">
		<Toolbar
			bind:selectedTool
			bind:currentColor
			onSelectAll={handleSelectAll}
			onDeselectAll={handleDeselectAll}
			onColorChange={handleColorChange}
		/>

		<div class="canvas-container">
			<div class="header">
				<h1>Svelte 5 Paint</h1>
				<div class="tool-info">Current tool: <span class="tool-name">{selectedTool}</span></div>
			</div>

			<Canvas
				bind:this={canvasComponent}
				bind:selectedTool
				width={canvasWidth}
				height={canvasHeight}
			/>

			<div class="instructions">
				<p>
					<strong>Tips:</strong>
					For polygon tool, click near the first point to complete the shape. Selected shapes are highlighted.
					Use cursor tool to select and move shapes.
				</p>
			</div>
		</div>
	</div>
</main>

<style>
	.paint-app {
		display: flex;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.canvas-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20px;
		background-color: #f8f8f8;
		overflow: auto;
		align-items: center;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-bottom: 20px;
	}

	h1 {
		margin: 0;
		font-size: 24px;
		color: #333;
	}

	.tool-info {
		font-size: 14px;
		color: #555;
	}

	.tool-name {
		font-weight: bold;
		text-transform: capitalize;
	}

	.instructions {
		margin-top: 16px;
		font-size: 13px;
		color: #666;
		max-width: 800px;
		text-align: center;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}
</style>
