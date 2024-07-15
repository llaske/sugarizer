define([
	"sugar-web/activity/activity",
	"sugar-web/env",
	"activity/palettes/bgpalette",
	"activity/palettes/volumepalette",
	"activity/palettes/colorpalettefill",
	"activity/palettes/colorpalettetext",
	"activity/palettes/zoompalette",
	"sugar-web/graphics/presencepalette",
	"tutorial",
	"sugar-web/graphics/journalchooser",
	"sugar-web/datastore",
], function (
	activity,
	env,
	bgpalette,
	volumepalette,
	colorpaletteFill,
	colorpaletteText,
	zoompalette,
	presencepalette,
	tutorial,
	journalchooser,
	datastore
) {
	// Function to change the background color based on the provided string
	requirejs(["domReady!"], function (doc) {
		activity.setup();
		// Link presence palette
		var paletteBg = new bgpalette.BgPalette(
			document.getElementById("bg-button"),
			undefined
		);
		paletteBg.setBackgroundChangeCallback(changeBoardBackgroundHelper);
		function changeBoardBackgroundHelper(selectedBoard) {
			console.log("changing background from base func");
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "changeBg",
					content: selectedBoard,
				});
			}
			changeBoardBackground(selectedBoard);
		}
		var paletteVolume = new volumepalette.VolumePalette(
			document.getElementById("volume-button"),
			undefined
		);
		var paletteZoom = new zoompalette.ZoomPalette(
			document.getElementById("zoom-button"),
			undefined
		);

		// Full screen
		document
			.getElementById("fullscreen-button")
			.addEventListener("click", function () {
				document.getElementById("main-toolbar").style.visibility =
					"hidden";
				document.getElementById("game-container").style.top = "0px";
				document.getElementById(
					"unfullscreen-button"
				).style.visibility = "visible";
			});
		document
			.getElementById("unfullscreen-button")
			.addEventListener("click", function () {
				document.getElementById("main-toolbar").style.visibility =
					"visible";
				document.getElementById("game-container").style.top = "55px";
				document.getElementById(
					"unfullscreen-button"
				).style.visibility = "hidden";
			});

		const randomDirection = new CANNON.Vec3(0.3, 0.05, 0.3);
		randomDirection.normalize(); // Normalize to unit vector

		let ctx = {
			showNumbers: false,
			presentColor: null,
			textColor: "#ffffff",
			toggleTransparent: false,
			offset: new CANNON.Vec3(0, 0.1, 0),
			rollingForce: randomDirection.scale(2),
		};
		let presentBackground = null;
		let presentScore = 0;
		let lastRoll = "";
		let diceArray = [];
		let journalDiceArray = [];
		let showImage = false;
		let imageData;
		var currentenv;
		let removeVolume = false;
		let transparent = false;
		let defaultVolume = true;

		let xCoordinate, zCoordinate;

		var defaultButton = document.getElementById("default-button");
		defaultButton.classList.toggle("active");

		// Setting user preferences through the env
		env.getEnvironment(function (err, environment) {
			currentenv = environment;

			ctx.presentColor =
				currentenv.user.colorvalue.fill != null
					? currentenv.user.colorvalue.fill
					: ctx.presentColor;

			scene.background = new THREE.Color("#ffffff");
			console.log(ctx.presentColor);

			ctx.textColor =
				currentenv.user.colorvalue.stroke != null
					? currentenv.user.colorvalue.stroke
					: ctx.textColor;

			document.getElementById("color-button-fill").style.backgroundColor =
				ctx.presentColor;
			document.getElementById("color-button-text").style.backgroundColor =
				ctx.textColor;

			if (environment.sharedId) {
				console.log("Shared instance");
				presence = activity.getPresenceObject(function (
					error,
					network
				) {
					network.onDataReceived(onNetworkDataReceived);
				});
			}
		});

		var paletteColorFill = new colorpaletteFill.ColorPalette(
			document.getElementById("color-button-fill"),
			undefined,
			ctx
		);

		var paletteColorText = new colorpaletteText.ColorPalette(
			document.getElementById("color-button-text"),
			undefined,
			ctx
		);

		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			// If user already has some volumes on the board
			if (msg.action == "init") {
				changeBoardBackground(msg.content[1]);
				data = msg.content[0];
				console.log(data);
				for (let i = 0; i < data.length; i++) {
					let createFunction = null;
					switch (data[i][0]) {
						case "cube":
							createFunction = createCube;
							break;
						case "octa":
							createFunction = createOctahedron;
							break;
						case "tetra":
							createFunction = createTetrahedron;
							break;
						case "deca":
							createFunction = createDecahedron;
							break;
						case "dodeca":
							createFunction = createDodecahedron;
							break;
						case "icosa":
							createFunction = createIcosahedron;
							break;
						default:
							console.log(`Unexpected shape: ${data[i][0]}`);
							continue;
					}
					// Add those volumes to the board.
					if (createFunction) {
						const fillColorStored = data[i][3];
						const textColorStored = data[i][4];
						createFunction(
							fillColorStored,
							data[i][5],
							data[i][6],
							data[i][1].x,
							data[i][1].z,
							false,
							null,
							data[i][1].y,
							data[i][2],
							textColorStored,
							ctx,
							diceArray,
							world,
							scene,
							groundPhysMat,
							data[i][7],
							data[i][8],
							data[i][9]
						);
					}
				}
			}
			if (msg.action == "throw") {
				throwDice();
			}
			if (msg.action == "changeBg") {
				changeBoardBackground(msg.content);
			}
			if (msg.action == "remove") {
				// This starts a ray from the top of the scene and that ray intersects objects.
				raycaster.setFromCamera(msg.content, camera);
				var intersects = raycaster.intersectObjects(scene.children);

				// The object that is intersected first is the object that needs to be removed.
				var intersectedObject = intersects[0]?.object;

				// If the first object is the board do not let it be removed
				if (intersectedObject?.geometry.type == "PlaneGeometry") {
					return;
				}
				remove(intersectedObject);
			}
			let createFunction = null;

			switch (msg.content.shape) {
				case "cube":
					createFunction = createCube;
					break;
				case "octa":
					createFunction = createOctahedron;
					break;
				case "tetra":
					createFunction = createTetrahedron;
					break;
				case "dodeca":
					createFunction = createDodecahedron;
					break;
				case "deca":
					createFunction = createDecahedron;
					break;
				case "icosa":
					createFunction = createIcosahedron;
					break;
				default:
					console.error("Unknown shape: " + msg.content.shape);
					break;
			}

			if (createFunction) {
				createFunction(
					msg.content.color,
					msg.content.ifNumbers,
					msg.content.ifTransparent,
					msg.content.xCoordinateShared,
					msg.content.zCoordinateShared,
					msg.content.ifImage,
					msg.content.sharedImageData,
					msg.content.yCoordinateShared,
					msg.content.quaternionShared,
					msg.content.sharedTextColor,
					ctx,
					diceArray,
					world,
					scene,
					groundPhysMat,
					msg.content.sharedAngVel1,
					msg.content.sharedAngVel2,
					msg.content.sharedAngVel3
				);
			}
		};

		// Handling the journal addition.

		document
			.getElementById("stop-button")
			.addEventListener("click", function (event) {
				// We must add to the journal all the features of the added volume along with its exact position and quaternion
				for (let i = 0; i < diceArray.length; i++) {
					journalDiceArray.push([
						diceArray[i][2],
						diceArray[i][1].position,
						diceArray[i][1].quaternion,
						diceArray[i][5],
						diceArray[i][6],
						diceArray[i][3],
						diceArray[i][4],
						diceArray[i][7],
						diceArray[i][8],
						diceArray[i][9],
					]);
				}
				console.log("writing...");
				var jsonData = JSON.stringify(journalDiceArray);
				console.log(jsonData);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});

		// Loading the journal data.

		env.getEnvironment(function (err, environment) {
			currentenv = environment;

			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
			} else {
				activity
					.getDatastoreObject()
					.loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							data = JSON.parse(data);
							for (let i = 0; i < data.length; i++) {
								let fillColorStored = data[i][3];
								let textColorStored = data[i][4];
								switch (data[i][0]) {
									case "cube":
										createFunction = createCube;
										break;
									case "octa":
										createFunction = createOctahedron;
										break;
									case "tetra":
										createFunction = createTetrahedron;
										break;
									case "deca":
										createFunction = createDecahedron;
										break;
									case "dodeca":
										createFunction = createDodecahedron;
										break;
									case "icosa":
										createFunction = createIcosahedron;
										break;
									default:
										console.log(
											`Unexpected shape: ${data[i][0]}`
										);
										break;
								}

								// Create the volumes

								if (createFunction) {
									createFunction(
										fillColorStored,
										data[i][5],
										data[i][6],
										data[i][1].x,
										data[i][1].z,
										false,
										null,
										data[i][1].y,
										data[i][2],
										textColorStored,
										ctx,
										diceArray,
										world,
										scene,
										groundPhysMat,
										data[i][7],
										data[i][8],
										data[i][9]
									);
								}
							}
						}
					});
			}
		});

		// Launch tutorial
		document
			.getElementById("help-button")
			.addEventListener("click", function (e) {
				// Set the adding flag to false so that new volumes are not added to the board when the tutorial is running.
				ifAdding.adding = false;
				tutorial.start(ifAdding);
			});

		// Handle the color sliders for the volume fill color.
		const redSliderFill = document.getElementById("red-slider-fill");
		const greenSliderFill = document.getElementById("green-slider-fill");
		const blueSliderFill = document.getElementById("blue-slider-fill");

		let sliderColorFill = { r: 0, g: 0, b: 0 };

		function rgbToHex(r, g, b) {
			return (
				"#" +
				((1 << 24) + (r << 16) + (g << 8) + b)
					.toString(16)
					.slice(1)
					.toUpperCase()
			);
		}

		function hexToRgb(hex) {
			let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result
				? {
						r: parseInt(result[1], 16),
						g: parseInt(result[2], 16),
						b: parseInt(result[3], 16),
				  }
				: null;
		}

		function updateColorDisplayFill() {
			const hexColor = rgbToHex(
				sliderColorFill.r,
				sliderColorFill.g,
				sliderColorFill.b
			);
			ctx.presentColor = hexColor;
			document.getElementById("color-button-fill").style.backgroundColor =
				ctx.presentColor;
		}

		function updateSlidersFill(color) {
			const rgb = color.match(/\d+/g).map((num) => parseInt(num, 10));
			redSliderFill.value = rgb[0];
			greenSliderFill.value = rgb[1];
			blueSliderFill.value = rgb[2];
		}

		function handleSliderChangeFill() {
			sliderColorFill = {
				r: parseInt(redSliderFill.value),
				g: parseInt(greenSliderFill.value),
				b: parseInt(blueSliderFill.value),
			};
			updateColorDisplayFill();
		}
		redSliderFill.addEventListener("input", handleSliderChangeFill);
		greenSliderFill.addEventListener("input", handleSliderChangeFill);
		blueSliderFill.addEventListener("input", handleSliderChangeFill);

		document.addEventListener("color-selected-fill", function (event) {
			const selectedColorFill = event.detail.color;
			ctx.presentColor = selectedColorFill;
			document.getElementById("color-button-fill").style.backgroundColor =
				ctx.presentColor;
			updateSlidersFill(selectedColorFill);
		});

		// Handle the color sliders for the volume text color.
		const redSliderText = document.getElementById("red-slider-text");
		const greenSliderText = document.getElementById("green-slider-text");
		const blueSliderText = document.getElementById("blue-slider-text");

		let sliderColorText = { r: 0, g: 0, b: 0 };

		function updateColorDisplayText() {
			const hexColor = rgbToHex(
				sliderColorText.r,
				sliderColorText.g,
				sliderColorText.b
			);
			ctx.textColor = hexColor;
			document.getElementById("color-button-text").style.backgroundColor =
				ctx.textColor;
		}

		function updateSlidersText(color) {
			const rgb = color.match(/\d+/g).map((num) => parseInt(num, 10));
			redSliderText.value = rgb[0];
			greenSliderText.value = rgb[1];
			blueSliderText.value = rgb[2];
		}

		function handleSliderChangeText() {
			sliderColorText = {
				r: parseInt(redSliderText.value),
				g: parseInt(greenSliderText.value),
				b: parseInt(blueSliderText.value),
			};
			updateColorDisplayText();
		}

		redSliderText.addEventListener("input", handleSliderChangeText);
		greenSliderText.addEventListener("input", handleSliderChangeText);
		blueSliderText.addEventListener("input", handleSliderChangeText);

		document.addEventListener("color-selected-text", function (event) {
			const selectedColorText = event.detail.color;
			ctx.textColor = selectedColorText;
			document.getElementById("color-button-text").style.backgroundColor =
				ctx.textColor;
			updateSlidersText(selectedColorText);
		});

		// Handle the tossing of the volumes.
		document
			.querySelector("#throw-button")
			.addEventListener("click", () => {
				throwDice();
				if (presence) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "throw",
					});
				}
			});

		// Toggles showing numbers on the volumes.

		document
			.querySelector("#number-button")
			.addEventListener("click", () => {
				var numberButton = document.getElementById("number-button");
				numberButton.classList.toggle("active");
				document.getElementById("volume-button").style.backgroundImage =
					"url(icons/number_volume.svg)";
				if (defaultVolume) {
					var defaultButton =
						document.getElementById("default-button");
					defaultButton.classList.toggle("active");
					defaultVolume = !defaultVolume;
				}
				if (ctx.toggleTransparent) {
					var transparentButton =
						document.getElementById("transparent-button");
					transparentButton.classList.toggle("active");
					ctx.toggleTransparent = !ctx.toggleTransparent;
				}
				ctx.showNumbers = !ctx.showNumbers;
				// toggleNumbers();
			});

		// Handles the transparent volume type button.
		document
			.querySelector("#transparent-button")
			.addEventListener("click", () => {
				var transparentButton =
					document.getElementById("transparent-button");
				// Toggle the 'active' class on the clear button
				transparentButton.classList.toggle("active");
				document.getElementById("volume-button").style.backgroundImage =
					"url(icons/transparent_volume.svg)";
				console.log(defaultVolume);

				if (defaultVolume) {
					var defaultButton =
						document.getElementById("default-button");
					defaultButton.classList.toggle("active");
					defaultVolume = !defaultVolume;
				}

				if (ctx.showNumbers) {
					var numberButton = document.getElementById("number-button");
					numberButton.classList.toggle("active");
					ctx.showNumbers = !ctx.showNumbers;
				}
				ctx.toggleTransparent = !ctx.toggleTransparent;
			});

		// Handles the default (solid volume, without numbers nor transparent) volume type button.
		document
			.querySelector("#default-button")
			.addEventListener("click", (event) => {
				var defaultButton = document.getElementById("default-button");
				// Toggle the 'active' class on the clear button
				defaultButton.classList.toggle("active");
				document.getElementById("volume-button").style.backgroundImage =
					"url(icons/default_volume.svg)";

				if (ctx.toggleTransparent) {
					var transparentButton =
						document.getElementById("transparent-button");
					transparentButton.classList.toggle("active");
					ctx.toggleTransparent = !ctx.toggleTransparent;
				}

				if (ctx.showNumbers) {
					var numberButton = document.getElementById("number-button");
					numberButton.classList.toggle("active");
					ctx.showNumbers = !ctx.showNumbers;
				}
				defaultVolume = !defaultVolume;
			});

		let addShape = {
			cube: true,
			tetra: false,
			octa: false,
			dodeca: false,
			deca: false,
			icosa: false,
		};
		document.getElementById("cube-button").classList.toggle("active");

		const buttons = ["cube", "tetra", "octa", "dodeca", "deca", "icosa"];
		const removeButton = document.querySelector("#clear-button");
		const solidButton = document.querySelector("#solid-button");

		const toggleShape = (shape) => {
			buttons.forEach((btn) => {
				addShape[btn] = btn === shape;
				document
					.getElementById(`${btn}-button`)
					.classList.toggle("active", btn === shape);
			});
			removeVolume = false;
			removeButton.classList.remove("active");
		};
		// Handles the remove button.
		removeButton.addEventListener("click", () => {
			if (!removeButton.classList.contains("active")) {
				buttons.forEach((btn) => {
					addShape[btn] = false;
					document
						.getElementById(`${btn}-button`)
						.classList.remove("active");
				});
				removeVolume = true;
				removeButton.classList.add("active");
			}
		});

		buttons.forEach((shape) => {
			document
				.getElementById(`${shape}-button`)
				.addEventListener("click", () => {
					if (
						!document
							.getElementById(`${shape}-button`)
							.classList.contains("active")
					) {
						toggleShape(shape);
					}
				});
		});

		const lastRollElement = document.getElementById("roll");

		// Adds all the numbers on top for the numbered volumes.
		function updateElements() {
			lastRollElement.textContent =
				lastRoll.substring(0, lastRoll.length - 2) +
				"= " +
				presentScore;
		}

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		renderer.shadowMap.enabled = true;

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		document.querySelector("body").addEventListener("click", onRemoveClick);
		document
			.querySelector("#game-container")
			.addEventListener("click", onAddClick);

		let ifAdding = {
			adding: true,
		};

		function onAddClick(event) {
			// This will be false only when tutorial is running.
			if (!ifAdding.adding) {
				return;
			}
			// This is so that volumes are not added to the board when the board is being rotated.
			if (window.isRotating) {
				window.isRotating = false;
				return;
			}
			if (!removeVolume) {
				// Calculates the exact point where the user clicks and wants to add the volume to.
				var rect = renderer.domElement.getBoundingClientRect();
				mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

				// Update the picking ray with the camera and mouse position
				raycaster.setFromCamera(mouse, camera);

				// Calculate objects intersecting the picking ray
				var intersects = raycaster.intersectObjects(scene.children);

				for (let i = 0; i < intersects.length; i++) {
					var intersectedObject = intersects[i]?.object;
					// The volume must be added to the board only when the board is clicked.
					if (intersectedObject.geometry.type == "PlaneGeometry") {
						xCoordinate = intersects[i].point.x;
						zCoordinate = intersects[i].point.z;

						let createFunction = null;
						let shapeType = null;

						if (addShape["cube"]) {
							createFunction = createCube;
							shapeType = "cube";
						} else if (addShape["tetra"]) {
							createFunction = createTetrahedron;
							shapeType = "tetra";
						} else if (addShape["deca"]) {
							createFunction = createDecahedron;
							shapeType = "deca";
						} else if (addShape["dodeca"]) {
							createFunction = createDodecahedron;
							shapeType = "dodeca";
						} else if (addShape["icosa"]) {
							createFunction = createIcosahedron;
							shapeType = "icosa";
						} else if (addShape["octa"]) {
							createFunction = createOctahedron;
							shapeType = "octa";
						}

						if (createFunction) {
							let angVel1 = Math.random() * (2 - 0.1) + 0.1;
							let angVel2 = Math.random() * (2 - 0.1) + 0.1;
							let angVel3 = Math.random() * (2 - 0.1) + 0.1;
							createFunction(
								null,
								null,
								null,
								xCoordinate,
								zCoordinate,
								null,
								null,
								null,
								null,
								null,
								ctx,
								diceArray,
								world,
								scene,
								groundPhysMat,
								angVel1,
								angVel2,
								angVel3
							);
							// Create the volume for the connected users as well.
							if (presence) {
								presence.sendMessage(
									presence.getSharedInfo().id,
									{
										user: presence.getUserInfo(),
										content: {
											shape: shapeType,
											color: ctx.presentColor,
											ifTransparent:
												ctx.toggleTransparent,
											ifNumbers: ctx.showNumbers,
											xCoordinateShared: xCoordinate,
											zCoordinateShared: zCoordinate,
											ifImage: showImage,
											sharedImageData: imageData,
											yCoordinateShared: null,
											quaternionShared: null,
											sharedTextColor: ctx.textColor,
											sharedAngVel1: angVel1,
											sharedAngVel2: angVel2,
											sharedAngVel3: angVel3,
										},
									}
								);
							}
						}
					}
				}
			}
		}

		function onRemoveClick(event) {
			if (removeVolume) {
				// Calculate mouse position in normalized device coordinates
				var rect = renderer.domElement.getBoundingClientRect();
				mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

				// Update the picking ray with the camera and mouse position
				raycaster.setFromCamera(mouse, camera);

				// Calculate objects intersecting the picking ray
				var intersects = raycaster.intersectObjects(scene.children);

				// Gets the first object intersected by the ray, which is the volume the user is clicking on.
				var intersectedObject = intersects[0]?.object;
				if (intersectedObject?.geometry.type == "PlaneGeometry") {
					return;
				}

				// Removing the volume for other users as well.
				if (presence) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "remove",
						content: mouse, // Send the point which the user is clicking on.
					});
				}

				remove(intersectedObject);
			}
		}
		function remove(intersectedObject) {
			let num = 0;
			for (let i = 0; i < diceArray.length; i++) {
				if (diceArray[i][3]) {
					num++;
				}
			}
			// Find the volume being clicked within the diceArray to remove it.
			for (let i = 0; i < diceArray.length; i++) {
				if (diceArray[i][0] == intersectedObject) {
					if (diceArray[i][3]) {
						// If the volume being removed is a numbered volume then get the number on top of the volume and remove it from the score.
						let score;
						switch (diceArray[i][2]) {
							case "cube":
								score = getCubeScore(diceArray[i][0], true);
								break;
							case "icosa":
								score = getIcosaScore(diceArray[i][0], true);
								break;
							case "deca":
								score = getDecaScore(diceArray[i][0], true);
								break;
							case "dodeca":
								score = getDodecaScore(diceArray[i][0], true);
								break;
							case "octa":
								score = getOctaScore(diceArray[i][0], true);
								break;
							case "tetra":
								score = getTetraScore(diceArray[i][0], true);
								break;
							default:
								console.log(`Unknown type: ${diceArray[i][3]}`);
								continue;
						}

						presentScore = presentScore - score;
						console.log(presentScore);

						let scoresArray = lastRoll.split(" + ");

						// Find the index of the first occurrence of the score to remove
						let indexToRemove = scoresArray.indexOf(
							score.toString()
						);

						// If the score is found, remove it
						if (indexToRemove !== -1) {
							scoresArray.splice(indexToRemove, 1);
						}

						// Join the remaining scores back into a string
						lastRoll = scoresArray.join(" + ");
						updateElements();
						console.log(lastRoll);
						console.log(presentScore);
						num--;
					}
					world.removeBody(diceArray[i][1]);
					scene.remove(diceArray[i][0]);
					diceArray.splice(i, 1);
				}
			}
			if (num == 0) {
				lastRollElement.textContent = "";
				lastRoll = "";
				presentScore = 0;
			}
		}

		var presence = null;
		var palette = new presencepalette.PresencePalette(
			document.getElementById("network-button"),
			undefined
		);
		palette.addEventListener("shared", function () {
			palette.popDown();
			console.log("Want to share");
			presence = activity.getPresenceObject(function (error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity(
					"org.sugarlabs.3DVolume",
					function (groupId) {
						console.log("Activity shared");
					}
				);
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		var onNetworkUserChanged = function (msg) {
			let presenceDiceArray = [];
			for (let i = 0; i < diceArray.length; i++) {
				// Handles the situation when the user already has some volume on the board before the connected user joins.
				presenceDiceArray.push([
					diceArray[i][2],
					diceArray[i][1].position,
					diceArray[i][1].quaternion,
					diceArray[i][5],
					diceArray[i][6],
					diceArray[i][3],
					diceArray[i][4],
					diceArray[i][7],
					diceArray[i][8],
				]);
			}
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				action: "init",
				content: [presenceDiceArray, presentBackground], // sends the diceArray and the present background of the user to the users which are joining
			});
		};

		renderer.setSize(window.innerWidth, window.innerHeight);
		const canvas = document.getElementById("game-container");
		document
			.getElementById("game-container")
			.appendChild(renderer.domElement);
		// Create the scene and add lighting to it.
		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#ffffff");
		const light = new THREE.DirectionalLight(0xffffff, 0.4);
		light.castShadow = true;
		const leftLight = new THREE.DirectionalLight(0xffffff, 0.25);
		leftLight.castShadow = true;
		const rightLight = new THREE.DirectionalLight(0xffffff, 0.1);
		rightLight.castShadow = true;
		const backLight = new THREE.DirectionalLight(0xffffff, 0.1);
		const bottomLight = new THREE.DirectionalLight(0xffffff, 0.1);
		const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
		topLight.castShadow = true;
		leftLight.position.set(-30, 20, -30);
		rightLight.position.set(30, 20, -30);
		backLight.position.set(0, 20, 30);
		light.position.set(0, 20, -30);
		bottomLight.position.set(0, -20, -30);
		topLight.position.set(0, 10, 0);
		scene.add(backLight);
		scene.add(rightLight);
		scene.add(leftLight);
		scene.add(light);
		scene.add(bottomLight);
		scene.add(topLight);

		const ambientLight = new THREE.AmbientLight(0x222222); // Soft ambient lighting
		scene.add(ambientLight);

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		// Create the cannon physics worls.
		const world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.81, 0),
		});
		world.allowSleep = true;

		var sensorButton = document.getElementById("sensor-button");
		var sensorMode = false;

		// Handles the accelerometer
		if (navigator.accelerometer != null) {
			// If the accelerometer is available then keep the accelerometer on by default.
			sensorMode = true;
			sensorButton.classList.add("active");
			watchId = navigator.accelerometer.watchAcceleration(
				accelerationChanged,
				null,
				{ frequency: 500 }
			);
		}

		sensorButton.addEventListener("click", function () {
			if (navigator.accelerometer == null) {
				return;
			}
			sensorMode = !sensorMode;
			if (sensorMode) {
				sensorButton.classList.add("active");
				watchId = navigator.accelerometer.watchAcceleration(
					accelerationChanged,
					null,
					{ frequency: 500 }
				);
			} else {
				sensorButton.classList.remove("active");
				world.gravity.set(0, -9.81, 0);
			}
		});

		function accelerationChanged(acceleration) {
			if (!sensorMode) return;
			if (acceleration.y > 0) {
				// right
				world.gravity.set(-9.81, 0, 0); // Gravity towards the right
				wakeAll();
			} else {
				if (acceleration.z > 0) {
					if (acceleration.y > -1 && acceleration.y < 1) {
						if (acceleration.z > 6) {
							// back
							world.gravity.set(0, 0, 9.81); // Gravity towards the back
							wakeAll();
						} else {
							// straight
							world.gravity.set(0, -9.81, 0);
							wakeAll();
						}
					} else {
						// left
						world.gravity.set(9.81, 0, 0); // Gravity towards the left
						wakeAll();
					}
				} else {
					// front
					world.gravity.set(0, 0, -9.81); // Gravity towards the front
					wakeAll();
				}
			}
		}

		// Wakes all the volumes so that they move towards the gravity.
		function wakeAll() {
			for (let i = 0; i < diceArray.length; i++) {
				diceArray[i][1].wakeUp();
			}
		}

		// Create the threejs mesh of the board.
		const groundGeo = new THREE.PlaneGeometry(30, 30);
		const groundMat = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			wireframe: false,
		});
		groundMat.needsUpdate = true;
		const groundMesh = new THREE.Mesh(groundGeo, groundMat);
		groundMesh.receiveShadow = true;

		groundMesh.material.color.setHex(0xc9c9c9);

		scene.add(groundMesh);
		const groundPhysMat = new CANNON.Material();
		const groundWidth = 0; // Desired width of the ground
		const groundDepth = 0; // Desired depth of the ground
		const boxWidth = groundWidth / 2;
		const boxDepth = groundDepth / 2;
		const boxHeight = 10; // Adjust this for desired box height

		const boxShape = new CANNON.Box(
			new CANNON.Vec3(boxWidth, boxHeight / 2, boxDepth)
		);

		// Create the physical cannon-es ground.
		const groundBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
		});
		groundBody.material.friction = 1;
		groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		world.addBody(groundBody);

		// We will add invisible walls to all sides of the board so that the volumes do not fly off the board.

		const topWall = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
		});
		topWall.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		topWall.position.set(0, 12, 0);

		world.addBody(topWall);

		const leftWallBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
			friction: -10,
			restitution: 10,
		});
		world.addBody(leftWallBody);
		leftWallBody.position.set(15, 0, 0);
		leftWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0);

		const rightWallBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
			friction: -10,
			restitution: 10,
		});
		world.addBody(rightWallBody);
		rightWallBody.position.set(-15, 0, 0);
		rightWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0);

		const backWallBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
			friction: -10,
			restitution: 10,
		});
		world.addBody(backWallBody);
		backWallBody.position.set(0, 0, 15);
		backWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);

		const frontWallBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
			friction: -10,
			restitution: 10,
		});
		world.addBody(frontWallBody);
		frontWallBody.position.set(0, 0, -15);
		frontWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);

		// Use OrbitControls to add orbital controls :)
		const orbit = new OrbitControls.OrbitControls(
			camera,
			renderer.domElement
		);
		camera.position.set(0, 25, -30);
		orbit.update();
		orbit.listenToKeyEvents(document.querySelector("body"));

		const goRightButton = document.querySelector("#right-button");
		const goLeftButton = document.querySelector("#left-button");
		const goUpButton = document.querySelector("#up-button");
		const goDownButton = document.querySelector("#down-button");

		// Handles the rotation of the board through the arrow buttons
		goRightButton.addEventListener("click", function (event) {
			orbit.rotateRight();
			event.stopPropagation();
		});

		goLeftButton.addEventListener("click", function (event) {
			orbit.rotateLeft();
			event.stopPropagation();
		});
		goUpButton.addEventListener("click", function (event) {
			orbit.rotateUp();
			event.stopPropagation();
		});
		goDownButton.addEventListener("click", function (event) {
			orbit.rotateDown();
			event.stopPropagation();
		});
		// Zoom code
		const evt = new Event("wheel", { bubbles: true, cancelable: true });

		const zoomInButton = document.getElementById("zoom-in-button");
		const zoomOutButton = document.getElementById("zoom-out-button");
		const zoomEqualButton = document.getElementById("zoom-equal-button");
		const zoomToButton = document.getElementById("zoom-to-button");

		// Zoom code is self explanatory
		const zoomInFunction = (e) => {
			const fov = getFov();
			camera.fov = clickZoom(fov, "zoomIn");
			camera.updateProjectionMatrix();
			e.stopPropagation();
		};

		const zoomOutFunction = (e) => {
			const fov = getFov();
			camera.fov = clickZoom(fov, "zoomOut");
			camera.updateProjectionMatrix();
			e.stopPropagation();
		};

		const zoomEqualFunction = (e) => {
			const fov = getFov();
			camera.fov = 29;
			camera.updateProjectionMatrix();
			e.stopPropagation();
		};

		const zoomToFunction = (e) => {
			const fov = getFov();
			camera.fov = 35;
			camera.updateProjectionMatrix();
			e.stopPropagation();
		};

		const clickZoom = (value, zoomType) => {
			if (value >= 20 && zoomType === "zoomIn") {
				return value - 5;
			} else if (value <= 75 && zoomType === "zoomOut") {
				return value + 5;
			} else {
				return value;
			}
		};

		const getFov = () => {
			return Math.floor(
				(2 *
					Math.atan(
						camera.getFilmHeight() / 2 / camera.getFocalLength()
					) *
					180) /
					Math.PI
			);
		};

		const fov = getFov();
		camera.fov = 29;
		camera.updateProjectionMatrix();

		zoomInButton.addEventListener("click", zoomInFunction);
		zoomOutButton.addEventListener("click", zoomOutFunction);
		zoomEqualButton.addEventListener("click", zoomEqualFunction);
		zoomToButton.addEventListener("click", zoomToFunction);

		// This function handles the tossing of the volumes.

		function throwDice() {
			// Remove all the volumes from the board.
			for (let i = 0; i < diceArray.length; i++) {
				scene.remove(diceArray[i][0]);
				world.removeBody(diceArray[i][1]);
			}
			if (diceArray.length > 0) {
				lastRoll = "";
				presentScore = 0;
				for (let i = 0; i < diceArray.length; i++) {
					scene.add(diceArray[i][0]);
					world.addBody(diceArray[i][1]);
					diceArray[i][1].position.set(0, 10, 0);
				}
			}
		}

		// Functions to get the scores of the dice.

		function getOctaScore(body, ifRemove) {
			const faceVectors = [
				{
					vector: new THREE.Vector3(1, 0, 0), // Along the positive x-axis
					face: 4,
				},
				{
					vector: new THREE.Vector3(-1, 0, 0), // Along the negative x-axis
					face: 6,
				},
				{
					vector: new THREE.Vector3(0, 1, 0), // Along the positive y-axis
					face: 5,
				},
				{
					vector: new THREE.Vector3(0, -1, 0), // Along the negative y-axis
					face: 3,
				},
				{
					vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
					face: 1,
				},
				{
					vector: new THREE.Vector3(-1, 1, 1).normalize(), // Towards a corner (negative x, positive y, z)
					face: 8,
				},
				{
					vector: new THREE.Vector3(1, -1, 1).normalize(), // Towards a corner (positive x, negative y, z)
					face: 2,
				},
				{
					vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
					face: 7,
				},
			];

			let minValue = 1000000;
			let minInd;
			for (let i = 0; i < faceVectors.length; i++) {
				let faceVector = faceVectors[i];
				faceVector.vector.applyEuler(body.rotation);
				if (minValue > Math.abs(1 - faceVector.vector.y)) {
					minValue = Math.abs(1 - faceVector.vector.y);
					minInd = i;
				}
			}
			if (!ifRemove) {
				lastRoll += faceVectors[minInd].face + " + ";
				presentScore += faceVectors[minInd].face;
				updateElements();
			}
			for (let i = 0; i < diceArray.length; i++) {
				if (body == diceArray[i][0]) {
					diceArray[i][7] = faceVectors[minInd].face;
				}
			}
			return faceVectors[minInd].face;
		}

		function getCubeScore(body, ifRemove) {
			const faceVectors = [
				{
					vector: new THREE.Vector3(1, 0, 0),
					face: 1,
				},
				{
					vector: new THREE.Vector3(-1, 0, 0),
					face: 2,
				},
				{
					vector: new THREE.Vector3(0, 1, 0),
					face: 3,
				},
				{
					vector: new THREE.Vector3(0, -1, 0),
					face: 4,
				},
				{
					vector: new THREE.Vector3(0, 0, 1),
					face: 5,
				},
				{
					vector: new THREE.Vector3(0, 0, -1),
					face: 6,
				},
			];
			for (const faceVector of faceVectors) {
				faceVector.vector.applyEuler(body.rotation);

				if (Math.round(faceVector.vector.y) == 1) {
					if (!ifRemove) {
						lastRoll += faceVector.face + " + ";
						presentScore += faceVector.face;
						updateElements();
					}
					for (let i = 0; i < diceArray.length; i++) {
						if (body == diceArray[i][0]) {
							diceArray[i][7] = faceVector.face;
						}
					}
					return faceVector.face;
				}
			}
		}
		function getTetraScore(body, ifRemove) {
			const faceVectors = [
				{
					vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
					face: 1,
				},
				{
					vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
					face: 3,
				},
				{
					vector: new THREE.Vector3(-1, 1, -1).normalize(), // Towards a corner (negative x, positive y, negative z)
					face: 2,
				},
				{
					vector: new THREE.Vector3(1, -1, -1).normalize(), // Towards a corner (positive x, negative y, negative z)
					face: 4,
				},
			];

			for (const faceVector of faceVectors) {
				faceVector.vector.applyEuler(body.rotation);
				if (Math.round(faceVector.vector.y) == 1) {
					if (!ifRemove) {
						lastRoll += faceVector.face + " + ";
						presentScore += faceVector.face;
						updateElements();
						break;
					}
					for (let i = 0; i < diceArray.length; i++) {
						if (body == diceArray[i][0]) {
							diceArray[i][7] = faceVector.face;
						}
					}
					return faceVector.face;
				}
			}
		}

		function getDecaScore(body, ifRemove) {
			// Define face vectors based on vertices
			const faceVectors = [
				{ vector: new THREE.Vector3(0, 0, 1), face: 1 },
				{ vector: new THREE.Vector3(0, 0, -1), face: 2 },
			];

			const sides = 10;
			for (let i = 0; i < sides; ++i) {
				const b = (i * Math.PI * 2) / sides;
				faceVectors.push({
					vector: new THREE.Vector3(
						-Math.cos(b),
						-Math.sin(b),
						0.105 * (i % 2 ? 1 : -1)
					),
					face: i + 3,
				});
			}

			for (const faceVector of faceVectors) {
				faceVector.vector.normalize().applyEuler(body.rotation);

				if (Math.round(faceVector.vector.y) === 1) {
					if (!ifRemove) {
						lastRoll += faceVector.face + " + ";
						presentScore += faceVector.face;
						updateElements();
						break;
					}
					for (let i = 0; i < diceArray.length; i++) {
						if (body == diceArray[i][0]) {
							diceArray[i][7] = faceVector.face;
						}
					}
					return faceVector.face;
				}
			}
		}

		function getIcosaScore(body, ifRemove) {
			// Define the golden ratio
			const phi = (1 + Math.sqrt(5)) / 2;

			// Icosahedron face vectors
			const faceVectors = [
				{ vector: new THREE.Vector3(0, 1, phi).normalize(), face: 7 },
				{ vector: new THREE.Vector3(0, -1, phi).normalize(), face: 16 },
				{ vector: new THREE.Vector3(0, 1, -phi).normalize(), face: 4 },
				{
					vector: new THREE.Vector3(0, -1, -phi).normalize(),
					face: 20,
				},
				{ vector: new THREE.Vector3(1, phi, 0).normalize(), face: 6 },
				{ vector: new THREE.Vector3(-1, phi, 0).normalize(), face: 5 },
				{ vector: new THREE.Vector3(1, -phi, 0).normalize(), face: 9 },
				{
					vector: new THREE.Vector3(-1, -phi, 0).normalize(),
					face: 17,
				},
				{ vector: new THREE.Vector3(phi, 0, 1).normalize(), face: 15 },
				{ vector: new THREE.Vector3(-phi, 0, 1).normalize(), face: 8 },
				{ vector: new THREE.Vector3(phi, 0, -1).normalize(), face: 19 },
				{
					vector: new THREE.Vector3(-phi, 0, -1).normalize(),
					face: 13,
				},
				{ vector: new THREE.Vector3(1, phi, phi).normalize(), face: 2 },
				{
					vector: new THREE.Vector3(-1, phi, phi).normalize(),
					face: 1,
				},
				{
					vector: new THREE.Vector3(1, -phi, phi).normalize(),
					face: 11,
				},
				{
					vector: new THREE.Vector3(-1, -phi, phi).normalize(),
					face: 12,
				},
				{
					vector: new THREE.Vector3(1, phi, -phi).normalize(),
					face: 10,
				},
				{
					vector: new THREE.Vector3(-1, phi, -phi).normalize(),
					face: 3,
				},
				{
					vector: new THREE.Vector3(1, -phi, -phi).normalize(),
					face: 14,
				},
				{
					vector: new THREE.Vector3(-1, -phi, -phi).normalize(),
					face: 18,
				},
			];

			let closestFace = null;
			let closestDot = -1; // Initialize with the smallest possible dot product

			// Reference vector pointing up
			let upVector = new THREE.Vector3(0, 1, 0);

			for (const faceVector of faceVectors) {
				// Apply the body's quaternion to the face vector
				let worldVector = faceVector.vector
					.clone()
					.applyQuaternion(body.quaternion);

				// Calculate the dot product with the up vector
				let dot = worldVector.dot(upVector);

				// Check if this is the closest to pointing up
				if (dot > closestDot) {
					closestDot = dot;
					closestFace = faceVector;
				}
			}

			if (closestFace) {
				let faceNumber = closestFace.face;
				if (!ifRemove) {
					lastRoll += faceNumber + " + ";
					presentScore += faceNumber;
					updateElements();
				}
				for (let i = 0; i < diceArray.length; i++) {
					if (body == diceArray[i][0]) {
						diceArray[i][7] = faceNumber;
					}
				}
				for (let i = 0; i < diceArray.length; i++) {
					if (body == diceArray[i][0]) {
						diceArray[i][7] = faceNumber;
					}
				}
				return faceNumber;
			}
		}

		function getDodecaScore(body, ifRemove) {
			// Define the golden ratio
			const phi = (1 + Math.sqrt(5)) / 2;

			// Decahedron face vectors
			const faceVectors = [
				{ vector: new THREE.Vector3(1, 1, 1), face: 1 },
				{ vector: new THREE.Vector3(1, 1, -1), face: 6 },
				{ vector: new THREE.Vector3(1, -1, 1), face: 11 },
				{ vector: new THREE.Vector3(1, -1, -1), face: 9 },
				{ vector: new THREE.Vector3(-1, 1, 1), face: 7 },
				{ vector: new THREE.Vector3(-1, 1, -1), face: 2 },
				{ vector: new THREE.Vector3(-1, -1, 1), face: 5 },
				{ vector: new THREE.Vector3(-1, -1, -1), face: 8 },
				{ vector: new THREE.Vector3(0, phi, 1 / phi), face: 4 },
				{ vector: new THREE.Vector3(0, phi, -1 / phi), face: 10 },
				{ vector: new THREE.Vector3(0, -phi, 1 / phi), face: 3 },
				{ vector: new THREE.Vector3(0, -phi, -1 / phi), face: 12 },
			];

			for (const faceVector of faceVectors) {
				faceVector.vector.normalize().applyEuler(body.rotation);

				if (Math.round(faceVector.vector.y) === 1) {
					if (!ifRemove) {
						lastRoll += faceVector.face + " + ";
						presentScore += faceVector.face;
						updateElements();
						break;
					}
					for (let i = 0; i < diceArray.length; i++) {
						if (body == diceArray[i][0]) {
							diceArray[i][7] = faceVector.face;
						}
					}
					return faceVector.face;
				}
			}
		}

		function getDecaScore(body, ifRemove) {
			// Decahedron face vectors
			const faceVectors = [
				{ vector: new THREE.Vector3(0, 1, 0.5), face: 7 },
				{ vector: new THREE.Vector3(0, 1, -0.5), face: 2 },
				{ vector: new THREE.Vector3(0, -1, 0.5), face: 3 },
				{ vector: new THREE.Vector3(0, -1, -0.5), face: 10 },
				{ vector: new THREE.Vector3(0.5, 0, 1), face: 5 },
				{ vector: new THREE.Vector3(-0.5, 0, 1), face: 8 },
				{ vector: new THREE.Vector3(0.5, 0, -1), face: 9 },
				{ vector: new THREE.Vector3(-0.5, 0, -1), face: 6 },
				{ vector: new THREE.Vector3(1, 0.5, 0), face: 1 },
				{ vector: new THREE.Vector3(-1, 0.5, 0), face: 4 },
			];

			for (const faceVector of faceVectors) {
				faceVector.vector.normalize().applyEuler(body.rotation);

				if (Math.round(faceVector.vector.y) === 1) {
					if (!ifRemove) {
						lastRoll += faceVector.face + " + ";
						presentScore += faceVector.face;
						updateElements();
						break;
					}
					for (let i = 0; i < diceArray.length; i++) {
						if (body == diceArray[i][0]) {
							diceArray[i][7] = faceVector.face;
						}
					}
					return faceVector.face;
				}
			}
		}

		function changeBoardBackground(selectedBoard) {
			console.log(selectedBoard);
			presentBackground = selectedBoard;
			let textureLoader = new THREE.TextureLoader();
			switch (selectedBoard) {
				case "green-board":
					console.log("now changing bg to green");
					textureLoader.load(
						"images/grass_background.png",
						function (groundTexture) {
							groundMesh.material.wireframe = false;
							groundMesh.material.map = groundTexture;
							groundMesh.material.needsUpdate = true;
							groundBody.material.friction = 5;
						}
					);
					break;
				case "wood":
					console.log("wood changing");
					textureLoader.load(
						"images/wood.png",
						function (groundTexture) {
							groundMesh.material.wireframe = false;
							groundMesh.material.color.setHex(0xf0c592);
							groundMesh.material.map = groundTexture;
							groundMesh.material.needsUpdate = true;
							groundBody.material.friction = 3;
						}
					);
					break;
				case "default":
					groundMesh.material.needsUpdate = true;
					groundMesh.material.color.setHex(0xc9c9c9);
					groundMesh.material.wireframe = false;
					groundMesh.material.map = null;
					groundBody.material.friction = 1;
					break;
			}
		}
		// This function calls the getScore functions for all the volumes and displays them.
		function getScores() {
			presentScore = 0;
			lastRoll = "";
			lastRollElement.textContent = "";

			for (let i = 0; i < diceArray.length; i++) {
				if (diceArray[i][3]) {
					switch (diceArray[i][2]) {
						case "cube":
							score = getCubeScore(diceArray[i][0]);
							break;
						case "icosa":
							score = getIcosaScore(diceArray[i][0]);
							break;
						case "deca":
							score = getDecaScore(diceArray[i][0]);
							break;
						case "dodeca":
							score = getDodecaScore(diceArray[i][0]);
							break;
						case "octa":
							score = getOctaScore(diceArray[i][0]);
							break;
						case "tetra":
							score = getTetraScore(diceArray[i][0]);
							break;
						default:
							console.log(`Unknown type: ${diceArray[i][3]}`);
							continue;
					}
				}
			}
		}

		// Leaving this here so that in the future contributors find it easier to debug the cannon-es physical world. Go to the animate function and uncomment the cannonDebugger line to view the physical world.

		const cannonDebugger = new CannonDebugger(scene, world, {
			color: 0xadd8e6,
		});

		let awake = false;
		const timeStep = 1 / 20;

		animate();

		function animate(time) {
			world.step(timeStep);
			// Uncomment the next line to view how the physical world actually looks like.
			// cannonDebugger.update();

			groundMesh.position.copy(groundBody.position);
			groundMesh.quaternion.copy(groundBody.quaternion);

			// Loop to merge the cannon bodies to the threejs meshes
			for (let i = 0; i < diceArray.length; i++) {
				diceArray[i][0]?.position?.copy(diceArray[i][1].position);
				diceArray[i][0]?.quaternion?.copy(diceArray[i][1].quaternion);
			}
			if (world.hasActiveBodies == false && awake == true) {
				awake = false;
				console.log("the world is going to sleep now bye bye");
				for (let i = 0; i < diceArray.length; i++) {
					console.log(diceArray[i][1].interpolatedQuaternion.x);
					console.log(diceArray[i][1].interpolatedQuaternion.y);
					console.log(diceArray[i][1].interpolatedQuaternion.z);
					console.log(diceArray[i][1].initQuaternion.x);
					console.log(diceArray[i][1].initQuaternion.y);
					console.log(diceArray[i][1].initQuaternion.z);
				}
				getScores();
			}
			if (world.hasActiveBodies == true) {
				awake = true;
			}

			renderer.render(scene, camera);
		}

		renderer.setAnimationLoop(animate);

		window.addEventListener("resize", function () {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});
	});
});
