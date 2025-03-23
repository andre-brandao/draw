<script lang="ts">
	import { appState } from '$lib/global.svelte';
	
	// Available colors
	const colors = [
	  '#000000', // black
	  '#FF0000', // red
	  '#00FF00', // green
	  '#0000FF', // blue
	  '#FFFF00', // yellow
	  '#FF00FF', // magenta
	  '#00FFFF', // cyan
	  '#FFFFFF', // white
	];

	// Add a state for rasterization algorithm
	// let rasterizationAlgorithm = $state('dda'); // 'dda', 'bresenham'
	
	// // Update the app state when algorithm changes
	// $effect(() => {
	//   appState.rasterizationAlgorithm = rasterizationAlgorithm;
	// });
  </script>
  
  <div class="toolbar">
	<div class="toolbar-section">
	  <h3>Tools</h3>
	  <div class="tool-buttons">
		<button 
		  class:active={appState.selectedTool === 'cursor'} 
		  on:click={() => appState.selectedTool = 'cursor'}
		  title="Cursor"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7-4.1 4z" fill="currentColor"/>
		  </svg>
		  Cursor
		</button>
		
		<button 
		  class:active={appState.selectedTool === 'point'} 
		  on:click={() => appState.selectedTool = 'point'}
		  title="Draw Point"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<circle cx="12" cy="12" r="5" fill="currentColor"/>
		  </svg>
		  Point
		</button>
		
		<button 
		  class:active={appState.selectedTool === 'line'} 
		  on:click={() => appState.selectedTool = 'line'}
		  title="Draw Line"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" stroke-width="2"/>
		  </svg>
		  Line
		</button>
		
		<button 
		  class:active={appState.selectedTool === 'polygon'} 
		  on:click={() => appState.selectedTool = 'polygon'}
		  title="Draw Polygon"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<polygon points="12,5 19,12 12,19 5,12" fill="currentColor"/>
		  </svg>
		  Polygon
		</button>

		<button 
		  class:active={appState.selectedTool === 'circle'} 
		  on:click={() => appState.selectedTool = 'circle'}
		  title="Draw Circle"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
		  </svg>
		  Circle
		</button>
	  </div>
	</div>
	
	<div class="toolbar-section">
	  <h3>Selection</h3>
	  <div class="tool-buttons">
		<button 
		  class:active={appState.selectedTool === 'select_cursor'} 
		  on:click={() => appState.selectedTool = 'select_cursor'}
		  title="Select Single"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7-4.1 4z" fill="currentColor"/>
			<circle cx="19" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1"/>
		  </svg>
		  Select
		</button>
		
		<button 
		  class:active={appState.selectedTool === 'select_box'} 
		  on:click={() => appState.selectedTool = 'select_box'}
		  title="Select Box"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2"/>
		  </svg>
		  Box Select
		</button>
		
		<button 
		  on:click={appState.selectAll}
		  title="Select All"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"/>
			<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
		  </svg>
		  Select All
		</button>
		
		<button 
		  on:click={appState.deselectAll}
		  title="Deselect All"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"/>
			<path d="M9 9l6 6 M15 9l-6 6" stroke="currentColor" stroke-width="2"/>
		  </svg>
		  Deselect All
		</button>
	  </div>
	</div>
	
	<div class="toolbar-section">
	  <h3>Actions</h3>
	  <div class="tool-buttons">
		<button 
		  class:active={appState.selectedTool === 'move'} 
		  on:click={() => appState.selectedTool = 'move'}
		  title="Move Selected"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<path d="M12 5v14 M5 12h14 M8 8l-3 4 3 4 M16 8l3 4-3 4 M8 8l4-3 4 3 M8 16l4 3 4-3" stroke="currentColor" stroke-width="1.5" fill="none"/>
		  </svg>
		  Move
		</button>
		
		<button 
		  class:active={appState.selectedTool === 'delete'} 
		  on:click={() => appState.selectedTool = 'delete'}
		  title="Delete Selected"
		>
		  <svg viewBox="0 0 24 24" width="16" height="16">
			<path d="M6 6l12 12 M18 6l-12 12" stroke="currentColor" stroke-width="2"/>
		  </svg>
		  Delete
		</button>
	  </div>
	</div>
	
	<div class="toolbar-section">
	  <h3>Color</h3>
	  <div class="color-picker">
		{#each colors as color}
		  <div 
			class="color-option"
			class:active={color === appState.currentColor}
			style="background-color: {color};"
			on:click={() => appState.changeColor(color)}
		  ></div>
		{/each}
	  </div>
	</div>

	<div class="toolbar-section">
	  <h3>Rasterization</h3>
	  
	  <div class="algorithm-options">
		<div class="control-row">
		  <label>
			<input 
			  type="radio" 
			  name="rasterization" 
			  value="dda" 
			  bind:group={appState.rasterizationAlgorithm}
			/>
			DDA Line
		  </label>
		</div>
		
		<div class="control-row">
		  <label>
			<input 
			  type="radio" 
			  name="rasterization" 
			  value="bresenham" 
			  bind:group={appState.rasterizationAlgorithm}
			/>
			Bresenham
		  </label>
		</div>
	  </div>
	</div>
  </div>
  
  <style>
	.toolbar {
	  display: flex;
	  flex-direction: column;
	  gap: 20px;
	  background-color: #f0f0f0;
	  border-right: 1px solid #ccc;
	  padding: 15px;
	  width: 220px;
	  height: 100%;
	  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
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
	  display: flex;
	  flex-direction: column;
	  gap: 5px;
	}
	
	button {
	  display: flex;
	  align-items: center;
	  gap: 8px;
	  padding: 8px 12px;
	  background-color: #ffffff;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  cursor: pointer;
	  font-size: 13px;
	  transition: all 0.2s;
	}
	
	button:hover {
	  background-color: #f5f5f5;
	}
	
	button.active {
	  background-color: #e0e0e0;
	  border-color: #999;
	  font-weight: bold;
	}
	
	.color-picker {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 8px;
	  padding: 5px 0;
	}
	
	.color-option {
	  width: 28px;
	  height: 28px;
	  border-radius: 4px;
	  border: 1px solid #ccc;
	  cursor: pointer;
	  transition: transform 0.2s;
	}
	
	.color-option:hover {
	  transform: scale(1.1);
	}
	
	.color-option.active {
	  border: 2px solid #333;
	  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}

	.algorithm-options {
	  display: flex;
	  flex-direction: column;
	  gap: 8px;
	  margin-top: 8px;
	}
	
	.control-row {
	  display: flex;
	  align-items: center;
	}
	
	.control-row label {
	  display: flex;
	  align-items: center;
	  gap: 6px;
	  font-size: 14px;
	  cursor: pointer;
	}
  </style>