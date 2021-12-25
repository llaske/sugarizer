define(["sugar-web/graphics/palette", "text!activity/palettes/fontPalette.html"], function(palette, template) {

	var fontPalette = {};

	fontPalette.FontPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

        this.getPalette().id = "font-palette";

        this.fontSelectedEvent = document.createEvent('CustomEvent');
        this.fontSelectedEvent.initCustomEvent('font-updated', true, true, {
            'font': 'Arial'
        });
		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

        var that = this;
        addEventListenerForFont(that, that.fontSelectedEvent);

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

    var addEventListenerForFont = function (that, customEvent) {
        let buttons = document.getElementById('font-buttons').children;
        for (var i = 0; i < buttons.length; i++) {
            let style = buttons[i].title;
            buttons[i].addEventListener('click', function(event) {
              that.fontSelectedEvent.font = style;
              that.getPalette().dispatchEvent(customEvent);
              that.popDown();
            });
          }
        }
    
        fontPalette.FontPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return fontPalette;
});

