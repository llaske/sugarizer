define(["sugar-web/graphics/palette",
  "text!activity/palettes/difficultyPalette.html"
], function(palette, template) {

  'use strict';

  var difficultyPalette = {};

  difficultyPalette.DifficultyPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "difficulty-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.difficultySelectedEvent = document.createEvent('CustomEvent');
    this.difficultySelectedEvent.initCustomEvent('difficulty-selected', true, true, {
      index: 0
    });

    var that = this;

    document.getElementById('easy-button').addEventListener('click', function(event) {
      that.difficultySelectedEvent.index = 0;
      that.getPalette().dispatchEvent(that.difficultySelectedEvent);
      that.popDown();
    });

    document.getElementById('medium-button').addEventListener('click', function(event) {
      that.difficultySelectedEvent.index = 1;
      that.getPalette().dispatchEvent(that.difficultySelectedEvent);
      that.popDown();
    });

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  difficultyPalette.DifficultyPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return difficultyPalette;
});
