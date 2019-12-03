define(["sugar-web/graphics/palette","text!pawnpalette.html"], function(palette, template) {

	var pawnpalette = {};

	pawnpalette.PawnPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);
		this.pawnClickEvent = document.createEvent('CustomEvent');
		this.pawnClickEvent.initCustomEvent('pawnClick', true, true, { count: 0 });
		var that = this;
		document.getElementById("item-one").addEventListener('click', function(event) {
			that.pawnClickEvent.count = 1;
			that.getPalette().dispatchEvent(that.pawnClickEvent);
			});
		document.getElementById("item-two").addEventListener('click', function(event) {
			that.pawnClickEvent.count = 2;
			that.getPalette().dispatchEvent(that.pawnClickEvent);
			that.popDown();
		});
		document.getElementById("item-three").addEventListener('click', function(event) {
			that.pawnClickEvent.count = 3;
			that.getPalette().dispatchEvent(that.pawnClickEvent);
			that.popDown();
		});
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	pawnpalette.PawnPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return pawnpalette;
});