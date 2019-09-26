define(["widepalette",
        "text!languagepalette.html"], function (palette, template) {

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

        this.langobjects = document.getElementsByClassName("lang");

		var that = this;
        for (var i=0; i<this.langobjects.length; i++){
            this.langobjects[i].addEventListener('click', function(){
                var langobj = document.getElementsByClassName("lang");
                for (var j=0; j<langobj.length; j++){
                    langobj[j].style.backgroundColor = "black";
                }
                this.style.backgroundColor = "grey";
                document.getElementById('speaklang').innerHTML = (this.id).split('-')[1];
				that.popDown();
            });
			var currentlang = document.getElementById("lang-"+document.getElementById('speaklang').innerHTML);
			if (currentlang == null) currentlang = document.getElementById("lang-en");
			currentlang.style.backgroundColor = "grey";
        }

    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Language Select:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});
