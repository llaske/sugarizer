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

		const randomDirection = new CANNON.Vec3(
			0.3, // Random x-axis value between -0.5 and 0.5
			0.05, // Random y-axis value between -0.1 and 0.1 (slightly tilted)
			0.3 // Random z-axis value between -0.5 and 0.5
		);
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
							continue; // Skip the rest of the loop for unexpected shapes
					}

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
							data[i][8]
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
			if (msg.action == "resetScore") {
				presentScore = 0;
				totalScoreElement.textContent = 0;
				lastRoll = "";
				lastRollElement.textContent = "";
			}
			if (msg.action == "remove") {
				raycaster.setFromCamera(msg.content, camera);
				var intersects = raycaster.intersectObjects(scene.children);

				var intersectedObject = intersects[0]?.object;
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
					msg.content.sharedAngVel2
				);
			}
		};

		document
			.getElementById("stop-button")
			.addEventListener("click", function (event) {
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
										data[i][8]
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
				tutorial.start();
			});

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

		// document.addEventListener('color-selected-fill', function (event) {
		//   const selectedColor = event.detail.color;
		//   ctx.presentColor = selectedColor;
		//   document.getElementById('color-button-fill').style.backgroundColor = ctx.presentColor;
		//   updateSlidersFill(selectedColor);
		// });

		function updateDice(type, value) {
			dices[type] += value;
			document.getElementById(type).innerHTML = "<br />" + dices[type];
		}

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

		// Toggles the dice's transparency
		// document.querySelector('#solid-button').addEventListener('click', () => {
		//   if (!transparent) {
		//     document.querySelector('#solid-button').style.backgroundImage =
		//       'url(icons/cube.svg)'
		//   } else {
		//     document.querySelector('#solid-button').style.backgroundImage =
		//       'url(icons/cube_solid.svg)'
		//   }
		//   transparent = !transparent
		//   toggleTransparency()
		// })

		// Toggles showing numbers on dice

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
				if (showImage) {
					var imageButton1 = document.getElementById("image-button");
					imageButton1.classList.toggle("active");
					showImage = !showImage;
				}
				ctx.showNumbers = !ctx.showNumbers;
				// toggleNumbers();
			});

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
					console.log("it is true");
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
				if (showImage) {
					var imageButton1 = document.getElementById("image-button");
					imageButton1.classList.toggle("active");
					showImage = !showImage;
				}
				ctx.toggleTransparent = !ctx.toggleTransparent;
			});

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
				if (showImage) {
					var imageButton1 = document.getElementById("image-button");
					imageButton1.classList.toggle("active");
					showImage = !showImage;
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
		const clearButton = document.getElementById("clear-button");
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

			if (transparent) {
				transparent = false;
				solidButton.style.backgroundImage = "url(icons/cube_solid.svg)";
				toggleTransparency();
			}
		};

		clearButton.addEventListener("click", () => {
			clearButton.classList.toggle("active");
			removeVolume = !removeVolume;
			buttons.forEach((btn) => {
				addShape[btn] = false;
				document
					.getElementById(`${btn}-button`)
					.classList.remove("active");
			});
		});

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

				if (transparent) {
					transparent = false;
					solidButton.style.backgroundImage =
						"url(icons/cube_solid.svg)";
					toggleTransparency();
				}
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

		// const imageButton = document.getElementById('image-button')
		// document
		//   .getElementById('image-button')
		//   .addEventListener('click', function (e) {
		//     if (showImage) {
		//       showImage = !showImage
		//       imageButton.classList.toggle('active')
		//       console.log('doing stuff onw')
		//       return
		//     }
		//     journalchooser.show(
		//       function (entry) {
		//         // No selection
		//         if (!entry) {
		//           return
		//         }
		//         // Get object content
		//         imageButton.classList.add('active')
		//         showImage = !showImage

		//         if (ctx.toggleTransparent) {
		//           var transparentButton =
		//             document.getElementById('transparent-button')
		//           transparentButton.classList.toggle('active')
		//           ctx.toggleTransparent = !ctx.toggleTransparent
		//         }

		//         if (ctx.showNumbers) {
		//           var numberButton = document.getElementById('number-button')
		//           numberButton.classList.toggle('active')
		//           ctx.showNumbers = !ctx.showNumbers
		//         }

		//         var dataentry = new datastore.DatastoreObject(entry.objectId)
		//         dataentry.loadAsText(function (err, metadata, data) {
		//           imageData = data
		//           console.log(data);
		//           // if (addCube) {
		//           //   console.log(data)
		//           //   imageData = data;
		//           //   console.log(imageData)
		//           //   createCube()
		//           // }
		//           // if (addTetra) {
		//           // }
		//           // if (addOcta) {
		//           // }
		//         })
		//       },
		//       { mimetype: 'image/png' },
		//       { mimetype: 'image/jpeg' },
		//     )
		//   })

		// Event listeners
		// document
		//   .querySelector('.cube .plus-button')
		//   .addEventListener('click', () => {
		//     updateDice('cube', 1)
		//     createCube()
		//     if (presence) {
		//       presence.sendMessage(presence.getSharedInfo().id, {
		//         user: presence.getUserInfo(),
		//         content: {
		//           shape: 'cube',
		//           color: currentenv.user.colorvalue.fill,
		//           ifTransparent: ctx.toggleTransparent,
		//           ifNumbers: ctx.showNumbers,
		//         },
		//       })
		//     }
		//   })

		const lastRollElement = document.getElementById("roll");

		// Function to update the elements
		function updateElements() {
			// totalScoreElement.textContent = presentScore
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
		document.querySelector("body").addEventListener("click", onAddClick);

		function onAddClick(event) {
			if (!removeVolume) {
				var rect = renderer.domElement.getBoundingClientRect();
				mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

				// Update the picking ray with the camera and mouse position
				raycaster.setFromCamera(mouse, camera);

				// Calculate objects intersecting the picking ray
				var intersects = raycaster.intersectObjects(scene.children);

				for (let i = 0; i < intersects.length; i++) {
					var intersectedObject = intersects[i]?.object;
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
							let angVel1 = Math.random() * (1 - 0.1) + 0.1;
							let angVel2 = Math.random() * (1 - 0.1) + 0.1;
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
								angVel2
							);

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

				var intersectedObject = intersects[0]?.object;
				if (intersectedObject?.geometry.type == "PlaneGeometry") {
					return;
				}
				if (presence) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "remove",
						content: mouse,
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
			for (let i = 0; i < diceArray.length; i++) {
				if (diceArray[i][0] == intersectedObject) {
					if (diceArray[i][3]) {
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
				content: [presenceDiceArray, presentBackground],
			});
		};

		// document
		//   .querySelector('#reset-button')
		//   .addEventListener('click', function () {
		//     presentScore = 0
		//     totalScoreElement.textContent = 0
		//     lastRoll = ''
		//     lastRollElement.textContent = ''
		//     if (presence) {
		//       presence.sendMessage(presence.getSharedInfo().id, {
		//         user: presence.getUserInfo(),
		//         action: 'resetScore',
		//       })
		//     }
		//   })
		let sleepCounter = 0;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const canvas = document.getElementById("game-container");
		document
			.getElementById("game-container")
			.appendChild(renderer.domElement);

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

		const world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.81, 0),
		});
		world.allowSleep = true;

		function adjustGravity(gamma) {
			console.log("adjusting gravity");
			var gravityStrength = 9.82; // Earth's gravity in m/s^2
			var maxTilt = 90; // Maximum tilt value

			// Map the gamma value to the gravity direction
			var gravityX = (gamma / maxTilt) * gravityStrength;

			// Set the new gravity vector
			world.gravity.set(gravityX, -gravityStrength, 0);
		}

		var useragent = navigator.userAgent.toLowerCase();
		var sensorButton = document.getElementById("sensor-button");
		var sensorMode = false;
		var readyToWatch = false;
		console.log(useragent.indexOf("android"));

		// if (useragent.indexOf('android') != -1 || useragent.indexOf('iphone') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('mozilla/5.0 (mobile') != -1) {
		// 	document.addEventListener('deviceready', function() {
		// 		readyToWatch = true;
		// 	}, false);
		// 	sensorButton.disabled = false;
		// } else {
		// 	sensorButton.disabled = true;
		// }

		sensorButton.addEventListener("click", function () {
			sensorMode = !sensorMode;
			if (sensorMode) {
				sensorButton.classList.add("active");
				// window.addEventListener(
				// 	"deviceorientation",
				// 	function (event) {
				// 		if (sensorMode) {
				// 			handleDeviceOrientation(event);
				// 		}
				// 	},
				// 	true
				// );
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

		function setGravity(gravityDirection) {
			let gravityX = 0;
			let gravityY = 0;
			let gravityZ = 0;

			switch (gravityDirection) {
				case 0:
					gravityY = 1; // Right
					break;
				case 1:
					gravityX = 1; // Right-bottom (diagonal down-right)
					gravityY = 1;
					break;
				case 2:
					gravityY = 1; // Bottom (straight down)
					break;
				case 3:
					gravityX = 1; // Left-bottom (diagonal down-left)
					gravityY = -1;
					break;
				case 4:
					gravityY = -1; // Left (straight left)
					break;
				case 5:
					gravityX = -1; // Left-top (diagonal up-left)
					gravityY = -1;
					break;
				case 6:
					gravityX = -1; // Top (straight up)
					break;
				case 7:
					gravityX = -1; // Right-top (diagonal up-right)
					gravityY = 1;
					break;
				default:
					break;
			}

			// Assuming you have a Cannon.js world instance called 'world'
			world.gravity.set(
				gravityX * 9.82,
				gravityY * 9.82,
				gravityZ * 9.82
			); // Scale gravity with 9.82 m/s² (approximate Earth gravity)
		}

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

		function wakeAll() {
			for (let i = 0; i < diceArray.length; i++) {
				diceArray[i][1].wakeUp();
			}
		}

		function myFunction() {
			console.log("hello");
		}
		// var intervalId = setInterval(accelerationChanged, 5000); // 2000 milliseconds (2 seconds)

		function handleDeviceOrientation(event) {
			var gamma = event.gamma; // Tilt left or right (range from -90 to 90)

			// Adjust gravity based on tilt
			adjustGravity(gamma);
		}

		// if (readyToWatch) {
		// 	sensorButton.disabled = false;
		// 	sensorButton.addEventListener("click", function () {
		// 		sensorMode = !sensorMode;
		// 		if (sensorMode) {
		// 			sensorButton.classList.add("active");
		// 		} else {
		// 			sensorButton.classList.remove("active");
		// 		}
		// 	});
		// 	window.addEventListener('deviceorientation', function(event) {
		// 		if (sensorMode) {
		// 			handleDeviceOrientation(event);
		// 		}
		// 	}, true);
		// }

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
		const groundThickness = 0;
		const boxWidth = groundWidth / 2;
		const boxDepth = groundDepth / 2;
		const boxHeight = 10; // Adjust this for desired box height

		const boxShape = new CANNON.Box(
			new CANNON.Vec3(boxWidth, boxHeight / 2, boxDepth)
		);

		const groundBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
		});
		console.log(groundBody)
		groundBody.material.friction = 1;
		groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		world.addBody(groundBody);

		const topWall = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
			type: CANNON.Body.STATIC,
			material: groundPhysMat,
		});
		topWall.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		topWall.position.set(0, 12, 0);
		world.addBody(topWall)


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

		// const rollingForceMagnitude = 2; // Adjust for desired intensity

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

		// Add click event listener to the button
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

		const zoomInFunction = (e) => {
			const fov = getFov();
			camera.fov = clickZoom(fov, "zoomIn");
			camera.updateProjectionMatrix();
		};

		const zoomOutFunction = (e) => {
			const fov = getFov();
			camera.fov = clickZoom(fov, "zoomOut");
			camera.updateProjectionMatrix();
		};

		const zoomEqualFunction = (e) => {
			const fov = getFov();
			camera.fov = 29;
			camera.updateProjectionMatrix();
		};

		const zoomToFunction = (e) => {
			const fov = getFov();
			camera.fov = 35;
			camera.updateProjectionMatrix();
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

		function onSleepStateChangeToOne(body) {
			let score;
			for (let i = 0; i < diceArray.length; i++) {
				if (diceArray[i][0] == body) {
					score = diceArray[i][7];
					let scoresArray = lastRoll.split(" + ");

					// Find the index of the first occurrence of the score to remove
					let indexToRemove = scoresArray.indexOf(score.toString());

					// If the score is found, remove it
					if (indexToRemove !== -1) {
						scoresArray.splice(indexToRemove, 1);
					}

					// Join the remaining scores back into a string
					lastRoll = scoresArray.join(" + ");
				}
			}
		}

		const cannonDebugger = new CannonDebugger(scene, world, {
			color: 0xadd8e6,
		});

		function makeNumbers() {
			let c = document.createElement("canvas");
			c.width = 1024;
			c.height = 1024;
			let ctx = c.getContext("2d");
			ctx.fillStyle = "#f0f";
			ctx.fillRect(0, 0, c.width, c.height);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#0f8";
			ctx.font = "bold 60px Arial";
			let step = 1024 / 10;
			let start = step * 0.5;

			for (let i = 0; i < 10; i++) {
				ctx.fillText(i + 1, start + step * i, 512);
			}

			return new THREE.CanvasTexture(c);
		}

		const timeStep = 1 / 20;

		function throwDice() {
			for (let i = 0; i < diceArray.length; i++) {
				scene.remove(diceArray[i][0]);
				world.removeBody(diceArray[i][1]);
			}
			if (diceArray.length > 0) {
				lastRoll = "";
				presentScore = 0;
				for (let i = 0; i < diceArray.length; i++) {
					diceArray[i][1].angularVelocity.set(0.5, 0.5, 0.5);
					diceArray[i][1].applyImpulse(ctx.offset, ctx.rollingForce);
					diceArray[i][1].position.set(0, 10, 0);
				}
				for (let i = 0; i < diceArray.length; i++) {
					scene.add(diceArray[i][0]);
					world.addBody(diceArray[i][1]);
				}
			} else {
				console.log("what is never supposed to happen is happening :0");
				for (let i = 0; i < dices.cube; i++) {
					createCube();
				}
				for (let i = 0; i < dices.tetra; i++) {
					createTetrahedron();
				}
				for (let i = 0; i < dices.octa; i++) {
					createOctahedron();
				}
				for (let i = 0; i < dices.dodeca; i++) {
					createDodecahedron();
				}
				for (let i = 0; i < dices.deca; i++) {
					createDecahedron();
				}
				for (let i = 0; i < dices.icosa; i++) {
					createIcosahedron();
				}
				lastRoll = "";
				// if (ctx.showNumbers) {
				//   getScore();
				// }
			}
		}
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

		// Function to calculate a face vector based on spherical coordinates
		function calculateFaceVector(theta, phi) {
			return new THREE.Vector3(
				Math.cos(theta) * Math.sin(phi),
				Math.sin(theta) * Math.sin(phi),
				Math.cos(phi)
			);
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

		function toggleTransparency() {
			for (let i = 0; i < diceArray.length; i++) {
				if (transparent) {
					leftLight.intensity = 5;
					rightLight.intensity = 5;
					backLight.intensity = 5;
					bottomLight.intensity = 5;
				} else {
					leftLight.intensity = 0.1;
					rightLight.intensity = 0.1;
					backLight.intensity = 0.5;
					bottomLight.intensity = 0.1;
				}
				diceArray[i][0].material.wireframe =
					!diceArray[i][0].material.wireframe;
				diceArray[i][0].material.transparent =
					!diceArray[i][0].material.transparent;
				diceArray[i][0].material.needsUpdate = true;
			}
			groundMesh.material.wireframe = !groundMesh.material.wireframe;
		}
		// function changeColors() {
		//   for (let i = 0; i < diceArray.length; i++) {
		//     diceArray[i][0].material.color?.set(ctx.presentColor);
		//     diceArray[i][0].material.needsUpdate = true;
		//   }
		// }

		function changeBoardBackground(selectedBoard) {
			console.log("changing bg now");
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
		let try_button = document.getElementById("try-button");
		try_button.addEventListener("click", ()=>{ 
			diceArray[0][0].rotateY(THREE.MathUtils.degToRad(20));
		})

		let awake = false;
		animate();

		function animate() {
			world.step(timeStep);
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
				getScores();
			}
			if (world.hasActiveBodies == true) {
				awake = true;
			}
			// accelerationChanged();

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
