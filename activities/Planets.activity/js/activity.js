define(["sugar-web/activity/activity", 'sugar-web/datastore'], function (activity, datastore) {

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
		var infoType = ["Name", "Type", "Year", "Mass", "Temperature", "Moons", "Distance"];
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
		document.getElementById("radius-button").style.display = "none";

		planetPos.style.display="none";

		initPosition("Sun", "Star", 0);
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

			initPlanet(planet[i].name, planet[i].type, planet[i].year, planet[i].mass, planet[i].temperature, planet[i].moons, planet[i].distancefromsun);
			initPosition(planet[i].name, planet[i].type, planet[i].radius);

			// Switch to fullscreen mode on click
			document.getElementById("fullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 0;
				document.getElementById("canvas").style.top = "0px";
				document.getElementById("unfullscreen-button").style.visibility = "visible";
			});

			// Switch to unfullscreen mode
			document.getElementById("unfullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 1;
				document.getElementById("canvas").style.top = "55px";
				document.getElementById("unfullscreen-button").style.visibility = "hidden";
			});

			document.getElementById("list-button").addEventListener("click", function(){
				homeDisplay.style.display="block";
				planetPos.style.display="none";
				distance = -80;
				requestAnim = false;
				textDistance = 3.5;
				document.getElementById("position-button").style.display="inline";
				document.getElementById("list-button").style.display = "none";
			});
		}

		//Show planet function
		function initPlanet(name, type, year, mass, temperature, moons, distance){

			//Variable action detectors
			var showInfo = true;
			var stopRotation;
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

			//When click on a planet, show more info about that planet
			document.getElementById("planet-" + name).addEventListener("click", function(){

				//Show planet display
				stopRotation = false;
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


				for (var i = 0; i < 7; i++){
					var information = document.createElement('div');
					information.id = infoType[i];
					information.className = 'info';
					planetInfo.appendChild(information);
				}

				document.getElementById("Name").innerHTML = '<p>' + "Planet Name: " + '</br>' + name + '</p>';
				document.getElementById("Type").innerHTML = '<p>' + "Planet Type: " + '</br>' + type + '</p>';
				document.getElementById("Year").innerHTML = '<p>' + "Length of Year: " + '</br>' + year + " Earth Days" + '</p>';
				document.getElementById("Mass").innerHTML = '<p>' + "Mass: " + '</br>' + mass + '</p>';
				document.getElementById("Temperature").innerHTML = '<p>' + "Surface Temperature: " + '</br>' + temperature + '</p>';
				document.getElementById("Moons").innerHTML = '<p>' + "Number of Moons: " + '</br>' + moons + '</p>';
				document.getElementById("Distance").innerHTML = '<p>' + "Distance from the Sun: " + '</br>' + distance + '</p>';

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

					if (stopRotation === false){
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
			});

			//Toggle Planet rotation
			document.getElementById("rotation-button").addEventListener("click", function(){

				if (stopRotation === false){
					stopRotation = true;
					document.getElementById("rotation-button").classList.add("active");
				} else{
					stopRotation = false;
					document.getElementById("rotation-button").classList.remove("active");
				}

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
				planetDisplay.appendChild(renderer.domElement);

			});

			//Back button to go back to planet list view
			backButton.addEventListener("click", function(){
				interactContainer.style.display = "none";
				homeDisplay.style.display = "block";
				mainCanvas.style.backgroundColor = "black";
				stopRotation = true;
				requestAnim = false;
				document.getElementById("rotation-button").style.display = "none";
				document.getElementById("info-button").style.display = "none";
				document.getElementById("image-button").style.display = "none";
				document.getElementById("position-button").style.display = "inline";


				//Remove previous scene
				while(scene.children.length > 0){
					 scene.remove(scene.children[0]);
				};


			});
		}

		function initPosition(name, type, radius){

			var planetSize;
			var requestAnim;
			var showRadius;

			//Active Buttons
			document.getElementById("radius-button").classList.add("active");

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
			}

			if (name !== "Sun"){
				//Add names to planets
				var planetNewName = document.createElement("div");
				planetNewName.id = "new-name-" + name;
				planetNewName.className = "planet-new-name";
				planetNewName.innerHTML = name;
				planetPos.appendChild(planetNewName);
				document.getElementById("new-name-" + name).style.marginLeft = textDistance + "%";

				//Add radius to planets
				var planetRadius = document.createElement("div");
				planetRadius.id = "radius-" + name;
				planetRadius.className = "planet-radius";
				planetRadius.innerHTML = radius + " km";
				planetPos.appendChild(planetRadius);
				document.getElementById("radius-" + name).style.marginLeft = textDistance - 0.5 + "%";
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


			//Show planet position and radius
			document.getElementById("position-button").addEventListener("click", function(){
				var aspect = planetPos.clientHeight/planetPos.clientWidth;
				var camera = new THREE.OrthographicCamera( frustumSize / - 20, frustumSize / 20, frustumSize * aspect / 20, frustumSize * aspect / - 20, -500, 2000 );

				//Show necessary buttons and hide unused buttons
				document.getElementById("position-button").style.display="none";
				homeDisplay.style.display="none";
				planetPos.style.display="block";
				document.getElementById("list-button").style.display = "inline";
				document.getElementById("radius-button").style.display = "inline";

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
					if (requestAnim === true){
						requestAnimationFrame(animatePlanet)
					}
					else{
						cancelAnimationFrame(animatePlanet);
					}
					renderer.render(scene,camera);
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

				animatePlanet();
			});

			//Need to set to false so to cancel animation
			document.getElementById("list-button").addEventListener("click", function(){

				requestAnim = false;
				document.getElementById("radius-button").style.display = "none";
			});

			//Toggle Planet Radius
			document.getElementById("radius-button").addEventListener("click", function(){

				if (showRadius === false){
					showRadius = true;
					for (var i = 0; i < 8; i++){
						document.getElementsByClassName("planet-radius")[i].style.display = "block";
					}
					document.getElementById("radius-button").classList.add("active");
				} else{
					showRadius = false;
					for (var i = 0; i < 8; i++){
						document.getElementsByClassName("planet-radius")[i].style.display = "none";
					}
					document.getElementById("radius-button").classList.remove("active");
				}

			});

		}

	});

});
