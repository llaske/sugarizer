define(["sugar-web/graphics/palette",
  "text!activity/palettes/hintPalette.html"
], function(palette, template) {

  'use strict';

  var hintPalette = {};

  hintPalette.HintPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  hintPalette.HintPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return hintPalette;
});
