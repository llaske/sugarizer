define(["sugar-web/graphics/palette", "text!findpalette.html"], function(palette, template) {

	var findpalette = {};

	findpalette.FindPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
    this.setContent([containerElem]);
    
    this.findClickEvent = document.createEvent('CustomEvent');
    this.findClickEvent.initCustomEvent('findClick', true, true, { query: '' });

    var that = this;
    document.getElementById("find-container").addEventListener('submit', function(event) {
      event.preventDefault();
    });
    document.getElementById("find").addEventListener('click', function(event) {
      that.findClickEvent.query = document.getElementById('query-input').value;
      that.getPalette().dispatchEvent(that.findClickEvent);
    });
  };
  
	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	findpalette.FindPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
  });

	return findpalette;
});