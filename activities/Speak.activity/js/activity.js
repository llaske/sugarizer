define(["sugar-web/activity/activity","activity/SpeakActivity","facepalette","speechpalette","languagepalette","tutorial","activity/sax","activity/dom-js","activity/AIMLInterpreter","activity/Speech"], function (activity, speakActivity, facepalette, speechpalette, languagepalette,tutorial) {

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
        // Launch tutorial
        document.getElementById("help-button").addEventListener('click', function(e) {
          tutorial.start();
        });


        //Loads talk history when instance is existing
        activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
      		if (error==null && data!=null) {
      			var parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                speakArray = parsedData;
            } else {
                speakArray = parsedData.speakArray || [];
                if (parsedData.mode) document.getElementById('mode').innerHTML = parsedData.mode;
                if (parsedData.numeyes) {
                    document.getElementById('numeyes').innerHTML = parsedData.numeyes;
                    if (document.getElementById('eyevalue')) document.getElementById('eyevalue').value = parsedData.numeyes;
                }
                if (parsedData.eyetype) {
                    document.getElementById('eyetype').innerHTML = parsedData.eyetype;
                    if (parsedData.eyetype == 1) {
                        if (document.getElementById('eyes')) document.getElementById('eyes').src = "icons/eyes-selected.svg";
                        if (document.getElementById('glasses')) document.getElementById('glasses').src = "icons/glasses.svg";
                    } else if (parsedData.eyetype == 2) {
                        if (document.getElementById('eyes')) document.getElementById('eyes').src = "icons/eyes.svg";
                        if (document.getElementById('glasses')) document.getElementById('glasses').src = "icons/glasses-selected.svg";
                    }
                }
                if (parsedData.rate) {
                    document.getElementById('rate').innerHTML = parsedData.rate;
                    if (document.getElementById('ratevalue')) document.getElementById('ratevalue').value = (parsedData.rate - 10) / 3;
                }
                if (parsedData.pitch) {
                    document.getElementById('pitch').innerHTML = parsedData.pitch;
                    if (document.getElementById('pitchvalue')) document.getElementById('pitchvalue').value = parsedData.pitch;
                }
                if (parsedData.speaklang) {
                    document.getElementById('speaklang').innerHTML = parsedData.speaklang;
                    var langobj = document.getElementsByClassName("lang");
                    for (var j=0; j<langobj.length; j++){
                        langobj[j].style.backgroundColor = "black";
                    }
                    var currentlang = document.getElementById("lang-" + parsedData.speaklang);
                    if (currentlang) currentlang.style.backgroundColor = "grey";
                }
            }
            removeExtra(speakArray); // Removes extra element and organizes list.
            speakComboBox();
            //console.log(speakArray);
      		}
      	});

        // Saves talk history in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
        	console.log("writing...");
        	var env = {
              speakArray: speakArray,
              mode: document.getElementById('mode').innerHTML,
              numeyes: document.getElementById('numeyes').innerHTML,
              eyetype: document.getElementById('eyetype').innerHTML,
              rate: document.getElementById('rate').innerHTML,
              pitch: document.getElementById('pitch').innerHTML,
              speaklang: document.getElementById('speaklang').innerHTML
          };
        	var jsonData = JSON.stringify(env);
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