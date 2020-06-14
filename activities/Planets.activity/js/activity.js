var currentview = "ListView";
define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/datastore", "webL10n", "tutorial"], function (activity, env, datastore, l10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		//Initialize 3D Scene and Camera
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});

		//Allow interaction with planet
		var controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.target.set(0,0,0);

		//Planet Information
		var infoType = ["Name", "Type", "Year", "Mass", "Temperature", "Moons", "Radius", "SunDistance"];
		var planet = planets;

		//Containers
		var homeDisplay = document.getElementById("planets-list");
		var interactContainer = document.getElementById("planet-container");
		var planetDisplay = document.getElementById("planet-display");
		var planetInfo = document.getElementById("planet-info");
		var planetPos = document.getElementById("planet-pos");
		var mainCanvas = document.getElementById("canvas");

		//Used for planet position view
		var distance = -96;
		var textDistance =11.5;
		var frustumSize = 5;

		//Detect clicked planet in planet position view
		var fromPlanetPosClicked = false;

		//Back Button to go back to homepage
		var backButton = document.createElement("div");
		backButton.id = "back-button";
		backButton.title = "Back to Planet List"
		interactContainer.appendChild(backButton);

		//Do not show unnecessary buttons
		interactContainer.style.display = "none";
		document.getElementById("rotation-button").style.display = "none";
		document.getElementById("info-button").style.display = "none";
		document.getElementById("image-button").style.display = "none";
		document.getElementById("list-button").style.display = "none";

		//Data to save to Journal
		var saveData = [false, null, true, true];

		planetPos.style.display="none";


		var currentenv;
		env.getEnvironment(function(err, environment){
			currentenv = environment;

			//Set current language
			var currentLang = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : currentLang;
			l10n.language.code = language;

			//Init Sun
			initPosition("Sun", "Star", null);

			for (var i = 0; i < planet.length; i ++){
				var planetList = document.createElement('div');
				planetList.id = 'planet-' + planet[i].name;
				planetList.className = 'planets';
				homeDisplay.appendChild(planetList);

				var planetImage = document.createElement('img');
				planetImage.className = planet[i].name;
				planetImage.src = "images/" + planet[i].name.toLowerCase() + ".jpg";
				planetImage.width = 240;
				document.getElementById("planet-" + planet[i].name).appendChild(planetImage);

				var planetName = document.createElement('span');
				planetName.className = "name"
				planetName.innerHTML = '<p>' + planet[i].name + '</p>';
				document.getElementById("planet-" + planet[i].name).appendChild(planetName);

				initPlanet(planet[i].name, planet[i].type, planet[i].year, planet[i].mass, planet[i].temperature, planet[i].moons, planet[i].radius, planet[i].distancefromsun);
				initPosition(planet[i].name, planet[i].type, planet[i].year, planet[i].mass, planet[i].temperature, planet[i].moons, planet[i].radius, planet[i].distancefromsun);

				// Switch to fullscreen mode on click
				document.getElementById("fullscreen-button").addEventListener('click', function() {
					document.getElementById("main-toolbar").style.opacity = 0;
					document.getElementById("canvas").style.top = "0px";
					document.getElementById("unfullscreen-button").style.visibility = "visible";
					document.getElementById("back-button").style.bottom = "740px";
				});

				// Switch to unfullscreen mode
				document.getElementById("unfullscreen-button").addEventListener('click', function() {
					document.getElementById("main-toolbar").style.opacity = 1;
					document.getElementById("canvas").style.top = "55px";
					document.getElementById("unfullscreen-button").style.visibility = "hidden";
					document.getElementById("back-button").style.bottom = "685px";
				});

				document.getElementById("list-button").addEventListener("click", function(){
					homeDisplay.style.display="block";
					planetPos.style.display="none";
					fromPlanetPosClicked = false;
					distance = -80;
					requestAnim = false;
					textDistance = 3.5;
					document.getElementById("position-button").style.display="inline";
					document.getElementById("list-button").style.display = "none";
				});
			}

			//Load from datastore
			if(!environment.objectId){
				console.log("New instance");
			}
			else {
				console.log("Existing instance");
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
				if (error==null && data!=null) {
					saveData = JSON.parse(data);
					console.log(saveData[1]);
						if (saveData[0] === true && currentview !== "ExploreView"){
							document.getElementById("position-button").click();
						}
						else{
							if (saveData[1] !== null){
								document.getElementById("planet-"+saveData[1]).click();

								if (saveData[2] === false){
									document.getElementById("rotation-button").click();
								}
								if (saveData[3] === false){
									document.getElementById("info-button").click();
								}
							}
						}
				}
			});


			}
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		document.getElementById("stop-button").addEventListener("click", function(event){
			console.log("writing...");
			var jsonData = JSON.stringify(saveData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error){
				if (error === null){
					console.log("writing done");
				}
				else {
					console.log("writing failed");
				}
			});
		});


		//Show planet function
		function initPlanet(name, type, year, mass, temperature, moons, radius, sunDistance){

			//Variable action detectors
			var showInfo = true;
			var isRotating = true;
			var requestAnim;
			var save;

			//Url of planet map files
			var url = "images/" + name.toLowerCase() + "map.jpg";

			//Create Planet
			var loadTexture = new THREE.TextureLoader().load(url);
			var geometry = new THREE.SphereGeometry(2, 32, 32);
			var material = new THREE.MeshPhongMaterial({
				map: loadTexture,
				shininess: 5
			});
			var light = new THREE.DirectionalLight(0xffffff);
			var lightHolder = new THREE.Group();
			var planetMesh = new THREE.Mesh(geometry, material);

			//Create clouds for Earth
			if(name === "Earth"){
				var specUrl = "images/" + name.toLowerCase() + "spec.png";
				var cloudUrl = "images/" + name.toLowerCase() + "cloudmap.jpg";
				var loadCloudTexture = new THREE.TextureLoader().load(cloudUrl);
				var cloudGeometry = new THREE.SphereGeometry(2.03, 32, 32);
				var cloudMaterial = new THREE.MeshPhongMaterial({
					map: loadCloudTexture,
					side: THREE.DoubleSide,
					opacity: 0.5,
					transparent: true,
					depthWrite: false
				});
				var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
				material.specularMap = new THREE.TextureLoader().load(specUrl);
				material.specular  = new THREE.Color('grey');
				planetMesh.add(cloudMesh);
			};

			//Create Rings
			if(name === "Saturn" || name === "Uranus"){
				var ringUrl = "images/" + name.toLowerCase() + "ringcolor.jpg";
				var loadRingTexture = new THREE.TextureLoader().load(ringUrl);
				if (name === "Saturn"){
					var ringGeometry = new THREE.RingBufferGeometry(2.5, 5, 40);
					var position = ringGeometry.attributes.position;
					var vector = new THREE.Vector3();
					for (let i = 0; i < position.count; i++){
						vector.fromBufferAttribute(position, i);
						ringGeometry.attributes.uv.setXY(i, vector.length() < 4 ? 0 : 1, 1);
					}
				}
				else{
					var ringGeometry = new THREE.RingBufferGeometry(3.8, 4, 40);
				}
				var ringMaterial = new THREE.MeshPhongMaterial({
					map: loadRingTexture,
					side: THREE.DoubleSide,
					opacity: 0.6,
					transparent: true,
					depthWrite: true
				});
				var ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
			}

			//For planets with terrain, add bumps
			if (type === "Terrestrial"){
				var bumpUrl = "images/" + name.toLowerCase() + "bump.png";
				material.bumpMap = new THREE.TextureLoader().load(bumpUrl);
				material.bumpScale = 0.1;
			}


			//Active buttons
			document.getElementById("rotation-button").classList.add("active");
			document.getElementById("info-button").classList.add("active");


			//Function for creating planet models
			createPlanet = function(){

				//Show planet display
				isRotating = true;
				requestAnim = true;
				mainCanvas.style.backgroundColor = "#c0c0c0";
				interactContainer.style.display = "block";
				homeDisplay.style.display = "none";
				document.getElementById("planet-info").style.display = "block";
				planetDisplay.style.width = "60%";
				document.getElementById("position-button").style.display = "none";
				document.getElementById("list-button").style.display = "none";
				document.getElementById("rotation-button").style.display = "inline";
				document.getElementById("info-button").style.display = "inline";
				document.getElementById("image-button").style.display = "inline";

				currentview = "ExploreView";
				saveData[0] = false;
				saveData[1] = name;

				//Remove previous scene
				while(scene.children.length > 0){
					 scene.remove(scene.children[0]);
				};

				renderer.setSize( planetDisplay.clientWidth, window.innerHeight);
				planetDisplay.appendChild(renderer.domElement);
				light.position.set( 1, 1, 5 );

				lightHolder.add(light);
				scene.add(lightHolder);

				scene.add(planetMesh);
				scene.add(camera);

				if (name === "Saturn" || name === "Uranus"){
					if (name === "Saturn"){
						ringMesh.rotation.x = 33;
					}
					else{
						ringMesh.rotation.x = 0;
					}
					scene.add(ringMesh);
				}

				camera.position.z = 5;


				for (var i = 0; i < 8; i++){
					var information = document.createElement('div');
					information.id = infoType[i];
					information.className = 'info';
					planetInfo.appendChild(information);
				}

				document.getElementById("Name").innerHTML = '<p>' + l10n.get("PlanetName") + '</br>' + l10n.get(name) + '</p>';
				document.getElementById("Type").innerHTML = '<p>' + l10n.get("PlanetType") + '</br>' + type + '</p>';
				document.getElementById("Year").innerHTML = '<p>' + l10n.get("YearLength") + '</br>' + year + " Earth Days" + '</p>';
				document.getElementById("Mass").innerHTML = '<p>' + l10n.get("Mass") + '</br>' + mass + '</p>';
				document.getElementById("Temperature").innerHTML = '<p>' + l10n.get("SurfaceTemperature") + '</br>' + temperature + '</p>';
				document.getElementById("Moons").innerHTML = '<p>' + l10n.get("NumberOfMoons") + '</br>' + moons + '</p>';
				document.getElementById("Radius").innerHTML = '<p>' + l10n.get("PlanetRadius") + '</br>' + radius + '</p>';
				document.getElementById("SunDistance").innerHTML = '<p>' + l10n.get("SunDistance") + '</br>' + sunDistance + '</p>';

				saveImage = function(){

					var mimetype = 'image/jpeg';
					var inputData = renderer.domElement.toDataURL();
					var metadata = {
						mimetype: mimetype,
						title: "Image " + name,
						activity: "org.olpcfrance.MediaViewerActivity",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};

					if (save){
						datastore.create(metadata, function() {
							console.log("export done.");
							save = false;
						}, inputData);
					}
				}

				animatePlanet = function() {
					if (resizePlanet(renderer)) {
						camera.aspect = planetDisplay.clientWidth/planetDisplay.clientHeight;
						camera.updateProjectionMatrix();
						controls.handleResize();
					}

					if (requestAnim === true){
						requestAnimationFrame(animatePlanet);
					}
					else{
						cancelAnimationFrame(animatePlanet);
					}

					if (isRotating === true){
						planetMesh.rotation.y += 0.1 * Math.PI/180;
					}


					controls.update();
					lightHolder.quaternion.copy(camera.quaternion);
					renderer.render(scene, camera);
				}

				resizePlanet = function(renderer) {

					var width = planetDisplay.clientWidth;
					var height = planetDisplay.clientHeight;
					var needResize = planetDisplay.width !== width || planetDisplay.height !== height;

					if (needResize) {
						renderer.setSize(width, height);
					}

					return needResize;

				}


				document.getElementById("image-button").addEventListener("click", function(){
					save = true;
					saveImage();
				});

				animatePlanet();
			}

			if (fromPlanetPosClicked !== false){
				createPlanet();
			}
			else{
				//When click on a planet, show more info about that planet
				document.getElementById("planet-" + name).addEventListener("click", createPlanet);
			}

			//Toggle Planet rotation
			document.getElementById("rotation-button").addEventListener("click", function(){

				if (isRotating){
					isRotating = false;
					document.getElementById("rotation-button").classList.remove("active");
				} else{
					isRotating = true;
					document.getElementById("rotation-button").classList.add("active");
				}


				saveData[2] = isRotating;

			});

			//Toggle Planet Info
			document.getElementById("info-button").addEventListener("click", function(){

				if (showInfo){
					document.getElementById("planet-info").style.display = "none";
					planetDisplay.style.width = "100%";
					renderer.setSize( window.innerWidth, window.innerHeight);
					resizePlanet(renderer);
					showInfo = false;
					document.getElementById("info-button").classList.remove("active");
				}
				else{
					document.getElementById("planet-info").style.display = "block";
					planetDisplay.style.width = "60%";
					renderer.setSize( planetDisplay.clientWidth, window.innerHeight);
					resizePlanet(renderer);
					showInfo = true;
					document.getElementById("info-button").classList.add("active");
				}

				saveData[3] = showInfo;
				planetDisplay.appendChild(renderer.domElement);

			});

			//Back button to go back to planet list view
			backButton.addEventListener("click", function(){

				saveData = [false, null, true, true];
				isRotating = false;
				requestAnim = false;

				isRotating = true;
				showInfo = true;

				interactContainer.style.display = "none";
				mainCanvas.style.backgroundColor = "black";

				document.getElementById("rotation-button").classList.add("active");
				document.getElementById("info-button").classList.add("active");
				document.getElementById("rotation-button").style.display = "none";
				document.getElementById("info-button").style.display = "none";
				document.getElementById("image-button").style.display = "none";

				//Go back to Planet Pos view if planets are clicked from that View
				// else go back to Planet List View
				if (fromPlanetPosClicked && currentview === "ExploreView"){
					while(scene.children.length > 0){
						 scene.remove(scene.children[0]);
					};
					document.getElementById("position-button").style.display="none";
					homeDisplay.style.display="none";
					planetPos.style.display="block";
					document.getElementById("position-button").click();
					fromPlanetPosClicked = false;
				}
				else if (currentview != "PositionView"){
					while(scene.children.length > 0){
						 scene.remove(scene.children[0]);
					};
					currentview = "ListView";
					document.getElementById("position-button").style.display = "inline";
					homeDisplay.style.display = "block";
				}

			});
		}

		function initPosition(name, type, year, mass, temperature, moons, radius, sunDistance){

			var planetSize;
			var requestAnim;

			//Url of planet map files
			var url = "images/" + name.toLowerCase() + "map.jpg";
			if (name === "Sun"){
				planetSize = 45;
			}
			else if (name === "Mercury"){
				planetSize = 0.5;
			} else if (name === "Venus" || name === "Earth"){
				planetSize = 2;
			}
			else if (name === "Mars"){
				planetSize = 1;
			}
			else if (name === "Jupiter" || name === "Saturn"){
				planetSize = 10;
			}
			else if (name === "Uranus" || name == "Neptune"){
				planetSize = 5;
			}
			//Create Planet
			var loadTexture = new THREE.TextureLoader().load(url);
			var geometry = new THREE.SphereGeometry(planetSize, 32, 32);
			var material = new THREE.MeshBasicMaterial({
				map: loadTexture,
				side: THREE.DoubleSide,
			});
			var light = new THREE.DirectionalLight(0xffffff);
			var lightHolder = new THREE.Group();
			var planetMesh = new THREE.Mesh(geometry, material);

			//Create clouds for Earth
			if(name === "Earth"){
				var specUrl = "images/" + name.toLowerCase() + "spec.png";
				var cloudUrl = "images/" + name.toLowerCase() + "cloudmap.jpg";
				var loadCloudTexture = new THREE.TextureLoader().load(cloudUrl);
				var cloudGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
				var cloudMaterial = new THREE.MeshPhongMaterial({
					map: loadCloudTexture,
					side: THREE.DoubleSide,
					opacity: 0.2,
					transparent: true,
					depthWrite: false
				});
				var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
				material.specularMap = new THREE.TextureLoader().load(specUrl);
				material.specular  = new THREE.Color('grey');
				planetMesh.add(cloudMesh);
			};

			//Create Rings
			if(name === "Saturn" || name === "Uranus"){
				var ringUrl = "images/" + name.toLowerCase() + "ringcolor.jpg";
				var loadRingTexture = new THREE.TextureLoader().load(ringUrl);
				if (name === "Saturn"){
					var ringGeometry = new THREE.RingBufferGeometry(12, 23, 64);
					var position = ringGeometry.attributes.position;
					var vector = new THREE.Vector3();
					for (let i = 0; i < position.count; i++){
						vector.fromBufferAttribute(position, i);
						ringGeometry.attributes.uv.setXY(i, vector.length() < 14 ? 0 : 1, 1);
					}
				}
				else{
					var ringGeometry = new THREE.RingBufferGeometry(9, 10, 64);
				}
				var ringMaterial = new THREE.MeshPhongMaterial({
					map: loadRingTexture,
					side: THREE.DoubleSide,
					opacity: 0.4,
					transparent: true,
				});
				var ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
			}


			//For planets with terrain, add bumps
			if (type === "Terrestrial"){
				var bumpUrl = "images/" + name.toLowerCase() + "bump.png";
				material.bumpMap = new THREE.TextureLoader().load(bumpUrl);
				material.bumpScale = 0.1;

				//Add div to planets. This will be used for clicking smaller planets
				var planetDiv = document.createElement("div");
				planetDiv.id = "div-" + name;
				planetDiv.className = "planet-div";
				planetPos.appendChild(planetDiv);
				document.getElementById("div-" + name).style.padding = "2%";
				document.getElementById("div-" + name).style.marginLeft = textDistance - 1 + "%";
			}

			if (name !== "Sun"){
				//Add names to planets
				var planetNewName = document.createElement("div");
				planetNewName.id = "new-name-" + name;
				planetNewName.className = "planet-new-name";
				planetNewName.innerHTML = name;
				planetPos.appendChild(planetNewName);
				document.getElementById("new-name-" + name).style.marginLeft = textDistance + "%";
			}


			if (name === "Sun"){
				distance +=-27;
			}
			else if (name === "Mercury"){
				distance +=52;
				textDistance += 7.7;
			}
			else if (name === "Venus" || name === "Earth" || name === "Mars"){
				distance +=15;
				textDistance += 8.3;
			}
			else if (name === "Uranus"){
				distance += 35;
				textDistance += 11;
			}
			else if (name === "Neptune"){
				distance += 20;
				textDistance += 15;
			}
			else if (name === "Jupiter"){
				distance += 17;
				textDistance += 18.5;
			}
			else{
				distance += 36;
				textDistance += 18;
			}

			planetMesh.position.x = distance;
			planetMesh.name = name;
			planetMesh.userData.typeOfPlanet = type;
			planetMesh.userData.year = year;
			planetMesh.userData.mass = mass;
			planetMesh.userData.temperature = temperature;
			planetMesh.userData.moons = moons;
			planetMesh.userData.radius = radius;
			planetMesh.userData.sunDistance = sunDistance;

			//Show planet position and distance from Sun
			document.getElementById("position-button").addEventListener("click", function(e){

				var aspect = planetPos.clientHeight/planetPos.clientWidth;
				var camera = new THREE.OrthographicCamera( frustumSize / - 20, frustumSize / 20, frustumSize * aspect / 20, frustumSize * aspect / - 20, -500, 2000 );
				var raycaster = new THREE.Raycaster();
				var mouse = new THREE.Vector2();


				//Show necessary buttons and hide unused buttons
				document.getElementById("position-button").style.display="none";
				homeDisplay.style.display="none";
				planetPos.style.display="block";
				document.getElementById("list-button").style.display = "inline";

				currentview = "PositionView";
				saveData[0] = true;

				requestAnim = true;

				scene.add(planetMesh);

				renderer.setSize( planetPos.clientWidth, planetPos.clientHeight);
				planetPos.appendChild(renderer.domElement);
				light.position.set( 1, 0.2, 5 );

				lightHolder.add(light);
				scene.add(lightHolder);


				scene.add(planetMesh);
				scene.add(camera);

				if (name === "Saturn" || name === "Uranus"){
					if (name === "Saturn"){
						ringMesh.rotation.x = 30;
						ringMesh.position.x = 27;
					}
					else{
						ringMesh.rotation.x = 0;
						ringMesh.position.x = 62;
					}
					scene.add(ringMesh);
				}

				camera.zoom = 0.0026;
				camera.updateProjectionMatrix();

				clickMesh = function ( e ) {
					e.preventDefault();

					canvasBounds = planetPos.getBoundingClientRect();

					if("ontouchend" in renderer.domElement){
						mouse.x =  ( (e.changedTouches[0].clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left ) )* 2 - 1;
				 		mouse.y = - ( (e.changedTouches[0].clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top ) ) * 2 + 1;
					}
					else{
						mouse.x =  ( (e.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left ) )* 2 - 1;
				    mouse.y = - ( (e.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top ) ) * 2 + 1;
					}


			    raycaster.setFromCamera( mouse, camera );

			    var intersects = raycaster.intersectObjects( scene.children );

			    for ( var i = 0; i < intersects.length; i++ ) {
						if(intersects[i].object.name !== "Sun"){
							planetPos.style.display = "none";
							fromPlanetPosClicked = true;
							initPlanet(
								intersects[i].object.name, intersects[i].object.userData.typeOfPlanet,
								intersects[i].object.userData.year, intersects[i].object.userData.mass,
								intersects[i].object.userData.temperature, intersects[i].object.userData.moons,
								intersects[i].object.userData.radius, intersects[i].object.userData.sunDistance
							);
						}

			    }

				}

				animatePlanet = function() {
					if (resizePlanet(renderer)){
						var aspect = planetPos.clientHeight / planetPos.clientWidth;
					  camera.left = frustumSize / - 20;
					  camera.right = frustumSize / 20;
					  camera.top = frustumSize * aspect / 20;
					  camera.bottom = - frustumSize * aspect / 20;

					  camera.updateProjectionMatrix();

					}

					camera.updateProjectionMatrix();


					if (requestAnim === true && currentview !== "ExploreView"){
						requestAnimationFrame(animatePlanet);
					}

					renderer.render(scene, camera);
				}

				resizePlanet = function(renderer) {

					var width = planetPos.clientWidth;
					var height = planetPos.clientHeight;
					var needResize = planetPos.width !== width || planetPos.height !== height;

					if (needResize) {
						renderer.setSize( planetPos.clientWidth, planetPos.clientHeight );
					}
					return needResize;
				}

				if("ontouchend" in renderer.domElement){
					renderer.domElement.addEventListener( 'touchend', clickMesh, false );
				}
				else{
					renderer.domElement.addEventListener( 'click', clickMesh, false );
				}


				//For Smaller Planets
				if (document.getElementById("div-" + name) !== null){
					document.getElementById("div-" + name).addEventListener('click', function(){
						planetPos.style.display = "none";
						currentview = "ExploreView";
						fromPlanetPosClicked = true;

						//There was a bug where the planets rotate faster and faster on each click
						//By setting requestAnim to false, initPlanet will stop initializaing, as it causes the bug
						if (requestAnim){
							initPlanet(name, type, year, mass, temperature, moons, radius, sunDistance);
						}

						requestAnim = false;
					});
				}

				animatePlanet();
			});

			//Need to set to false so to cancel animation
			document.getElementById("list-button").addEventListener("click", function(){
				currentview = "ListView";
				saveData[1] = null;
				saveData[0] = false;
				requestAnim = false;
			});


		}

	});

});
