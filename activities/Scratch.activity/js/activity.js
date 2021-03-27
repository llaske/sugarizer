define(["sugar-web/activity/activity", "sugar-web/datastore", "sugar-web/env"], function (activity, datastore, env) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();


		// HACK: Clone stop button to remove default stop handling
		var oldStopButton = document.getElementById("stop-button");
		var stopButton = oldStopButton.cloneNode(true);
		document.getElementById("main-toolbar").replaceChild(stopButton, oldStopButton);

		// Handle Stop click
		stopButton.addEventListener('click', function (event) {
			document.getElementById("myBlocks").addEventListener('click', function (event) {
				console.log("writing...");
				var data = document.getElementById("myBlocks").value;
				activity.getDatastoreObject().setDataAsText(data);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
					window.onbeforeunload = null;
					window.setTimeout(function() {
						activity.close();
					}, 500);
				});
			});
			var found = false;
			for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
				var spanElement = document.getElementsByTagName("span")[i];
				if (spanElement.innerHTML == "Save to Sugarizer"){
					spanElement.click();
					found = true;
					break;
				}
			}
			console.log(found?"Call saved successfully":"Unable to save");
		});

		env.getEnvironment(function(err, environment) {
			if (environment.objectId) {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data){
					if (error==null && data!=null){
						var found = false;
						var spanFound = null;
						for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
							var spanElement = document.getElementsByTagName("span")[i];
							if (spanElement.innerHTML == "Load from Sugarizer"){
								document.getElementById("myBlocks").value = data;
								spanFound = spanElement;
								setTimeout(function() {
									spanFound.click();
								}, 500);
								found = true;
								break;
							}
						}
						console.log(found?"Loaded successfully":"Unable to load");
					}
				});
			}
		});
	});
});
