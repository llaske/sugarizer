define(["sugar-web/graphics/palette",
  "text!activity/palettes/timerPalette.html"
], function(palette, template) {

  'use strict';

  var timerPalette = {};

  timerPalette.TimerPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "timer-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.timerSelectedEvent = document.createEvent('CustomEvent');
    this.timerSelectedEvent.initCustomEvent('timer-selected', true, true, {
      index: 0
    });

    var that = this;

    document.getElementById('no-timer-button').addEventListener('click', function(event) {
      that.timerSelectedEvent.index = 0;
      that.getPalette().dispatchEvent(that.timerSelectedEvent);
      that.popDown();
    });

    document.getElementById('first-timer-button').addEventListener('click', function(event) {
      that.timerSelectedEvent.index = 1;
      that.getPalette().dispatchEvent(that.timerSelectedEvent);
      that.popDown();
    });

    document.getElementById('second-timer-button').addEventListener('click', function(event) {
      that.timerSelectedEvent.index = 2;
      that.getPalette().dispatchEvent(that.timerSelectedEvent);
      that.popDown();
    });

    document.getElementById('third-timer-button').addEventListener('click', function(event) {
      that.timerSelectedEvent.index = 3;
      that.getPalette().dispatchEvent(that.timerSelectedEvent);
      that.popDown();
    });

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  timerPalette.TimerPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return timerPalette;
});
