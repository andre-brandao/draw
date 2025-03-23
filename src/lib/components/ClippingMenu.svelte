<script lang="ts">
    import { appState } from '$lib/global.svelte';
    
    // Define local state variables with defaults
    let clippingEnabled = $state(false);
    let clippingAlgorithm: 'cohen-sutherland' | 'liang-barsky' = $state('cohen-sutherland'); // 'cohen-sutherland' or 'liang-barsky'
    
    // Clipping boundaries
    let xMin = $state(50);
    let yMin = $state(50);
    let xMax = $state(555); // Default to canvas width
    let yMax = $state(600); // Default to canvas height
    
    // Initialize values from appState if they exist
    $effect(() => {
        if (appState.clippingConfig) {
            clippingEnabled = appState.clippingConfig.enabled;
            clippingAlgorithm = appState.clippingConfig.algorithm;
            xMin = appState.clippingConfig.xMin;
            yMin = appState.clippingConfig.yMin;
            xMax = appState.clippingConfig.xMax;
            yMax = appState.clippingConfig.yMax;
        }
    });
    
    // Apply clipping settings
    function applyClippingSettings() {
        appState.setClippingConfig({
            enabled: clippingEnabled,
            algorithm: clippingAlgorithm,
            xMin,
            yMin,
            xMax,
            yMax
        });
    }
    
    // Reset to canvas dimensions
    function resetBoundaries() {
        xMin = 0;
        yMin = 0;
        xMax = appState.width;
        yMax = appState.height;
    }
</script>

<div class="clipping-menu">
    <div class="toolbar-section">
        <h3>Clipping Configuration</h3>
        <div class="setting-option">
            <label for="clipping-toggle">
                <input 
                    type="checkbox" 
                    id="clipping-toggle" 
                    bind:checked={clippingEnabled} 
                />
                Enable Clipping
            </label>
        </div>
    </div>
    
    <div class="toolbar-section">
        <h3>Clipping Algorithm</h3>
        <div class="algorithm-options">
            <label>
                <input 
                    type="radio" 
                    name="clippingAlgorithm" 
                    value="cohen-sutherland" 
                    bind:group={clippingAlgorithm} 
                />
                Cohen-Sutherland
                <div class="setting-help">Region encoding algorithm</div>
            </label>
            <label>
                <input 
                    type="radio" 
                    name="clippingAlgorithm" 
                    value="liang-barsky" 
                    bind:group={clippingAlgorithm} 
                />
                Liang-Barsky
                <div class="setting-help">Parametric equation algorithm</div>
            </label>
        </div>
    </div>
    
    <div class="toolbar-section">
        <h3>Clipping Boundaries</h3>
        <div class="boundaries-container">
            <div class="control-row">
                <label class="control-label">X Min:</label>
                <input type="number" bind:value={xMin} />
            </div>
            <div class="control-row">
                <label class="control-label">Y Min:</label>
                <input type="number" bind:value={yMin} />
            </div>
            <div class="control-row">
                <label class="control-label">X Max:</label>
                <input type="number" bind:value={xMax} />
            </div>
            <div class="control-row">
                <label class="control-label">Y Max:</label>
                <input type="number" bind:value={yMax} />
            </div>
            <button class="reset-button" on:click={resetBoundaries}>Reset to Canvas Size</button>
        </div>
    </div>
    
    <div class="toolbar-section">
        <button class="apply-button" on:click={applyClippingSettings}>Apply Clipping Settings</button>
    </div>
</div>

<style>
    .clipping-menu {
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
    
    .algorithm-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .algorithm-options label {
        display: flex;
        flex-direction: column;
        padding: 8px;
        background-color: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .setting-help {
        font-size: 0.8em;
        color: #666;
        margin-top: 4px;
    }
    
    .boundaries-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        background-color: #f5f5f5;
        border-radius: 4px;
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
    
    input[type="number"] {
        width: 60px;
        padding: 4px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
    
    .apply-button, .reset-button {
        padding: 8px;
        background-color: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 5px;
    }
    
    .apply-button:hover, .reset-button:hover {
        background-color: #0052a3;
    }
    
    .reset-button {
        background-color: #666;
        font-weight: normal;
        font-size: 12px;
    }
    
    .reset-button:hover {
        background-color: #444;
    }
</style>