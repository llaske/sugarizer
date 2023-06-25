define(["sugar-web/graphics/palette", "text!activity/palettes/exportPalette.html"], function(palette, template) {

	var exportPalette = {};
    
	exportPalette.ExportPalette = function(invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        this.getPalette().id = "export-palette";
		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
		this.setContent([containerElem]);

        this.exportStorySelectedEvent = document.createEvent('CustomEvent');
        this.exportStorySelectedEvent.initCustomEvent('export-story-selected', true, true, {});
        var that = this;
        addEventListenerForGridSize(that, that.exportStorySelectedEvent);

	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};
    var addEventListenerForGridSize = function (that, customEvent) {
        let buttons = document.getElementById('export-buttons').children;
        for (var i = 0; i < buttons.length; i++) {
            let style = buttons[i].title;
            buttons[i].addEventListener('click', function(event) {
              that.exportStorySelectedEvent.fileType = style;
              that.getPalette().dispatchEvent(customEvent);
              that.popDown();
            });
          }
        }
        exportPalette.ExportPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return exportPalette;
});