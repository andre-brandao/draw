<script lang="ts">
	import ToolsMenu from './ToolsMenu.svelte';
	import SaveMenu from './SaveMenu.svelte';
	import ClippingMenu from './ClippingMenu.svelte';

	let activeTab = $state('tools'); // 'tools', 'save', or 'clipping'
</script>

<div class="tab-menu">
	<div class="tab-header">
		<button class:active={activeTab === 'tools'} onclick={() => (activeTab = 'tools')}>
			Tools
		</button>
		<button class:active={activeTab === 'save'} onclick={() => (activeTab = 'save')}>
			Save/Load
		</button>
		<button class:active={activeTab === 'clipping'} onclick={() => (activeTab = 'clipping')}>
			Clipping
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === 'tools'}
			<ToolsMenu />
		{:else if activeTab === 'save'}
			<SaveMenu />
		{:else}
			<ClippingMenu />
		{/if}
	</div>
</div>

<style>
	.tab-menu {
		display: flex;
		flex-direction: column;
		background-color: #f0f0f0;
		border-right: 1px solid #ccc;
		width: 220px;
		height: 100%;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
	}

	.tab-header {
		display: flex;
		border-bottom: 1px solid #ccc;
	}

	.tab-header button {
		flex: 1;
		padding: 10px;
		background-color: #e4e4e4;
		border: none;
		border-right: 1px solid #ccc;
		cursor: pointer;
		font-weight: bold;
		transition: background-color 0.2s;
	}

	.tab-header button:last-child {
		border-right: none;
	}

	.tab-header button.active {
		background-color: #f8f8f8;
		border-bottom: 2px solid #0066cc;
	}

	.tab-content {
		flex: 1;
		overflow-y: auto;
	}
</style>
