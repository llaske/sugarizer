define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/zoompalette.html",
], function (palette, template) {
	var zoompalette = {};
	zoompalette.ZoomPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "zoom-palette";

		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;

		this.setContent([containerElem]);
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	zoompalette.ZoomPalette.prototype = Object.create(
		palette.Palette.prototype,
		{
			addEventListener: {
				value: addEventListener,
				enumerable: true,
				configurable: true,
				writable: true,
			},
		}
	);

	return zoompalette;
});
