define(["sugar-web/graphics/palette"], function (palette) {

    var notepalette = {};

    notepalette.NotePalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template = "";

        var notes_arr = app.notes_arr;
        
        var len = notes_arr.length;

        if (app.instrument_name == 'none') {

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

        document.getElementById("none").addEventListener('click', function (event) {
            template = "";
            for (var i = 0; i < len; i++) {
                template += `
                    <div id="note_${i}" class="palette-item note-palette">${app.SugarL10n.get(notes_arr[i])}</div>
                `;
            }
            containerElem.innerHTML = template;
        });
        document.getElementById("guitar_instrument").addEventListener('click', function (event) {

            template = `
                    <div id="guitar_note_all" class="palette-item note-palette">${app.SugarL10n.get("AllNotes")}</div>
                `;

            for(var i in app.instrument_data['guitar']['notes']) {

                template += `
                    <div id="guitar_note_${i}" class="palette-item note-palette">${app.SugarL10n.get(i[0]) + ' ' + i[1]}</div>
                `;
            }
            containerElem.innerHTML = template;
            document.getElementById("guitar_note_all").addEventListener('click', function(e) {
                window.app.drawNote(-1, 0);
                that.popDown();
            })
            var j = 0;
            for (var i in app.instrument_data['guitar']['notes']) {
                (function (index, key) {
                    document.getElementById(`guitar_note_${key}`).addEventListener('click', function (e) {
                        window.app.drawNote(index, app.instrument_data['guitar']['notes'][key]);
                        that.popDown();
                    })
                })(j, i)
                j++;
            }
        });

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
