define(["sugar-web/graphics/palette"], function (palette) {

    var octavepalette = {};

    octavepalette.OctavePalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template = "";

        if (app.instrument_name == 'none') {

            for (var i = 0; i < 9; i++) {
                template += `
                    <div id="octave_${i}" class="palette-item">${i}</div>
                `;
            }
        }

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.SelectOctaveEvent = document.createEvent('CustomEvent');
        this.SelectOctaveEvent.initCustomEvent('select-octave', true, true, { octave: 0 });

        var that = this;

    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    octavepalette.OctavePalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return octavepalette;
});
