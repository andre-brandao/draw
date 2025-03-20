<script lang="ts">
	import { onMount } from 'svelte';
	import { innerHeight, innerWidth } from 'svelte/reactivity/window';
	// CONST
	let width = 600;
	let height = 600;

	type Selectable = {
		selected: boolean;
	};

	type Colorable = {
		// todo add
		color: string; // add color property
	};

	type Point = Selectable &
		Colorable & {
			x: number;
			y: number;
		};

	type Line = Selectable &
		Colorable & {
			start: Point;
			end: Point;
		};

	type Polygon = Selectable &
		Colorable & {
			points: Point[];
		};

	type Tool =
		| 'point' // add point
		| 'line' // add line
		| 'polygon' // add polygon
		| 'select_box' // select box
		| 'select_cursor' // select individual Selectables
		| 'move' // move Selectables
		| 'delete' // delete Selectables
		| 'cursor'; // default cursor

	let selectedTool: Tool = $state('cursor');
	// CANVAS
	let canvas: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | undefined = $state();
	onMount(() => {
		ctx = canvas?.getContext('2d') ?? undefined;
	});
	// FUNCTIONS
</script>

<div class="nav"></div>
<canvas
	{width}
	{height}
	bind:this={canvas}
	onmousedown={(e) => {
		// handle mouse down
	}}
	onmousemove={(e) => {
		// handle mouse move
	}}
	onmouseup={(e) => {
		// handle mouse up
	}}
	onclick={(e) => {
		// handle click
	}}
></canvas>
