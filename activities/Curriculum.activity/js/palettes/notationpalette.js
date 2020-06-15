define(["sugar-web/graphics/palette", "text!activity/palettes/notationpalette.html"], function (palette, template) {

	var notationpalette = {};

	notationpalette.NotationPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		this.uploadItemEvent = document.createEvent('CustomEvent');
		this.uploadItemEvent.initCustomEvent('notation-selected', true, true, { level: null });

		var that = this;
		var levelButtons = document.getElementById('notation-selector').children;
		for(var button of levelButtons) {
			if(button.id.substr(6) == app.user.notationLevel) {
				button.classList.add('active');
			}
			button.addEventListener('click', onClick);
		}

		function onClick(event) {
			that.uploadItemEvent.level = event.currentTarget.getAttribute('level');
			that.getPalette().dispatchEvent(that.uploadItemEvent);
			that.popDown();
			for(var button of levelButtons) {
				if(button.id.substr(6) == app.user.notationLevel) {
					button.classList.add('active');
				} else {
					button.classList.remove('active');
				}
			}
		}
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	notationpalette.NotationPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return notationpalette;
});
