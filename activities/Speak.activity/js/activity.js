define(["sugar-web/activity/activity","activity/SpeakActivity","facepalette","speechpalette","languagepalette","activity/sax","activity/dom-js","activity/AIMLInterpreter","activity/Speech", "tutorial", "webL10n"], function (activity, speakActivity, facepalette, speechpalette, languagepalette, tutorial, webL10n) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();


		var datastoreObject = activity.getDatastoreObject();
        var faceButton = document.getElementById("face-button");

        var faceButtonPalette = new facepalette.ActivityPalette(
            faceButton, datastoreObject);

        var speechButton = document.getElementById("speech-button");

        var speechButtonPalette = new speechpalette.ActivityPalette(
            speechButton, datastoreObject);

        var languageButton = document.getElementById("language-button");

        var languagePalette = new languagepalette.ActivityPalette(
            languageButton, datastoreObject);


        //Loads talk history when instance is existing
        activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
      		if (error==null && data!=null) {
      			speakArray = JSON.parse(data);
            removeExtra(speakArray); // Removes extra element and organizes list.
            speakComboBox();
            //console.log(speakArray);
      		}
      	});

        // Saves talk history in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
        	console.log("writing...");
        	var jsonData = JSON.stringify(speakArray);
          console.log(jsonData);
        	activity.getDatastoreObject().setDataAsText(jsonData);
        	activity.getDatastoreObject().save(function (error) {
        		if (error === null) {
        			console.log("write done.");
        		} else {
        			console.log("write failed.");
        		}
        	});

    });

        document.getElementById("help-button").addEventListener('click', function(e) {
          tutorial.start();
        });

        // Function that creates options for select tag. Value of options is equal to saved talk.
        function speakComboBox() {
          for (var i = 0; i < speakArray.length; i ++) {
            var addUserInput = document.createElement("OPTION");
            addUserInput.setAttribute("value", speakArray[i]);
            addUserInput.text = speakArray[i];
            document.getElementById("combo-box").appendChild(addUserInput);
          }
        }

        //Function that removes extra elements in the select tag.
        function removeExtra(element) {
          element.sort();
          for (var x = element.length-1; x--;) {
            if (element[x] === element[x + 1]) {
              element.splice(x, 1);
            }
          }
        }



    });



});
