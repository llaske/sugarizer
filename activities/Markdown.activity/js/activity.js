define(["sugar-web/activity/activity","webL10n","sugar-web/datastore"], function (activity, datastore) {

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
		var buttons = ["wmd-bold-button-second", "wmd-italic-button-second", "wmd-heading-button", "wmd-hr-button",
			       "wmd-olist-button", "wmd-ulist-button", "wmd-code-button", "wmd-quote-button", "wmd-link-button",
				"wmd-undo-button", "wmd-redo-button"];
        inputTextContent = document.getElementById("wmd-input-second");
        inputTextContent.value = l10n_s.get("sample-input");
		//document.getElementById("wmd-bold-button-second");

        //to save and resume the contents from datastore.

        var datastoreObject = activity.getDatastoreObject();

        inputTextContent.onblur = function () {

            var jsonData = JSON.stringify((inputTextContent.value).toString());
            datastoreObject.setDataAsText(jsonData);
            datastoreObject.save(function () {});
        };
        markdownParsing(); //to load for the first time
        datastoreObject.loadAsText(function (error, metadata, data) {
            markdowntext = JSON.parse(data);
            inputTextContent.value = markdowntext;
            markdownParsing(); //to load again when there is a datastore entry
        });
		for (i = 0; i < buttons.length; i++) {
			document.getElementById(buttons[i]).title = l10n_s.get(buttons[i]);
		    var journal = document.getElementById(buttons[i]);

		    journal.onclick = function () {
		        activity.showObjectChooser(function (error, result) {
		            //result1 = result.toString();
		            var datastoreObject = new datastore.DatastoreObject(result);
		            datastoreObject.loadAsText(function (error, metadata, data) {

		                try {
		                    textdata = JSON.parse(data);
		                } catch (e) {
		                    textdata = data;
		                }

		                var inputTextContent = document.getElementById("wmd-input-second");
		                //inputTextContent.value += textdata;
		                insertAtCursor(inputTextContent, textdata);
		            });

		        });
		    };
		}

        function insertAtCursor(myField, myValue) {
            //IE support
            if (document.selection) {
                myField.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
            }
            //MOZILLA and others
            else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                myField.value = myField.value.substring(0, startPos)
                    + myValue
                    + myField.value.substring(endPos, myField.value.length);
            } else {
                myField.value += myValue;
            }
            //markdownParsing();
        }

        function markdownParsing() {
            var converter2 = new Markdown.Converter();

            var help = function () {
                alert(l10n_s.get("need-help"));
            }
            var options = {
                helpButton: {
                    handler: help
                },
                strings: {
                    quoteexample: l10n_s.get("put-it-right-here")
                }
            };

            var editor2 = new Markdown.Editor(converter2, "-second", options);

            editor2.run();
        }

    });

});
