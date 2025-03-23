<script lang="ts">
	import { appState } from '$lib/global.svelte';

	let { x, y, text, visible } = $props<{
		x: number;
		y: number;
		text: string;
		visible: boolean;
	}>();
	// Transformation parameters
	let transformType = $state('translate');
	let translateX = $state(0);
	let translateY = $state(0);
	let rotateAngle = $state(0);
	let scaleX = $state(1);
	let scaleY = $state(1);
	let reflectionType = $state('x');

	// Apply the transformation
	function applyTransform() {
		switch (transformType) {
			case 'translate':
				appState.transformSelectedShapes({
					type: 'translate',
					dx: translateX,
					dy: translateY
				});
				break;
			case 'rotate':
				appState.transformSelectedShapes({
					type: 'rotate',
					angle: rotateAngle,
					originX: x,
					originY: y
				});
				break;
			case 'scale':
				appState.transformSelectedShapes({
					type: 'scale',
					scaleX: scaleX,
					scaleY: scaleY,
					originX: x,
					originY: y
				});
				break;
			case 'reflect':
				appState.transformSelectedShapes({
					type: 'reflect',

					axis: reflectionType as 'x' | 'y' | 'xy',
					originX: x,
					originY: y
				});
				break;
		}
	}

	// Reset transformation inputs
	function resetInputs() {
		translateX = 0;
		translateY = 0;
		rotateAngle = 0;
		scaleX = 1;
		scaleY = 1;
		reflectionType = 'x';
	}

	function deleteSelected() {
		appState.deleteSelectedShapes();
		visible = false;
	}
</script>

{#if visible}
	<div class="tooltip" style="left: {x}px; top: {y - 50}px;">
		<div class="tooltip-header">
			{text}
		</div>

		<div class="transformation-controls">
			<div class="control-row">
				<label class="control-label">Transform:</label>
				<select bind:value={transformType}>
					<option value="translate">Translation</option>
					<option value="rotate">Rotation</option>
					<option value="scale">Scale</option>
					<option value="reflect">Reflection</option>
				</select>
			</div>

			{#if transformType === 'translate'}
				<div class="control-group">
					<div class="control-row">
						<label class="control-label">X:</label>
						<input type="number" bind:value={translateX} />
					</div>
					<div class="control-row">
						<label class="control-label">Y:</label>
						<input type="number" bind:value={translateY} />
					</div>
				</div>
			{/if}

			{#if transformType === 'rotate'}
				<div class="control-group">
					<div class="control-row">
						<label class="control-label">Angle (deg):</label>
						<input type="number" bind:value={rotateAngle} />
					</div>
					<div class="control-row">
						<label class="control-label">Presets:</label>
						<div class="preset-buttons">
							<button class="preset-button" onclick={() => (rotateAngle = 45)}>45°</button>
							<button class="preset-button" onclick={() => (rotateAngle = 90)}>90°</button>
							<button class="preset-button" onclick={() => (rotateAngle = 180)}>180°</button>
						</div>
					</div>
				</div>
			{/if}

			{#if transformType === 'scale'}
				<div class="control-group">
					<div class="control-row">
						<label class="control-label">X:</label>
						<input type="number" step="0.1" bind:value={scaleX} />
					</div>
					<div class="control-row">
						<label class="control-label">Y:</label>
						<input type="number" step="0.1" bind:value={scaleY} />
					</div>
				</div>
			{/if}

			{#if transformType === 'reflect'}
				<div class="control-group">
					<div class="control-row">
						<label class="control-label">Axis:</label>
						<select bind:value={reflectionType}>
							<option value="x">X axis</option>
							<option value="y">Y axis</option>
							<option value="xy">X=Y line</option>
						</select>
					</div>
				</div>
			{/if}

			<div class="button-row">
				<button class="apply-button" onclick={applyTransform}>Apply</button>
				<button class="delete-button" onclick={() => deleteSelected()}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.tooltip {
		position: absolute;
		background-color: rgba(30, 30, 30, 0.95);
		color: white;
		padding: 10px;
		border-radius: 4px;
		font-size: 12px;
		transform: translate(-50%, -100%);
		z-index: 100;
		min-width: 200px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tooltip-header {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 8px;
		margin-bottom: 8px;
		font-weight: bold;
	}

	.transformation-controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 6px 0;
		padding: 8px;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
	}

	.control-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.control-label {
		margin-right: 8px;
		min-width: 70px;
	}

	select,
	input {
		background-color: #333;
		color: white;
		border: 1px solid #555;
		border-radius: 3px;
		padding: 4px;
		flex: 1;
		min-width: 70px;
	}

	.button-row {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		margin-top: 8px;
	}

	button {
		padding: 6px 12px;
		border: none;
		border-radius: 3px;
		cursor: pointer;
		font-weight: bold;
		flex: 1;
	}
	.delete-button {
		background-color: #e74c3c;
		color: white;
	}

	.delete-button:hover {
		background-color: #c0392b;
	}
	.preset-buttons {
		display: flex;
		gap: 4px;
	}

	.preset-button {
		padding: 2px 6px;
		font-size: 11px;
		background-color: #444;
		min-width: auto;
		flex: 0;
	}

	.preset-button:hover {
		background-color: #555;
	}
	.apply-button {
		background-color: #2a7de1;
		color: white;
	}

	.apply-button:hover {
		background-color: #1a6ed1;
	}

	.reset-button {
		background-color: #555;
		color: white;
	}

	.reset-button:hover {
		background-color: #444;
	}
</style>
