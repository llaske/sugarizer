define(["sugar-web/graphics/palette"], function (palette) {

    var settingspalette = {};

    settingspalette.SettingsPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
            `
            <div style="margin: 10px;">
                <hr>
                <h4 id="changeAmpTitle">Change Amplitude</h4>
                <hr>
                <button id="amp-low-button" class="toolbutton" onclick="app.decreaseAmp()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                <input id="ampSlider" class="multiplatformInputSlider" type="range" min="1" max="10" step="1" value="10" oninput="app.ampSettings()" style="width:100px;vertical-align: top;margin-top: 10%;">
                <button id="amp-high-button" class="toolbutton" onclick="app.increaseAmp()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                <hr>
                <h4 id="invertWaveformTitle">Invert Waveform</h4>
                <hr>
                <button id="invert-off-button" class="toolbutton" onclick="app.invertWaveform()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                <button id="invert-on-button" class="toolbutton" onclick="app.invertWaveform()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
            </div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    settingspalette.SettingsPalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return settingspalette;
});
