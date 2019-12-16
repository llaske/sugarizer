define(["sugar-web/activity/activity","sugar-web/env", "worldpalette", "viewpalette", "webL10n", "tutorial"], function (activity, env, worldpalette, viewpalette, webL10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();


		//Set background color to user color
		var canvas = document.getElementById("canvas");
		var canvasColor;
		activity.getXOColor(function(error, retcolors){
			canvasColor = retcolors;
		});

		canvas.style.backgroundColor = canvasColor["fill"];

		var datastoreObject = activity.getDatastoreObject();

        var worldButton = document.getElementById("world-button");

        var worldPalette = new worldpalette.ActivityPalette(
            worldButton, datastoreObject);

				var viewButton = document.getElementById("view-button");

        var viewPalette = new viewpalette.ActivityPalette(
            viewButton, datastoreObject);

		$(document).ready(function() {

			var planetarium = $.virtualsky({
							id: 'starmap', //Div tag id where you want to place star chart
							projection:'stereo', //Type of map projection used
							keyboard: false, //Disable/Enable keyboard
							showposition: false, //Show/Hide coordinates
							showstars: true, //Show/Hide stars
							constellations: true, //Show/Hide constellation lines
							constellationlabels: true, //Show/Hide Constellation names
							showplanets: true, //Show/Hide planets
							showplanetlabels: true, //Show/Hide planet names
							live: true, //Disabe/Enable real time clock
							clock: new Date() //Set clock

			});

			// Load from datastore
			env.getEnvironment(function(err, environment) {
				currentenv = environment;

				//Set current language
				var currentLang = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : currentLang;
				webL10n.language.code = language;

				planetarium.loadLanguage(language); //Set the star chart's language to Sugarizer's language
				document.getElementById("locale-date").innerHTML = language; //Localize date

				//Process localize event
				window.addEventListener("localized", function(){
					toLocalize();
				})


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
							planetarium.setGeo($(customLatitude,customLongitude)).setClock(0).draw();
							try {
								document.getElementById(chartJournal[2]).style.backgroundColor = 'grey';
							}
							catch(e){
								console.log("User location used");
							}
							planetarium.selectProjection(chartJournal[3]);
							document.getElementById(chartJournal[3]).style.backgroundColor = 'grey';
							if (chartJournal[0] == false){
								document.getElementById("const-button").classList.remove("active");
								planetarium.toggleConstellationLines();
								planetarium.toggleConstellationLabels();
							} else if (chartJournal[0] == true){
									document.getElementById("const-button").classList.add("active");
							}
							if (chartJournal[1] == true){
								document.getElementById("star-button").classList.add("active");
								planetarium.toggleStarLabels();
							}
						}
					});
				}
			});
			//Things to localize
			function toLocalize() {
				document.getElementById("add-button").title = webL10n.get("AddDay");
				document.getElementById("minus-button").title = webL10n.get("MinusDay");
				document.getElementById("const-button").title = webL10n.get("ToggleConst");
				document.getElementById("star-button").title = webL10n.get("ToggleStar");
				document.getElementById("location-button").title = webL10n.get("Location");
				document.getElementById("world-button").title = webL10n.get("WorldList");
				document.getElementById("view-button").title = webL10n.get("View");
				document.getElementById("55.3781,-3.4360").innerHTML = webL10n.get("Britain");
				document.getElementById("23.6345,-102.5528").innerHTML = webL10n.get("Mexico");
				document.getElementById("40.4637,-3.7492").innerHTML = webL10n.get("Spain");
				document.getElementById("51.1657,10.4515").innerHTML = webL10n.get("Germany");
				document.getElementById("40.3399,127.5101").innerHTML = webL10n.get("NorthKorea");
				document.getElementById("23.8859,45.0792").innerHTML = webL10n.get("SaudiArabia");
				document.getElementById("35.9078,127.7669").innerHTML = webL10n.get("SouthKorea");
				document.getElementById("46.2276,2.2137").innerHTML = webL10n.get("France");
				document.getElementById("51.9194,19.1451").innerHTML = webL10n.get("Poland");
				document.getElementById("41.8719,12.5674").innerHTML = webL10n.get("Italy");
				document.getElementById("20.5937,78.9629").innerHTML = webL10n.get("India");
				document.getElementById("9.0820,8.6753").innerHTML = webL10n.get("Nigeria");
				document.getElementById("0.7893,113.9213").innerHTML = webL10n.get("Indonesia");
				document.getElementById("-14.2350,-51.9253").innerHTML = webL10n.get("Brazil");
				document.getElementById("54.5260,-105.2551").innerHTML = webL10n.get("NorthAmerica");
				document.getElementById("-8.7832,-55.4915").innerHTML = webL10n.get("SouthAmerica");
				document.getElementById("-8.7832,34.5085").innerHTML = webL10n.get("Africa");
				document.getElementById("-25.2744,133.7751").innerHTML = webL10n.get("Australia");
				document.getElementById("12.8797,121.7740").innerHTML = webL10n.get("Philippines");
				document.getElementById("4.2105,101.9758").innerHTML = webL10n.get("Malaysia");
				document.getElementById("36.2048,138.2529").innerHTML = webL10n.get("Japan");
				document.getElementById("39.9042,116.4074").innerHTML = webL10n.get("China");
			}

			//Necessary variables
			var chartJournal = [true,false,"55.3781,-3.4360","stereo"];
			var longlat = document.getElementById('worldConst').innerHTML;
			var customLatitude = planetarium.setLatitude(parseFloat(longlat.split(',')[0]));
			var customLongitude = planetarium.setLongitude(parseFloat(longlat.split(',')[1]));
			document.getElementById("const-button").classList.add("active");

			//Get Location of user and set the star chart to the position
			//when Location button is pressed
			function getUserLocation(){
				if (navigator.geolocation){
					navigator.geolocation.getCurrentPosition(userPosition);
				}
			}
			function userPosition(position) {
				$("button#location-button").on('click', function(){
					console.log(longlat);
					try{
						document.getElementById(longlat).style.backgroundColor = 'black';
					}
					catch(e){}
					longlat = position.coords.latitude + "," + position.coords.longitude;
					customLatitude = planetarium.setLatitude(parseFloat(longlat.split(',')[0]));
					customLongitude = planetarium.setLongitude(parseFloat(longlat.split(',')[1]));
					planetarium.setGeo($(customLatitude,customLongitude)).setClock(0).draw();
					chartJournal[2] = longlat;
					console.log(chartJournal);
				})
			}

			getUserLocation();


			//Add 1 day to date
			$("button#add-button").on('click', function (){
				planetarium.clock.setDate(planetarium.clock.getDate() + 1);
				planetarium.updateClock(planetarium.clock);
				planetarium.draw();
			})

			//Minus 1 day to date
			$("button#minus-button").on('click', function (){
				planetarium.clock.setDate(planetarium.clock.getDate() - 1);
				planetarium.updateClock(planetarium.clock);
				planetarium.draw();
			})

			//Toggle Constellation Lines and Name
			$("button#const-button").on('click', function (){

				planetarium.toggleConstellationLines();
				planetarium.toggleConstellationLabels();

				if (chartJournal[0] == true){
					document.getElementById("const-button").classList.remove("active");
					chartJournal[0] = false;
				} else{
					document.getElementById("const-button").classList.add("active");
					chartJournal[0] = true;
				}

				console.log(chartJournal[0]);
			})

			//Toggle Star names
			$("button#star-button").on('click', function (){
				planetarium.toggleStarLabels();

				if (chartJournal[1] == true){
					document.getElementById("star-button").classList.remove("active");
					chartJournal[1] = false;
				} else{
					document.getElementById("star-button").classList.add("active");
					chartJournal[1] = true;
				}
				console.log(chartJournal[1]);
			})

			//Set long and lat to specific country
			$("button.country").on('click', function (){
				longlat = document.getElementById('worldConst').innerHTML;
				customLatitude = planetarium.setLatitude(parseFloat(longlat.split(',')[0]));
				customLongitude = planetarium.setLongitude(parseFloat(longlat.split(',')[1]));
				planetarium.setGeo($(customLatitude,customLongitude)).setClock(0).draw();
				chartJournal[2] = longlat;
				console.log(chartJournal);
			})

			//Change projection view
			$("button.view").on('click', function (){
				var pv = document.getElementById('projection-view').innerHTML;
				planetarium.selectProjection(pv);
				chartJournal[3] = pv;
				planetarium.draw();
				console.log(chartJournal);
			})


			// Launch tutorial
			document.getElementById("help-button").addEventListener('click', function(e) {
				tutorial.start();
			});
			// Full screen
			document.getElementById("fullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 1;
				document.getElementById("canvas").style.top = "0px";
				document.getElementById("unfullscreen-button").style.visibility = "visible";
				planetarium.resize()
			});
			document.getElementById("unfullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 1;
				document.getElementById("canvas").style.top = "55px";
				document.getElementById("unfullscreen-button").style.visibility = "hidden";
				planetarium.resize()
			});

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

		});
	});

});
