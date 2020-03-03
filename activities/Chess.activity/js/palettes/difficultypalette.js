define(["sugar-web/graphics/palette","text!activity/palettes/difficultypalette.html"], function(palette, template) {

	var difficultypalette = {};

	difficultypalette.DifficultyPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		this.getPalette().id = "template-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		this.difficultySelectedEvent = document.createEvent('CustomEvent');
		this.difficultySelectedEvent.initCustomEvent('difficultySelected', true, true, { index: -1 });

		var that = this;
		document.getElementById("difficulty-0").addEventListener('click', function(event) {
			that.difficultySelectedEvent.index = 0;
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		});
		document.getElementById("difficulty-1").addEventListener('click', function(event) {
			that.difficultySelectedEvent.index = 1;
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		});
		document.getElementById("difficulty-2").addEventListener('click', function(event) {
			that.difficultySelectedEvent.index = 2;
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		});
		document.getElementById("difficulty-3").addEventListener('click', function(event) {
			that.difficultySelectedEvent.index = 3;
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		});
		document.getElementById("difficulty-4").addEventListener('click', function(event) {
			that.difficultySelectedEvent.index = 4;
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		});
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	difficultypalette.DifficultyPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return difficultypalette;
});
