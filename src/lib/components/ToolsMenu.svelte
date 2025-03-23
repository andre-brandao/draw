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

	type LabeledTool = {
		id: Tool;
		name: string;
		icon: string;
	};
	// Drawing tools
	const drawingTools: LabeledTool[] = [
		{ id: 'cursor', name: 'Cursor', icon: '👆' },
		{ id: 'point', name: 'Point', icon: '•' },
		{ id: 'line', name: 'Line', icon: '/' },
		{ id: 'polygon', name: 'Polygon', icon: '△' },
		{ id: 'circle', name: 'Circle', icon: '○' }
	];

	// Selection tools
	const selectionTools: LabeledTool[] = [
		{ id: 'select_cursor', name: 'Select', icon: '✓' },
		{ id: 'select_box', name: 'Box Select', icon: '□' },
		{ id: 'move', name: 'Move', icon: '↔' },
		{ id: 'delete', name: 'Delete', icon: '🗑' }
	];
</script>

<div class="tools-menu">
	<div class="toolbar-section">
		<h3>Settings</h3>
		<div class="setting-option">
			<label for="clipping-toggle">
				<input type="checkbox" id="clipping-toggle" bind:checked={appState.snappingEnabled} />
				Enable Snapping
			</label>
		</div>
	</div>
	<div class="toolbar-section">
		<h3>Drawing Tools</h3>
		<div class="tool-buttons">
			{#each drawingTools as tool}
				<button
					class:active={appState.selectedTool === tool.id}
					onclick={() => (appState.selectedTool = tool.id)}
					title={tool.name}
				>
					<span class="tool-icon">{tool.icon}</span>
					<span class="tool-name">{tool.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="toolbar-section">
		<h3>Selection Tools</h3>
		<div class="tool-buttons">
			{#each selectionTools as tool}
				<button
					class:active={appState.selectedTool === tool.id}
					onclick={() => (appState.selectedTool = tool.id)}
					title={tool.name}
				>
					<span class="tool-icon">{tool.icon}</span>
					<span class="tool-name">{tool.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="toolbar-section">
		<h3>Selection Actions</h3>
		<div class="selection-actions">
			<button onclick={appState.selectAll}>Select All</button>
			<button onclick={appState.deselectAll}>Deselect All</button>
		</div>
	</div>

	<!-- <div class="toolbar-section">
		<h3>Colors</h3>
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
		<input
			type="color"
			value={appState.currentColor}
			oninput={(e) => {
				const value = (e.target as HTMLInputElement).value;

				appState.changeColor(value);
			}}
			class="color-picker"
		/>
	</div> -->

	<div class="toolbar-section">
		<h3>Rasterization</h3>
		<div class="rasterization-options">
			<label>
				<input
					type="radio"
					name="rasterizationAlgorithm"
					value="dda"
					checked={appState.rasterizationAlgorithm === 'dda'}
					onchange={() => (appState.rasterizationAlgorithm = 'dda')}
				/>
				DDA
			</label>
			<label>
				<input
					type="radio"
					name="rasterizationAlgorithm"
					value="bresenham"
					checked={appState.rasterizationAlgorithm === 'bresenham'}
					onchange={() => (appState.rasterizationAlgorithm = 'bresenham')}
				/>
				Bresenham
			</label>
		</div>
	</div>
</div>

<style>
	.tools-menu {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 15px;
		height: 100%;
		overflow-y: auto;
	}

	.toolbar-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #333;
		border-bottom: 1px solid #ddd;
		padding-bottom: 5px;
	}

	.tool-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.tool-buttons button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 8px;
		background-color: #ffffff;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tool-buttons button:hover {
		background-color: #f5f5f5;
	}

	.tool-buttons button.active {
		background-color: #e6f0ff;
		border-color: #0066cc;
		color: #0066cc;
	}

	.tool-icon {
		font-size: 18px;
		margin-bottom: 4px;
	}

	.tool-name {
		font-size: 12px;
	}

	.selection-actions {
		display: flex;
		gap: 8px;
	}

	.selection-actions button {
		flex: 1;
		padding: 8px;
		background-color: #ffffff;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}

	.selection-actions button:hover {
		background-color: #f5f5f5;
	}

	.rasterization-options {
		display: flex;
		gap: 15px;
	}

	.rasterization-options label {
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
	}

	.setting-option {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
		padding: 8px;
		background-color: #f5f5f5;
		border-radius: 4px;
	}

	.setting-option label {
		display: flex;
		align-items: center;
		font-weight: bold;
	}

	.setting-help {
		font-size: 0.8em;
		color: #666;
		margin-top: 4px;
		margin-left: 20px;
	}
</style>
