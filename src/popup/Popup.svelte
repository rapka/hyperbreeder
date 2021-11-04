<style>
	#popup-container {
		z-index: 100;
		background: rgba(0,0,0,0.3);
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		justify-content: center;
		align-items: center;
		color: white;
		position: absolute;
	}

	#popup-contents {
		text-transform: uppercase;
		font-family: 'majormono';
		letter-spacing: 32px;
		font-size: 96px;
		text-align: center;
		width: 100%;
		mix-blend-mode: darken;
		flex: 0 0;
		padding: 16px;
	}

	#splash-description {
		text-transform: uppercase;
		font-family: 'xanh';
		letter-spacing: 8px;
		font-size: 24px;
		width: 100%;
		padding: 24px;
		text-align: center;
		background: black;
		flex: 0 0;
	}

	#splash-dismiss {
		cursor: pointer;
		background: black;
		font-size: 24px;
		border: 1px solid white;
		padding: 8px;

		flex: 0 0;
	}

	.dismiss-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 8px;
		flex: 0 0;
	}

	#splash-top-spacer,
	#splash-bottom-spacer {
		width: 100%;
		flex: 1 1;

	}
</style>

<script>
	export let dismiss = () => {};
	export let text = 'TEST TEXT';
	export let dismissText = 'TEST DISMISS';
	let currentText = '';
	let animationComplete = false;
	let textArray = [];

	const loop = (a, index) => {
		let c, interval, g, h;

		if (index == a.length) {
			animationComplete = true;
		} else {
			g = currentText;
			h = Math.floor(21 * Math.random() + 5);
			c = 32 === a[index] ? 32 : a[index] - h;
			interval = setInterval(function() {
				currentText = g + String.fromCharCode(c);

				if (c == a[index]) {
					clearInterval(interval);
					c = 32;
					index++;
					 setTimeout(function() {
						loop(a, index);
					}, 100);
				} else {
					c++;
				}
			}, 50);
		}
	};

	for (let d = text, c = 0;c < d.length; c++) {
		textArray.push(d.charCodeAt(c));
	}

	loop(textArray, 0);
</script>

<div id="popup-container">
	<div id="popup-contents">
		<div id="splash-description">
			{currentText}
		</div>
		<div class="dismiss-container">
			<div id="splash-dismiss" on:click={dismiss}>
				{dismissText}
			</div>
		</div>
	</div>
</div>
