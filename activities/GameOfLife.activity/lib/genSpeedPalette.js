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
            var newTimeInterval = 460 - this.value*(450/100);
//            console.log("Generation time interval" + newTimeInterval);
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
