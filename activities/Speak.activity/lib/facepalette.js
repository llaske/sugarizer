define(["widepalette",
        "text!facepalette.html"], function (palette, template) {

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
		
		var eyevalue = document.getElementById("eyevalue");
		eyevalue.min = 1;
		eyevalue.max = 5;
		eyevalue.value = document.getElementById('numeyes').innerHTML;
		eyevalue.onclick = function() {
            document.getElementById('numeyes').innerHTML = eyevalue.value;
        }
		
		document.getElementById('eyes').onclick = function() {
			document.getElementById('eyetype').innerHTML = 1;
			document.getElementById('eyes').src = "icons/eyes-selected.svg";
			document.getElementById('glasses').src = "icons/glasses.svg";
			
		}
		document.getElementById('glasses').onclick = function() {
			document.getElementById('eyetype').innerHTML = 2;
			document.getElementById('eyes').src = "icons/eyes.svg";
			document.getElementById('glasses').src = "icons/glasses-selected.svg";
		}
    };

    activitypalette.ActivityPalette.prototype =
        Object.create(palette.Palette.prototype, {
            setTitleDescription: {
                value: "Face Palette:",
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

    return activitypalette;
});
