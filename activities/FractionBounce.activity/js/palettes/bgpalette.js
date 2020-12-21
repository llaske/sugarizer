define(["sugar-web/graphics/palette","text!activity/palettes/bgpalette.html"], function(palette, template) {

	var bgpalette = {};

	bgpalette.BgPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		this.getPalette().id = "bg-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;

    this.setContent([containerElem]);
    
    this.bgSelectedEvent = document.createEvent('CustomEvent');
    this.bgSelectedEvent.initCustomEvent('bg-selected', true, true, { bg: '' });
    
    let that = this;
    document.getElementById("grass").addEventListener('click', onClick);
    document.getElementById("sand").addEventListener('click', onClick);
    document.getElementById("clouds").addEventListener('click', onClick);
    document.getElementById("wood").addEventListener('click', onClick);
    document.getElementById("journal-bg").addEventListener('click', onClick);
    
    function onClick(event) {
      that.bgSelectedEvent.bg = event.currentTarget.id;
      that.getPalette().dispatchEvent(that.bgSelectedEvent);
      that.popDown();
    }
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	bgpalette.BgPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return bgpalette;
});
