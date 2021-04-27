define(["sugar-web/graphics/palette"], function(palette) {

	'use strict';

	var thingpalette = {};

	var things = [
		{name: "Thing1", svg: "", index: 0},
		{name: "Thing2", svg: "", index: 1},
		{name: "Thing3", svg: "", index: 2},
		{name: "Thing4", svg: "", index: 3},
		{name: "Thing5", svg: "", index: 4},
		{name: "Thing6", svg: "", index: 5},
		{name: "Thing7", svg: "", index: 6},
	]

	thingpalette.ThingPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);
		this.getPalette().id = "thingpalette";
		this.sharedEvent = document.createEvent("CustomEvent");
		this.sharedEvent.initCustomEvent('thing', true, true, {});

		this.buttons = [];

		let div = document.createElement('div');
		for (let i = 0; i < things.length; i++) {
			var thing = things[i];
			var button = document.createElement("div");
			button.value = thing;
			button.onmouseover = function() {
				this.style.background = "rgb(204, 204, 204)";
			};

			button.onmouseout = function() {
				this.style.background = "rgb(0, 0, 0)";
			};
			button.style.borderRadius = "0";
			button.style.width = "100%";
			button.style.background = "rgb(0, 0, 0)";
			if (i != 0) {
				button.style.marginTop = "8px";
			}
			button.innerHTML = "<div style='display:inline-block;vertical-align:middle;margin:3px 10px 3px 3px;width:40px;padding-top:4px' id='pthingimg"+i+"'>" + thing.svg + "</div><div style='display:inline-block; margin-right: 5px;' id='pthinglabel"+i+"'>" + thing.name + "</div>";
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
			let thing = things[i];

			(function (button, thing) {
				button.addEventListener("click", function () {
					that.sharedEvent.detail.value = app.$refs.api.getPopularThings()[thing.index];
					that.getPalette().dispatchEvent(that.sharedEvent);
					that.popDown();
				});
			})(button, thing);
			button.addEventListener('thing', popDownOnButtonClick);
		}

		invoker.addEventListener('click', function(e) {
			let apithings = app.$refs.api.getPopularThings();
			for (let i = 0 ; i < apithings.length ; i++) {
				let thing = apithings[i];
				document.getElementById("pthinglabel"+i).innerHTML = thing.plural;
				let icon = app.$refs.api.getThingByTopic(thing.originPlural);
				if (icon) {
					document.getElementById("pthingimg"+i).innerHTML = icon.svg;
				}
			}
		});
	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	thingpalette.ThingPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return thingpalette;
});
