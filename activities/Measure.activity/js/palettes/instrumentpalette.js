define(["sugar-web/graphics/palette"], function (palette) {

    var instrumentpalette = {};

    instrumentpalette.InstrumentPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
        `
            <div id="none" class="palette-item">None</div>
        `;

        for (var instrument in app.instrument_data) {
            template += `<div id="${instrument}_instrument" class="palette-item">${instrument}</div>`
        }

        var containerElem = document.createElement('div');
        containerElem.setAttribute("id", "instrumentPalette");
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.SelectInstrumentEvent = document.createEvent('CustomEvent');
        this.SelectInstrumentEvent.initCustomEvent('select-instrument', true, true, { instrument_name: '' });

        var that = this;

        document.getElementById("none").style.backgroundColor = 'darkgray';
        document.getElementById("none").addEventListener('click', function (event) {
            document.getElementById("octave-select-button").style.display = "initial";
            that.SelectInstrumentEvent.instrument_name = 'none';
            that.getPalette().dispatchEvent(that.SelectInstrumentEvent);
            that.popDown();
        });

        for (var instrument in app.instrument_data) {
            (function (instrument) {
                document.getElementById(`${instrument}_instrument`).addEventListener('click', function (event) {
                    document.getElementById("octave-select-button").style.display = "none";
                    that.SelectInstrumentEvent.instrument_name = instrument;
                    that.getPalette().dispatchEvent(that.SelectInstrumentEvent);
                    that.popDown();
                });
            })(instrument)
        }
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
