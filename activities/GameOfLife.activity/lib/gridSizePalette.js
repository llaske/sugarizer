define(["sugar-web/graphics/palette",
        "text!gridSizePalette.html",'activity/patterns'], function (palette, template, patterns) {

    'use strict';

    var activitypalette = {};

    activitypalette.ActivityPalette = function (activityButton, state, board) {

        palette.Palette.call(this, activityButton);

        var randomPattern = patterns[0];
        var activityTitle;
        var descriptionLabel;
        var descriptionBox;

        this.getPalette().id = "activity-palette";

        var containerElem = document.createElement('div');
        containerElem.innerHTML = template;
        this.setContent([containerElem]);

        this.sizeScale = containerElem.querySelector('#sizevalue');

        this.sizeScale.onclick = function(){
          var val = this.value;
          var newCols = val*20;
          var newRows = val*10;
          state.set({
            gridCols : newCols,
            gridRows : newRows,
            generation : 0
          });
          state.set({
            boardState : randomPattern(state)
          })
          board.handleResize(window.innerWidth, state.state.boardState, state);
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
