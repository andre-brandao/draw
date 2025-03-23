<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '$lib/global.svelte';

	let drawingName = $state('');
	let savedDrawings = $state<{ name: string; timestamp: string }[]>([]);
	let message = $state('');
	let messageType = $state<'success' | 'error'>('success');

	// Load saved drawings
	function loadSavedDrawings() {
		savedDrawings = appState.getSavedDrawings();
	}

	// Show message
	function showMessage(text: string, type: 'success' | 'error') {
		message = text;
		messageType = type;
		setTimeout(() => {
			message = '';
		}, 3000);
	}

	// Handle save
	function handleSave() {
		if (!drawingName.trim()) {
			drawingName = 'Untitled: ' + new Date().getTime();
			// showMessage('Please enter a drawing name', 'error');
			// return;
		}

		const success = appState.saveDrawing(drawingName);
		if (success) {
			showMessage('Drawing saved successfully!', 'success');
			loadSavedDrawings();
			drawingName = '';
		} else {
			showMessage('Failed to save drawing', 'error');
		}
	}

	// Handle load
	function handleLoad(name: string) {
		const success = appState.loadDrawing(name);
		if (success) {
			showMessage(`Loaded drawing: ${name}`, 'success');
		} else {
			showMessage('Failed to load drawing', 'error');
		}
	}

	// Handle delete
	function handleDelete(name: string) {
		if (confirm(`Are you sure you want to delete "${name}"?`)) {
			const success = appState.deleteSavedDrawing(name);
			if (success) {
				showMessage(`Deleted drawing: ${name}`, 'success');
				loadSavedDrawings();
			} else {
				showMessage('Failed to delete drawing', 'error');
			}
		}
	}

	// New drawing
	function newDrawing() {
		if (confirm('Start a new drawing? Current changes will be lost.')) {
			appState.resetState();
			showMessage('Started new drawing', 'success');
		}
	}

	onMount(() => {
		loadSavedDrawings();
	});
</script>

<div class="save-menu">
	<div class="toolbar-section">
		<h3>Save Drawing</h3>
		<div class="save-form">
			<input type="text" placeholder="Drawing name" bind:value={drawingName} />
		</div>
		<button onclick={handleSave}>Save</button>
	</div>

	<div class="toolbar-section">
		<h3>Saved Drawings</h3>
		<button class="new-drawing" onclick={newDrawing}>New Drawing</button>

		{#if savedDrawings.length === 0}
			<p class="no-drawings">No saved drawings</p>
		{:else}
			<ul class="drawings-list">
				{#each savedDrawings as drawing}
					<li>
						<span class="drawing-name">{drawing.name}</span>
						<span class="drawing-date">{new Date(drawing.timestamp).toLocaleString()}</span>
						<div class="drawing-actions">
							<button onclick={() => handleLoad(drawing.name)}>Load</button>
							<button class="delete-btn" onclick={() => handleDelete(drawing.name)}>×</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if message}
		<div class="message {messageType}">
			{message}
		</div>
	{/if}
</div>

<style>
	.save-menu {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 15px;
		height: 100%;
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

	.save-form {
		display: flex;
		gap: 8px;
	}

	input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 8px 12px;
		background-color: #ffffff;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #f5f5f5;
	}

	.new-drawing {
		background-color: #4caf50;
		color: white;
		border: none;
		margin-bottom: 10px;
	}

	.new-drawing:hover {
		background-color: #45a049;
	}

	.drawings-list {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 300px;
		overflow-y: auto;
	}

	.drawings-list li {
		display: flex;
		flex-direction: column;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-bottom: 8px;
		background-color: white;
	}

	.drawing-name {
		font-weight: bold;
	}

	.drawing-date {
		font-size: 11px;
		color: #666;
	}

	.drawing-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 5px;
	}

	.delete-btn {
		background-color: #e74c3c;
		color: white;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		font-size: 16px;
	}

	.delete-btn:hover {
		background-color: #c0392b;
	}

	.no-drawings {
		color: #666;
		font-style: italic;
		margin: 10px 0;
	}

	.message {
		padding: 8px;
		border-radius: 4px;
		margin-top: 10px;
		text-align: center;
	}

	.success {
		background-color: #dff0d8;
		color: #3c763d;
	}

	.error {
		background-color: #f2dede;
		color: #a94442;
	}
</style>
