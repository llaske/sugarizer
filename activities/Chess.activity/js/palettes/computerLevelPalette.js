define(["sugar-web/graphics/palette",
  "text!activity/palettes/computerLevelPalette.html"
], function(palette, template) {

  'use strict';

  var computerLevelPalette = {};

  computerLevelPalette.ComputerLevelPalette = function(invokingButton) {

    palette.Palette.call(this, invokingButton);

    var activityTitle;
    var descriptionLabel;
    var descriptionBox;

    this.getPalette().id = "computerLevel-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.computerlevelChangedEvent = document.createEvent('CustomEvent');
    this.computerlevelChangedEvent.initCustomEvent('computerlevelChanged', true, true, {
      level: 0
    });


    this.levelScale = containerElem.querySelector('#compLevelValue');
    var that = this;

    document.getElementById("compLevelValue").addEventListener('click', function () {
      var val = this.value;
      var level = Math.floor(val / 20);
      that.computerlevelChangedEvent.level = level;
      this.value = level * 20;
      that.getPalette().dispatchEvent(that.computerlevelChangedEvent);
    })

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };


  computerLevelPalette.ComputerLevelPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
    });

  return computerLevelPalette;
});
