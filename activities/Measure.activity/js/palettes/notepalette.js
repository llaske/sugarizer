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
        containerElem.setAttribute("id", "notePalette");
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.SelectNoteEvent = document.createEvent('CustomEvent');
        this.SelectNoteEvent.initCustomEvent('select-note', true, true, { note: 0 });

        document.getElementById(`note_${app.freq_input_note_index}`).style.backgroundColor = 'darkgray';

        var that = this;

        for (var i = 0; i < len; i++) {
            (function (index) {
                document.getElementById(`note_${index}`).addEventListener('click', function (e) {
                    app.setNote(index);
                    that.popDown();
                })
            })(i)
        }

        if(document.getElementById("none")) {

            document.getElementById("none").addEventListener('click', function (event) {

                template = "";
                for (var i = 0; i < len; i++) {
                    template += `
                    <div id="note_${i}" class="palette-item note-palette">${app.SugarL10n.get(notes_arr[i])}</div>
                `;
                }
                containerElem.innerHTML = template;
                document.getElementById(`note_${app.freq_input_note_index}`).style.backgroundColor = 'darkgray';
                for (var i = 0; i < len; i++) {
                    (function (index) {
                        document.getElementById(`note_${index}`).addEventListener('click', function (e) {
                            app.setNote(index);
                            that.popDown();
                        })
                    })(i)
                }
            });

        }

        function setUpForInstrument(instrument) {
            template = `
                    <div id="${instrument}_note_all" class="palette-item note-palette">${app.SugarL10n.get("AllNotes")}</div>
                `;

            var j = 0;
            for (var i in app.instrument_data[instrument]['notes']) {

                template += `
                    <div id="${instrument}_note_${i}" class="palette-item note-palette" style="color: ${app.colors[j]};">${app.SugarL10n.get(i[0]) + ' ' + i[1]}</div>
                `;
                j++;
            }
            containerElem.innerHTML = template;
            app.note_name = 'all';
            document.getElementById(`${instrument}_note_all`).style.backgroundColor = 'darkgray';
            document.getElementById(`${instrument}_note_all`).addEventListener('click', function (e) {
                window.app.drawNote(-1, 0, 'all');
                that.popDown();
            })
            j = 0;
            for (var i in app.instrument_data[instrument]['notes']) {
                (function (index, key) {
                    document.getElementById(`${instrument}_note_${key}`).addEventListener('click', function (e) {
                        window.app.drawNote(index, app.instrument_data[instrument]['notes'][key], key);
                        that.popDown();
                    })
                })(j, i)
                j++;
            }
        }

        for (var instrument in app.instrument_data) {
            (function (instrument) {
                if (document.getElementById(`${instrument}_instrument`)) {
                    document.getElementById(`${instrument}_instrument`).addEventListener('click', function (event) {
                        setUpForInstrument(instrument);
                    });
                }
            })(instrument)
        }

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
