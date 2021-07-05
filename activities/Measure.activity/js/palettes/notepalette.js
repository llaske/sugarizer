define(["sugar-web/graphics/palette"], function (palette) {

    var notepalette = {};

    notepalette.NotePalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template = "";

        var notes_arr = ['A', 'A♯/B♭', 'B', 'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭',
            'G', 'G♯/A♭']

        if (app.instrument_name == 'none') {
            var len = notes_arr.length;
            for(var i=0;i<len;i++) {
                template += `
                    <div id="note_${i}" class="palette-item note-palette">${notes_arr[i]}</div>
                `;
            }
        }

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.SelectNoteEvent = document.createEvent('CustomEvent');
        this.SelectNoteEvent.initCustomEvent('select-note', true, true, { note: 0 });

        var that = this;

        // document.getElementById("guitar_instrument").addEventListener('click', function (event) {
        //     that.SelectNoteEvent.instrument_name = 'guitar';
        //     that.getPalette().dispatchEvent(that.SelectNoteEvent);
        //     that.popDown();
        // });
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    notepalette.NotePalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return notepalette;
});
