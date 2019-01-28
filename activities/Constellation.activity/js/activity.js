define(["sugar-web/activity/activity", "worldpalette", "viewPalette"], function (activity, worldpalette, viewpalette) {

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
			})

			//Toggle Star names
			S("button#star-button").on('click', function (){
				planetarium.toggleStarLabels();
			})

			//Set long and lat to specific country
			S("button.country").on('click', function (){
				var longlat = document.getElementById('worldConst').innerHTML;
				var customLatitude = planetarium.setLatitude(parseFloat(longlat.split(',')[0]));
				var customLongitude = planetarium.setLongitude(parseFloat(longlat.split(',')[1]));
				planetarium.setGeo(S(customLatitude,customLongitude)).setClock(0).draw();
			})

			//Change projection view
			S("button.view").on('click', function (){
				var pv = document.getElementById('projection-view').innerHTML;
				planetarium.selectProjection(pv);
				//console.log(pv);
			})


		});



	});

});
