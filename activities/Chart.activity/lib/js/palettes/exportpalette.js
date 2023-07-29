define(["sugar-web/graphics/palette"], function (palette) {
    var exportpalette = {};

    exportpalette.ExportPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template = `
            <div id="export-formats">
                <button id="export-img-button"></button>
                <button id="export-csv-button"></button>
            </div>
        `;

        var containerElem = document.createElement("div");
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.exportClickEvent = document.createEvent("CustomEvent");
        this.exportClickEvent.initCustomEvent("export-file", true, true, { format: "" });

        var that = this;

        document.getElementById("export-csv-button").addEventListener("click", function (event) {
            that.exportClickEvent.format = "csv";
            that.getPalette().dispatchEvent(that.exportClickEvent);
            that.popDown();
        });
        document.getElementById("export-img-button").addEventListener("click", function (event) {
            that.exportClickEvent.format = "png";
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
            writable: true,
        },
    });

    return exportpalette;
});
