define(["sugar-web/graphics/palette"], function (palette) {

    var zoompalette = {};

    zoompalette.ZoomPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template = 
        `
            <div id="zoomSettingsPalette" style="margin: 10px;">
                <button id="zoom-in-button" class="toolbutton" onclick="app.decrementZoom()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                <input id="zoomSlider" class="multiplatformInputSlider" type="range" min="0" max="95" step="0.00001" value="0.0005" oninput="app.ZoomInOut()" style="width:100px;vertical-align: top;margin-top: 10%;">
                <button id="zoom-out-button" class="toolbutton" onclick="app.incrementZoom()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
            </div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    zoompalette.ZoomPalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return zoompalette;
});
