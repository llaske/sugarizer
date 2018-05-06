define(["sugar-web/activity/activity", "sugar-web/datastore", "sugar-web/env"], function (activity, datastore, env) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

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
					activity.close();
				});
			});
			for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
				var spanElement = document.getElementsByTagName("span")[i];
				if (spanElement.innerHTML == "Save to Sugarizer"){
					spanElement.click();
					console.log("Call saved successfully");
				}
				else{
					console.log("Unable to save");
				}
			}
		});

		env.getEnvironment(function(err, environment) {
			if (environment.objectId) {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data){
					if (error==null && data!=null){
						console.log(data);
						for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
							var spanElement = document.getElementsByTagName("span")[i];
							if (spanElement.innerHTML == "Load from Sugarizer"){
								document.getElementById("myBlocks").value = data;
								spanElement.click();
								console.log("Loaded successfully");
							}
							else{
								console.log("Unable to load");
							}
						}
					}
				});
			}
		});
	});
});
