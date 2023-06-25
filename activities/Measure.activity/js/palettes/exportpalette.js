define(["sugar-web/graphics/palette"], function (palette) {

    var exportpalette = {};

    exportpalette.ExportPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
            `
            <div id="export-formats">
                <button id="csv-export"></button>
                <button id="pdf-export"></button>
            </div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.exportClickEvent = document.createEvent('CustomEvent');
        this.exportClickEvent.initCustomEvent('export-file', true, true, { format: '' });

        var that = this;
        
        document.getElementById("csv-export").addEventListener('click', function (event) {
            that.exportClickEvent.format = 'csv';
            that.getPalette().dispatchEvent(that.exportClickEvent);
            that.popDown();
        });
        document.getElementById("pdf-export").addEventListener('click', function (event) {
            that.exportClickEvent.format = 'pdf';
            that.getPalette().dispatchEvent(that.exportClickEvent);
            that.popDown();
        });
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    exportpalette.ExportPalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return exportpalette;
});
