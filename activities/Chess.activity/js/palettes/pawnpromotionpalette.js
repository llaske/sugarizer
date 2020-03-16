define(["sugar-web/graphics/palette", "text!activity/palettes/pawnpromotionpalette.html"], function(palette, template) {

	var pawnpromotionpalette = {};
	pawnpromotionpalette.Promotionpalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

		this.promotionEvent = document.createEvent('CustomEvent');
		this.promotionEvent.initCustomEvent('pawnpromotion', true, true, { option: -1 });
		var that = this;
		document.getElementById("option-queen").addEventListener('click', function(event) {
			that.promotionEvent.option = 0;
			document.getElementById("button5").style.backgroundImage = "url('images/white_queen.png')";
			document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_queen.png')";
			that.getPalette().dispatchEvent(that.promotionEvent);
			that.popDown();
		});
		document.getElementById("option-rook").addEventListener('click', function(event) {
			that.promotionEvent.option = 1;
			document.getElementById("button5").style.backgroundImage = "url('images/white_rook.png')";
			document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_rook.png')";
			that.getPalette().dispatchEvent(that.promotionEvent);
			that.popDown();
		});
		document.getElementById("option-knight").addEventListener('click', function(event) {
			that.promotionEvent.option = 2;
			document.getElementById("button5").style.backgroundImage = "url('images/white_knight.png')";
			document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_knight.png')";
			that.getPalette().dispatchEvent(that.promotionEvent);
			that.popDown();
		});
		document.getElementById("option-bishop").addEventListener('click', function(event) {
			that.promotionEvent.option = 3;
			document.getElementById("button5").style.backgroundImage = "url('images/white_bishop.png')";
			document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_bishop.png')";
			that.getPalette().dispatchEvent(that.promotionEvent);
			that.popDown();
		});

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	pawnpromotionpalette.Promotionpalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});
	return pawnpromotionpalette;
});