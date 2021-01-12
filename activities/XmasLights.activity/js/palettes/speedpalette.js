
define(['sugar-web/graphics/palette'], function(palette) {

	var speedpalette = {};

	speedpalette.SpeedPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "speedpalette";
		this.speedEvent = document.createEvent('CustomEvent');
		this.speedEvent.initCustomEvent('speed', true, true, {'speed': 50});

		var speedElem = document.createElement('div');
		speedElem.innerHTML = `
			<div class="row expand" style="width:200px;">
			  <span id="speedlabel" style="position:absolute;margin-top:20px;">speed:</span><input id="speedvalue" type="range" step="10" style="width:70%;margin:3%;margin-left:28%;margin-top:22px;"></input>
			</div>
		`;
		this.setContent([speedElem]);


		invoker.addEventListener('click', function(e) {
			document.getElementById("speedlabel").innerHTML = (document.getElementById("speed-button").title) + ":";
			document.getElementById("speedvalue").value = 100-((app.blinkTime-500)/10);
		});

		var that = this;
		this.speedScale = document.querySelector('#speedvalue');
		this.speedScale.oninput = function() {
			that.speedEvent.detail.speed = 100-this.value;
			that.getPalette().dispatchEvent(that.speedEvent);
		}
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	speedpalette.SpeedPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return speedpalette;
});
