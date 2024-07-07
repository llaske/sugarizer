define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/volumepalette.html",
], function (palette, template) {
	var volumepalette = {};
	volumepalette.VolumePalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "volume-palette";

		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		var that = this;

		document
			.getElementById("volume-palette")
			.addEventListener("click", () => {
				that.getPalette().childNodes[0].style.backgroundImage =
					invoker.style.backgroundImage;
				this.popDown();
			});
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	volumepalette.VolumePalette.prototype = Object.create(
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

	return volumepalette;
});
