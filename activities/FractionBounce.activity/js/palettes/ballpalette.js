define(["sugar-web/graphics/palette","text!activity/palettes/ballpalette.html"], function(palette, template) {

	var ballpalette = {};
	
	ballpalette.BallPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		this.getPalette().id = "ball-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;

    this.setContent([containerElem]);
    
    this.ballSelectedEvent = document.createEvent('CustomEvent');
    this.ballSelectedEvent.initCustomEvent('ball-selected', true, true, { ball: '' });
    
    let that = this;
    document.getElementById("soccerball").addEventListener('click', onClick);
    document.getElementById("basketball").addEventListener('click', onClick);
    document.getElementById("beachball").addEventListener('click', onClick);
    document.getElementById("feather").addEventListener('click', onClick);
    document.getElementById("rugbyball").addEventListener('click', onClick);
		document.getElementById("bowlingball").addEventListener('click', onClick);
    document.getElementById("journal-ball").addEventListener('click', onClick);
    
    function onClick(event) {
      that.ballSelectedEvent.ball = event.currentTarget.id;
      that.getPalette().dispatchEvent(that.ballSelectedEvent);
      that.popDown();
    }
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	ballpalette.BallPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return ballpalette;
});
