define(["sugar-web/graphics/palette"], function(palette) {

	'use strict';

	var regionpalette = {};

	var regions = [
		{name: "World", image: "world.svg", code: null},
		{name: "Africa", image: "africa.svg", code: "af"},
		{name: "Asia", image: "asia.svg", code: "as"},
		{name: "Europe", image: "europe.svg", code: "eu"},
		{name: "The Americas", image: "americas.svg", code: "am"},
	]

	regionpalette.RegionPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "regionpalette";
		this.sharedEvent = document.createEvent("CustomEvent");
		this.sharedEvent.initCustomEvent('region', true, true, {});

		this.buttons = [];

		let div = document.createElement('div');
		for (let i = 0; i < regions.length; i++) {
			var region = regions[i];
			var button = document.createElement("div");
			button.value = region;
			button.onmouseover = function() {
				if (this.style.background == "rgb(0, 0, 0)") {
					this.style.background = "rgb(204, 204, 204)";
				}
				else {
					this.style.background = "rgb(172, 172, 172)";
				}
			};

			button.onmouseout = function() {
				if (this.style.background == "rgb(204, 204, 204)") {
					this.style.background = "rgb(0, 0, 0)";
				}
				else {
					this.style.background = "rgb(127, 127, 127)";
				}
			};
			button.style.borderRadius = "0";
			button.style.width = "100%";
			button.style.background = "rgb(0, 0, 0)";
			if (i != 0) {
				button.style.marginTop = "3px";
			}
			button.innerHTML = "<img style='vertical-align: middle; margin:3px 10px 3px 3px; width: 80px;' src='icons/" + region.image + "'><div style='display:inline-block; margin-right: 5px;' id='pregion"+i+"'>" + region.name + "</div>";
			div.appendChild(button);
			this.buttons.push(button);
		}
		this.setContent([div]);

		// Pop-down the palette when a item in the menu is clicked.

		let that = this;

		that.getPalette().firstChild.style.backgroundColor = "transparent";
		that.getPalette().firstChild.style.backgroundImage = "";

		function popDownOnButtonClick(event) {
			console.log(event);
			that.popDown();
		}

		for (let i = 0; i < this.buttons.length; i++) {
			let t = this;
			let button = t.buttons[i];
			let region = regions[i];

			(function (button, region) {
				button.addEventListener("click", function () {
					that.sharedEvent.detail.value = region.code;
					that.getPalette().dispatchEvent(that.sharedEvent);
					that.popDown();
				});
			})(button, region);
			button.addEventListener('region', popDownOnButtonClick);
		}

		invoker.addEventListener('click', function(e) {
			let apiregions = app.$refs.api.getRegions();
			for (let i = 0 ; i < apiregions.length ; i++) {
				let region = apiregions[i];
				for (let j = 0 ; j < regions.length ; j++) {
					if (regions[j].name == region.originRegionName)  {
						document.getElementById("pregion"+j).innerHTML = region.region;
						break;
					}
				}
			}
			document.getElementById("pregion0").innerHTML = app.$refs.api.getL10n("THE_WORLD");
			for (let i = 0 ; i < regions.length ; i++) {
				if (regions[i].code == app.currentRegion) {
					that.buttons[i].style.background = "rgb(127, 127, 127)";
				} else {
					that.buttons[i].style.background = "rgb(0, 0, 0)";
				}
			}
		});
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	regionpalette.RegionPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return regionpalette;
});
