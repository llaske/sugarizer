define(["sugar-web/graphics/palette", "text!activity/palettes/exportpalette.html"], function (palette, template) {

	var exportpalette = {};

	exportpalette.ExportPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		this.uploadItemEvent = document.createEvent('CustomEvent');
		this.uploadItemEvent.initCustomEvent('format-selected', true, true, { format: null });

		var that = this;
		var levelButtons = document.getElementById('export-formats').children;
		for(var button of levelButtons) {
			button.addEventListener('click', onClick);
		}

		function onClick(event) {
			that.uploadItemEvent.format = event.currentTarget.getAttribute('format');
			that.getPalette().dispatchEvent(that.uploadItemEvent);
			that.popDown();
		}
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	exportpalette.ExportPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return exportpalette;
});
