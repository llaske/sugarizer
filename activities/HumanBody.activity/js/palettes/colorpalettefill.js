define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/colorpalettefill.html",
	"sugar-web/env",
], function (palette, template, env) {
	var colorpalette = {};
	colorpalette.ColorPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "color-palette";

		var containerElem = document.createElement("div");

		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		let that = this;
		env.getEnvironment(function (err, environment) {
			currentenv = environment;
			that.getPalette().childNodes[0].style.backgroundColor =
				currentenv.user.colorvalue.fill;
		});

		const colors = document.querySelectorAll(".color-fill");
		colors.forEach((color) => {
			color.addEventListener("click", function () {
				const selectedColor = this.style.backgroundColor;
				that.getPalette().childNodes[0].style.backgroundColor =
					this.style.backgroundColor;
				const colorChangeEvent = new CustomEvent(
					"color-selected-fill",
					{
						detail: { color: selectedColor },
					}
				);
				document.dispatchEvent(colorChangeEvent);
				that.popDown();
				document.getElementById(
					"color-button-fill"
				).style.backgroundColor = selectedColor;
			});
		});
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	colorpalette.ColorPalette.prototype = Object.create(
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

	return colorpalette;
});
