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

    document.getElementById('category-button-1').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Animals";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    document.getElementById('category-button-2').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Geometrical";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    document.getElementById('category-button-3').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Letters, Numbers, Signs";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    document.getElementById('category-button-4').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "People";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });
    document.getElementById('category-button-5').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Usual Objects";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    document.getElementById('category-button-6').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Boats";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    document.getElementById('category-button-7').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Miscellaneous";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });

    /*document.getElementById('category-button-random').addEventListener('click', function(event) {
      that.tangramCategorySelectedEvent.index = "Random";
      that.getPalette().dispatchEvent(that.tangramCategorySelectedEvent);
      that.popDown();
    });*/
  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

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
