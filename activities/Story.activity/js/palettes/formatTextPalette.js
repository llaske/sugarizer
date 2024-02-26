define(["sugar-web/graphics/palette", "text!activity/palettes/formatTextPalette.html"], function(palette, template) {

	var formatTextPalette = {};

	formatTextPalette.FormatTextPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

        this.getPalette().id = "format-text-palette";

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

        this.formatTextSelectedEvent = document.createEvent('CustomEvent');
        this.formatTextSelectedEvent.initCustomEvent('format-text-selected', true, true, {});

        var that = this;
        addEventListenerForFormatText(that, that.formatTextSelectedEvent);

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

    var addEventListenerForFormatText = function (that, customEvent) {
        let buttons = document.getElementById('format-text-buttons').children;
        for (var i = 0; i < buttons.length; i++) {
            let style = buttons[i].title;
            buttons[i].addEventListener('click', function(event) {
              that.formatTextSelectedEvent.format = style;
              that.getPalette().dispatchEvent(customEvent);
              that.popDown();
            });
          }
        }
    
	formatTextPalette.FormatTextPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return formatTextPalette;
});