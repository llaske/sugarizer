define(["sugar-web/graphics/palette"], function (palette) {

    var loggingpalette = {};

    loggingpalette.LoggingPalette = function (invoker, primaryText) {
        palette.Palette.call(this, invoker, primaryText);

        var template =
            `
            <div id="time-one" class="palette-item">1/10 second</div>
            <div id="time-two" class="palette-item">1 second</div>
            <div id="time-three" class="palette-item">30 seconds</div>
            <div id="time-four" class="palette-item">5 minutes</div>
        `;

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.logIntervalEvent = document.createEvent('CustomEvent');
        this.logIntervalEvent.initCustomEvent('log-interval', true, true, { secondVal: 0 });

        var that = this;

        document.getElementById("time-one").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 0.1;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("time-two").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 1;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("time-three").addEventListener('click', function (event) {
            that.logIntervalEvent.secondVal = 30;
            that.getPalette().dispatchEvent(that.logIntervalEvent);
            that.popDown();
        });
        document.getElementById("time-four").addEventListener('click', function (event) {
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
