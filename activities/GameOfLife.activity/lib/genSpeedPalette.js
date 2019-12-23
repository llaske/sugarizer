define(["sugar-web/graphics/palette",
        "text!genSpeedPalette.html"], function (palette, template) {

    'use strict';

    var activitypalette = {};

    activitypalette.ActivityPalette = function (activityButton, state) {

        palette.Palette.call(this, activityButton);

        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "activity-palette";

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.speedScale = containerElem.querySelector('#speedvalue');

        this.speedScale.onclick = function() {
            var val = this.value/100;
            var newTimeInterval = 950*val*val-1900*val+1000;
            state.set({
              generationTimeInterval : newTimeInterval
            });
        }

    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Speed Palette:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});
