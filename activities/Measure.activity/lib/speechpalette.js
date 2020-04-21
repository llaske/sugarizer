define(["sugar-web/graphics/palette",
        "text!speechpalette.html"], function (palette, template) {

    'use strict';

    var activitypalette = {};

    activitypalette.ActivityPalette = function (activityButton) {

        palette.Palette.call(this, activityButton);

        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "activity-palette";

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.pitchScale = containerElem.querySelector('#timepitchvalue');
        this.rateScale = containerElem.querySelector('#timeratevalue');

        this.pitchScale.onclick = function() {
            // console.log("he;;p");
            console.log(this.value,"pitch");
            // document.getElementById('pitch').innerHTML = this.value;
        }
        this.rateScale.onclick = function() {
            console.log(this.value,"rate");
            // document.getElementById('rate').innerHTML = this.value*(300/100) + 10;
            // console.log("hell");
        }


    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Speech Palette:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
    return activitypalette;
});