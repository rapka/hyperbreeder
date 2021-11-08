<style>
	#optionsMenu-container {
		z-index: 110;
		display: flex;
		flex-direction: column;
		pointer-events: none;
		width: 100vw;
		height: 100vh;
		justify-content: center;
		align-items: center;
		color: white;
		position: fixed;
		left: 0;
		top: 0;
	}

	#optionsMenu-contents {
		pointer-events: auto;
		z-index: 101;
		font-family: 'majormono';
		text-align: center;
		flex-direction: column;
		border: 2px solid white;
		width: calc(100% - 200px);
		height: calc(100% - 200px);
		position: relative;
		background: rgba(0, 0, 0, 0.8);
		box-shadow: 0 0 150px #000;
		padding: 16px;
	}

	.optionsMenu-title {
		font-family: 'xanh';
		letter-spacing: 5px;
		font-size: 16px;
		padding-top: 16px;
		width: 100%;
		text-align: center;
		flex: 0 0;
	}

	.optionsMenu-closeButton {
		margin-top: 16px;
		background: rgba(0, 0, 0, 0.5);
		cursor: pointer;
		text-align: center;
		font-size: 24px;
		color: white;
		border: 1px solid white;
	}

	#optionsMenu-toggleButton {
		box-shadow: 0 0 32px black;
		text-shadow: 0 0 32px white, 0 0 16px white;
		pointer-events: auto;
		cursor: pointer;
		position: fixed;
		width: 64px;
		height: 64px;
		border-radius: 32px;
		bottom: 16px;
		left: 16px;
		background: rgba(0, 0, 0, 0.9);
		text-align: center;
		font-size: 64px;
    	line-height: 80px;
    	letter-spacing: -1px;
    	user-select: none;
	}

	.open #optionsMenu-toggleButton {
		box-shadow: 0 0 32px white;
		background: rgba(255, 255, 255, 0.9);
		color: black;
		text-shadow: 0 0 32px black, 0 0 16px black;
	}

	.optionsMenu-option {
		font-size: 20px;
	}
</style>

<script>
	import isEmpty from 'lodash/isEmpty';
	import AnimatedText from '../components/ui/AnimatedText.svelte';
	import options from '../stores/optionStores';
	let open = false;

	let descPlaying = false;
	const toggleOpen = () => open = !open;
	const onChangeTextSpeed = (e) => {
		$options.textSpeed = parseInt(e.target.value);
	};
</script>

<div id="optionsMenu-container" class={open ? 'open' : ''}>
	<div id="optionsMenu-toggleButton" on:click={toggleOpen}>*</div>
	{#if open === true}
		<div id="optionsMenu-contents">
			<div class="optionsMenu-title">Options</div>
			<form on:submit|preventDefault={() =>{}}>
				<div class="optionsMenu-option">
					<span class="optionsMenu-label">Text Speed</span>
					<select value={$options.textSpeed} on:change={onChangeTextSpeed}>
						{#each [1,2,3] as textSpeedOption}
							<option value={textSpeedOption}>
								{textSpeedOption}
							</option>
						{/each}
					</select>
				</div>
			</form>
			<button class="optionsMenu-closeButton" on:click={toggleOpen}>
				Close
			</button>
		</div>
	{/if}
</div>
