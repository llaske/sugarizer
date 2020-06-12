define(["sugar-web/graphics/palette",
  "text!activity/palettes/compulsoryOpPalette.html"
], function(palette, template) {

  'use strict';

  var compulsoryOpPalette = {};

  compulsoryOpPalette.CompulsoryOpPalette = function(invokingButton, state) {

    palette.Palette.call(this, invokingButton);

    this.getPalette().id = "compulsory-op-palette";

    var activityTitle;
    var descriptionLabel;
    var descriptionBox;

    //this.getPalette().id = "clock-palette";

    var containerElem = document.createElement('div');
    containerElem.innerHTML = template;
    this.setContent([containerElem]);

    this.compulsoryOpSelectedEvent = document.createEvent('CustomEvent');
    this.compulsoryOpSelectedEvent.initCustomEvent('compulsory-op-selected', true, true, {
      operator: null
    });

    var that = this;

    document.getElementById('plus-cmpOp').addEventListener('click', function(event) {
      that.compulsoryOpSelectedEvent.operator = '+';
      that.getPalette().dispatchEvent(that.compulsoryOpSelectedEvent);
      this.classList.toggle("palette-button-notselected");
      that.popDown();
    });

    document.getElementById('minus-cmpOp').addEventListener('click', function(event) {
      that.compulsoryOpSelectedEvent.operator = '-';
      that.getPalette().dispatchEvent(that.compulsoryOpSelectedEvent);
      this.classList.toggle("palette-button-notselected");
      that.popDown();
    });

    document.getElementById('multiply-cmpOp').addEventListener('click', function(event) {
      that.compulsoryOpSelectedEvent.operator = '*';
      that.getPalette().dispatchEvent(that.compulsoryOpSelectedEvent);
      this.classList.toggle("palette-button-notselected");
      that.popDown();
    });

    document.getElementById('divide-cmpOp').addEventListener('click', function(event) {
      that.compulsoryOpSelectedEvent.operator = '/';
      that.getPalette().dispatchEvent(that.compulsoryOpSelectedEvent);
      this.classList.toggle("palette-button-notselected");
      that.popDown();
    });

  };

  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  compulsoryOpPalette.CompulsoryOpPalette.prototype =
    Object.create(palette.Palette.prototype, {
      addEventListener: {
        value: addEventListener,
        enumerable: true,
        configurable: true,
        writable: true
      }
    });

  return compulsoryOpPalette;
});
