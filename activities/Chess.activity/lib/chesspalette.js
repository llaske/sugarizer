define(["sugar-web/graphics/palette","text!chesspalette.html"], function(palette,template) {

	var chesspalette = {};

	chesspalette.ChessPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		// var template = '<strong>Hello palette!</strong>';
		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	chesspalette.ChessPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return chesspalette;
});