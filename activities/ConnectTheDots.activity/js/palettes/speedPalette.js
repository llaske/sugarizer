define(["sugar-web/graphics/palette", "text!activity/palettes/speedPalette.html", "activity/modes/game-mode"], function(palette, template, gameMode) {

  'use strict';

  var speedPalette = {};

  speedPalette.SpeedPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "speed-palette";
    
    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.speedScale = containerElem.querySelector('#speedvalue');

    this.speedScale.oninput = function() {
      var val = this.value;
      // Map 0-100 to 0.01-0.10 so the game never fully stops
      var newSpeed = 0.01 + (val * 0.0009); 
      if (typeof gameMode.setSpeed === 'function') {
        gameMode.setSpeed(newSpeed);
      }
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('speedChanged', true, true, { 'speed': newSpeed });
      invokingButton.dispatchEvent(event);
    };
  };

  speedPalette.SpeedPalette.prototype =
    Object.create(palette.Palette.prototype, {
      setTitleDescription: {
        value: "Speed Palette:",
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return speedPalette;
});
