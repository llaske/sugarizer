define(["sugar-web/graphics/palette"], function (palette) {

    var instrumentpalette = {};

    instrumentpalette.InstrumentPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
        `
            <div id="none" class="palette-item">None</div>
            <div id="guitar_instrument" class="palette-item">Guitar</div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.SelectInstrumentEvent = document.createEvent('CustomEvent');
        this.SelectInstrumentEvent.initCustomEvent('select-instrument', true, true, { instrument_name: '' });

        var that = this;

        document.getElementById("none").addEventListener('click', function (event) {
            that.SelectInstrumentEvent.instrument_name = 'none';
            that.getPalette().dispatchEvent(that.SelectInstrumentEvent);
            that.popDown();
        });

        document.getElementById("guitar_instrument").addEventListener('click', function (event) {
            that.SelectInstrumentEvent.instrument_name = 'guitar';
            that.getPalette().dispatchEvent(that.SelectInstrumentEvent);
            that.popDown();
        });
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    instrumentpalette.InstrumentPalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return instrumentpalette;
});
