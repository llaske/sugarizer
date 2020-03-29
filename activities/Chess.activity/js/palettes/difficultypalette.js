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
		var levels = document.getElementsByClassName('palette-item');
		for(var i=0; i<levels.length; i++) {
			levels[i].addEventListener('click', onClick);
		}

		function onClick(event) {
			var level = event.currentTarget.id[11];
			that.difficultySelectedEvent.index = +level;
			bindClasses(level);
			that.getPalette().dispatchEvent(that.difficultySelectedEvent);
			that.popDown();
		}

		function bindClasses(level) {
			for(var i=0; i<levels.length; i++) {
				if(levels[i].id[11] == level) {
					levels[i].classList.add('active');
				} else {
					levels[i].classList.remove('active');
				}
			}
		}

		bindClasses(2);
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
