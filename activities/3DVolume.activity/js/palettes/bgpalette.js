define([
	"sugar-web/graphics/palette",
	"text!activity/palettes/bgpalette.html",
	"sugar-web/graphics/presencepalette",
], function (palette, template, presencepalette) {
	var bgpalette = {};
	bgpalette.BgPalette = function (invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "bg-palette";

		var containerElem = document.createElement("div");
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		this.bgSelectedEvent = document.createEvent("CustomEvent");
		this.bgSelectedEvent.initCustomEvent("bg-selected", true, true, {
			bg: "",
		});

		let that = this;
		let backgroundChangeCallback = null;

		this.setBackgroundChangeCallback = function (callback) {
			backgroundChangeCallback = callback;
		};

		document
			.getElementById("green-board")
			.addEventListener("click", onClick);
		document.getElementById("default").addEventListener("click", onClick);
		document.getElementById("wood").addEventListener("click", onClick);

		function onClick(event) {
			that.bgSelectedEvent.bg = event.currentTarget.id;
			if (
				document
					.querySelector("#green-board")
					.classList.contains("active")
			) {
				document
					.querySelector("#green-board")
					.classList.remove("active");
			}
			if (document.querySelector("#wood").classList.contains("active")) {
				document.querySelector("#wood").classList.remove("active");
			}
			if (
				document.querySelector("#default").classList.contains("active")
			) {
				document.querySelector("#default").classList.remove("active");
			}
			event.currentTarget.classList.add("active");

			if (backgroundChangeCallback) {
				backgroundChangeCallback(that.bgSelectedEvent.bg);
			}

			that.popDown();
		}
	};

	var addEventListener = function (type, listener, useCapture) {
		console.log("adding event listener");
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	bgpalette.BgPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true,
		},
	});

	return bgpalette;
});
