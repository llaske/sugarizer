define(["sugar-web/activity/activity", 'sugar-web/datastore'], function (activity, datastore) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		//Initialize 3D Scene and Camera
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});

		//Planet Information
		var infoType = ["Name", "Type", "Year", "Mass", "Temperature", "Moons"];
		var planet = planets;

		var homeDisplay = document.getElementById("planets-list");
		var interactContainer = document.getElementById("planet-container");
		var planetDisplay = document.getElementById("planet-display");
		var planetInfo = document.getElementById("planet-info");
		var mainCanvas = document.getElementById("canvas");

		//Back Button to go back to homepage
		var backButton = document.createElement("div");
		backButton.id = "back-button";
		backButton.title = "Back to Planet List"
		planetInfo.appendChild(backButton);

		//Allow interaction with planet
		var controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.target.set(0,0,0);


		interactContainer.style.display = "none";
		document.getElementById("rotation-button").style.display = "none";
		document.getElementById("info-button").style.display = "none";
		document.getElementById("image-button").style.display = "none";

		for (var i = 0; i < planet.length; i ++){
			var planetList = document.createElement('div');
			planetList.id = 'planet-' + planet[i].name;
			planetList.className = 'planets';
			homeDisplay.appendChild(planetList);

			var planetImage = document.createElement('img');
			planetImage.className = planet[i].name;
			planetImage.src = "images/" + planet[i].name + ".jpg";
			planetImage.width = 240;
			document.getElementById("planet-" + planet[i].name).appendChild(planetImage);

			var planetName = document.createElement('span');
			planetName.className = "name"
			planetName.innerHTML = '<p>' + planet[i].name + '</p>';
			document.getElementById("planet-" + planet[i].name).appendChild(planetName);

			initPlanet(planet[i].name, planet[i].type, planet[i].year, planet[i].mass, planet[i].temperature, planet[i].moons);
		}

		//Show planet function
		function initPlanet(name, type, year, mass, temperature, moons){

			//Variable action detectors
			var showInfo = true;
			var stopRotation;
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
			if(name === "Saturn"){
				var ringUrl = "images/" + name.toLowerCase() + "ringcolor.jpg";
				var loadRingTexture = new THREE.TextureLoader().load(ringUrl);
				var ringGeometry = new THREE.RingBufferGeometry(2.5, 5, 40);
				var position = ringGeometry.attributes.position;
				var vector = new THREE.Vector3();
				for (let i = 0; i < position.count; i++){
					vector.fromBufferAttribute(position, i);
					ringGeometry.attributes.uv.setXY(i, vector.length() < 4 ? 0 : 1, 1);
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
				mainCanvas.style.backgroundColor = "#c0c0c0";
				interactContainer.style.display = "block";
				homeDisplay.style.display = "none";
				document.getElementById("planet-info").style.display = "block";
				planetDisplay.style.width = "60%";
				document.getElementById("rotation-button").style.display = "inline";
				document.getElementById("info-button").style.display = "inline";
				document.getElementById("image-button").style.display = "inline";

				renderer.setSize( planetDisplay.clientWidth, window.innerHeight);
				planetDisplay.appendChild(renderer.domElement);
				light.position.set( 1, 1, 5 );

				lightHolder.add(light);
				scene.add(lightHolder);

				scene.add(planetMesh);
				scene.add(camera);

				if (name === "Saturn"){
					ringMesh.rotation.x = 33;
					scene.add(ringMesh);
				}

				camera.position.z = 5;


				for (var i = 0; i < 6; i++){
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

					requestAnimationFrame(animatePlanet);
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
				document.getElementById("rotation-button").style.display = "none";
				document.getElementById("info-button").style.display = "none";
				document.getElementById("image-button").style.display = "none";

				//Remove previous scene
				while(scene.children.length > 0){
					 scene.remove(scene.children[0]);
				};

			});

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



		}


	});

});
