define([
	"sugar-web/activity/activity",
	"sugar-web/env",
	"sugar-web/datastore",
	"activity/palettes/colorpalettefill",
	"activity/palettes/zoompalette",
	"activity/palettes/modelpalette",
	"activity/palettes/settingspalette",
	"sugar-web/graphics/presencepalette",
	"l10n",
	"tutorial",
	"humane"
], function (
	activity,
	env,
	datastore,
	colorpaletteFill,
	zoompalette,
	modelpalette,
	settingspalette,
	presencepalette,
	l10n,
	tutorial,
	humane
) {
	requirejs(["domReady!"], function (doc) {
		activity.setup();

		let currentenv;

		// STATE VARIABLES
		let fillColor = null;
		let currentModel = null;
		let currentModelName = "body";
		let partsColored = [];
		let modal = null;
		let cameraPosition = { x: 0, y: 10, z: 20 };
		let cameraTarget = { x: 0, y: 0, z: 0 };
		let cameraFov = 45;
		let renderer = null;

		// MODE VARIABLES  
		let isPaintActive = true;
		let isTourActive = false;
		let isDoctorActive = false;
		let currentModeIndex = 0;

		// NETWORK VARIABLES
		let presence = null;
		let players = [];
		let isHost = false;
		let username = null;

		let doctorMode = false;
		let currentBodyPartIndex = 0;
		let presenceCorrectIndex = 0;
		let presenceIndex = 0;
		let ifDoctorHost = false;
		let firstAnswer = true;
		let numModals = 0;
		let shownParts = []; // track which parts have been shown in the current session

		let tourIndex = 0;
		let previousMesh = null;
		let tourTimer = null;

		let failedAttempts = 0;
		const REMINDER_AFTER_ATTEMPTS = 3; // Show reminder after 3 failed attempts

		// Body parts data for different models
		let bodyPartsData = {
			skeleton: [],
			body: [],
			organs: []
		};

		// Store painted parts per model
		let modelPaintData = {
			skeleton: [],
			body: [],
			organs: []
		};

		// Array of modes
		const modes = ["Paint", "Tour", "Doctor"];

		const availableModels = {
			skeleton: {
				modelPath: "models/skeleton/skeleton.gltf",
				name: "skeleton",
				position: { x: 0, y: -6, z: 0 },
				scale: { x: 4, y: 4, z: 4 }
			},
			body: {
				modelPath: "models/human/human.gltf",
				name: "human-body",
				position: { x: 0, y: 2, z: 0 },
				scale: { x: 1.2, y: 1.2, z: 1.2 }
			},
			organs: {
				modelPath: "models/organs/organs.gltf",
				name: "organs",
				position: { x: 0, y: -1, z: 0 },
				scale: { x: 1, y: 1, z: 1 }
			}
		};

		var paletteColorFill = new colorpaletteFill.ColorPalette(
			document.getElementById("color-button-fill"),
			undefined
		);

		var paletteSettings = new settingspalette.SettingsPalette(
			document.getElementById("settings-button"),
			undefined
		);

		var paletteModel = new modelpalette.ModelPalette(
			document.getElementById("model-button"),
			undefined
		);

		document
			.getElementById("stop-button")
			.addEventListener("click", function (event) {
				console.log("writing...");

				// Save current model's paint data before saving
				if (currentModelName && currentModel) {
					modelPaintData[currentModelName] = [...partsColored];
				}

				// Save current camera position and settings
				cameraPosition = {
					x: camera.position.x,
					y: camera.position.y,
					z: camera.position.z
				};

				// Get the target from orbit controls
				cameraTarget = {
					x: orbit.target.x,
					y: orbit.target.y,
					z: orbit.target.z
				};

				cameraFov = camera.fov;

				// Save all data including camera state
				const saveData = {
					modelName: currentModelName,
					modelPaintData: modelPaintData,
					partsColored: partsColored,
					cameraPosition: cameraPosition,
					cameraTarget: cameraTarget,
					cameraFov: cameraFov
				};

				var jsonData = JSON.stringify(saveData);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
			
		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Save as Image
		document.getElementById("image-button").addEventListener('click', function (e) {
			saveAsImage();
		});

		env.getEnvironment(function (err, environment) {
			currentenv = environment;

			var defaultLanguage = 
						(typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) 
						? chrome.i18n.getUILanguage() 
						: navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);

			// Process localize event
			window.addEventListener("localized", function () {
				updateModeText();
			}, false);

			username = environment.user.name;

			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
				currentModelName = "body";
				modelPaintData = {
					skeleton: [],
					body: [],
					organs: []
				};
				
				if (!environment.sharedId) {
					loadModel({
						...availableModels.body,
						callback: (loadedModel) => {
							currentModel = loadedModel;
						}
					});
				} else {
					console.log("Shared new instance - waiting for host data");
				}
			} else {
				activity
					.getDatastoreObject()
					.loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							const savedData = JSON.parse(data);

							// Load model paint data if available
							if (savedData.modelPaintData) {
								modelPaintData = savedData.modelPaintData;
							} else {
								modelPaintData = {
									skeleton: [],
									body: [],
									organs: []
								};
							}

							// Load camera state if available
							if (savedData.cameraPosition) {
								cameraPosition = savedData.cameraPosition;
							}

							if (savedData.cameraTarget) {
								cameraTarget = savedData.cameraTarget;
							}

							if (savedData.cameraFov) {
								cameraFov = savedData.cameraFov;
							}

							// Check if saved data includes model information
							if (savedData.modelName && availableModels[savedData.modelName]) {
								currentModelName = savedData.modelName;
								partsColored = savedData.partsColored || [];

								setTimeout(function () {
									// Update the model palette to show the correct active button
									if (paletteModel.updateActiveModel) {
										paletteModel.updateActiveModel(currentModelName);
									}

									// Also update the main toolbar button icon
									const modelButton = document.getElementById('model-button');
									if (modelButton) {
										modelButton.classList.remove('skeleton-icon', 'body-icon', 'organs-icon');
										modelButton.classList.add(currentModelName + '-icon');
									}
								}, 200); // Small delay to ensure palette is fully initialized

								// If we have model-specific paint data, use that instead
								if (modelPaintData[currentModelName] && modelPaintData[currentModelName].length > 0) {
									partsColored = [...modelPaintData[currentModelName]];
								}
							} else {
								partsColored = savedData;
								currentModelName = "body";
								if (Array.isArray(partsColored)) {
									modelPaintData.body = [...partsColored];
								}
							}

							loadModel({
								...availableModels[currentModelName],
								callback: (loadedModel) => {
									currentModel = loadedModel;
									setTimeout(() => {
										applyModelColors(loadedModel, currentModelName);

										// Restore camera position after model is loaded
										restoreCameraPosition(cameraPosition, cameraTarget, cameraFov);
									}, 100);
								}
							});
						} else {
							currentModelName = "body";
							modelPaintData = {
								skeleton: [],
								body: [],
								organs: []
							};
							loadModel({
								...availableModels.body,
								callback: (loadedModel) => {
									currentModel = loadedModel;
								}
							});
						}
					});
			}

			fillColor = environment.user.colorvalue.fill || fillColor;

			document.getElementById("color-button-fill").style.backgroundColor = fillColor;

			if (environment.sharedId) {
				console.log("Shared instance");
				window.sharedActivity = true; // Set global flag
				window.isHost = false; // Default to false until we know

				removeCurrentModel();

				presence = activity.getPresenceObject(function (
					error,
					network
				) {
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});

				return; 
			}
		});

		// Save as Image function
		function saveAsImage() {
			// Ensure renderer is available
			if (!renderer || !renderer.domElement) {
				console.error("Renderer not available for image capture");
				return;
			}

			try {
				var mimetype = 'image/jpeg';
				var inputData = renderer.domElement.toDataURL(mimetype);
				var metadata = {
					mimetype: mimetype,
					title: "HumanBody Image " + currentModelName,
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};

				datastore.create(metadata, function() {
					showModal(l10n.get("ImageSaved") || "Image saved successfully!");
					console.log("Image export done.");
				}, inputData);
			} catch (error) {
				console.error("Error saving image:", error);
			}
		}

		function logAllMeshesAsJSON(model) {
			const meshData = [];

			model.traverse((node) => {
				if (node.isMesh && node.name) {
					// Get world position
					const worldPosition = node.getWorldPosition(new THREE.Vector3());

					const meshInfo = {
						name: node.name.replace(/_Material\d+mat_\d+$/, ''),
						mesh: node.name,
						position: [
							parseFloat(worldPosition.x.toFixed(2)),
							parseFloat(worldPosition.y.toFixed(2)),
							parseFloat(worldPosition.z.toFixed(2))
						]
					};

					meshData.push(meshInfo);
				}
			});

			// Sort by mesh name for consistency
			meshData.sort((a, b) => a.mesh.localeCompare(b.mesh));

			console.log("=== ALL MESHES AS JSON ===");
			console.log(JSON.stringify(meshData, null, 2));
			console.log("=== END JSON ===");

			return meshData;
		}

		function loadModel(options) {
			const {
				modelPath,
				name,
				position = { x: 0, y: 0, z: 0 },
				scale = { x: 1, y: 1, z: 1 },
				callback = null
			} = options;

			// Determine the full model path using network check
			let fullModelPath = modelPath;
			if (typeof HumanBody !== 'undefined' && HumanBody.NetworkCheck) {
				const baseUrl = HumanBody.NetworkCheck.getModelsBaseUrl();
				fullModelPath = baseUrl + modelPath;
			}

			loader.load(
				fullModelPath,
				function (gltf) {
					const model = gltf.scene;
					model.name = name;

					// Apply position
					model.position.set(position.x, position.y, position.z);
					model.scale.set(scale.x, scale.y, scale.z);

					// Get the correct paint data for this model
					const currentPaintData = modelPaintData[name] || partsColored;

					model.traverse((node) => {
						if (node.isMesh) {
							// Ensure geometry is properly set up
							const geometry = node.geometry;

							if (!geometry.boundingBox) {
								geometry.computeBoundingBox();
							}
							if (!geometry.boundingSphere) {
								geometry.computeBoundingSphere();
							}
							if (!geometry.attributes.normal) {
								geometry.computeVertexNormals();
							}

							// Force geometry to be non-indexed for better raycasting
							if (geometry.index) {
								const nonIndexedGeometry = geometry.toNonIndexed();
								node.geometry = nonIndexedGeometry;
								nonIndexedGeometry.computeBoundingBox();
								nonIndexedGeometry.computeBoundingSphere();
							}

							// Store original material
							node.userData.originalMaterial = node.material.clone();

							// Find saved color for this part
							const savedColor = currentPaintData.find(
								([partName]) => partName === node.name
							);

							// Apply saved color if exists, otherwise use default material
							if (savedColor) {
								const [, color] = savedColor;
								if (color !== "#000000" && color !== "#ffffff") {
									node.material = new THREE.MeshStandardMaterial({
										color: new THREE.Color(color),
										side: THREE.DoubleSide,
										transparent: false,
										opacity: 1.0,
										depthTest: true,
										depthWrite: true
									});
								} else {
									// Use original material for default colors
									node.material = node.userData.originalMaterial.clone();
								}
							} else {
								// Use standard material for new meshes
								node.material = new THREE.MeshStandardMaterial({
									color: node.material.color || new THREE.Color(0xe7e7e7),
									side: THREE.DoubleSide,
									transparent: false,
									opacity: 1.0,
									depthTest: true,
									depthWrite: true
								});
							}

							node.visible = true;
							node.castShadow = true;
							node.receiveShadow = true;
							node.frustumCulled = false;

							// Force matrix update
							node.updateMatrix();
							node.updateMatrixWorld(true);
						}
					});

					model.updateMatrix();
					model.updateMatrixWorld(true);

					scene.add(model);

					// console.log(`=== LOGGING MESHES FOR MODEL: ${name} ===`);
					// logAllMeshesAsJSON(model);

					if (callback) callback(model);
				},
				function (xhr) {
					console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
				},
				function (error) {
					
					// If we were trying to load from remote and it failed, try local as fallback
					if (typeof HumanBody !== 'undefined' && HumanBody.NetworkCheck && !HumanBody.NetworkCheck.isConnected() && fullModelPath !== modelPath) {
						console.log("Trying to fallback to local model for", name);
						
						loader.load(
							modelPath, // Try original local path
							function (gltf) {
								const model = gltf.scene;
								model.name = name;
								model.position.set(position.x, position.y, position.z);
								model.scale.set(scale.x, scale.y, scale.z);
								scene.add(model);
								if (callback) callback(model);
							},
							function (xhr) {
								console.log("Fallback: " + (xhr.loaded / xhr.total) * 100 + "% loaded");
							},
						);
					}
				}
			);
		}

		function removeCurrentModel() {
			const modelNamesToRemove = ['skeleton', 'human-body', 'organs'];
			const childrenToRemove = [];

			scene.children.forEach(child => {
				if (child.name && modelNamesToRemove.includes(child.name)) {
					childrenToRemove.push(child);
				}
			});

			childrenToRemove.forEach(child => {
				console.log(`Removing model: ${child.name}`);
				scene.remove(child);

				// Clean up resources
				child.traverse((node) => {
					if (node.isMesh) {
						if (node.geometry) {
							node.geometry.dispose();
						}
						if (node.material) {
							if (Array.isArray(node.material)) {
								node.material.forEach(material => material.dispose());
							} else {
								node.material.dispose();
							}
						}
					}
				});
			});

			// Clear the currentModel reference
			currentModel = null;
		}

		function switchModel(modelKey) {
			if (!availableModels[modelKey]) {
				console.error(`Model ${modelKey} not found`);
				return;
			}

			if (currentModelName === modelKey) {
				return;
			}

			// Save current model's paint data before switching
			if (currentModelName && currentModel) {
				modelPaintData[currentModelName] = [...partsColored];
			}

			// Stop any ongoing tour before switching models
			if (isTourActive && tourTimer) {
				clearTimeout(tourTimer);
				tourTimer = null;
			}

			// Remove current model before loading new one
			removeCurrentModel();

			currentModelName = modelKey;
			updateBodyPartsForModel(modelKey);

			// Restore paint data for new model
			if (modelPaintData[modelKey] && modelPaintData[modelKey].length > 0) {
				partsColored = [...modelPaintData[modelKey]];
			}

			// Update toolbar icon
			const modelButton = document.getElementById('model-button');
			modelButton.classList.remove('skeleton-icon', 'body-icon', 'organs-icon');
			modelButton.classList.add(`${modelKey}-icon`);

			// Broadcast model change to other users
			if (presence && isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "switchModel",
					content: modelKey,
				});
			}

			// Load new model
			const modelConfig = availableModels[modelKey];
			loadModel({
				...modelConfig,
				callback: (loadedModel) => {
					currentModel = loadedModel;
					applyModelColors(loadedModel, modelKey);

					// Restart tour if we're in tour mode
					if (isTourActive) {
						startTourMode();
					}
				}
			});

			if (isDoctorActive) {
				// Reset doctor mode state
				currentBodyPartIndex = 0;
				presenceIndex = 0;

				// Update body parts for new model
				updateBodyPartsForModel(modelKey);

				// Show new question for the first part of new model
				if (bodyParts.length > 0) {
					showModal(l10n.get("FindThe", { name: l10n.get(bodyParts[0].name) }));
				}
			}
		}
		
		// apply saved colors based on model type
		function applyModelColors(model, modelName) {
			model.traverse((node) => {
				if (node.isMesh) {
					// Find saved color for this part
					const part = partsColored.find(
						([partName, partColor]) => partName === node.name
					);

					if (part) {
						const [, partColor] = part;
						if (partColor !== "#000000" && partColor !== "#ffffff") {
							node.material = new THREE.MeshStandardMaterial({
								color: new THREE.Color(partColor),
								side: THREE.DoubleSide,
								transparent: false,
								opacity: 1.0,
								depthTest: true,
								depthWrite: true
							});
						}
					}
				}
			});
		}

		// Function to update body parts when model changes
		function updateBodyPartsForModel(modelName) {
			if (bodyPartsData[modelName] && bodyPartsData[modelName].length > 0) {
				bodyParts = bodyPartsData[modelName];

				if (!modelPaintData[modelName] || modelPaintData[modelName].length === 0) {
					initializePartsColored();
				}

				// Reset doctor mode if active
				if (isDoctorActive) {
					currentBodyPartIndex = 0;
					presenceIndex = 0;
				}
			} else {
				// console.warn(`No body parts data found for model: ${modelName}`);
			}
		}

		function getRandomUnshownPartIndex() {
			const availableIndices = bodyParts
				.map((_, index) => index)
				.filter(index => !shownParts.includes(index));

			if (availableIndices.length === 0) {
				// All parts have been shown, reset and start again
				shownParts = [];
				return Math.floor(Math.random() * bodyParts.length);
			}

			const randomIndex = Math.floor(Math.random() * availableIndices.length);
			return availableIndices[randomIndex];
		}

		document.addEventListener('model-selected', function (event) {
			const selectedModel = event.detail.model;
			console.log('Model selected:', selectedModel);
			switchModel(selectedModel);
		});

		document.addEventListener('mode-selected', function (event) {
			const selectedMode = event.detail.mode;

			if (currentModeIndex !== selectedMode) {
				currentModeIndex = selectedMode;
				updateModeText();

				// Broadcast mode change to other users in shared mode
				if (presence && isHost) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "modeChange",
						content: selectedMode,
					});
				}
			}
		});

		// Link presence palette
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
					"org.sugarlabs.HumanBody",
					function (groupId) {
						console.log("Activity shared");
						isHost = true;
						window.isHost = true; // Set global flag
						window.sharedActivity = true; // Set global flag

						// Save current model's paint data before sharing
						if (currentModelName && currentModel) {
							modelPaintData[currentModelName] = [...partsColored];
						}

						// Send full paint data to any new users
						sendFullPaintDataToNewUser();
					}
				);
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});

		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			if (msg.action == "init") {
				partsColored = msg.content[0];
				players = msg.content[1];

				// Update the model palette to show the correct active button
				if (paletteModel.updateActiveModel) {
					paletteModel.updateActiveModel(currentModelName);
				}

				// Update the settings palette to show the correct active mode
				updateSettingsIconBasedOnMode(currentModeIndex);
			}

			if (msg.action == "nextQuestion") {
				presenceCorrectIndex = msg.content.questionIndex;
				currentBodyPartIndex = msg.content.questionIndex;

				// Update shownParts if provided
				if (msg.content.shownParts) {
					shownParts = msg.content.shownParts;
				} else {
					shownParts.push(msg.content.questionIndex);
				}

				// Update players array with latest scores
				if (msg.content.players) {
					players = msg.content.players;
					showLeaderboard();
				}

				if (bodyParts[presenceCorrectIndex]) {
					showModal(l10n.get("FindThe", { name: l10n.get(bodyParts[presenceCorrectIndex].name) }));
				}
			}

			if (msg.action == "update") {
				players = msg.content;
				showLeaderboard();
			}

			if (msg.action == "answer") {

				// Only host processes answers
				if (!ifDoctorHost || !firstAnswer) {
					return;
				}

				// Only process if this is the correct answer for the current question
				if (msg.content.correctIndex === presenceCorrectIndex) {
					let targetPlayerIndex = players.findIndex(
						(player) => player[0] === msg.content.userName
					);

					if (targetPlayerIndex !== -1) {
						players[targetPlayerIndex][1]++; // Increment score
						firstAnswer = false; // Only first correct answer gets points

						console.log(msg.user.name + " answered correctly");
						console.log("Updated scores:", players);

						// Send updated scores to all players
						if (presence && presence.getSharedInfo() && presence.getSharedInfo().id) {
							presence.sendMessage(presence.getSharedInfo().id, {
								user: presence.getUserInfo(),
								action: "scoreUpdate",
								content: players,
							});
						}

						// Move to next question after a delay
						setTimeout(() => {
							presenceIndex++;
							startDoctorModePresence();
						}, 2000);
					}
				}
			}

			if (msg.action == "scoreUpdate") {
				players = msg.content;
				showLeaderboard();
			}

			if (msg.action == "startDoctor") {

				updateBodyPartsForModel(msg.content.modelName);

				// switch models, before starting doctor mode
				if (msg.content.modelName !== currentModelName) {
					switchModel(msg.content.modelName);

					// Wait for model to load before starting doctor mode
					setTimeout(() => {
						showLeaderboard();
						isPaintActive = false;
						isLearnActive = false;
						isTourActive = false;
						isDoctorActive = true;
					}, 500);
					return;
				}

				showLeaderboard();
				isPaintActive = false;
				isLearnActive = false;
				isTourActive = false;
				isDoctorActive = true;
			}

			if (msg.action == "switchModel") {
				const newModel = msg.content;
				
				removeCurrentModel();
				currentModelName = newModel;

				loadModel({
					...availableModels[newModel],
					callback: (loadedModel) => {
						currentModel = loadedModel;
						
						// Apply existing colors if available
						if (modelPaintData[newModel] && modelPaintData[newModel].length > 0) {
							partsColored = [...modelPaintData[newModel]];
							applyModelColors(loadedModel, newModel);
						}
						
						// Update the UI to reflect the new model
						const modelButton = document.getElementById('model-button');
						if (modelButton) {
							modelButton.classList.remove('skeleton-icon', 'body-icon', 'organs-icon');
							modelButton.classList.add(`${newModel}-icon`);
						}
						
						// Update the model palette if available
						if (paletteModel && paletteModel.updateActiveModel) {
							paletteModel.updateActiveModel(newModel);
						}
					}
				});
			}

			if (msg.action == "modeChange") {
				const newModeIndex = msg.content;
				if (currentModeIndex !== newModeIndex) {

					if (isTourActive) {
						camera.position.set(0, 10, 20);
						camera.lookAt(0, 0, 0);
						camera.updateProjectionMatrix();

						if (currentModel) {
							currentModel.traverse((node) => {
								if (node.isMesh) {
									restoreMeshColor(node);
								}
							});
						}

						if (tourTimer) {
							clearTimeout(tourTimer);
							tourTimer = null;
						}
					}

					if (isDoctorActive) {
						stopDoctorMode();
					}

					currentModeIndex = newModeIndex;
					updateModeText();

					// Dispatch event to update settings palette icon
					document.dispatchEvent(new CustomEvent('mode-changed', {
						detail: { mode: newModeIndex }
					}));
				}
			}

			if (msg.action == "paint") {
				const { objectName, color, bodyPartName, modelName } = msg.content;
				applyPaintFromNetwork(objectName, color, bodyPartName, msg.user.name, modelName);
			}

			if (msg.action == "syncAllPaintData") {
				const { modelPaintData: receivedPaintData, currentModel: senderCurrentModel } = msg.content;

				// Merge received paint data with local data
				Object.keys(receivedPaintData).forEach(modelKey => {
					if (!modelPaintData[modelKey]) {
						modelPaintData[modelKey] = [];
					}

					// Merge paint data for this model
					receivedPaintData[modelKey].forEach(([partName, color]) => {
						const existingIndex = modelPaintData[modelKey].findIndex(([name, _]) => name === partName);
						if (existingIndex !== -1) {
							modelPaintData[modelKey].splice(existingIndex, 1);
						}
						modelPaintData[modelKey].push([partName, color]);
					});
				});

				// If we're on the same model as sender, apply the colors
				if (senderCurrentModel === currentModelName) {
					partsColored = [...modelPaintData[currentModelName]];
					if (currentModel) {
						applyModelColors(currentModel, currentModelName);
					}
				}
			}

			if (msg.action == "tourStart") {
				if (!isTourActive) {
					isTourActive = true;
					currentModeIndex = 1; // Tour mode
					updateModeText();
				}

				// Update body parts data if provided
				if (msg.content.bodyPartsData) {
					bodyParts = msg.content.bodyPartsData;
				} else {
					// Fallback: update body parts for current model
					updateBodyPartsForModel(msg.content.modelName || currentModelName);
				}

				shownParts = msg.content.shownParts || [];
				tourIndex = msg.content.currentIndex || 0;

				// Clear any existing tour timer
				if (tourTimer) {
					clearTimeout(tourTimer);
					tourTimer = null;
				}

				// Function to start tour sync once model is ready
				const startTourSync = () => {
					if (bodyParts[tourIndex]) {
						const part = bodyParts[tourIndex];
						syncTourStep(
							tourIndex,
							part.name,
							shownParts,
							part.position,
							part.frontView,
							part.sideView
						);
					}
				};

				// Check if we need to switch models
				if (msg.content.modelName && msg.content.modelName !== currentModelName) {
					// Remove current model first
					removeCurrentModel();

					const originalCallback = availableModels[msg.content.modelName].callback;

					// Temporarily override the model load callback
					const modelConfig = availableModels[msg.content.modelName];
					loadModel({
						...modelConfig,
						callback: (loadedModel) => {
							currentModel = loadedModel;
							applyModelColors(loadedModel, msg.content.modelName);

							currentModelName = msg.content.modelName;

							const modelButton = document.getElementById('model-button');
							modelButton.classList.remove('skeleton-icon', 'body-icon', 'organs-icon');
							modelButton.classList.add(`${msg.content.modelName}-icon`);

							startTourSync();
							
							if (originalCallback) {
								originalCallback(loadedModel);
							}
						}
					});

					// Restore paint data for new model
					if (modelPaintData[msg.content.modelName] && modelPaintData[msg.content.modelName].length > 0) {
						partsColored = [...modelPaintData[msg.content.modelName]];
					}
				} else {
					// Same model, start tour sync immediately
					startTourSync();
				}
			}

			if (msg.action == "tourStep") {
				syncTourStep(
					msg.content.index,
					msg.content.partName,
					msg.content.shownParts,
					msg.content.position,
					msg.content.isFrontView,
					msg.content.isSideView
				);
			}

			if (msg.action == "tourStop") {
				if (isTourActive) {
					isTourActive = false;

					const newCameraPosition = msg.content.cameraPosition || { x: 0, y: 10, z: 20 };
					const newCameraTarget = msg.content.cameraTarget || { x: 0, y: 0, z: 0 };

					camera.position.set(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z);
					camera.lookAt(newCameraTarget.x, newCameraTarget.y, newCameraTarget.z);
					camera.updateProjectionMatrix();

					if (currentModel) {
						currentModel.traverse((node) => {
							if (node.isMesh) {
								restoreMeshColor(node);
							}
						});
					}

					if (tourTimer) {
						clearTimeout(tourTimer);
						tourTimer = null;
					}
				}
			}

			if (msg.action == "restoreMaterials") {
				// Only process if it's for the current model
				if (msg.content.modelName === currentModelName && currentModel) {
					currentModel.traverse((node) => {
						if (node.isMesh && node.userData.originalMaterial) {
							node.material = node.userData.originalMaterial.clone();
						}
					});
				}
			}
		};

		function sendFullPaintDataToNewUser() {
			if (presence && isHost) {
				// Ensure we have current model's paint data
				if (currentModelName) {
					if (!modelPaintData[currentModelName]) {
						modelPaintData[currentModelName] = [];
					}
					modelPaintData[currentModelName] = [...partsColored];
				}

				// Send model-specific paint data
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "syncAllPaintData",
					content: {
						modelPaintData: modelPaintData,
						currentModel: currentModelName,
						cameraPosition: camera.position,
						cameraTarget: orbit.target,
						cameraFov: camera.fov
					},
				});
			}
		};

		var onNetworkUserChanged = function (msg) {
			if (players.length === 0) {
				// Add current user as first player with color
				players.push([username, 0, currentenv.user.colorvalue]);
			}

			// Add new user to players array if not already present
			const existingPlayerIndex = players.findIndex(p => p[0] === msg.user.name);

			if (existingPlayerIndex === -1) {
				// Include the user's color in the player data
				players.push([msg.user.name, 0, msg.user.colorvalue]);
			}

			if (isDoctorActive) {
				showLeaderboard();
			}

			if (isHost) {
				// Send full paint data to new user
				sendFullPaintDataToNewUser();

				// Send current mode to new user - with safety check
				if (presence && presence.getSharedInfo() && presence.getSharedInfo().id) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "switchModel",
						content: currentModelName,
					});

					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "modeChange",
						content: currentModeIndex,
					});

					// Send initialization data
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "init",
						content: [partsColored, players],
					});
				}
			}

			if (isDoctorActive) {
				if (presence && presence.getSharedInfo() && presence.getSharedInfo().id) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "startDoctor",
						content: {
							players: players,
							modelName: currentModelName,
							bodyPartsData: bodyParts
						},
					});
				}
				ifDoctorHost = true;
				startDoctorModePresence();
			}
		};

		const modeTextElem = document.getElementById("mode-text");

		function updateModeText() {
			if (isTourActive && currentModeIndex !== 1) {
				stopTourMode();
			}

			if (isDoctorActive && currentModeIndex !== 2) {
				stopDoctorMode();
				hideLeaderboard();
			}

			const buttonsToTranslate = [
				{ id: 'network-button', key: 'Network' },
				{ id: 'stop-button', key: 'Stop' },
				{ id: 'fullscreen-button', key: 'Fullscreen' },
				{ id: "color-button-fill", key: 'FillColor' },
				{ id: 'help-button', key: 'Tutorial' },
				{ id: 'settings-button', key: 'Settings' },
				{ id: 'paint-button', key: 'Paint' },
				{ id: 'tour-button', key: 'Tour' },
				{ id: 'doctor-button', key: 'Doctor' },
				{ id: 'model-body-button', key: 'BodyModel' },
				{ id: 'model-skeleton-button', key: 'SkeletonModel' },
				{ id: 'model-organs-button', key: 'OrgansModel' },
				{ id: 'zoom-in-button', key: 'ZoomIn' },
				{ id: 'zoom-out-button', key: 'ZoomOut' },
				{ id: 'zoom-to-button', key: 'ZoomTo' },
				{ id: 'zoom-equal-button', key: 'ZoomEqual' },
				{ id: 'zoom-button', key: 'ZoomPalette' },
				{ id: 'image-button', key: 'SaveAsImage' },
				{ id: 'model-button', key: 'SelectModel' }
			];

			buttonsToTranslate.forEach(button => {
				const element = document.getElementById(button.id);
				if (element) {
					const translatedText = l10n.get(button.key);
					if (translatedText) {
						element.title = translatedText;
						if (button.id === 'doctor-button' || button.id === 'tour-button' || button.id === 'paint-button') {
							document.getElementById(button.id+'-label').textContent = translatedText;
						}
					}
				}
			});
			const modeKey = modes[currentModeIndex];

			// Check if modeTextElem exists before setting textContent
			if (modeTextElem) {
				modeTextElem.textContent = l10n.get(modeKey);
			}

			// Update mode tracking variables
			isPaintActive = currentModeIndex === 0;
			isTourActive = currentModeIndex === 1;
			isDoctorActive = currentModeIndex === 2;

			window.currentModeIndex = currentModeIndex;
			
			// If switching to Tour mode, start it
			if (isTourActive) {
				startTourMode();
			}

			// If switching to Doctor mode, start it
			if (isDoctorActive) {
				if (presence) {
					showLeaderboard();

					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "startDoctor",
						content: {
							players: players,
							modelName: currentModelName,
							bodyPartsData: bodyParts
						},
					});
					ifDoctorHost = true;
					startDoctorModePresence();
				} else {
					console.log("starting doctor mode");
					startDoctorMode();
				}
			}
		}

		function updateSettingsIconBasedOnMode(modeIndex) {
			const settingsButton = document.getElementById("settings-button");
			if (!settingsButton) return;

			const modeIcons = {
				0: 'paint',
				1: 'compass',
				2: 'doctor'
			};

			const iconName = modeIcons[modeIndex] || 'paint';
			settingsButton.style.backgroundImage = `url(icons/mode-${iconName}.svg)`;

			// Also update the active button in the settings palette
			const palette = document.getElementById("settings-palette");
			if (palette) {
				const buttons = {
					0: palette.querySelector("#paint-button"),
					1: palette.querySelector("#tour-button"),
					2: palette.querySelector("#doctor-button")
				};

				// Remove active class from all buttons
				Object.values(buttons).forEach(btn => {
					if (btn) btn.classList.remove('active');
				});

				// Add active class to current mode button
				if (buttons[modeIndex]) {
					buttons[modeIndex].classList.add('active');
				}
			}

			// Dispatch event to ensure all instances are synced
			document.dispatchEvent(new CustomEvent('mode-changed', {
				detail: { mode: modeIndex }
			}));
		}
		
		function startTourMode() {
			shownParts = []; // Reset shown parts
			updateBodyPartsForModel(currentModelName);

			tourIndex = getRandomUnshownPartIndex();
			previousMesh = null;

			// Clear any existing tour timer
			if (tourTimer) {
				clearTimeout(tourTimer);
			}

			// Broadcast tour start to all users if host
			if (presence && isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "tourStart",
					content: {
						shownParts: shownParts,
						currentIndex: tourIndex,
						modelName: currentModelName, 
						bodyPartsData: bodyParts 
					},
				});
			}

			function tourNextPart() {
				if (shownParts.length >= bodyParts.length || !isTourActive) {
					// Restore previous mesh color before stopping
					if (previousMesh) {
						restoreMeshColor(previousMesh);
					}
					stopTourMode(); // Stop the tour if all parts have been shown
					return;
				}

				tourIndex = getRandomUnshownPartIndex();
				shownParts.push(tourIndex);
				const part = bodyParts[tourIndex];
				const position = part.position;
				const isFrontView = part.frontView !== undefined ? part.frontView : true;
				const isSideView = part.sideView !== undefined ? part.sideView : false;

				// Broadcast tour step to other users if host
				if (presence && isHost) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: "tourStep",
						content: {
							index: tourIndex,
							partName: part.name,
							shownParts: shownParts,
							position: position,
							isFrontView: isFrontView,
							isSideView: isSideView
						},
					});
				}

				// Find the mesh for the current body part
				const currentMesh = currentModel.getObjectByName(part.mesh);

				// Restore previous mesh color
				if (previousMesh) {
					restoreMeshColor(previousMesh);
				}

				// Highlight current mesh
				if (currentMesh) {
					if (!currentMesh.userData.originalMaterial) {
						currentMesh.userData.originalMaterial = currentMesh.material.clone();
					}

					// Store current color
					currentMesh.userData.currentColor = getCurrentMeshColor(currentMesh).clone();

					// Apply highlight color
					currentMesh.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color("#ffff00"), 
						side: THREE.DoubleSide,
						transparent: true,
						opacity: 0.8,
						depthTest: true,
						depthWrite: true,
						emissive: new THREE.Color("#ffff00"),
						emissiveIntensity: 0.2
					});

					previousMesh = currentMesh;
				}

				// Position camera based on view type
				if (isSideView) {
					// Position camera from the side (positive X for right side view)
					camera.position.set(position[0] + 5, position[1], position[2]);
					camera.lookAt(position[0], position[1], position[2]);
				} else if (isFrontView) {
					// Position camera in front (positive Z)
					camera.position.set(position[0], position[1], position[2] + 5);
					camera.lookAt(position[0], position[1], position[2]);
				} else {
					// Position camera behind (negative Z) for back view
					camera.position.set(position[0], position[1], position[2] - 5);
					camera.lookAt(position[0], position[1], position[2]);
				}

				camera.updateProjectionMatrix();

				// Display the name of the part using the modal
				showModal(l10n.get(part.name));

				tourIndex++;

				// Set a timeout to move to the next part after a delay
				tourTimer = setTimeout(tourNextPart, 3000);
			}

			tourNextPart(); // Start the tour
		}

		function stopTourMode() {
			// Restore all materials to their original state
			if (currentModel) {
				currentModel.traverse((node) => {
					if (node.isMesh) {
						restoreMeshColor(node);
					}
				});
			}

			// Reset camera to default position
			camera.position.set(0, 10, 20);
			camera.lookAt(0, 0, 0);
			camera.updateProjectionMatrix();

			// Clear any existing tour timer
			if (tourTimer) {
				clearTimeout(tourTimer);
				tourTimer = null;
			}

			// Broadcast tour stop in shared mode
			if (presence && isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "tourStop",
					content: {
						modelName: currentModelName,
						cameraPosition: { x: 0, y: 10, z: 20 },
						cameraTarget: { x: 0, y: 0, z: 0 }
					}
				});
			}
		}

		function syncTourStep(index, partName, receivedShownParts = [], position, isFrontView, isSideView) {
			if (!isTourActive || !currentModel) return;

			if (receivedShownParts && receivedShownParts.length > 0) {
				shownParts = [...receivedShownParts];
			} else {
				shownParts.push(index);
			}

			const part = bodyParts[index];
			if (!part) return;

			const partPosition = position || part.position;
			const partIsFrontView = isFrontView !== undefined ? isFrontView : (part.frontView !== undefined ? part.frontView : true);
			const partIsSideView = isSideView !== undefined ? isSideView : (part.sideView !== undefined ? part.sideView : false);

			// Find and highlight the mesh
			const currentMesh = currentModel.getObjectByName(part.mesh);

			// Restore previous mesh to its original or painted color
			if (previousMesh) {
				restoreMeshColor(previousMesh);
			}

			// Highlight current mesh while preserving any painted color
			if (currentMesh) {
				if (!currentMesh.userData.originalMaterial) {
					currentMesh.userData.originalMaterial = currentMesh.material.clone();
				}

				// Store current color before highlighting
				currentMesh.userData.currentColor = getCurrentMeshColor(currentMesh).clone();

				// Apply highlight color
				currentMesh.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color("#ffff00"), 
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.8,
					depthTest: true,
					depthWrite: true,
					emissive: new THREE.Color("#ffff00"),
					emissiveIntensity: 0.2
				});

				previousMesh = currentMesh;
			}

			// Position camera based on view type
			if (partIsSideView) {
				// Position camera from the side (positive X for right side view)
				camera.position.set(partPosition[0] + 5, partPosition[1], partPosition[2]);
				camera.lookAt(partPosition[0], partPosition[1], partPosition[2]);
			} else if (partIsFrontView) {
				// Position camera in front (positive Z)
				camera.position.set(partPosition[0], partPosition[1], partPosition[2] + 5);
				camera.lookAt(partPosition[0], partPosition[1], partPosition[2]);
			} else {
				// Position camera behind (negative Z) for back view
				camera.position.set(partPosition[0], partPosition[1], partPosition[2] - 5);
				camera.lookAt(partPosition[0], partPosition[1], partPosition[2]);
			}

			camera.updateProjectionMatrix();

			// Display the name of the part
			showModal(l10n.get(partName));
		}

		function startDoctorMode() {
			shownParts = []; // Reset shown parts
			currentBodyPartIndex = getRandomUnshownPartIndex();
			presenceIndex = currentBodyPartIndex;
			presenceCorrectIndex = currentBodyPartIndex;
			firstAnswer = true;
			failedAttempts = 0;

			// Initialize players array if empty
			if (players.length === 0 && presence) {
				players.push([presence.getUserInfo().name, 0, presence.getUserInfo().colorvalue]);
			}

			if (bodyParts[currentBodyPartIndex]) {
				shownParts.push(currentBodyPartIndex);
				showModal(l10n.get("FindThe", { name: l10n.get(bodyParts[currentBodyPartIndex].name) }));
			}
		}

		function startDoctorModePresence() {
			failedAttempts = 0;

			// Check if all parts have been shown
			if (shownParts.length >= bodyParts.length) {
				showModal(l10n.get("GameOverAll"));
				return;
			}

			// Get a new random part
			presenceCorrectIndex = getRandomUnshownPartIndex();
			currentBodyPartIndex = presenceCorrectIndex;
			presenceIndex = presenceCorrectIndex;
			shownParts.push(presenceCorrectIndex);
			firstAnswer = true; // Reset for new question

			// Send next question to all players - with safety check
			if (presence && presence.getSharedInfo() && presence.getSharedInfo().id) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "nextQuestion",
					content: {
						questionIndex: presenceCorrectIndex,
						players: players, // Send updated scores
						shownParts: shownParts // Send the full array of shown parts
					},
				});
			}

			// Show the question
			if (bodyParts[presenceCorrectIndex]) {
				showModal(l10n.get("FindThe", { name: l10n.get(bodyParts[presenceCorrectIndex].name) }));
			}

			// Update leaderboard
			showLeaderboard();
		}
		

		function stopDoctorMode() {
			if (modal) {
				document.body.removeChild(modal);
				modal = null;
			}
			hideLeaderboard();
		}

		function hideLeaderboard() {
			var leaderboard = document.getElementById("leaderboard");
			if (leaderboard) {
				leaderboard.style.display = "none";
			}
		}

		function showLeaderboard() {
			console.log("running show leaderboard");
			var leaderboard = document.getElementById("leaderboard");
			leaderboard.style.display = "block";
			let playerScores = players;
			var tableBody = document.querySelector(".leaderboard tbody");

			// Clear existing content
			tableBody.innerHTML = "";

			// Sort players by score (descending)
			playerScores.sort((a, b) => b[1] - a[1]);

			// Add each user with their icon and score
			for (var i = 0; i < playerScores.length; i++) {
				var playerName = playerScores[i][0]; // Get player name
				var playerScore = playerScores[i][1]; // Get player score
				var playerColor = playerScores[i][2] || currentenv.user.colorvalue; // Get player color or fallback to current user color

				// Create table row
				var row = document.createElement("tr");

				// Create icon cell
				var iconCell = document.createElement("td");
				iconCell.style.textAlign = "center";
				iconCell.style.padding = "5px";

				// Create icon with user's actual color
				var iconElement = document.createElement("div");
				iconElement.style.width = "30px";
				iconElement.style.height = "30px";
				iconElement.style.backgroundImage = `url(${generateXOLogoWithColor(playerColor)})`;
				iconElement.style.backgroundSize = "contain";
				iconElement.style.display = "inline-block";

				// Create name cell
				var nameCell = document.createElement("td");
				nameCell.textContent = playerName;
				nameCell.style.color = "#000000";
				nameCell.style.padding = "5px";

				// Create score cell
				var scoreCell = document.createElement("td");
				scoreCell.textContent = playerScore;
				scoreCell.style.color = "#000000";
				scoreCell.style.padding = "5px";
				scoreCell.style.textAlign = "center";

				// Add elements to row
				iconCell.appendChild(iconElement);
				row.appendChild(iconCell);
				row.appendChild(nameCell);
				row.appendChild(scoreCell);
				tableBody.appendChild(row);
			}
		}

		// Add this function to generate XO logos with colors (similar to Memorize)
		function generateXOLogoWithColor(color) {
			var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

			var coloredLogo = xoLogo;
			coloredLogo = coloredLogo.replace("#010101", color.stroke);
			coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);

			return "data:image/svg+xml;base64," + btoa(coloredLogo);
		}

		// Initialize the mode text
		updateModeText();

		document.getElementById("color-button-fill").style.backgroundColor =
			fillColor;

		var paletteZoom = new zoompalette.ZoomPalette(
			document.getElementById("zoom-button"),
			undefined
		);

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

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

		const evt = new Event("wheel", { bubbles: true, cancelable: true });

		const zoomInButton = document.getElementById("zoom-in-button");
		const zoomOutButton = document.getElementById("zoom-out-button");
		const zoomEqualButton = document.getElementById("zoom-equal-button");
		const zoomToButton = document.getElementById("zoom-to-button");

		const zoomFunction = (zoomType, targetFov) => (e) => {
			let fov = getFov();
			if (zoomType === "click") {
				camera.fov = targetFov;
			} else {
				camera.fov = clickZoom(fov, zoomType);
			}
			camera.updateProjectionMatrix();
			e.stopPropagation();
		};


		const clickZoom = (value, zoomType) => {
			if (zoomType === "zoomIn" && value > 5) {
				// Allow zoom in as long as FOV is greater than 5
				return value - 5;
			} else if (zoomType === "zoomOut" && value < 75) {
				// Allow zoom out as long as FOV is less than 75
				return value + 5;
			} else {
				return value;
			}
		};

		const getFov = () => {
			return Math.floor( (2 * Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) * 180)/Math.PI );
		};

		const fov = getFov();
		camera.updateProjectionMatrix();

		zoomInButton.addEventListener("click", zoomFunction("zoomIn"));
		zoomOutButton.addEventListener("click", zoomFunction("zoomOut"));
		zoomEqualButton.addEventListener("click", zoomFunction("click", 29));
		zoomToButton.addEventListener("click", zoomFunction("click", 35));

		async function loadAllBodyPartsData() {
			try {
				// Load skeleton parts
				await new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open("GET", "./js/bodyParts/skeletonParts.json", true);
					xhr.onreadystatechange = function () {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								bodyPartsData.skeleton = JSON.parse(xhr.responseText);
								resolve();
							} else {
								reject(new Error("Failed to load skeletonParts.json"));
							}
						}
					};
					xhr.send();
				});

				// Load body parts
				await new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open("GET", "./js/bodyParts/humanBodyParts.json", true);
					xhr.onreadystatechange = function () {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								bodyPartsData.body = JSON.parse(xhr.responseText);
								resolve();
							} else {
								reject(new Error("Failed to load humanBodyParts.json"));
							}
						}
					};
					xhr.send();
				});

				// Load organs parts
				await new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open("GET", "./js/bodyParts/organParts.json", true);
					xhr.onreadystatechange = function () {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								bodyPartsData.organs = JSON.parse(xhr.responseText);
								resolve();
							} else {
								reject(new Error("Failed to load organParts.json"));
							}
						}
					};
					xhr.send();
				});

				// Set initial body parts based on current model
				updateBodyPartsForModel(currentModelName);

			} catch (error) {
				console.error("Error loading body parts data:", error);
			}
		}

		// Function to initialize partsColored array
		function initializePartsColored() {
			partsColored = [];
			for (let i = 0; i < bodyParts.length; i++) {
				partsColored.push([bodyParts[i].name, "#000000"]);
			}
		}

		loadAllBodyPartsData();

		function showModal(text) {
			// Check if a modal is already displayed
			let existingModal = document.querySelector('.custom-modal');
			if (existingModal) {
				existingModal.remove();
			}

			const modal = document.createElement("div");
			modal.className = "custom-modal";
			modal.innerHTML = text;
			numModals++;

			document.body.appendChild(modal);

			// Make the modal disappear after 1.5 seconds
			setTimeout(() => {
				if (modal && modal.parentNode === document.body) {
					document.body.removeChild(modal);
					numModals--;
				}
			}, 3000);
		}

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
			fillColor = hexColor;
			document.getElementById("color-button-fill").style.backgroundColor =
				fillColor;
		}

		function updateSlidersFill(color) {
			const rgb = hexToRgb(color);
			// Check if rgb is not null
			if (rgb) { 
				redSliderFill.value = rgb.r;
				greenSliderFill.value = rgb.g;
				blueSliderFill.value = rgb.b;

				// Update the sliderColorFill object to keep it in sync
				sliderColorFill = {
					r: rgb.r,
					g: rgb.g,
					b: rgb.b
				};
			} else {
				redSliderFill.value = 0;
				greenSliderFill.value = 0;
				blueSliderFill.value = 0;
				sliderColorFill = { r: 0, g: 0, b: 0 };
			}
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
			fillColor = selectedColorFill;
			document.getElementById("color-button-fill").style.backgroundColor =
				fillColor;
			updateSlidersFill(selectedColorFill);
		});

		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			logarithmicDepthBuffer: true,
			preserveDrawingBuffer: true
		});

		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const canvas = document.getElementById("canvas");
		canvas.appendChild(renderer.domElement);
		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#1a1a1a");

		// Restore all lights
		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.castShadow = true;
		const leftLight = new THREE.DirectionalLight(0xffffff, 1);
		leftLight.castShadow = true;
		const rightLight = new THREE.DirectionalLight(0xffffff, 1);
		rightLight.castShadow = true;
		const backLight = new THREE.DirectionalLight(0xffffff, 1);
		const bottomLight = new THREE.DirectionalLight(0xffffff, 1);
		const topLight = new THREE.DirectionalLight(0xffffff, 1);
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

		camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
		camera.fov = cameraFov;
		camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);

		const orbit = new OrbitControls.OrbitControls(
			camera,
			renderer.domElement
		);
		orbit.update();
		orbit.listenToKeyEvents(document.querySelector("body"));

		function restoreCameraPosition(savedCameraPosition, savedCameraTarget, savedCameraFov) {
			if (savedCameraPosition) {
				camera.position.set(
					savedCameraPosition.x,
					savedCameraPosition.y,
					savedCameraPosition.z
				);
			}

			if (savedCameraTarget) {
				orbit.target.set(
					savedCameraTarget.x,
					savedCameraTarget.y,
					savedCameraTarget.z
				);
				camera.lookAt(savedCameraTarget.x, savedCameraTarget.y, savedCameraTarget.z);
			}

			if (savedCameraFov) {
				camera.fov = savedCameraFov;
			}

			camera.updateProjectionMatrix();
			orbit.update();
		}

		const loader = new THREE.GLTFLoader();
		let skeleton;

		// Initialize network check for model availability
		if (typeof HumanBody !== 'undefined' && HumanBody.NetworkCheck) {
			// Get environment asynchronously (it requires a callback)
			env.getEnvironment(function(err, environment) {
				if (err) {
					startNetworkCheck(null);
				} else {
					startNetworkCheck(environment);
				}
			});
		} else {
			// Fallback if network check is not available
			if (presence == null) {
				switchModel('body');
			}
		}
		
		function startNetworkCheck(environment) {
			// Set remote base URL if we're connected to a Sugarizer server
			if (environment && environment.server) {
				HumanBody.NetworkCheck.setRemoteBaseUrl(environment.server);
			}
			
			// Check model availability and then initialize
			HumanBody.NetworkCheck.check(function(hasLocalModels) {
				if (presence == null) {
					switchModel('body');
				}
			});
		}

		function setModelColor(model, color) {
			model.traverse((node) => {
				if (node.isMesh) {
					if (node.material) {
						node.material.color.set(color);
					}
				}
			});
		}

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		raycaster.near = camera.near;
		raycaster.far = camera.far;
		raycaster.params.Points.threshold = 0.1;
		raycaster.params.Line.threshold = 0.1;

		function handleIntersection(intersect) {
			const point = intersect.point;
			const clickedObject = intersect.object;

			if (isPaintActive) {
				handlePaintMode(clickedObject);
			} else if (isDoctorActive) {
				handleDoctorMode(clickedObject);
			}
		}

		function getClicked3DPoint() {
			mouse.x =
				((evt.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
			mouse.y =
				-((evt.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

			rayCaster.setFromCamera(mousePosition, camera);
			var intersects = rayCaster.intersectObjects(
				scene.getObjectByName("skeleton").children,
				true
			);

			if (intersects.length > 0) console.log(intersects[0].point);
		}

		function showPaintModal(bodyPartName, userName = null) {
			// Check if a paint modal is already displayed and remove it
			let existingPaintModal = document.querySelector('.paint-modal');
			if (existingPaintModal) {
				existingPaintModal.remove();
			}

			const paintModal = document.createElement("div");
			paintModal.className = "paint-modal";

			if (userName) {
				paintModal.innerHTML = `${userName} painted: ${l10n.get(bodyPartName)}`;
			} else {
				paintModal.innerHTML = l10n.get(bodyPartName);
			}

			document.body.appendChild(paintModal);

			// Trigger fade-in animation
			setTimeout(() => {
				paintModal.classList.add('show');
			}, 10);

			// Make the modal disappear after 2 seconds with fade-out
			setTimeout(() => {
				if (paintModal && paintModal.parentNode === document.body) {
					paintModal.classList.remove('show');
					setTimeout(() => {
						if (paintModal && paintModal.parentNode === document.body) {
							document.body.removeChild(paintModal);
						}
					}, 300);
				}
			}, 2000);
		}


		// apply paint received from network
		function applyPaintFromNetwork(objectName, color, bodyPartName, userName, modelName = null) {
		
			// Only apply paint if it's for the current model
			if (modelName && modelName !== currentModelName) {
				// Store the paint data for the specific model even if not currently active
				if (modelPaintData[modelName]) {
					const modelIndex = modelPaintData[modelName].findIndex(([name, paintColor]) => name === objectName);
					if (modelIndex !== -1) {
						modelPaintData[modelName].splice(modelIndex, 1);
					}
					modelPaintData[modelName].push([objectName, color]);
				}
				return;
			}

			if (!currentModel) return;

			const object = currentModel.getObjectByName(objectName);
			if (!object) return;

			// Store original material
			if (!object.userData.originalMaterial) {
				object.userData.originalMaterial = object.material.clone();
			}

			// Update partsColored array
			const index = partsColored.findIndex(([name, paintColor]) => name === objectName);
			if (index !== -1) {
				partsColored.splice(index, 1);
			}
			partsColored.push([objectName, color]);

			// Update model-specific paint data
			if (currentModelName && modelPaintData[currentModelName]) {
				const modelIndex = modelPaintData[currentModelName].findIndex(([name, paintColor]) => name === objectName);
				if (modelIndex !== -1) {
					modelPaintData[currentModelName].splice(modelIndex, 1);
				}
				modelPaintData[currentModelName].push([objectName, color]);
			}

			// Apply color
			if (color !== "#ffffff" && color !== "#000000") {
				object.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(color),
					side: THREE.DoubleSide,
					transparent: false,
					opacity: 1.0,
					depthTest: true,
					depthWrite: true
				});
			} else {
				object.material = object.userData.originalMaterial.clone();
			}

		}

		// handle the click event for painting
		function handlePaintMode(object) {
			if (!object.userData.originalMaterial) {
				object.userData.originalMaterial = object.material.clone();
			}

			// Check current color
			const currentColor = object.material.color;
			const isDefaultColor = currentColor.equals(new THREE.Color("#ffffff")) || currentColor.equals(object.userData.originalMaterial.color);

			// Find the body part name for the modal
			let clickedBodyPart = bodyParts.find((part) => part.mesh === object.name);
			let bodyPartName = clickedBodyPart ? clickedBodyPart.name : object.name;

			// Show local modal without username
			showPaintModal(bodyPartName);

			const index = partsColored.findIndex(([name, color]) => name === object.name);
			if (index !== -1) {
				partsColored.splice(index, 1);
			}

			const newColor = isDefaultColor ? fillColor : "#ffffff";
			partsColored.push([object.name, newColor]);

			// Update model-specific paint data
			if (currentModelName && modelPaintData[currentModelName]) {
				const modelIndex = modelPaintData[currentModelName].findIndex(([name, color]) => name === object.name);
				if (modelIndex !== -1) {
					modelPaintData[currentModelName].splice(modelIndex, 1);
				}
				modelPaintData[currentModelName].push([object.name, newColor]);
			}

			if (isDefaultColor) {
				object.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(fillColor),
					side: THREE.DoubleSide,
					transparent: false,
					opacity: 1.0,
					depthTest: true,
					depthWrite: true
				});
			} else {
				object.material = object.userData.originalMaterial.clone();
			}

			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "paint",
					content: {
						objectName: object.name,
						color: newColor,
						bodyPartName: bodyPartName,
						modelName: currentModelName
					},
				});
			}
		}

		function getCurrentMeshColor(mesh) {
			// Check if this part has been painted
			const paintedPart = partsColored.find(([name]) => name === mesh.name);

			if (paintedPart) {
				return new THREE.Color(paintedPart[1]);
			}

			// Return original material color if available
			if (mesh.userData.originalMaterial) {
				return mesh.userData.originalMaterial.color.clone();
			}

			// Default fallback
			return mesh.material.color.clone();
		}

		// handle the click event for doctor mode checks if the clicked object is the correct body part

		function handleDoctorMode(object) {
			// Store original material if not already stored
			if (!object.userData.originalMaterial) {
				object.userData.originalMaterial = object.material.clone();
			}

			// Store current color
			const currentColor = getCurrentMeshColor(object);
			object.userData.currentColor = currentColor.clone(); 

			if (presence) {
				const targetMeshName = bodyParts[presenceCorrectIndex].mesh;

				if (object.name === targetMeshName) {
					// Correct answer - reset failed attempts counter
					failedAttempts = 0;

					// Correct answer - color green temporarily
					object.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color("#00ff00"), // Green
						side: THREE.DoubleSide,
						transparent: false,
						opacity: 1.0,
						depthTest: true,
						depthWrite: true
					});

					// Restore original color after 1 second
					setTimeout(() => {
						restoreMeshColor(object);
					}, 1000);

					// Show "Correct!" modal first
					showModal(l10n.get("Correct"));

					if (ifDoctorHost) {
						// Host handles scoring and progression
						if (firstAnswer) {
							// Increment score for the host's correct answer
							let hostPlayerIndex = players.findIndex(
								(player) => player[0] === presence.getUserInfo().name
							);
							if (hostPlayerIndex !== -1) {
								players[hostPlayerIndex][1]++;
							}
							firstAnswer = false;
						}

						// Move to next question
						presenceIndex++;
						setTimeout(() => {
							startDoctorModePresence();
						}, 2000);
					} else {
						// Non-host sends answer to host
						presence.sendMessage(
							presence.getSharedInfo().id,
							{
								user: presence.getUserInfo(),
								action: "answer",
								content: {
									correctIndex: presenceCorrectIndex,
									userName: presence.getUserInfo().name
								}
							}
						);
					}
				} else {
					// Wrong answer - increment failed attempts
					failedAttempts++;

					// Show reminder if needed
					if (failedAttempts % REMINDER_AFTER_ATTEMPTS === 0) {
						const currentPart = bodyParts[presenceCorrectIndex];
						showModal(l10n.get("RemindYou", {name: l10n.get(currentPart.name)}));
					}

					// Wrong answer - color red temporarily
					object.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color("#ff0000"), // Red
						side: THREE.DoubleSide,
						transparent: false,
						opacity: 1.0,
						depthTest: true,
						depthWrite: true
					});

					// Restore original color after 1 second
					setTimeout(() => {
						restoreMeshColor(object);
					}, 1000);
				}
			} else {
				// Single player mode
				const targetMeshName = bodyParts[currentBodyPartIndex].mesh;

				if (object.name === targetMeshName) {
					// Correct answer - reset failed attempts counter
					failedAttempts = 0;

					// Correct answer - color green temporarily
					object.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color("#00ff00"), // Green
						side: THREE.DoubleSide,
						transparent: false,
						opacity: 1.0,
						depthTest: true,
						depthWrite: true
					});

					// Restore original color after 1 second
					setTimeout(() => {
						restoreMeshColor(object);
					}, 1000);

					// Show "Correct!" modal first
					showModal(l10n.get("Correct"));

					// After delay, get next random part
					setTimeout(() => {
						// Get next random part index
						currentBodyPartIndex = getRandomUnshownPartIndex();
						shownParts.push(currentBodyPartIndex);

						// Show next question
						showModal(l10n.get("FindThe", { name: l10n.get(bodyParts[currentBodyPartIndex].name) }));
					}, 2000);
				} else {
					// Wrong answer - increment failed attempts
					failedAttempts++;

					// Show reminder if needed
					if (failedAttempts % REMINDER_AFTER_ATTEMPTS === 0) {
						const currentPart = bodyParts[currentBodyPartIndex];
						showModal(l10n.get("RemindYou", {name: l10n.get(currentPart.name)}))
					}

					// Wrong answer - color red temporarily
					object.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color("#ff0000"), // Pure red
						side: THREE.DoubleSide,
						transparent: false,
						opacity: 1.0,
						depthTest: true,
						depthWrite: true
					});

					// Restore original color after 1 second
					setTimeout(() => {
						restoreMeshColor(object);
					}, 1000);
				}
			}
		}

		function restoreMeshColor(mesh) {
			if (!mesh.userData.currentColor) return;
			
			// Check if this part has been painted
			const paintedPart = partsColored.find(([name]) => name === mesh.name);
			
			if (paintedPart) {
				const paintedColor = paintedPart[1];
				mesh.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(paintedColor),
					side: THREE.DoubleSide,
					transparent: false,
					opacity: 1.0,
					depthTest: true,
					depthWrite: true
				});
			} else {
				// Restore original material 
				if (mesh.userData.originalMaterial) {
					mesh.material = mesh.userData.originalMaterial.clone();
				}
			}

			delete mesh.userData.currentColor;
		}

		function onMouseClick(event) {
			const rect = renderer.domElement.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Convert to normalized device coordinates
			mouse.x = (x / rect.width) * 2 - 1;
			mouse.y = -(y / rect.height) * 2 + 1;

			const altRaycaster = new THREE.Raycaster();
			altRaycaster.setFromCamera(mouse, camera);

			altRaycaster.near = 0.01;
			altRaycaster.far = 1000;
			altRaycaster.params.Points.threshold = 1.0;
			altRaycaster.params.Line.threshold = 1.0;

			// Test intersection with everything
			const intersects = altRaycaster.intersectObjects(scene.children, true);

			if (intersects.length > 0) {
				// Handle the first intersection found
				const intersect = intersects[0];
				handleIntersection(intersect);
			} else {
				// No intersection found, check for closest mesh
				findClosestMeshToRay(altRaycaster);
			}
		}

		function findClosestMeshToRay(raycaster) {
			let closestMesh = null;
			let closestDistance = Infinity;

			scene.traverse((child) => {
				if (child.isMesh && child.visible) {
					// Get mesh center
					if (!child.geometry.boundingBox) {
						child.geometry.computeBoundingBox();
					}

					const boundingBox = child.geometry.boundingBox.clone();
					boundingBox.applyMatrix4(child.matrixWorld);
					const center = boundingBox.getCenter(new THREE.Vector3());

					// Calculate distance from ray to mesh center
					const distance = raycaster.ray.distanceToPoint(center);

					// Within 2 units of the ray
					if (distance < closestDistance && distance < 2.0) { 
						closestDistance = distance;
						closestMesh = child;
					}
				}
			});

			if (closestMesh) {

				if (isPaintActive) {
					handlePaintMode(closestMesh);
				} else if (isDoctorActive) {
					handleDoctorMode(closestMesh);
				}
			} else {
				console.log("No mesh found close to ray");
			}
		}

		window.addEventListener("click", onMouseClick, false);

		document.getElementById("fullscreen-button").addEventListener('click', function () {
			document.body.classList.add('fullscreen-mode');

			const canvas = document.getElementById("canvas");
			canvas.style.position = "fixed";
			canvas.style.top = "0px";
			canvas.style.left = "0px";
			canvas.style.width = "100vw";
			canvas.style.height = "100vh";
			canvas.style.zIndex = "1000";

			const unfullscreenButton = document.getElementById("unfullscreen-button");
			unfullscreenButton.classList.add("visible");

			if (typeof gearSketch !== 'undefined' && gearSketch.canvas) {
				gearSketch.canvasOffsetY = gearSketch.canvas.getBoundingClientRect().top;
				if (gearSketch.updateCanvasSize) {
					gearSketch.updateCanvasSize();
				}
			}

			if (typeof renderer !== 'undefined' && renderer.setSize) {
				renderer.setSize(window.innerWidth, window.innerHeight);
			}

			if (typeof camera !== 'undefined') {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			}
		});

		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			document.body.classList.remove('fullscreen-mode');

			const canvas = document.getElementById("canvas");
			canvas.style.position = "";
			canvas.style.top = "55px";
			canvas.style.left = "";
			canvas.style.width = "";
			canvas.style.height = "";
			canvas.style.zIndex = "";

			const unfullscreenButton = document.getElementById("unfullscreen-button");
			unfullscreenButton.classList.remove("visible");

			if (typeof gearSketch !== 'undefined' && gearSketch.canvas) {
				gearSketch.canvasOffsetY = gearSketch.canvas.getBoundingClientRect().top;
				if (gearSketch.updateCanvasSize) {
					gearSketch.updateCanvasSize();
				}
			}

			if (typeof renderer !== 'undefined' && renderer.setSize) {
				// Calculate proper canvas size based on toolbar height
				const toolbarHeight = toolbar.offsetHeight || 55;
				const canvasWidth = window.innerWidth;
				const canvasHeight = window.innerHeight - toolbarHeight;
				renderer.setSize(canvasWidth, canvasHeight);
			}

			if (typeof camera !== 'undefined') {
				const toolbarHeight = toolbar.offsetHeight || 55;
				camera.aspect = window.innerWidth / (window.innerHeight - toolbarHeight);
				camera.updateProjectionMatrix();
			}
		});

		// Handle window resize in fullscreen mode
		window.addEventListener('resize', function () {
			if (document.body.classList.contains('fullscreen-mode')) {
				if (typeof renderer !== 'undefined' && renderer.setSize) {
					renderer.setSize(window.innerWidth, window.innerHeight);
				}

				if (typeof camera !== 'undefined') {
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
				}
			} else {
				if (typeof renderer !== 'undefined' && renderer.setSize) {
					const toolbar = document.getElementById("main-toolbar");
					const toolbarHeight = toolbar.offsetHeight || 55;
					const canvasWidth = window.innerWidth;
					const canvasHeight = window.innerHeight - toolbarHeight;
					renderer.setSize(canvasWidth, canvasHeight);
				}

				if (typeof camera !== 'undefined') {
					const toolbar = document.getElementById("main-toolbar");
					const toolbarHeight = toolbar.offsetHeight || 55;
					camera.aspect = window.innerWidth / (window.innerHeight - toolbarHeight);
					camera.updateProjectionMatrix();
				}
			}
		});

		function animate() {
			renderer.render(scene, camera);
		}

		renderer.setAnimationLoop(animate);
	});
});
