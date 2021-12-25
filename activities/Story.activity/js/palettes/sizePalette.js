define(["sugar-web/graphics/palette", "text!activity/palettes/sizePalette.html"], function(palette, template) {

	var sizePalette = {};
    
	sizePalette.SizePalette = function(invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        this.getPalette().id = "size-palette";
        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.gridSizeSelectedEvent = document.createEvent('CustomEvent');
        this.gridSizeSelectedEvent.initCustomEvent('grid-size-selected', true, true, {});
        var that = this;
        addEventListenerForGridSize(that, that.gridSizeSelectedEvent);

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};
  var addEventListenerForGridSize = function (that, customEvent) {
      let buttons = document.getElementById('size-buttons').children;
      for (var i = 0; i < buttons.length; i++) {
          let style = buttons[i].title;
          buttons[i].addEventListener('click', function(event) {
            that.gridSizeSelectedEvent.count = style;
            that.getPalette().dispatchEvent(customEvent);
            that.popDown();
          });
        }
      }
  sizePalette.SizePalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return sizePalette;
});