define(["sugar-web/graphics/palette"], function (palette) {

    var settingspalette = {};

    settingspalette.SettingsPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);
        var waveform_inverted = window.app.invert_waveform;
        var waveform_status;

        if (waveform_inverted) {
            waveform_status = 'Inverted';
        }
        else {
            waveform_status = 'Normal';
        }

        var template =
            `
            <div style="margin: 10px;">
                <h3 id="AmpTitle">Amplitude</h3>
                <div id="amplitudeSettings">
                    <button id="amp-low-button" class="toolbutton" onclick="app.decreaseAmp()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <input id="ampSlider" class="multiplatformInputSlider" type="range" min="1" max="10" step="1" value="10" oninput="app.ampSettings()" style="width:100px;vertical-align: top;margin-top: 10%;">
                    <button id="amp-high-button" class="toolbutton" onclick="app.increaseAmp()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                </div>
                <hr>
                <h3 id="WaveformTitle">Waveform</h3>
                <div id="waveformInversionSettings">
                    <div style="display: -webkit-inline-box;">
                    <button id="invert-off-button" class="toolbutton" onclick="app.invertWaveform()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <button id="invert-on-button" class="toolbutton" onclick="app.invertWaveform()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <h3 id="waveformStatus" style="margin-left: 30%;">${waveform_status}</h3>
                </div>
                </div>
                <hr>
                <h3 id="TriggeringEdgeTitle">Triggering Edge</h3>
                <div id="triggeringEdgeSettings">
                    <div style="display: -webkit-inline-box;">
                    <button id="triggering-edge-none-button" class="toolbutton" onclick="app.triggeringEdge()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <button id="triggering-edge-rising-button" class="toolbutton" onclick="app.triggeringEdge()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <button id="triggering-edge-falling-button" class="toolbutton" onclick="app.triggeringEdge()" style="border-radius: 10px;height: 55px;width: 55px;"></button>
                    <h3 id="TrigEdgeType" style="margin-left: 30%;">None</h3>
                </div>
                </div>
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
