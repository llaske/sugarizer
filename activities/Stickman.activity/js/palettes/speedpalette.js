define(['sugar-web/graphics/palette'], function (palette) {
	var speedpalette = {};

	speedpalette.SpeedPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "speedpalette";
		this.speedEvent = document.createEvent('CustomEvent');
		this.speedEvent.initCustomEvent('speed', true, true, { 'speed': 1 }); // Default 1x speed

		var speedElem = document.createElement('div');
		speedElem.innerHTML = `
			<div class="row expand" style="width:200px;">
				<span id="speedlabel" style="position:absolute;margin-top:20px;">${primaryText}:</span>
				<input id="speedvalue" type="range" min="0" max="100" value="50" step="1" style="width:70%;margin:3%;margin-left:28%;margin-top:22px;">
			</div>
		`;
		this.setContent([speedElem]);

		invoker.addEventListener('click', function () {
			document.getElementById("speedlabel").innerHTML = invoker.title + ":";
		});

		var that = this;
		this.speedScale = document.querySelector('#speedvalue');
		this.speedScale.oninput = function () {
			var sliderValue = parseInt(this.value);
			var speedMultiplier = calculateSpeedMultiplier(sliderValue);
			that.speedEvent.detail.speed = speedMultiplier;
			that.getPalette().dispatchEvent(that.speedEvent);
		};

		function calculateSpeedMultiplier(sliderValue) {
			if (sliderValue <= 50) {
				return 0.25 + (sliderValue / 50) * 0.75; // 0.25x to 1x
			} else {
				return 1 + ((sliderValue - 50) / 50) * 3; // 1x to 4x
			}
		}
	};

	speedpalette.SpeedPalette.prototype = Object.create(palette.Palette.prototype);
	speedpalette.SpeedPalette.prototype.addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	return speedpalette;
});