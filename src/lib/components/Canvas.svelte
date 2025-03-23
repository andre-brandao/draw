<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '$lib/global.svelte';
	import Tooltip from './Tooltip.svelte';
	
	// Canvas props using Svelte 5 syntax
	const {
	  width = $bindable<number>(600),
	  height = $bindable<number>(600)
	} = $props<{
	  width?: number;
	  height?: number;
	}>();
	
	// Canvas element
	let canvas: HTMLCanvasElement | undefined = $state();
	
	// Initialize canvas on mount
	onMount(() => {
	  if (canvas) {
		appState.canvas = canvas;
		appState.width = width;
		appState.height = height;
	  }
	});
	
	// Watch for width/height changes
	$effect(() => {
	  if (appState.width !== width) {
		appState.width = width;
	  }
	  
	  if (appState.height !== height) {
		appState.height = height;
	  }

	  appState.redraw()
	});
  </script>
  
  <div class="canvas-container">
	<canvas
	  bind:this={canvas}
	  width={appState.width}
	  height={appState.height}
	  onmousedown={appState.handleMouseDown}
	  onmousemove={appState.handleMouseMove}
	  onmouseup={appState.handleMouseUp}
	></canvas>
	
	<Tooltip 
	  x={appState.tooltip.x}
	  y={appState.tooltip.y}
	  text={appState.tooltip.text}
	  visible={appState.tooltip.visible}
	/>
  </div>
  
  <style>
	.canvas-container {
	  position: relative;
	}
	
	canvas {
	  border: 1px solid #ccc;
	  background-color: white;
	  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
  </style>