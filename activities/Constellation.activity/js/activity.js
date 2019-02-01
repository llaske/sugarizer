define(["sugar-web/activity/activity","sugar-web/env", "worldpalette", "viewPalette"], function (activity, env, worldpalette, viewpalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		var datastoreObject = activity.getDatastoreObject();

        var worldButton = document.getElementById("world-button");

        var worldPalette = new worldpalette.ActivityPalette(
            worldButton, datastoreObject);

				var viewButton = document.getElementById("view-button");

        var viewPalette = new viewpalette.ActivityPalette(
            viewButton, datastoreObject);


		S(document).ready(function() {

			var planetarium = S.virtualsky({
							id: 'starmap', //Div tag id where you want to place star chart
							projection:'stereo', //Type of map projection used
							keyboard: false, //Disable/Enable keyboard
							showposition: false, //Show/Hide coordinates
							showstars: true, //Show/Hide stars
							constellations: true, //Show/Hide constellation lines
							constellationlabels: true, //Show/Hide Constellation names
							showplanets: true, //Show/Hide planets
							showplanetlabels: true, //Show/Hide planet names
							live: false, //Disabe/Enable real time clock
							clock: new Date() //Set clock
			});
			
			//Array to save chart
			var chartJournal = [true,false,"55.3781,-3.4360","stereo"];

			//Add 1 day to date
			S("button#add-button").on('click', function (){
				planetarium.clock.setDate(planetarium.clock.getDate() + 1);
				planetarium.updateClock(planetarium.clock);
			})

			//Minus 1 day to date
			S("button#minus-button").on('click', function (){
				planetarium.clock.setDate(planetarium.clock.getDate() - 1);
				planetarium.updateClock(planetarium.clock);
			})

			//Toggle Constellation Lines and Name
			S("button#const-button").on('click', function (){

				planetarium.toggleConstellationLines();
				planetarium.toggleConstellationLabels();

				if (chartJournal[0] == true){
					chartJournal[0] = false;
				} else{
					chartJournal[0] = true;
				}

				console.log(chartJournal[0]);
			})

			//Toggle Star names
			S("button#star-button").on('click', function (){
				planetarium.toggleStarLabels();

				if (chartJournal[1] == true){
					chartJournal[1] = false;
				} else{
					chartJournal[1] = true;
				}
				console.log(chartJournal[1]);
			})

			//Set long and lat to specific country
			S("button.country").on('click', function (){
				var longlat = document.getElementById('worldConst').innerHTML;
				var customLatitude = planetarium.setLatitude(parseFloat(longlat.split(',')[0]));
				var customLongitude = planetarium.setLongitude(parseFloat(longlat.split(',')[1]));
				planetarium.setGeo(S(customLatitude,customLongitude)).setClock(0).draw();
				chartJournal[2] = longlat;
				console.log(chartJournal);
			})

			//Change projection view
			S("button.view").on('click', function (){
				var pv = document.getElementById('projection-view').innerHTML;
				planetarium.selectProjection(pv);
				chartJournal[3] = pv;
				console.log(chartJournal);
			})

			//Save in Journal on stop
			document.getElementById("stop-button").addEventListener('click', function (event) {
				console.log("writing...");
				var jsonData = JSON.stringify(chartJournal);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
						console.log(jsonData);
					} else {
						console.log("write failed.");
					}
				});
			});

			// Load from datastore
			env.getEnvironment(function(err, environment) {
			currentenv = environment;

			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
				document.getElementById(chartJournal[2]).style.backgroundColor = 'grey';
				document.getElementById(chartJournal[3]).style.backgroundColor = 'grey';
			} else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						chartJournal = JSON.parse(data);
						customLatitude = planetarium.setLatitude(parseFloat(chartJournal[2].split(',')[0]));
					 	customLongitude = planetarium.setLongitude(parseFloat(chartJournal[2].split(',')[1]));
						planetarium.setGeo(S(customLatitude,customLongitude)).setClock(0).draw();
						document.getElementById(chartJournal[2]).style.backgroundColor = 'grey';
						planetarium.selectProjection(chartJournal[3]);
						document.getElementById(chartJournal[3]).style.backgroundColor = 'grey';
						if (chartJournal[0] == false){
							planetarium.toggleConstellationLines();
							planetarium.toggleConstellationLabels();
						}
						if (chartJournal[1] == true){
							planetarium.toggleStarLabels();
						}
					}
				});
			}
		});


		});



	});

});
