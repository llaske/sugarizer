define(["sugar-web/activity/activity", "sugar-web/datastore"], function (activity, datastore) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

				var stopButton = document.getElementById("stop-button");
				stopButton.addEventListener('click', function (event) {
					for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
						if (document.getElementsByTagName("span")[i].innerHTML == "Save"){
							document.getElementsByTagName("span")[i].click();
							console.log("Saved successfully");
						}
						else{
							console.log("Unable to save");
						}
					}
					console.log("writing...");
					var data = document.getElementById("myBlocks").value;
					console.log(data);
					var jsonData = JSON.stringify(data);
					activity.getDatastoreObject().setDataAsText(jsonData);
					activity.getDatastoreObject().save(function (error) {
						if (error === null) {
							console.log("write done.");
						} else {
							console.log("write failed.");
						}
					});
				});
				activity.getDatastoreObject().getMetadata(function(error, mdata){
					console.log("datastore check");
					var d = new Date().getTime();
					if (Math.abs(d-mdata.creation_time) < 2000){
						console.log("Time too short");
					}
					else{
						activity.getDatastoreObject().loadAsText(function(error, metadata, data){
							if (error==null && data!=null){
								data = JSON.parse(data);
								console.log(data);
								for (var i = 0; i < document.body.getElementsByTagName("span").length; i++){
									if (document.getElementsByTagName("span")[i].innerHTML == "Load"){
										document.getElementById("myBlocks").value = data;
										document.getElementsByTagName("span")[i].click();
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
