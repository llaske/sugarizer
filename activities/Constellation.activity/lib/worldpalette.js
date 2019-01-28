define(["worldpalettetemplate",
        "text!worldpalette.html"], function (palette, template) {

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

        this.countryobjects = document.getElementsByClassName("country");

		var that = this;
        for (var i=0; i<this.countryobjects.length; i++){
            this.countryobjects[i].addEventListener('click', function(){
                var countryobj = document.getElementsByClassName("country");
                for (var j=0; j<countryobj.length; j++){
                    countryobj[j].style.backgroundColor = "black";
                }
                this.style.backgroundColor = "grey";
                document.getElementById('worldConst').innerHTML = [(this.id).split(',')[0],(this.id).split(',')[1]];
				that.popDown();
            });
			var currentcountry = document.getElementById("55.3781,"+document.getElementById('worldConst').innerHTML);
			if (currentcountry == null) currentcountry = document.getElementById("55.3781,-3.4360");
			currentcountry.style.backgroundColor = "grey";
        }

    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "World Select:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});
