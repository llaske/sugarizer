define(["widepalette",
        "text!speechpalette.html"], function (palette, template) {

    'use strict';

    var activitypalette = {};

    activitypalette.ActivityPalette = function (activityButton,
        datastoreObject) {

        palette.Palette.call(this, activityButton);

        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "activity-palette";

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.pitchScale = containerElem.querySelector('#pitchvalue');
        this.rateScale = containerElem.querySelector('#ratevalue');

        this.pitchScale.oninput = function() {
            document.getElementById('pitch').innerHTML = this.value;
        }
        this.rateScale.oninput = function() {
            document.getElementById('rate').innerHTML = this.value*(300/100) + 10;
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
