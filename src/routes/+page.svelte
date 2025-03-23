<script lang="ts">
	import { onMount } from 'svelte';
	import { innerHeight, innerWidth } from 'svelte/reactivity/window';
	import Canvas from '$lib/components/Canvas.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import TabMenu from '$lib/components/TabMenu.svelte';
	import { appState } from '$lib/global.svelte';

	// App state
	let canvasWidth = $state(800);
	let canvasHeight = $state(600);

	// Handle window resize
	$effect(() => {
		if (innerWidth.current && innerHeight.current) {
			canvasWidth = Math.min(1200, innerWidth.current - 300);
			canvasHeight = Math.min(800, innerHeight.current - 100);
		}
	});

	onMount(() => {
		// Initialize any app-level setup here
	});
</script>

<main>
	<div class="paint-app">
		<TabMenu />

		<div class="canvas-container">
			<div class="header">
				<h1>Deds Paint</h1>
				<div class="tool-info">
					Current tool: <span class="tool-name">{appState.selectedTool}</span>
				</div>
			</div>

			<Canvas width={canvasWidth} height={canvasHeight} />
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
