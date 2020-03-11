define(["sugar-web/graphics/palette", "text!activity/palettes/computerdifficultypalette.html"], function(palette, template) {

	var computerpalette = {};
	computerpalette.DifficultyPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		this.difficultyEvent = document.createEvent('CustomEvent');
		this.difficultyEvent.initCustomEvent('difficulty', true, true, { option: -1 });

		var that = this;
		document.getElementById("option-default").addEventListener('click', function(event) {
			that.difficultyEvent.option = 2;
			that.getPalette().dispatchEvent(that.difficultyEvent);
			that.popDown();
		});
		document.getElementById("option-slow").addEventListener('click', function(event) {
			that.difficultyEvent.option = 3;
			that.getPalette().dispatchEvent(that.difficultyEvent);
			that.popDown();
		});
		document.getElementById("option-slowest").addEventListener('click', function(event) {
			that.difficultyEvent.option = 4;
			that.getPalette().dispatchEvent(that.difficultyEvent);
			that.popDown();
		});
		document.getElementById("option-stupid").addEventListener('click', function(event) {
			that.difficultyEvent.option = 0;
			that.getPalette().dispatchEvent(that.difficultyEvent);
			that.popDown();
		});
		document.getElementById("option-middling").addEventListener('click', function(event) {
			that.difficultyEvent.option = 1;
			that.getPalette().dispatchEvent(that.difficultyEvent);
			that.popDown();
		});

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	computerpalette.DifficultyPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});
	return computerpalette;
});