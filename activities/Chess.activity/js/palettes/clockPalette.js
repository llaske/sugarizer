define(["sugar-web/graphics/palette",
  "text!activity/palettes/clockPalette.html"
], function(palette, template) {

  'use strict';

  var clockPalette = {};

  clockPalette.ClockPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    var activityTitle;
    var descriptionLabel;
    var descriptionBox;

    this.getPalette().id = "clock-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.clockSelectedEvent = document.createEvent('CustomEvent');
    this.clockSelectedEvent.initCustomEvent('clockSelected', true, true, {
      index: 0
    });

    var that = this;
    document.getElementById("disabled-clock").addEventListener('click', function(event) {
      that.clockSelectedEvent.index = 0;
      that.getPalette().dispatchEvent(that.clockSelectedEvent);
      that.popDown();

    });

    document.getElementById("lightning-clock").addEventListener('click', function(event) {
      that.clockSelectedEvent.index = 1;
      that.getPalette().dispatchEvent(that.clockSelectedEvent);
      that.popDown();

    });

    document.getElementById("blitz-clock").addEventListener('click', function(event) {
      that.clockSelectedEvent.index = 2;
      that.getPalette().dispatchEvent(that.clockSelectedEvent);
      that.popDown();

    });

    document.getElementById("tournament-clock").addEventListener('click', function(event) {
      that.clockSelectedEvent.index = 3;
      that.getPalette().dispatchEvent(that.clockSelectedEvent);
      that.popDown();

    });
  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  clockPalette.ClockPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return clockPalette;
});
