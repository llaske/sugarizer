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
        containerElem.setAttribute("id", "octavePalette");
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        document.getElementById(`octave_${app.freq_input_octave}`).style.backgroundColor = 'darkgray';

        var that = this;

        for (var i=0;i<9;i++) {
            (function (index) {
                document.getElementById(`octave_${index}`).addEventListener('click', function (e) {
                    app.setOctave(index);
                    that.popDown();
                })
            })(i)
        }

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
