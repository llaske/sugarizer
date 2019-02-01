define(["viewpalettetemplate",
        "text!viewpalette.html"], function (palette, template) {

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

        this.projectionobjects = document.getElementsByClassName("view");

		var that = this;
        for (var i=0; i<this.projectionobjects.length; i++){
            this.projectionobjects[i].addEventListener('click', function(){
                var viewobj = document.getElementsByClassName("view");
                for (var j=0; j<viewobj.length; j++){
                    viewobj[j].style.backgroundColor = "black";
                }
                this.style.backgroundColor = "grey";
                document.getElementById('projection-view').innerHTML = this.id;
				that.popDown();
            });
			var currentview = document.getElementById(document.getElementById('projection-view').innerHTML);
			if (currentview == null) currentview = document.getElementById("stereo");
			//currentview.style.backgroundColor = "grey";
        }

    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Projection View Select:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});
