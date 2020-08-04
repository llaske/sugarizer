define(["sugar-web/graphics/palette",
  "text!activity/palettes/tangramTypePalette.html"
], function(palette, template) {

  'use strict';

  var tangramTypePalette = {};

  tangramTypePalette.TangramTypePalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "tangram-type-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.tangramTypeSelectedEvent = document.createEvent('CustomEvent');
    this.tangramTypeSelectedEvent.initCustomEvent('tangram-type-selected', true, true, {
      index: 0
    });

    var that = this;

    document.getElementById('standard-type-button').addEventListener('click', function(event) {
      that.tangramTypeSelectedEvent.index = 1;
      that.getPalette().dispatchEvent(that.tangramTypeSelectedEvent);
      that.popDown();
    });

    document.getElementById('random-type-button').addEventListener('click', function(event) {
      that.tangramTypeSelectedEvent.index = 2;
      that.getPalette().dispatchEvent(that.tangramTypeSelectedEvent);
      that.popDown();
    });

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  tangramTypePalette.TangramTypePalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return tangramTypePalette;
});
