define(["sugar-web/graphics/palette"], function (palette) {

    var loggingpalette = {};

    loggingpalette.LoggingPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
            `
            <div id="loggingPalette">
                <div id="interval-0.1" class="palette-item">1/10 second</div>
                <div id="interval-1" class="palette-item">1 second</div>
                <div id="interval-30" class="palette-item">30 second</div>
                <div id="interval-300" class="palette-item">5 minutes</div>
            </div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.logIntervalEvent = document.createEvent('CustomEvent');
        this.logIntervalEvent.initCustomEvent('log-interval', true, true, { secondVal: 0 });

        var that = this;

        document.getElementById("interval-0.1").style.backgroundColor = 'darkgray';

        document.getElementById("interval-0.1").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 0.1;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("interval-1").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 1;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("interval-30").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 30;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("interval-300").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 300;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    loggingpalette.LoggingPalette.prototype = Object.create(palette.Palette.prototype, {
        addEventListener: {
            value: addEventListener,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    return loggingpalette;
});
