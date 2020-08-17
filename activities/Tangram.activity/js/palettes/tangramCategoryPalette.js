define(["sugar-web/graphics/palette",
  "text!activity/palettes/tangramCategoryPalette.html"
], function(palette, template) {

  'use strict';

  var tangramCategoryPalette = {};

  tangramCategoryPalette.TangramCategoryPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "tangram-category-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.tangramCategorySelectedEvent = document.createEvent('CustomEvent');
    this.tangramCategorySelectedEvent.initCustomEvent('tangram-category-selected', true, true, {
      index: 0
    });

    var that = this;
    addEventListenersForTangramCategories(that, that.tangramCategorySelectedEvent);
  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  var addEventListenersForTangramCategories = function (that, customEvent) {
    let buttons = document.getElementById('category-buttons').children;
    for (var i = 0; i < buttons.length; i++) {
      let cat = buttons[i].innerHTML;
      buttons[i].addEventListener('click', function(event) {
        that.tangramCategorySelectedEvent.index = cat;
        that.getPalette().dispatchEvent(customEvent);
        that.popDown();
      });
    }
  }

  tangramCategoryPalette.TangramCategoryPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return tangramCategoryPalette;
});
