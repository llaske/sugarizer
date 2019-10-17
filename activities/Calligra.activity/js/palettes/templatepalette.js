define(["sugar-web/graphics/palette","text!activity/palettes/templatepalette.html"], function(palette, template) {

	var templatepalette = {};

	templatepalette.TemplatePalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		this.getPalette().id = "template-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;

		this.setContent([containerElem]);

		this.templateSelectedEvent = document.createEvent('CustomEvent');
		this.templateSelectedEvent.initCustomEvent('templateSelected', true, true, { index: -1 });

		var that = this;
		document.getElementById("item-lower").addEventListener('click', function(event) {
			that.templateSelectedEvent.index = 0;
			that.getPalette().dispatchEvent(that.templateSelectedEvent);
			that.getPalette().children[0].style.backgroundImage = invoker.style.backgroundImage = "url(icons/template-lower.svg)";
			that.popDown();
		});
		document.getElementById("item-upper").addEventListener('click', function(event) {
			that.templateSelectedEvent.index = 1;
			that.getPalette().dispatchEvent(that.templateSelectedEvent);
			that.getPalette().children[0].style.backgroundImage = invoker.style.backgroundImage = "url(icons/template-upper.svg)";
			that.popDown();
		});
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	templatepalette.TemplatePalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return templatepalette;
});
