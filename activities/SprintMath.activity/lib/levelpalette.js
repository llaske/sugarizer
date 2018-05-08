define(["levelpalettetemplate",
    "text!levelpalette.html"], function (palette, template) {

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

        this.langobjects = document.getElementsByClassName("level");

        var that = this;
        for (var i=0; i<this.langobjects.length; i++){
            this.langobjects[i].addEventListener('click', function(){
                var levelobj = document.getElementsByClassName("level");
                for (var j=0; j<levelobj.length; j++){
                    levelobj[j].style.backgroundColor = "black";
                }
                this.style.backgroundColor = "grey";
                document.getElementById('level').innerHTML = (this.id);
                console.log("Level inside:"+ this.id)
                that.popDown();
            });
            var level = document.getElementById(document.getElementById('level').innerHTML);
            if (level == null) level = document.getElementById("easy");
            level.style.backgroundColor = "grey";
        }

    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Level Select:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});