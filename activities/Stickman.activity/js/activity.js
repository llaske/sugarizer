define([
	"sugar-web/activity/activity",
	"sugar-web/env",
	"sugar-web/datastore",
	"sugar-web/graphics/presencepalette",
	"sugar-web/graphics/journalchooser",
	"activity/palettes/speedpalette",
	"activity/palettes/zoompalette",
	"activity/palettes/templatepalette",
	"tutorial",
	"l10n",
	"humane"
], function (
	activity,
	env,
	datastore,
	presencepalette,
	journalchooser,
	speedpalette,
	zoompalette,
	templatepalette,
	tutorial,
	l10n,
	humane
) {
	const tf = window.tf;
	const posenet = window.posenet;

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// STATE VARIABLES
		let canvas, ctx;

		let baseFrames = {}; 	// Store first frame with absolute positions for each stickman
		let deltaFrames = {}; 	// Store relative movement deltas for subsequent frames
		let stickmen = []; 		// Array of stickmen (current working positions)

		let currentFrameIndices = {};
		let isPlaying = false;
		let speed = 1;
		let selectedJoint = null;
		let selectedStickmanIndex = -1;
		let isDragging = false;
		let isDraggingWhole = false;
		let templates = {};
		let currentSpeed = 1;
		let dragStartPos = { x: 0, y: 0 };
		let originalJoints = [];
		let nextStickmanId = 0;
		let isRemovalMode = false;
		let currentenv;
		let isShared = false;
		let isRotating = false;
		let rotationPivot = null;
		let rotationStartAngle = 0;
		let neckManuallyMoved = false;
		let templatePaletteInstance = null; // Store template palette reference for localization

		// Zoom functionality
		let currentZoom = 1; 	// Default zoom level
		let minZoom = 0.5; 		// Minimum zoom level (50%)
		let maxZoom = 3.0; 		// Maximum zoom level (300%)

		// PoseNet model configurations
		let posenetModel = null;

		const POSENET_CONFIGS = {
			resnet50: {
				architecture: 'ResNet50',
				outputStride: 16,
				inputResolution: 513,
				quantBytes: 2
			},
			mobilenet: {
				architecture: 'MobileNetV1',
				outputStride: 16,
				inputResolution: 257,
				quantBytes: 2,
				multiplier: 0.75
			}
		};

		// Mobile/Platform detection function
		function detectPlatform() {
			const userAgent = navigator.userAgent.toLowerCase();
			const maxTouchPoints = navigator.maxTouchPoints || 0;

			// Check for mobile devices
			const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || maxTouchPoints > 0;

			// Check for tablet specifically
			const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (maxTouchPoints > 0 && window.screen.width >= 768);

			// Check for low-end devices (basic heuristics)
			const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

			// Check for older devices (approximate check)
			const isOlderDevice = /android [1-4]\.|cpu os [1-9]_/i.test(userAgent);

			// Check available memory (if supported)
			const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;

			// Check for specific mobile platforms
			const isIOS = /iphone|ipad|ipod/i.test(userAgent);
			const isAndroid = /android/i.test(userAgent);

			// Screen size heuristics
			const hasSmallScreen = window.screen.width <= 768 || window.screen.height <= 768;

			return {
				isMobile: isMobile && !isTablet,
				isTablet: isTablet,
				isDesktop: !isMobile && !isTablet,
				isLowEnd: isLowEnd || hasLowMemory,
				isOlderDevice: isOlderDevice,
				isIOS: isIOS,
				isAndroid: isAndroid,
				hasSmallScreen: hasSmallScreen,
				deviceMemory: navigator.deviceMemory || null,
				hardwareConcurrency: navigator.hardwareConcurrency || null
			};
		}

		// Auto-select PoseNet configuration based on platform
		function selectOptimalPoseNetConfig() {
			const platform = detectPlatform();

			// Use ResNet50 as preferred default, with MobileNet fallback for offline
			return POSENET_CONFIGS.resnet50;
		}

		// Current active configuration - automatically selected based on platform
		const posenetConfig = selectOptimalPoseNetConfig();

		// Expose model info for debugging (accessible via browser console)
		window.StickmanActivityDebug = {
			getPlatformInfo: () => detectPlatform(),
			getModelConfig: () => posenetConfig,
			getCurrentModel: () => posenetModel ? posenetModel.architecture : null,
			isModelLoaded: () => !!posenetModel
		};

		let lastMovementBroadcast = 0;
		const MOVEMENT_BROADCAST_THROTTLE = 50;

		// Add these variables for remote stickman management
		let remoteStickmanPositions = {}; // Store local positions for remote stickmen
		let isDraggingRemote = false;

		// PRESENCE VARIABLES
		let presence = null;
		let isHost = false;
		let stickmanUserColors = {}; // Maps stickman ID to user color data

		// UTILITY FUNCTIONS

		function deepClone(obj) {
			return JSON.parse(JSON.stringify(obj));
		}

		// Check if a stickman is owned by the current user
		function isStickmanOwned(stickmanId) {
			if (!isShared || !presence || !currentenv || !currentenv.user) {
				return true; // Not in shared mode or no user info, assume owned
			}

			const currentUser = presence.getUserInfo();
			return currentUser && stickmanId.toString().startsWith(currentUser.networkId);
		}

		// Joint hierarchy - defines parent-child relationships for rotation
		const jointHierarchy = {
			2: [11], 		// hip -> middle
			11: [1], 		// middle -> body (neck rotates around middle)
			1: [0, 7, 9], 	// body -> head, left elbow, right elbow
			7: [8], 		// left elbow -> left hand
			9: [10], 		// right elbow -> right hand
			3: [4], 		// left knee -> left foot
			5: [6]			// right knee -> right foot
		};

		// Joint connections with proper distances
		const jointConnections = [
			{ from: 1, to: 0, length: 20 },    // body to head 
			{ from: 11, to: 1, length: 30 },   // middle to body
			{ from: 2, to: 11, length: 30 },   // hips to middle
			{ from: 2, to: 3, length: 40 },    // hips to left knee
			{ from: 3, to: 4, length: 40 },    // left knee to foot
			{ from: 2, to: 5, length: 40 },    // hips to right knee
			{ from: 5, to: 6, length: 40 },    // right knee to foot
			{ from: 1, to: 7, length: 40 },    // body to left elbow
			{ from: 7, to: 8, length: 30 },    // left elbow to hand
			{ from: 1, to: 9, length: 40 },    // body to right elbow
			{ from: 9, to: 10, length: 30 }    // right elbow to hand
		];

		// DELTA FRAME SYSTEM FUNCTIONS

		function calculateDeltas(currentJoints, previousJoints) {
			if (!previousJoints || currentJoints.length !== previousJoints.length) {
				return null;
			}

			// Create a copy of current joints and enforce constraints
			const constrainedJoints = deepClone(currentJoints);
			enforceJointDistances(constrainedJoints);

			return constrainedJoints.map((joint, index) => ({
				dx: joint.x - previousJoints[index].x,
				dy: joint.y - previousJoints[index].y,
				name: joint.name
			}));
		}

		function applyDeltas(baseJoints, deltas) {
			if (!deltas || baseJoints.length !== deltas.length) {
				return deepClone(baseJoints);
			}

			const newJoints = baseJoints.map((joint, index) => ({
				x: joint.x + deltas[index].dx,
				y: joint.y + deltas[index].dy,
				name: joint.name
			}));

			// Apply distance constraints to maintain limb lengths
			enforceJointDistances(newJoints);

			return newJoints;
		}

		function enforceJointDistances(joints) {
			// Apply joint distance constraints with a hierarchical approach
			// Start from the root (hips) and work outward to maintain stability
			const processOrder = [
				{ from: 2, to: 11 },   // hips to middle
				{ from: 11, to: 1 },   // middle to body  
				{ from: 1, to: 0 },    // body to head
				{ from: 1, to: 7 },    // body to left elbow
				{ from: 7, to: 8 },    // left elbow to left hand
				{ from: 1, to: 9 },    // body to right elbow
				{ from: 9, to: 10 },   // right elbow to right hand
				{ from: 2, to: 3 },    // hips to left knee
				{ from: 3, to: 4 },    // left knee to left foot
				{ from: 2, to: 5 },    // hips to right knee
				{ from: 5, to: 6 }     // right knee to right foot
			];

			// Apply constraints in hierarchical order
			for (let iteration = 0; iteration < 2; iteration++) {
				processOrder.forEach(conn => {
					const joint1 = joints[conn.from];
					const joint2 = joints[conn.to];

					if (!joint1 || !joint2) return;

					const dx = joint2.x - joint1.x;
					const dy = joint2.y - joint1.y;
					const currentDistance = Math.sqrt(dx * dx + dy * dy);
					const targetDistance = jointConnections.find(jc => jc.from === conn.from && jc.to === conn.to)?.length;

					if (targetDistance && currentDistance > 0 && Math.abs(currentDistance - targetDistance) > 0.5) {
						const ratio = targetDistance / currentDistance;
						const newX = joint1.x + dx * ratio;
						const newY = joint1.y + dy * ratio;

						// Move the child joint to maintain distance from parent
						joint2.x = newX;
						joint2.y = newY;
					}
				});
			}
		}

		function reconstructFrameFromDeltas(stickmanId, frameIndex) {
			if (!baseFrames[stickmanId] || frameIndex < 0) {
				return null;
			}

			if (frameIndex === 0) {
				// First frame is always the base frame
				return JSON.parse(JSON.stringify({
					id: stickmanId,
					joints: baseFrames[stickmanId]
				}));
			}

			if (!deltaFrames[stickmanId] || frameIndex - 1 >= deltaFrames[stickmanId].length) {
				return null;
			}

			// Start with base frame and apply deltas incrementally
			let currentJoints = deepClone(baseFrames[stickmanId]);

			for (let i = 0; i < frameIndex; i++) {
				if (deltaFrames[stickmanId][i]) {
					currentJoints = applyDeltas(currentJoints, deltaFrames[stickmanId][i]);
					// Enforce joint distance constraints after each delta application
					enforceJointDistances(currentJoints);
				}
			}

			return {
				id: stickmanId,
				joints: currentJoints
			};
		}

		function rebaseDeltas(stickmanId, removedFrameIndex) {
			if (!deltaFrames[stickmanId] || removedFrameIndex <= 0) return;

			const getTotalFrameCount = (id) => {
				if (!baseFrames[id]) return 0;
				return 1 + (deltaFrames[id] ? deltaFrames[id].length : 0);
			};

			if (removedFrameIndex === 1) {
				// Removing second frame - need to update base frame and recompute all deltas
				const newBaseFrame = reconstructFrameFromDeltas(stickmanId, 1);
				if (newBaseFrame) {
					baseFrames[stickmanId] = newBaseFrame.joints;

					// Recompute all deltas relative to new base
					const newDeltas = [];
					for (let i = 2; i < getTotalFrameCount(stickmanId); i++) {
						const frame = reconstructFrameFromDeltas(stickmanId, i);
						if (frame) {
							const delta = calculateDeltas(frame.joints, baseFrames[stickmanId]);
							if (delta) newDeltas.push(delta);
						}
					}
					deltaFrames[stickmanId] = newDeltas;
				}
			} else {
				// Remove delta frame and recompute subsequent deltas
				const originalDeltas = [...deltaFrames[stickmanId]];
				deltaFrames[stickmanId].splice(removedFrameIndex - 1, 1);

				// Recompute deltas for frames after the removed one
				for (let i = removedFrameIndex - 1; i < deltaFrames[stickmanId].length; i++) {
					const currentFrame = reconstructFrameFromDeltas(stickmanId, i + 1);
					const previousFrame = reconstructFrameFromDeltas(stickmanId, i);

					if (currentFrame && previousFrame) {
						const newDelta = calculateDeltas(currentFrame.joints, previousFrame.joints);
						if (newDelta) {
							deltaFrames[stickmanId][i] = newDelta;
						}
					}
				}
			}
		}

		// INITIALIZATION FUNCTIONS

		function initializeAnimator() {
			const canvasElement = document.getElementById('stickman-canvas');
			if (canvasElement) {
				initCanvas();
				initEvents();
				initControls();
				render();
			} else {
				console.warn('Canvas element not found, retrying...');
				setTimeout(initializeAnimator, 100);
			}
		}

		function setupDatastore() {
			env.getEnvironment(function (err, environment) {
				currentenv = environment;

				// Set current language to Sugarizer
				var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
				var language = environment.user ? environment.user.language : defaultLanguage;
				l10n.init(language);

				if (environment.sharedId) {
					isShared = true;
					presence = activity.getPresenceObject(function (error, network) {
						if (error) {
							console.log("Error joining shared activity:", error);
							return;
						}

						// Set up handlers immediately - like HumanBody
						network.onDataReceived(onNetworkDataReceived);
						network.onSharedActivityUserChanged(onNetworkUserChanged);

						// Improved host status detection
						try {
							const sharedInfo = network.getSharedInfo();
							const userInfo = network.getUserInfo();

							// More robust host detection
							if (sharedInfo && userInfo && sharedInfo.owner && userInfo.networkId) {
								isHost = userInfo.networkId === sharedInfo.owner;
							} else {
								// If we can't determine host status, assume not host
								isHost = false;
							}

						} catch (e) {
							console.log("Error checking host status:", e);
							isHost = false;
							console.log("Fallback host status:", isHost);
						}
					});
				}

				// Load from datastore
				if (!environment.objectId) {
					// Only create initial stickman if NOT in shared mode or if we're the host
					if (!environment.sharedId) {
						createInitialStickman();
						updateTimeline();
						updateRemoveButtonState();
						render();
					} else {
						// In shared mode, non-host users start with empty canvas
						// and wait for data from host
						stickmen = [];
						updateTimeline();
						updateRemoveButtonState();
						render();
					}
				} else {
					// load saved data
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							const savedData = JSON.parse(data);

							baseFrames = savedData.baseFrames || {};
							deltaFrames = savedData.deltaFrames || {};
							currentFrameIndices = savedData.currentFrameIndices || {};
							speed = savedData.speed || 1;
							currentSpeed = savedData.currentSpeed || 1;
							nextStickmanId = savedData.nextStickmanId || 0;
							
							if (savedData.currentZoom !== undefined) {
								currentZoom = savedData.currentZoom;
								resizeCanvas(); 
							}
							
							// Always initialize with current user's color, ignoring any saved colors
							stickmanUserColors = {};

							// Reconstruct stickmen 
							if (Object.keys(baseFrames).length > 0) {
								stickmen = [];

								Object.keys(baseFrames).forEach(stickmanIdStr => {
									const stickmanId = stickmanIdStr; // Keep as string for networkId format
									const frameIndex = currentFrameIndices[stickmanId] || 0;
									const stickman = reconstructFrameFromDeltas(stickmanId, frameIndex);
									if (stickman) {
										stickmen.push(stickman);
										
										// Assign current user's color to all loaded stickmen
										if (currentenv && currentenv.user && currentenv.user.colorvalue) {
											stickmanUserColors[stickmanId] = currentenv.user.colorvalue;
										}
									}
								});

								stickmen.forEach((_, index) => updateMiddleJoint(index));

								// Select first stickman by default
								if (stickmen.length > 0) {
									selectedStickmanIndex = 0;
								}
							} else {
								createInitialStickman();
							}

							updateTimeline();
							updateRemoveButtonState();
							render();
						} else {
							createInitialStickman();
							updateTimeline();
							updateRemoveButtonState();
							render();
						}
					});
				}
			});
		}

		// translate toolbar buttons (localize the toolbar buttons)
		function translateToolbarButtons() {
			const buttonsToTranslate = [
				{ id: 'network-button', key: 'Network' },
				{ id: 'play-pause-button', key: 'PlayPause' },
				{ id: 'speed-button', key: 'Speed' },
				{ id: 'zoom-button', key: 'Zoom' },
				{ id: 'zoom-in-button', key: 'ZoomIn' },
				{ id: 'zoom-out-button', key: 'ZoomOut' },
				{ id: 'zoom-original-button', key: 'ZoomReset' },
				{ id: 'zoom-fit-button', key: 'ZoomFit' },
				{ id: 'minus-button', key: 'RemoveStickman' },
				{ id: 'addStickman-button', key: 'AddStickman' },
				{ id: 'template-button', key: 'Templates' },
				{ id: 'importJournal-button', key: 'ImportFromJournal' },
				{ id: 'import-button', key: 'Import' },
				{ id: 'export-button', key: 'Export' },
				{ id: 'stop-button', key: 'Stop' },
				{ id: 'fullscreen-button', key: 'Fullscreen' },
				{ id: 'unfullscreen-button', key: 'Unfullscreen' },
				{ id: 'help-button', key: 'Tutorial' },
				{ id: 'add-button', key: 'AddFrame' }
			];

			buttonsToTranslate.forEach(button => {
				const element = document.getElementById(button.id);
				if (element) {
					const translatedText = l10n.get(button.key);
					if (translatedText) {
						element.title = translatedText;
					}
				}
			});

			// Also localize template palette buttons if the instance exists
			if (templatePaletteInstance && typeof templatePaletteInstance.localizeTemplateButtons === 'function') {
				templatePaletteInstance.localizeTemplateButtons();
			}
		}

		document.getElementById('stop-button').addEventListener('click', function () {
			if (currentenv && currentenv.user) {
				const currentUserId = currentenv.user.networkId || currentenv.user.name || 'user';

				// updated with current user ownership
				const updatedBaseFrames = {};
				const updatedDeltaFrames = {};
				const updatedCurrentFrameIndices = {};

				// update ownership
				stickmen.forEach((stickman, index) => {
					const oldId = stickman.id;
					let newId;

					if (typeof oldId === 'string' && oldId.includes('_')) {
						const timestamp = oldId.split('_').slice(1).join('_') || Date.now();
						newId = `${currentUserId}_${timestamp}`;
					} else {
						newId = `${currentUserId}_${Date.now()}_${index}`;
					}

					stickman.id = newId;

					if (baseFrames[oldId]) {
						updatedBaseFrames[newId] = baseFrames[oldId];
					}
					if (deltaFrames[oldId]) {
						updatedDeltaFrames[newId] = deltaFrames[oldId];
					}
					if (currentFrameIndices[oldId] !== undefined) {
						updatedCurrentFrameIndices[newId] = currentFrameIndices[oldId];
					}
				});

				// Replace the original data structures
				baseFrames = updatedBaseFrames;
				deltaFrames = updatedDeltaFrames;
				currentFrameIndices = updatedCurrentFrameIndices;
			}

			const saveData = {
				baseFrames: baseFrames,
				deltaFrames: deltaFrames,
				currentFrameIndices: currentFrameIndices,
				speed: speed,
				currentSpeed: currentSpeed,
				nextStickmanId: nextStickmanId,
				currentZoom: currentZoom
				// Note: stickmanUserColors intentionally removed from journal save
			};

			var jsonData = JSON.stringify(saveData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
				activity.close();
			});
		});

		document.getElementById("help-button").addEventListener('click', function (e) {
			tutorial.start();
		});

		// Fullscreen functionality
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.display = "none";
			document.querySelector(".bottomContainer").style.display = "none";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			
			// Add fullscreen class to canvas
			const canvas = document.getElementById("stickman-canvas");
			canvas.classList.add("fullscreen");
			
			resizeCanvas(); // Adjust canvas size for fullscreen
		});

		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.display = "block";
			document.querySelector(".bottomContainer").style.display = "flex";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			
			// Remove fullscreen class from canvas
			const canvas = document.getElementById("stickman-canvas");
			canvas.classList.remove("fullscreen");
			
			resizeCanvas(); // Readjust canvas size for normal view
		});

		function initCanvas() {
			canvas = document.getElementById('stickman-canvas');
			ctx = canvas.getContext('2d');
			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);
		}

		function resizeCanvas() {
			// Check if we're in fullscreen mode
			const canvas = document.getElementById("stickman-canvas");
			const isFullscreen = canvas.classList.contains("fullscreen");
			
			if (isFullscreen) {
				// In fullscreen mode, use full viewport dimensions
				document.getElementById("main-toolbar").style.opacity = 0;
				document.getElementById("timeline").style.opacity = 0;
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				canvas.getContext("2d").scale(currentZoom * 1.1, currentZoom * 1.3);
			} else {
				// Normal mode: Use calculated dimensions based on container
				document.getElementById("main-toolbar").style.opacity = 1;
				document.getElementById("timeline").style.opacity = 1;
				canvas.width = canvas.parentElement.clientWidth - 32;
				canvas.height = canvas.parentElement.clientHeight - 250;
				canvas.getContext("2d").scale(currentZoom, currentZoom);
			}
		}

		function initEvents() {
			canvas.addEventListener('mousedown', handleMouseDown);
			canvas.addEventListener('mousemove', handleMouseMove);
			canvas.addEventListener('mouseup', handleMouseUp);
			canvas.addEventListener('touchstart', function(e) {
				e.preventDefault();
				if (e.touches.length > 0) {
					handleMouseDown(e.touches[0]);
				}
			}, { passive: false });

			canvas.addEventListener('touchmove', function (e) {
				e.preventDefault();
				if (e.touches.length > 0) {
					handleMouseMove(e.touches[0]);
				}
			}, { passive: false });
			
			canvas.addEventListener('touchend', function (e) {
				e.preventDefault();
				handleMouseUp(e);
			}, { passive: false });

			// Control buttons
			document.getElementById('add-button').addEventListener('click', addFrame);
			document.getElementById('export-button').addEventListener('click', exportAnimation);
			document.getElementById('addStickman-button').addEventListener('click', addNewStickman);
			document.getElementById('minus-button').addEventListener('click', removeSelectedStickman);
			document.getElementById('importJournal-button').addEventListener('click', importFromJournal);
			document.getElementById('import-button').addEventListener('click', importVideoAnimation);

			// Initialize datastore
			setupDatastore();
		}

		function initControls() {
			// Play/Pause button setup
			const playPauseButton = document.getElementById('play-pause-button');
			playPauseButton.style.backgroundImage = "url('icons/play.svg')";
			playPauseButton.style.backgroundPosition = "center";
			playPauseButton.style.backgroundRepeat = "no-repeat";
			playPauseButton.style.backgroundSize = "contain";
			playPauseButton.addEventListener('click', togglePlayPause);

			// Speed control setup
			const speedButton = document.getElementById("speed-button");
			const speedPalette = new speedpalette.SpeedPalette(speedButton);
			speedPalette.addEventListener('speed', function (e) {
				currentSpeed = e.detail.speed;
				speed = currentSpeed;
			});

			// Zoom control setup
			const zoomButton = document.getElementById("zoom-button");
			const zoomPalette = new zoompalette.ZoomPalette(zoomButton);

			// Set up zoom button event handlers
			setTimeout(() => {
				const zoomInButton = document.getElementById("zoom-in-button");
				const zoomOutButton = document.getElementById("zoom-out-button");
				const zoomOriginalButton = document.getElementById("zoom-original-button");
				const zoomFitButton = document.getElementById("zoom-fit-button");

				if (zoomInButton) 
					zoomInButton.addEventListener("click", () => handleZoomChange("zoomIn"));
				if (zoomOutButton) 
					zoomOutButton.addEventListener("click", () => handleZoomChange("zoomOut"));
				if (zoomOriginalButton) 
					zoomOriginalButton.addEventListener("click", () => handleZoomChange("reset"));
				if (zoomFitButton) 
					zoomFitButton.addEventListener("click", () => handleZoomChange("fit"));
			}, 100);

			// Template palette - temporarily disabled due to loading issues
			var templateButton = document.getElementById("template-button");
			templatePaletteInstance = new templatepalette.TemplatePalette(templateButton);

			document.addEventListener('template-selected', function (e) {
				loadTemplate(e.detail.template);
			});

			// Presence palette setup
			var palette = new presencepalette.PresencePalette(
				document.getElementById("network-button"),
				undefined
			);

			palette.addEventListener('shared', function () {
				palette.popDown();
				presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						console.log("Sharing error:", error);
						return;
					}

					network.createSharedActivity('org.sugarlabs.Stickman', function (groupId) {
						isShared = true;
						isHost = true;

						// Initialize network handlers
						network.onDataReceived(onNetworkDataReceived);
						network.onSharedActivityUserChanged(onNetworkUserChanged);

						// Create initial stickman for host if none exists
						if (stickmen.length === 0) {
							createInitialStickman();
							updateTimeline();
							updateRemoveButtonState();
						}

						// Update existing stickman IDs to use network format
						if (stickmen.length > 0) {
							stickmen.forEach(stickman => {
								if (typeof stickman.id === 'number') {
									const oldId = stickman.id;
									const newId = `${currentenv.user.networkId}_${Date.now()}`;

									// Update stickman ID
									stickman.id = newId;

									// Update all related data structures
									if (baseFrames[oldId]) {
										baseFrames[newId] = baseFrames[oldId];
										delete baseFrames[oldId];
									}
									if (deltaFrames[oldId]) {
										deltaFrames[newId] = deltaFrames[oldId];
										delete deltaFrames[oldId];
									}
									if (currentFrameIndices[oldId] !== undefined) {
										currentFrameIndices[newId] = currentFrameIndices[oldId];
										delete currentFrameIndices[oldId];
									}
									if (stickmanUserColors[oldId]) {
										stickmanUserColors[newId] = stickmanUserColors[oldId];
										delete stickmanUserColors[oldId];
									}
								}
							});
							updateTimeline();
						}

						// Send initial data to any waiting users
						setTimeout(sendAllStickmen, 500);
					});
				});
			});
		}

		// Handle zoom change from zoom palette (inspired by Human Body activity)
		function handleZoomChange(zoomType) {
			let newZoom = currentZoom;
			const zoomStep = 0.25; // 25% increment/decrement steps

			switch (zoomType) {
				case "zoomIn":
					if (currentZoom < maxZoom) {
						newZoom = Math.min(maxZoom, currentZoom + zoomStep);
					}
					break;
				case "zoomOut":
					if (currentZoom > minZoom) {
						newZoom = Math.max(minZoom, currentZoom - zoomStep);
					}
					break;
				case "reset":
					newZoom = 1.0; // Standard zoom level
					break;
				case "fit":
					newZoom = calculateFitToScreenZoom();
					break;
			}

			if (Math.abs(newZoom - currentZoom) > 0.01) {
				currentZoom = newZoom;

				// Reset canvas transform and apply new zoom
				const canvas = document.getElementById('stickman-canvas');
				const ctx = canvas.getContext('2d');
				ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

				// Reapply canvas size and zoom
				resizeCanvas();

				// Re-render all stickmen with new zoom
				render();

				console.log(`Zoom changed to: ${(currentZoom * 100).toFixed(0)}%`);
			}
		}

		// Calculate optimal zoom to fit all stickmen on screen
		function calculateFitToScreenZoom() {
			if (stickmen.length === 0) {
				return 1.0;
			}

			let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

			// Find bounding box of all stickmen
			stickmen.forEach(stickman => {
				if (stickman && stickman.joints) {
					stickman.joints.forEach(joint => {
						if (joint) {
							minX = Math.min(minX, joint.x);
							maxX = Math.max(maxX, joint.x);
							minY = Math.min(minY, joint.y);
							maxY = Math.max(maxY, joint.y);
						}
					});
				}
			});

			if (minX === Infinity) {
				return 1.0;
			}

			// Add padding around stickmen
			const padding = 50;
			const contentWidth = (maxX - minX) + (padding * 2);
			const contentHeight = (maxY - minY) + (padding * 2);

			// Calculate zoom to fit in canvas
			const canvasWidth = canvas.width / (canvas.classList.contains("fullscreen") ? 1.1 : 1);
			const canvasHeight = canvas.height / (canvas.classList.contains("fullscreen") ? 1.3 : 1);

			const scaleX = canvasWidth / contentWidth;
			const scaleY = canvasHeight / contentHeight;

			// Use the smaller scale to ensure everything fits
			let fitZoom = Math.min(scaleX, scaleY);

			// Clamp to zoom limits
			fitZoom = Math.max(minZoom, Math.min(maxZoom, fitZoom));

			return fitZoom;
		}

		// function to reset remote positions when receiving updates
		function resetRemoteStickmanPosition(stickmanId) {
			if (remoteStickmanPositions[stickmanId]) {
				// Update the original joints to the new network data
				const stickmanIndex = stickmen.findIndex(s => s.id === stickmanId);
				if (stickmanIndex !== -1) {
					// Store the new network position as the original joints
					remoteStickmanPositions[stickmanId].originalJoints = deepClone(stickmen[stickmanIndex].joints);
					// Keep the existing offset - it will be applied during rendering
				}
			}
		}

		// NETWORK CALLBACKS

		var onNetworkDataReceived = function (msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}

			if (msg.action === 'new_stickman') {
				processIncomingStickman(msg.content.stickman, msg.content.stickman.id, msg.content.color);
				render();
			}

			if (msg.action === 'all_stickmen') {
				msg.content.forEach(stickman => {
					processIncomingStickman(stickman, stickman.id, stickman.color);
				});
				render();
			}

			if (msg.action === 'stickman_update' || msg.action === 'stickman_final_position') {
				const stickmanId = msg.content.stickmanId;
				updateStickmanFromNetwork(msg.content);
				render();
			}

			if (msg.action === 'stickman_movement') {
				processStickmanMovement(msg.content);
				render();
			}

			if (msg.action === 'remote_stickman_movement') {
				processRemoteStickmanMovement(msg.content);
				render();
			}

			if (msg.action === 'stickman_removal') {
				processStickmanRemoval(msg.content);
				render();
			}
		};

		var onNetworkUserChanged = function (msg) {
			if (!msg || !msg.user) return;

			if (isHost && msg.move == 1) {
				// Host sends all stickmen to new user
				setTimeout(sendAllStickmen, 500); // Small delay to ensure connection is ready
			}
		};

		function sendAllStickmen() {
			if (!isHost || !presence) {
				return;
			}

			try {
				const stickmenData = stickmen.map(stickman => {
					const id = stickman.id;
					return {
						id: id,
						joints: stickman.joints,
						baseFrame: baseFrames[id],
						deltaFrames: deltaFrames[id],
						color: stickmanUserColors[id],
						currentFrameIndex: currentFrameIndices[id] || 0
					};
				});

				// Send even if empty array to sync removal state
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "all_stickmen",
					content: stickmenData
				});
			} catch (error) {
				console.log("Error sending stickmen data:", error);
				setTimeout(sendAllStickmen, 1000);
			}
		}

		function broadcastStickman(stickmanData) {
			if (!isHost || !presence) {
				return;
			}

			try {
				presence.sendMessage({
					type: 'new_stickman',
					stickman: stickmanData.stickman,
					color: stickmanData.color
				});
			} catch (error) {
				console.log("Error broadcasting stickman:", error);
				setTimeout(() => broadcastStickman(stickmanData), 1000);
			}
		}

		// Allows users to drag remote stickmen (created by other users) across the screen
		function broadcastRemoteStickmanMovement(stickmanIndex, movementType, data = {}) {
			if (!isShared || !presence || stickmanIndex < 0 || stickmanIndex >= stickmen.length) {
				return;
			}

			// Throttle movement broadcasts to prevent spam
			const now = Date.now();
			if (now - lastMovementBroadcast < MOVEMENT_BROADCAST_THROTTLE) {
				return;
			}
			lastMovementBroadcast = now;

			try {
				const stickman = stickmen[stickmanIndex];
				const stickmanId = stickman.id;

				const message = {
					user: presence.getUserInfo(),
					action: 'remote_stickman_movement',
					content: {
						stickmanId: stickmanId,
						movementType: movementType,
						joints: deepClone(stickman.joints),
						timestamp: now,
						...data
					}
				};

				presence.sendMessage(presence.getSharedInfo().id, message);
			} catch (error) {
				console.log("Error broadcasting remote movement:", error);
			}
		}

		function processRemoteStickmanMovement(movementData) {
			const {
				stickmanId,
				movementType,
				joints
			} = movementData;

			// Find the stickman to update
			const stickmanIndex = stickmen.findIndex(s => s.id === stickmanId);
			if (stickmanIndex === -1) {
				return;
			}

			// Don't process movements of currently selected stickman to avoid conflicts
			if (stickmanIndex === selectedStickmanIndex && (isDragging || isDraggingWhole || isRotating)) {
				return;
			}

			// Reset to frame 1 when user moves a remote stickman, this makes it easier to handle and prevents complex pose conflicts
			if (remoteStickmanPositions[stickmanId] && 
				(remoteStickmanPositions[stickmanId].offsetX !== 0 || remoteStickmanPositions[stickmanId].offsetY !== 0)) {
				
				// Reset to first frame (frame 0)
				if (baseFrames[stickmanId]) {
					currentFrameIndices[stickmanId] = 0;
					const baseFrame = reconstructFrameFromDeltas(stickmanId, 0);
					if (baseFrame) {
						stickmen[stickmanIndex] = baseFrame;
					}
				}
				
				// Clear the local offset since we're getting fresh network data
				remoteStickmanPositions[stickmanId].offsetX = 0;
				remoteStickmanPositions[stickmanId].offsetY = 0;
			}

			// Update the stickman joints with received data
			if (joints && joints.length === stickmen[stickmanIndex].joints.length) {
				stickmen[stickmanIndex].joints = deepClone(joints);
				updateMiddleJoint(stickmanIndex);
				
				// Update original joints for this remote stickman
				if (remoteStickmanPositions[stickmanId]) {
					remoteStickmanPositions[stickmanId].originalJoints = deepClone(joints);
				}
			}
		}

		function broadcastStickmanMovement(stickmanIndex, movementType, data = {}) {
			if (!isShared || !presence || stickmanIndex < 0 || stickmanIndex >= stickmen.length) {
				return;
			}

			// Throttle movement broadcasts to prevent spam
			const now = Date.now();
			if (now - lastMovementBroadcast < MOVEMENT_BROADCAST_THROTTLE) {
				return;
			}
			lastMovementBroadcast = now;

			try {
				const stickman = stickmen[stickmanIndex];
				const stickmanId = stickman.id;

				// Only broadcast movements of own stickmen
				if (!isStickmanOwned(stickmanId)) {
					return;
				}

				const message = {
					user: currentUser,
					action: 'stickman_movement',
					content: {
						stickmanId: stickmanId,
						movementType: movementType,
						joints: deepClone(stickman.joints),
						timestamp: now,
						...data
					}
				};

				presence.sendMessage(presence.getSharedInfo().id, message);
			} catch (error) {
				console.log("Error broadcasting movement:", error);
			}
		}

		function processIncomingStickman(stickmanData, newId, color) {

			// Check if stickman already exists
			const existingIndex = stickmen.findIndex(s => s.id === newId);
			if (existingIndex !== -1) {

				// Store original joints if remote positioning data exists
				if (remoteStickmanPositions[newId]) {
					// Update original joints to the new network data
					remoteStickmanPositions[newId].originalJoints = deepClone(stickmanData.joints);
				}

				// Update existing stickman with new network data (offset will be applied during rendering)
				stickmen[existingIndex].joints = deepClone(stickmanData.joints);
				baseFrames[newId] = deepClone(stickmanData.baseFrame || stickmanData.joints);
				deltaFrames[newId] = deepClone(stickmanData.deltaFrames || []);
				currentFrameIndices[newId] = stickmanData.currentFrameIndex || 0;
				stickmanUserColors[newId] = color;

				updateMiddleJoint(existingIndex);
				updateTimeline();
				updateRemoveButtonState();
				return;
			}

			// Store original joints if remote positioning data exists
			if (remoteStickmanPositions[newId]) {
				// Update original joints to the new network data
				remoteStickmanPositions[newId].originalJoints = deepClone(stickmanData.joints);
			}

			const newStickman = {
				id: newId,
				joints: deepClone(stickmanData.joints) // Store original joints, offset applied during rendering
			};

			stickmen.push(newStickman);
			baseFrames[newId] = deepClone(stickmanData.baseFrame || stickmanData.joints);
			deltaFrames[newId] = deepClone(stickmanData.deltaFrames || []);
			currentFrameIndices[newId] = stickmanData.currentFrameIndex || 0;
			stickmanUserColors[newId] = color;

			updateMiddleJoint(stickmen.length - 1);
			updateTimeline();
			updateRemoveButtonState();

			return {
				stickman: newStickman,
				color: color
			};
		}

		function processStickmanMovement(movementData) {
			const { stickmanId, movementType, joints, timestamp } = movementData;

			// Find the stickman to update
			const stickmanIndex = stickmen.findIndex(s => s.id === stickmanId);
			if (stickmanIndex === -1) {
				return;
			}

			// Don't process movements of currently selected stickman to avoid conflicts
			if (stickmanIndex === selectedStickmanIndex && (isDragging || isDraggingWhole || isRotating)) {
				return;
			}

			// Update the stickman joints with received data
			if (joints && joints.length === stickmen[stickmanIndex].joints.length) {
				stickmen[stickmanIndex].joints = deepClone(joints);

				// Update middle joint
				updateMiddleJoint(stickmanIndex);

				// Update current frame data to match the movement
				if (baseFrames[stickmanId] && currentFrameIndices[stickmanId] !== undefined) {
					const currentFrameIndex = currentFrameIndices[stickmanId];

					if (currentFrameIndex === 0) {
						// Update base frame
						baseFrames[stickmanId] = deepClone(joints);
					} else {
						// Update delta frame
						const previousFrame = reconstructFrameFromDeltas(stickmanId, currentFrameIndex - 1);
						if (previousFrame) {
							const newDelta = calculateDeltas(joints, previousFrame.joints);
							if (newDelta && deltaFrames[stickmanId]) {
								const deltaIndex = currentFrameIndex - 1;
								if (deltaIndex >= 0 && deltaIndex < deltaFrames[stickmanId].length) {
									deltaFrames[stickmanId][deltaIndex] = newDelta;
								}
							}
						}
					}
				}
			}
		}

		function broadcastStickmanFinalPosition(stickmanIndex) {
			if (!isShared || !presence || stickmanIndex < 0 || stickmanIndex >= stickmen.length) {
				return;
			}

			try {
				const stickman = stickmen[stickmanIndex];
				const stickmanId = stickman.id;

				// Only broadcast final positions of own stickmen
				if (!isStickmanOwned(stickmanId)) {
					return;
				}

				const currentUser = presence.getUserInfo();

				const message = {
					user: currentUser,
					action: 'stickman_final_position',
					content: {
						stickmanId: stickmanId,
						joints: deepClone(stickman.joints),
						baseFrame: baseFrames[stickmanId],
						deltaFrames: deltaFrames[stickmanId],
						currentFrameIndex: currentFrameIndices[stickmanId],
						timestamp: Date.now()
					}
				};

				presence.sendMessage(presence.getSharedInfo().id, message);
			} catch (error) {
				console.log("Error broadcasting final position:", error);
			}
		}

		function updateStickmanFromNetwork(data) {
			const stickmanId = data.stickmanId;

			const stickmanIndex = stickmen.findIndex(s => s.id === stickmanId);
			if (stickmanIndex >= 0) {
				baseFrames[stickmanId] = deepClone(data.baseFrame);
				deltaFrames[stickmanId] = deepClone(data.deltaFrames);
				currentFrameIndices[stickmanId] = data.currentFrameIndex;

				// Reconstruct current frame
				const frame = reconstructFrameFromDeltas(stickmanId, data.currentFrameIndex);
				if (frame) {
					// Store original joints if remote positioning data exists
					if (remoteStickmanPositions[stickmanId]) {
						// Update original joints to the new network data
						remoteStickmanPositions[stickmanId].originalJoints = deepClone(frame.joints);
					}

					stickmen[stickmanIndex] = frame;
					updateMiddleJoint(stickmanIndex);
					updateTimeline();
				}
			}
		}

		function broadcastStickmanRemoval(stickmanId) {
			if (!isShared || !presence) {
				return;
			}

			try {
				// Only broadcast removal of own stickmen
				if (!isStickmanOwned(stickmanId)) {
					return;
				}

				const currentUser = presence.getUserInfo();

				const message = {
					user: currentUser,
					action: 'stickman_removal',
					content: {
						stickmanId: stickmanId,
						timestamp: Date.now()
					}
				};

				presence.sendMessage(presence.getSharedInfo().id, message);
			} catch (error) {
				console.log("Error broadcasting stickman removal:", error);
			}
		}

		function processStickmanRemoval(removalData) {
			const { stickmanId, timestamp } = removalData;

			// Clean up local position data
			if (remoteStickmanPositions[stickmanId]) {
				delete remoteStickmanPositions[stickmanId];
			}

			// Find and remove the stickman
			const stickmanIndex = stickmen.findIndex(s => s.id === stickmanId);
			if (stickmanIndex === -1) {
				return;
			}

			// Remove from current stickmen array
			stickmen.splice(stickmanIndex, 1);

			// Remove stickman data
			delete baseFrames[stickmanId];
			delete deltaFrames[stickmanId];
			delete currentFrameIndices[stickmanId];
			delete stickmanUserColors[stickmanId];

			// Adjust selected stickman index if needed
			if (selectedStickmanIndex === stickmanIndex) {
				selectedJoint = null;
				selectedStickmanIndex = stickmen.length > 0 ? 0 : -1;
			} else if (selectedStickmanIndex > stickmanIndex) {
				selectedStickmanIndex--;
			}

			updateTimeline();
			updateRemoveButtonState();

			// If no stickmen remain for current user, create a new one
			if (stickmen.length === 0) {
				createInitialStickman();
				updateTimeline();
				updateRemoveButtonState();
			}
		}

		function updateRemoveButtonState() {
			const minusButton = document.getElementById('minus-button');

			// Count only owned stickmen in shared mode
			let ownedStickmenCount = stickmen.length;

			if (isShared && presence) {
				const currentUser = presence.getUserInfo();
				if (currentUser) {
					ownedStickmenCount = stickmen.filter(stickman =>
						isStickmanOwned(stickman.id)
					).length;
				}
			}

			minusButton.title = l10n.get("RemoveStickmanTooltip");
			if (ownedStickmenCount <= 1) {
				minusButton.disabled = true;
			} else {
				minusButton.disabled = false;
			}
		}

		// STICKMAN CREATION & MANAGEMENT

		function createStickmanJoints(centerX, centerY, id) {
			const scale = 1.0; // Can be adjusted for different sizes

			return {
				id: id,
				joints: [
					{ x: centerX, y: centerY - 65 * scale, name: 'head' },                    // 0 - head
					{ x: centerX, y: centerY - 45 * scale, name: 'body' },                    // 1 - body (neck)
					{ x: centerX, y: centerY + 15 * scale, name: 'hips' },                    // 2 - hips
					{ x: centerX - 15 * scale, y: centerY + 55 * scale, name: 'leftKnee' },   // 3 - left knee
					{ x: centerX - 20 * scale, y: centerY + 95 * scale, name: 'leftFoot' },   // 4 - left foot
					{ x: centerX + 15 * scale, y: centerY + 55 * scale, name: 'rightKnee' },  // 5 - right knee
					{ x: centerX + 20 * scale, y: centerY + 95 * scale, name: 'rightFoot' },  // 6 - right foot
					{ x: centerX - 25 * scale, y: centerY - 35 * scale, name: 'leftElbow' },  // 7 - left elbow
					{ x: centerX - 40 * scale, y: centerY - 5 * scale, name: 'leftHand' },    // 8 - left hand
					{ x: centerX + 25 * scale, y: centerY - 35 * scale, name: 'rightElbow' }, // 9 - right elbow
					{ x: centerX + 40 * scale, y: centerY - 5 * scale, name: 'rightHand' },   // 10 - right hand
					{ x: centerX, y: centerY - 15 * scale, name: 'middle' }                   // 11 - middle (torso center)
				]
			};
		}

		function createInitialStickman() {
			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2 - 20;

			// Always use unique ID format in shared mode
			let stickmanId;
			if (isShared && currentenv && currentenv.user) {
				stickmanId = `${currentenv.user.networkId}_${Date.now()}`;
			} else {
				stickmanId = nextStickmanId++;
			}

			const initialStickman = createStickmanJoints(centerX, centerY, stickmanId);

			// Ensure the initial stickman has proper joint distances
			enforceJointDistances(initialStickman.joints);

			stickmen = [initialStickman];

			// Initialize base frame for this stickman
			baseFrames[initialStickman.id] = deepClone(initialStickman.joints);
			deltaFrames[initialStickman.id] = [];
			currentFrameIndices[initialStickman.id] = 0;

			// Associate this stickman with current user's color
			if (currentenv && currentenv.user && currentenv.user.colorvalue) {
				stickmanUserColors[initialStickman.id] = currentenv.user.colorvalue;
			}

			neckManuallyMoved = false;
			updateMiddleJoint(0);
			selectedStickmanIndex = 0;
			updateRemoveButtonState();
		}

		function addNewStickman() {
			// Calculate safe boundaries based on the improved stickman proportions
			const stickmanHeight = 160;
			const stickmanWidth = 80;
			const margin = 30;

			const minX = stickmanWidth / 2 + margin;
			const maxX = canvas.width - stickmanWidth / 2 - margin;
			const minY = 65 + margin;
			const maxY = canvas.height - 95 - margin;

			if (maxX <= minX || maxY <= minY) {
				console.warn("Canvas too small for new stickman");
				return;
			}

			let centerX, centerY;
			let attempts = 0;
			const maxAttempts = 20;
			const minDistance = 100;

			do {
				centerX = Math.random() * (maxX - minX) + minX;
				centerY = Math.random() * (maxY - minY) + minY;

				const isTooClose = stickmen.some(stickman => {
					const existingCenter = stickman.joints[11];
					const distance = Math.sqrt(
						Math.pow(centerX - existingCenter.x, 2) +
						Math.pow(centerY - existingCenter.y, 2)
					);
					return distance < minDistance;
				});

				if (!isTooClose) break;
				attempts++;
			} while (attempts < maxAttempts);

			// Always use unique ID format
			let newId;
			if (currentenv && currentenv.user) {
				newId = `${currentenv.user.networkId}_${Date.now()}`;
			} else {
				newId = nextStickmanId++;
			}

			const newStickman = createStickmanJoints(centerX, centerY, newId);
			enforceJointDistances(newStickman.joints);
			stickmen.push(newStickman);

			// Initialize frames
			baseFrames[newId] = deepClone(newStickman.joints);
			deltaFrames[newId] = [];
			currentFrameIndices[newId] = 0;

			const userColor = currentenv.user.colorvalue;
			stickmanUserColors[newId] = userColor;

			// Always broadcast in shared mode
			if (isShared && presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'new_stickman',
					content: {
						stickman: {
							id: newId,
							joints: newStickman.joints,
							baseFrame: baseFrames[newId],
							deltaFrames: deltaFrames[newId],
							currentFrameIndex: currentFrameIndices[newId]
						},
						color: userColor
					}
				});
			}

			selectedStickmanIndex = stickmen.length - 1;
			neckManuallyMoved = false;

			updateTimeline();
			updateRemoveButtonState();
		}

		function confirmationModal(stickmanId, stickmanToRemove) {
			const modalOverlay = document.createElement('div');
			modalOverlay.className = 'modal-overlay';

			const modal = document.createElement('div');
			modal.className = 'modal-content';

			const header = document.createElement('div');
			header.className = 'modal-header';

			const headerContent = document.createElement('div');
			headerContent.style.display = 'flex';
			headerContent.style.alignItems = 'center';
			headerContent.style.gap = '8px';

			const warningIcon = document.createElement('div');
			warningIcon.style.backgroundImage = "url('./icons/emblem-warning.svg')";
			warningIcon.style.backgroundSize = '40px 40px';
			warningIcon.style.backgroundRepeat = 'no-repeat';
			warningIcon.style.backgroundPosition = 'center';
			warningIcon.style.width = '40px';
			warningIcon.style.height = '40px';

			const title = document.createElement('h3');
			title.textContent = l10n.get("Warning") || "Warning";
			title.className = 'modal-title';

			headerContent.appendChild(warningIcon);
			headerContent.appendChild(title);

			const body = document.createElement('div');
			body.className = 'modal-body';

			const message = document.createElement('p');
			message.textContent = l10n.get("ConfirmRemoval");
			message.className = 'modal-message';

			// button container
			const buttonContainer = document.createElement('div');
			buttonContainer.className = 'modal-button-container';

			// cancel button
			const cancelButton = document.createElement('button');
			cancelButton.className = 'modal-button';
			cancelButton.innerHTML = `
				<span class="modal-button-icon modal-button-icon-cancel"></span>${l10n.get("Cancel") || "Cancel"}
			`;

			// confirm button
			const confirmButton = document.createElement('button');
			confirmButton.className = 'modal-button modal-button-confirm';
			confirmButton.innerHTML = `
				<span class="modal-button-icon modal-button-icon-minus"></span>${l10n.get("Remove") || "Remove"}
			`;

			cancelButton.onclick = () => {
				document.body.removeChild(modalOverlay);
			};

			confirmButton.onclick = () => {
				document.body.removeChild(modalOverlay);

				if (stickmen.length > 1) {
					const stickmanId = stickmen[stickmanToRemove].id;

					// Broadcast removal in shared mode BEFORE removing locally
					if (isShared && presence) {
						broadcastStickmanRemoval(stickmanId);
					}

					// Remove from current stickmen array
					stickmen.splice(stickmanToRemove, 1);

					// Remove stickman frames
					delete baseFrames[stickmanId];
					delete deltaFrames[stickmanId];
					delete currentFrameIndices[stickmanId];
					delete stickmanUserColors[stickmanId];

					// Adjust selected stickman index if needed
					if (selectedStickmanIndex === stickmanToRemove) {
						selectedJoint = null;
						selectedStickmanIndex = stickmen.length > 0 ? 0 : -1;
					} else if (selectedStickmanIndex > stickmanToRemove) {
						selectedStickmanIndex--;
					}

					updateTimeline();
					updateRemoveButtonState();

					// If only one stickman remains, automatically exit removal mode
					if (stickmen.length <= 1) {
						exitRemovalMode();
					}
				} else {
					console.error("Cannot remove the last stickman. At least one stickman must remain.");
				}
			};

			// Close modal when clicking overlay
			modalOverlay.onclick = (e) => {
				if (e.target === modalOverlay) {
					document.body.removeChild(modalOverlay);
				}
			};

			// Assemble modal
			header.appendChild(headerContent);
			body.appendChild(message);
			buttonContainer.appendChild(cancelButton);
			buttonContainer.appendChild(confirmButton);
			body.appendChild(buttonContainer);
			modal.appendChild(header);
			modal.appendChild(body);
			modalOverlay.appendChild(modal);

			// Add to page
			document.body.appendChild(modalOverlay);
		}

		function removeSelectedStickman() {
			// Check if only one stickman remains
			if (stickmen.length <= 1) {
				return;
			}

			if (!isRemovalMode) {
				isRemovalMode = true;
				document.getElementById('minus-button').style.backgroundColor = '#808080';
				canvas.style.cursor = 'crosshair';
			} else {
				exitRemovalMode();
			}
		}

		function updateRemoveButtonState() {
			const minusButton = document.getElementById('minus-button');

			minusButton.title = l10n.get("RemoveStickmanTooltip");
			if (stickmen.length <= 1) {
				minusButton.disabled = true;
			} else {
				minusButton.disabled = false;			
			}
		}

		function exitRemovalMode() {
			isRemovalMode = false;
			document.getElementById('minus-button').style.backgroundColor = '';
			canvas.style.cursor = 'default';
		}

		function updateMiddleJoint(stickmanIndex) {
			if (stickmanIndex >= 0 && stickmanIndex < stickmen.length && !neckManuallyMoved) {
				const joints = stickmen[stickmanIndex].joints;
				joints[11].x = (joints[1].x + joints[2].x) / 2;
				joints[11].y = (joints[1].y + joints[2].y) / 2;
			}
		}

		async function loadTemplate(templateName) {
			try {
				// Use XMLHttpRequest for Cordova compatibility
				const templateData = await new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open('GET', `js/templates/${templateName}.json`);
					xhr.responseType = 'json';
					xhr.onload = function() {
						if (xhr.status === 200 || xhr.status === 0) {
							if (xhr.response && typeof xhr.response === 'object') {
								resolve(xhr.response);
							} else {
								try {
									resolve(JSON.parse(xhr.responseText));
								} catch (e) {
									reject(e);
								}
							}
						} else {
							reject(new Error('Failed to load template: ' + xhr.status));
						}
					};
					xhr.onerror = function() {
						reject(new Error('XHR error'));
					};
					xhr.send();
				});

				// Check if this is journal-style format (with metadata and text)
				let savedData;
				if (templateData.metadata && templateData.text) {
					// This is journal-style format - parse the text field
					try {
						savedData = JSON.parse(templateData.text);
					} catch (parseError) {
						console.error('Error parsing template text data:', parseError);
						return;
					}
				} else {
					console.error('Unknown template format');
					return;
				}

				// Handle journal-style data format
				if (savedData.baseFrames && savedData.deltaFrames && savedData.currentFrameIndices) {
					const templateStickmen = [];

					// Process each stickman from the template data
					Object.keys(savedData.baseFrames).forEach((originalStickmanId, index) => {
						try {
							// Create new ID for template stickman - always use current user as owner
							let newStickmanId;
							if (currentenv && currentenv.user) {
								newStickmanId = `${currentenv.user.networkId}_${Date.now()}_template_${index}`;
							} else {
								newStickmanId = nextStickmanId++;
							}

							// Copy the animation data
							const baseFrame = savedData.baseFrames[originalStickmanId];
							const deltaFramesList = savedData.deltaFrames[originalStickmanId] || [];
							const frameIndex = savedData.currentFrameIndices[originalStickmanId] || 0;

							if (baseFrame && Array.isArray(baseFrame)) {
								// Store the animation data
								baseFrames[newStickmanId] = deepClone(baseFrame);
								deltaFrames[newStickmanId] = deepClone(deltaFramesList);
								currentFrameIndices[newStickmanId] = 0; // Start from first frame

								// Assign current user's color to template stickman (ignore original buddy color)
								if (currentenv && currentenv.user && currentenv.user.colorvalue) {
									stickmanUserColors[newStickmanId] = currentenv.user.colorvalue;
								}

								// Reconstruct the first frame to create the stickman
								const reconstructedFrame = reconstructFrameFromDeltas(newStickmanId, 0);
								if (reconstructedFrame && reconstructedFrame.joints) {
									// Position the template stickman to avoid collision with existing stickmen
									const existingStickmenCount = stickmen.length;
									const templateStickmenCount = Object.keys(savedData.baseFrames).length;

									// Calculate safe position considering existing stickmen
									let centerX, centerY;
									if (existingStickmenCount === 0) {
										// No existing stickmen - use canvas center
										centerX = canvas.width / 2 + (index * 150) - (templateStickmenCount - 1) * 75;
										centerY = canvas.height / 2;
									} else {
										// Try to place template stickman without overlapping existing ones
										const stickmanHeight = 160;
										const stickmanWidth = 80;
										const margin = 50;

										const minX = stickmanWidth / 2 + margin;
										const maxX = canvas.width - stickmanWidth / 2 - margin;
										const minY = 65 + margin;
										const maxY = canvas.height - 95 - margin;

										let attempts = 0;
										const maxAttempts = 20;
										const minDistance = 120;

										do {
											centerX = Math.random() * (maxX - minX) + minX;
											centerY = Math.random() * (maxY - minY) + minY;

											const isTooClose = stickmen.some(existingStickman => {
												const existingCenter = existingStickman.joints[11] || existingStickman.joints[2];
												const distance = Math.sqrt(
													Math.pow(centerX - existingCenter.x, 2) +
													Math.pow(centerY - existingCenter.y, 2)
												);
												return distance < minDistance;
											});

											if (!isTooClose) break;
											attempts++;
										} while (attempts < maxAttempts);

										// If couldn't find safe position, offset from canvas center
										if (attempts >= maxAttempts) {
											centerX = canvas.width / 2 + (existingStickmenCount + index) * 100;
											centerY = canvas.height / 2;
										}
									}

									// Calculate current center of the stickman
									const currentCenter = {
										x: (Math.max(...reconstructedFrame.joints.map(p => p.x)) + Math.min(...reconstructedFrame.joints.map(p => p.x))) / 2,
										y: (Math.max(...reconstructedFrame.joints.map(p => p.y)) + Math.min(...reconstructedFrame.joints.map(p => p.y))) / 2
									};

									const offsetX = centerX - currentCenter.x;
									const offsetY = centerY - currentCenter.y;

									// Apply offset to base frame
									baseFrames[newStickmanId] = baseFrames[newStickmanId].map(joint => ({
										x: joint.x + offsetX,
										y: joint.y + offsetY,
										name: joint.name
									}));

									// Reconstruct with new position
									const finalFrame = reconstructFrameFromDeltas(newStickmanId, 0);
									if (finalFrame) {
										stickmen.push(finalFrame);
										templateStickmen.push({
											stickman: {
												id: newStickmanId,
												joints: finalFrame.joints,
												baseFrame: baseFrames[newStickmanId],
												deltaFrames: deltaFrames[newStickmanId],
												currentFrameIndex: currentFrameIndices[newStickmanId]
											},
											color: stickmanUserColors[newStickmanId]
										});
									}
								}
							}
						} catch (stickmanError) {
							console.error('Error processing template stickman:', originalStickmanId, stickmanError);
						}
					});

					// In shared mode, broadcast all template stickmen to other users
					if (isShared && presence && templateStickmen.length > 0) {
						templateStickmen.forEach(templateStickmanData => {
							presence.sendMessage(presence.getSharedInfo().id, {
								user: presence.getUserInfo(),
								action: 'new_stickman',
								content: templateStickmanData
							});
						});
					}
				} else {
					console.error('Template data missing required fields');
				}

				// Set up UI state - select the newly added template stickman
				if (stickmen.length > 0) {
					selectedStickmanIndex = stickmen.length - 1; // Select the newly added template stickman
				} else {
					selectedStickmanIndex = -1;
				}
				neckManuallyMoved = false;

				// Update middle joints for all stickmen
				stickmen.forEach((_, index) => updateMiddleJoint(index));

				updateTimeline();
				updateRemoveButtonState();
				render();

			} catch (error) {
				console.error('Error loading template:', error);
				createInitialStickman();
			}
		}

		// FRAME MANAGEMENT

		function addFrame() {
			// If no stickman is selected, add frame for all stickmen Otherwise, add frame only for selected stickman
			const targetStickmanIndices = selectedStickmanIndex >= 0 ?
				[selectedStickmanIndex] : stickmen.map((_, index) => index);

			// Filter to only include owned stickmen in shared mode
			const allowedIndices = targetStickmanIndices.filter(index => {
				if (!isShared || !presence) return true;

				const stickmanId = stickmen[index].id;
				return isStickmanOwned(stickmanId);
			});

			if (allowedIndices.length === 0) {
				return;
			}

			allowedIndices.forEach(index => {
				updateMiddleJoint(index);

				const stickman = stickmen[index];
				const stickmanId = stickman.id;

				// Ensure current stickman joints have proper distances before processing
				enforceJointDistances(stickman.joints);

				if (!baseFrames[stickmanId]) {
					// First frame - create base frame
					baseFrames[stickmanId] = JSON.parse(JSON.stringify(stickman.joints));
					deltaFrames[stickmanId] = [];
					currentFrameIndices[stickmanId] = 0;
				} else {
					// Additional frame - calculate delta from current position
					const currentFrameIndex = currentFrameIndices[stickmanId];
					const previousFrame = reconstructFrameFromDeltas(stickmanId, currentFrameIndex);

					if (previousFrame) {
						const delta = calculateDeltas(stickman.joints, previousFrame.joints);
						if (delta) {
							deltaFrames[stickmanId].push(delta);
							// Update current frame index to the new frame
							const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;
							currentFrameIndices[stickmanId] = totalFrames - 1;
						}
					}
				}
			});

			neckManuallyMoved = false;
			updateTimeline();
		}

		function saveCurrentFrame() {
			// If no stickman is selected or being manipulated, save all stickmen Otherwise, save only the selected stickman
			const targetStickmanIndices = selectedStickmanIndex >= 0 ? [selectedStickmanIndex] : stickmen.map((_, index) => index);

			targetStickmanIndices.forEach(index => {
				const stickman = stickmen[index];
				const stickmanId = stickman.id;

				// Skip if no frames for this stickman
				if (!baseFrames[stickmanId]) {
					return;
				}

				const isNeckOperation = (isRotating || isDragging) && selectedJoint &&
					stickmen[index] === stickman &&
					stickmen[index].joints.indexOf(selectedJoint) === 1;

				if (!isNeckOperation) {
					updateMiddleJoint(index);
				}

				// Enforce joint distance constraints before saving
				enforceJointDistances(stickman.joints);

				const currentFrameIndex = currentFrameIndices[stickmanId];
				const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;

				if (currentFrameIndex === 0) {
					// Update base frame
					baseFrames[stickmanId] = JSON.parse(JSON.stringify(stickman.joints));

					// Recompute ALL deltas since base frame changed
					const newDeltas = [];
					for (let i = 1; i < totalFrames; i++) {
						const frame = reconstructFrameFromDeltas(stickmanId, i);
						const prevFrame = reconstructFrameFromDeltas(stickmanId, i - 1);

						if (frame && prevFrame) {
							const delta = calculateDeltas(frame.joints, prevFrame.joints);
							if (delta) {
								newDeltas.push(delta);
							}
						}
					}
					deltaFrames[stickmanId] = newDeltas;

				} else if (currentFrameIndex > 0) {
					// Update a delta frame - need to recompute this and all subsequent deltas
					const deltaIndex = currentFrameIndex - 1;

					if (deltaIndex >= 0 && deltaIndex < deltaFrames[stickmanId].length) {
						// First, temporarily store the current stickman position
						const currentJoints = JSON.parse(JSON.stringify(stickman.joints));

						// Get the previous frame
						const previousFrame = reconstructFrameFromDeltas(stickmanId, currentFrameIndex - 1);

						if (previousFrame) {
							// Calculate new delta for current frame
							const newDelta = calculateDeltas(currentJoints, previousFrame.joints);
							if (newDelta) {
								deltaFrames[stickmanId][deltaIndex] = newDelta;
							}

							// Now recompute all subsequent deltas
							for (let i = currentFrameIndex + 1; i < totalFrames; i++) {
								const nextFrameOld = reconstructFrameFromDeltas(stickmanId, i);
								const prevFrameNew = reconstructFrameFromDeltas(stickmanId, i - 1);

								if (nextFrameOld && prevFrameNew) {
									const subsequentDelta = calculateDeltas(nextFrameOld.joints, prevFrameNew.joints);
									if (subsequentDelta) {
										deltaFrames[stickmanId][i - 1] = subsequentDelta;
									}
								}
							}
						}
					}
				}
			});

			// Sync updates in shared mode
			if (isShared && selectedStickmanIndex >= 0) {
				const stickman = stickmen[selectedStickmanIndex];
				const stickmanId = stickman.id;

				if (isHost) {
					// Host broadcasts updates to all
					presence.sendMessage({
						type: 'stickman_update',
						stickmanId: stickmanId,
						baseFrame: baseFrames[stickmanId],
						deltaFrames: deltaFrames[stickmanId],
						currentFrameIndex: currentFrameIndices[stickmanId]
					});
				} else {
					// Non-hosts send updates only to host
					presence.sendMessage({
						type: 'stickman_update_request',
						stickmanId: stickmanId,
						baseFrame: baseFrames[stickmanId],
						deltaFrames: deltaFrames[stickmanId],
						currentFrameIndex: currentFrameIndices[stickmanId]
					});
				}
			}
		}

		// TIMELINE FUNCTIONS

		function updateTimeline() {
			const timeline = document.getElementById('timeline');
			timeline.innerHTML = '';

			// If no stickmen exist, don't show timeline
			if (stickmen.length === 0) {
				return;
			}

			// Get the currently selected stickman (or first one if none selected)
			const stickmanIndex = selectedStickmanIndex >= 0 ? selectedStickmanIndex : 0;
			const selectedStickman = stickmen[stickmanIndex];
			const stickmanId = selectedStickman.id;

			// Check ownership in shared mode
			let isOwnStickman = true;
			if (isShared && presence) {
				isOwnStickman = isStickmanOwned(stickmanId);
			}

			// Only show frames if user owns the stickman
			if (!isOwnStickman) {
				// For non-owned stickmen, show empty timeline
				return;
			}

			const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;
			const currentFrameIndex = currentFrameIndices[stickmanId] || 0;

			// For each frame of the selected stickman, create a preview
			for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
				const frameContainer = document.createElement('div');
				frameContainer.className = 'frame-container';

				const frameData = reconstructFrameFromDeltas(stickmanId, frameIndex);
				const previewCanvas = createPreviewCanvas(frameData, frameIndex, stickmanId);
				const deleteBtn = createDeleteButton(frameIndex, stickmanId);

				previewCanvas.addEventListener('click', () => {
					if (isShared && presence) {
						if (!isStickmanOwned(stickmanId)) {
							return;
						}
					}

					currentFrameIndices[stickmanId] = frameIndex;

					const newFrameData = reconstructFrameFromDeltas(stickmanId, frameIndex);
					if (newFrameData) {
						stickmen[stickmanIndex] = newFrameData;

						neckManuallyMoved = false; // Reset flag when switching frames
						updateMiddleJoint(stickmanIndex);
						updateTimeline();
						render();
					}
				});

				frameContainer.appendChild(previewCanvas);
				frameContainer.appendChild(deleteBtn);
				timeline.appendChild(frameContainer);
			}

			// Scroll to active frame inline
			const activeFrame = timeline.querySelector('.frame.active');
			if (activeFrame) {
				const timelineRect = timeline.getBoundingClientRect();
				const activeFrameRect = activeFrame.getBoundingClientRect();

				if (activeFrameRect.right > timelineRect.right || activeFrameRect.left < timelineRect.left) {
					activeFrame.scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
						inline: 'center'
					});
				}
			}
		}

		function createPreviewCanvas(frameData, index, stickmanId) {
			const previewCanvas = document.createElement('canvas');
			previewCanvas.width = 80;
			previewCanvas.height = 80;

			const isActive = index === currentFrameIndices[stickmanId];
			previewCanvas.className = `frame ${isActive ? 'active' : ''}`;

			const previewCtx = previewCanvas.getContext('2d');
			previewCtx.fillStyle = isActive ? '#e6f3ff' : '#ffffff';
			previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

			// Draw the stickman frame data
			if (frameData && frameData.joints) {
				const joints = frameData.joints;

				// Calculate bounds for this single stickman
				const stickmanHeight = Math.max(...joints.map(p => p.y)) - Math.min(...joints.map(p => p.y));
				const stickmanWidth = Math.max(...joints.map(p => p.x)) - Math.min(...joints.map(p => p.x));
				const scale = Math.min(40 / stickmanHeight, 40 / stickmanWidth);

				const centerX = (Math.max(...joints.map(p => p.x)) + Math.min(...joints.map(p => p.x))) / 2;
				const centerY = (Math.max(...joints.map(p => p.y)) + Math.min(...joints.map(p => p.y))) / 2;

				previewCtx.save();
				previewCtx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
				previewCtx.scale(scale, scale);
				previewCtx.translate(-centerX, -centerY);

				// Draw stickman in preview
				drawStickmanPreview(previewCtx, joints);

				previewCtx.restore();
			}

			return previewCanvas;
		}

		function createDeleteButton(frameIndex, stickmanId) {
			const deleteBtn = document.createElement('button');
			deleteBtn.className = 'delete-frame';
			deleteBtn.innerHTML = '';
			deleteBtn.addEventListener('click', (e) => {
				e.stopPropagation();

				if (isShared && presence) {
					if (!isStickmanOwned(stickmanId)) {
						return;
					}
				}

				const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;

				if (totalFrames > 1) {
					// Remove this frame using delta system
					if (frameIndex === 0) {
						// Removing base frame - promote second frame to base
						const secondFrame = reconstructFrameFromDeltas(stickmanId, 1);

						if (secondFrame) {
							baseFrames[stickmanId] = secondFrame.joints;

							// Remove first delta and recompute remaining deltas
							deltaFrames[stickmanId].shift();

							// Recompute all remaining deltas relative to new base
							const newDeltas = [];

							for (let i = 1; i < deltaFrames[stickmanId].length + 1; i++) {
								const currentFrame = reconstructFrameFromDeltas(stickmanId, i);
								const previousFrame = reconstructFrameFromDeltas(stickmanId, i - 1);

								if (currentFrame && previousFrame) {
									const delta = calculateDeltas(currentFrame.joints, previousFrame.joints);
									if (delta) newDeltas.push(delta);
								}
							}

							deltaFrames[stickmanId] = newDeltas;
						}
					} else {
						// Remove delta frame and rebase subsequent deltas
						rebaseDeltas(stickmanId, frameIndex);
					}

					// Adjust current frame index if needed
					const newTotalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;
					currentFrameIndices[stickmanId] = Math.min(
						currentFrameIndices[stickmanId],
						newTotalFrames - 1
					);

					// Find the stickman with this ID in the current stickmen array
					for (let i = 0; i < stickmen.length; i++) {
						if (stickmen[i].id === stickmanId) {
							const newFrameIndex = currentFrameIndices[stickmanId];
							const newFrameData = reconstructFrameFromDeltas(stickmanId, newFrameIndex);

							if (newFrameData) {
								stickmen[i] = newFrameData;
								neckManuallyMoved = false;
								updateMiddleJoint(i);
							}

							break;
						}
					}
					updateTimeline();
				}
			});
			return deleteBtn;
		}

		// DRAWING FUNCTIONS

		function drawStickmanPreview(ctx, joints) {
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			drawStickmanSkeleton(ctx, joints);

			joints.forEach((joint, index) => {
				if (index === 11)
					return;
				
				// Different colors for different joint types
				if (index === 2) {
					// Hip joint - green
					ctx.fillStyle = '#00ff00';
				} else if (index === 1 || index === 3 || index === 5 || index === 7 || index === 9) {
					// Middle joints (neck, knees, elbows) - orange
					ctx.fillStyle = '#ff8800';
				} else {
					// End joints (head, hands, feet) - red
					ctx.fillStyle = '#ff0000';
				}
				
				ctx.beginPath();
				if (index === 0) {
					ctx.arc(joint.x, joint.y, 3, 0, Math.PI * 2);
				} else {
					ctx.arc(joint.x, joint.y, 2, 0, Math.PI * 2);
				}
				ctx.fill();
			});
		}

		function drawAllStickmen() {
			stickmen.forEach((stickman, stickmanIndex) => {
				drawStickman(stickman.joints, stickmanIndex);
			});
		}

		function drawStickman(joints, stickmanIndex) {
			const stickmanId = stickmen[stickmanIndex].id;
			const isOwnStickman = isStickmanOwned(stickmanId);

			// Apply remote offset if this is a remote stickman
			let displayJoints = joints;
			if (!isOwnStickman && remoteStickmanPositions[stickmanId]) {
				const offsetX = remoteStickmanPositions[stickmanId].offsetX || 0;
				const offsetY = remoteStickmanPositions[stickmanId].offsetY || 0;

				displayJoints = joints.map(joint => ({
					x: joint.x + offsetX,
					y: joint.y + offsetY,
					name: joint.name
				}));
			}

			// Draw with different style for remote stickmen
			if (!isOwnStickman) {
				// Get user color for remote stickman
				let userColor = null;
				if (stickmanUserColors[stickmanId]) {
					userColor = stickmanUserColors[stickmanId];
				}

				// Draw solid black skeleton for remote stickmen
				drawStickmanSkeleton(ctx, displayJoints, userColor, isOwnStickman);

				// Only show hip joint for dragging
				const hipJoint = displayJoints[2];
				ctx.fillStyle = '#00ff00';
				ctx.strokeStyle = '#00cc00';
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(hipJoint.x, hipJoint.y, 5, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();

				return; // Skip normal drawing for remote stickmen
			}

			// Original drawing code for owned stickmen
			// skeleton first
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			// Get user color and ownership info
			let userColor = null;

			if (stickmanIndex < stickmen.length) {
				const stickmanId = stickmen[stickmanIndex].id;

				// Only get color for OTHER users' stickmen
				if (!isOwnStickman && stickmanUserColors[stickmanId]) {
					userColor = stickmanUserColors[stickmanId];
				}
			}

			drawStickmanSkeleton(ctx, displayJoints, userColor, isOwnStickman);

			// Show joints for selected stickman, or first stickman if none selected
			const shouldShowJoints = (selectedStickmanIndex >= 0)
				? stickmanIndex === selectedStickmanIndex
				: stickmanIndex === 0;

			// Only draw joints if the stickman is owned by current user (or not in shared mode)
			const canShowJoints = !isShared || isOwnStickman;

			if (shouldShowJoints && canShowJoints) {
				displayJoints.forEach((joint, index) => {
					if (index === 11)
						return; // Skip middle joint in regular drawing

					// Different colors for different joint types
					if (index === 2) {
						// Hip joint - green
						ctx.fillStyle = '#00ff00';
						ctx.strokeStyle = '#00cc00';
					} else if (index === 1 || index === 3 || index === 5 || index === 7 || index === 9) {
						// Middle joints (neck, knees, elbows) - orange
						ctx.fillStyle = '#ff8800';
						ctx.strokeStyle = '#cc6600';
					} else {
						// End joints (head, hands, feet) - red
						ctx.fillStyle = '#ff0000';
						ctx.strokeStyle = '#cc0000';
					}

					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.arc(joint.x, joint.y, 4, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				});

				// Draw middle joint only for owned stickmen - orange
				const middleJoint = displayJoints[11];
				ctx.fillStyle = '#ff8800';
				ctx.strokeStyle = '#cc6600';
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(middleJoint.x, middleJoint.y, 4, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			} else if (shouldShowJoints && !isOwnStickman) {
				// For remote stickmen, only show the hip joint
				const hipJoint = displayJoints[2];
				ctx.fillStyle = '#00ff00';
				ctx.strokeStyle = '#00cc00';
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(hipJoint.x, hipJoint.y, 4, 0, Math.PI * 2); // Same size as owned stickmen
				ctx.fill();
				ctx.stroke();
			}
		}

		function drawStickmanSkeleton(ctx, joints, userColor = null, isOwnStickman = true) {
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 12;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			// body line
			ctx.beginPath();
			ctx.moveTo(joints[0].x, joints[0].y);
			ctx.lineTo(joints[1].x, joints[1].y);
			if (joints[11]) {
				ctx.lineTo(joints[11].x, joints[11].y);
			}
			ctx.lineTo(joints[2].x, joints[2].y);
			ctx.stroke();

			// left leg
			ctx.beginPath();
			ctx.moveTo(joints[2].x, joints[2].y); // hips
			ctx.lineTo(joints[3].x, joints[3].y); // left knee
			ctx.lineTo(joints[4].x, joints[4].y); // left foot
			ctx.stroke();

			// right leg
			ctx.beginPath();
			ctx.moveTo(joints[2].x, joints[2].y); // hips
			ctx.lineTo(joints[5].x, joints[5].y); // right knee
			ctx.lineTo(joints[6].x, joints[6].y); // right foot
			ctx.stroke();

			// left arm
			ctx.beginPath();
			ctx.moveTo(joints[1].x, joints[1].y); // body
			ctx.lineTo(joints[7].x, joints[7].y); // left elbow
			ctx.lineTo(joints[8].x, joints[8].y); // left hand
			ctx.stroke();

			// right arm
			ctx.beginPath();
			ctx.moveTo(joints[1].x, joints[1].y);    // body
			ctx.lineTo(joints[9].x, joints[9].y);    // right elbow
			ctx.lineTo(joints[10].x, joints[10].y);  // right hand
			ctx.stroke();

			// head circle - use color only for OTHER users' stickmen
			ctx.beginPath();
			ctx.arc(joints[0].x, joints[0].y, 17, 0, Math.PI * 2);
			if (!isOwnStickman && userColor) {
				// Other user's stickman - use their color
				ctx.fillStyle = userColor.stroke || '#000000';
			} else {
				// Own stickman - always black
				ctx.fillStyle = '#000000';
			}
			ctx.fill();

			if (!isOwnStickman && userColor) {
				ctx.beginPath();
				ctx.arc(joints[0].x, joints[0].y, 6, 0, Math.PI * 2);
				ctx.fillStyle = userColor.fill || userColor.stroke || '#ffffff';
				ctx.fill();

				// Add a small border to the center dot for better visibility
				ctx.beginPath();
				ctx.arc(joints[0].x, joints[0].y, 6, 0, Math.PI * 2);
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Restore context state
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 12;
		}

		// HIERARCHICAL ROTATION SYSTEM

		function rotatePointAroundPivot(point, pivot, angle) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const dx = point.x - pivot.x;
			const dy = point.y - pivot.y;

			return {
				x: pivot.x + (dx * cos - dy * sin),
				y: pivot.y + (dx * sin + dy * cos)
			};
		}

		function rotateJointHierarchy(stickmanIndex, pivotJointIndex, angle) {
			const joints = stickmen[stickmanIndex].joints;
			let pivot;
			let pivotJointIndex_actual; // The joint that acts as the actual rotation pivot

			// Determine the actual pivot point for rotation
			if (pivotJointIndex === 11) {
				// middle joint rotates around hip
				pivot = joints[2];
				pivotJointIndex_actual = 2;
			} else if (pivotJointIndex === 1) {
				// body/neck rotates around middle joint
				pivot = joints[11];
				pivotJointIndex_actual = 11;
			} else if (pivotJointIndex === 7 || pivotJointIndex === 9) {
				// elbows rotate around body
				pivot = joints[1];
				pivotJointIndex_actual = 1;
			} else if (pivotJointIndex === 3 || pivotJointIndex === 5) {
				// knees rotate around hip
				pivot = joints[2];
				pivotJointIndex_actual = 2;
			} else {
				pivot = joints[pivotJointIndex];
				pivotJointIndex_actual = pivotJointIndex;
			}

			// Store pivot position to prevent it from changing during rotation
			const fixedPivot = {
				x: pivot.x,
				y: pivot.y
			};

			// Rotate all child joints recursively
			function rotateChildren(parentIndex, rotationAngle) {
				const childIndices = jointHierarchy[parentIndex] || [];

				childIndices.forEach(childIndex => {
					// Never rotate the pivot joint itself
					if (childIndex === pivotJointIndex_actual) return;

					const oldPos = {
						x: joints[childIndex].x,
						y: joints[childIndex].y
					};
					const newPos = rotatePointAroundPivot(oldPos, fixedPivot, rotationAngle);
					joints[childIndex].x = newPos.x;
					joints[childIndex].y = newPos.y;

					// Recursively rotate children of this joint
					rotateChildren(childIndex, rotationAngle);
				});
			}

			// First rotate the selected joint itself around its pivot (except pivot joints)
			if (pivotJointIndex !== pivotJointIndex_actual) {
				const oldPos = {
					x: joints[pivotJointIndex].x,
					y: joints[pivotJointIndex].y
				};
				const newPos = rotatePointAroundPivot(oldPos, fixedPivot, angle);
				joints[pivotJointIndex].x = newPos.x;
				joints[pivotJointIndex].y = newPos.y;
			}

			// Then rotate all children
			rotateChildren(pivotJointIndex, angle);

			// Ensure pivot joint position is preserved (especially important for middle joint)
			if (pivotJointIndex_actual < joints.length) {
				joints[pivotJointIndex_actual].x = fixedPivot.x;
				joints[pivotJointIndex_actual].y = fixedPivot.y;
			}
		}

		function getAngle(point1, point2) {
			return Math.atan2(point2.y - point1.y, point2.x - point1.x);
		}

		function isRotationalJoint(jointIndex) {
			// These joints support rotation with hierarchical movement
			return [1, 2, 3, 5, 7, 9, 11].includes(jointIndex);
		}

		function getRotationPivot(stickmanIndex, jointIndex) {
			const joints = stickmen[stickmanIndex].joints;

			// Define pivot mapping for rotational joints
			const pivotMap = {
				11: joints[2],  // middle joint rotates around hip
				1: { x: joints[11].x, y: joints[11].y },  // body/neck rotates around middle joint
				7: joints[1],   // left elbow rotates around body
				9: joints[1],   // right elbow rotates around body
				3: joints[2],   // left knee rotates around hip
				5: joints[2]    // right knee rotates around hip
			};

			return pivotMap[jointIndex] || joints[jointIndex]; // fallback to joint itself
		}

		// ANIMATION CONTROL

		function togglePlayPause() {
			if (isPlaying) {
				pause();
			} else {
				play();
			}
		}

		function play() {
			if (!isPlaying) {
				isPlaying = true;
				document.getElementById('play-pause-button').style.backgroundImage = "url('icons/pause.svg')";
				animate();
			}
		}

		function pause() {
			isPlaying = false;
			document.getElementById('play-pause-button').style.backgroundImage = "url('icons/play.svg')";
		}

		function animate() {
			if (!isPlaying)
				return;

			stickmen.forEach((stickman, index) => {
				const stickmanId = stickman.id;
				const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;

				if (totalFrames > 1) {
					// Only animate if there are multiple frames
					// Move to next frame for this stickman
					currentFrameIndices[stickmanId] = (currentFrameIndices[stickmanId] + 1) % totalFrames;
					const newFrameIndex = currentFrameIndices[stickmanId];

					const newFrameData = reconstructFrameFromDeltas(stickmanId, newFrameIndex);
					if (newFrameData) {
						stickmen[index] = newFrameData;
						updateMiddleJoint(index);
					}
				}
			});

			neckManuallyMoved = false;
			updateTimeline();

			setTimeout(() => {
				requestAnimationFrame(animate);
			}, 1000 / (currentSpeed * 2));
		}

		// MOUSE INTERACTION

		function handleMouseDown(e) {
			const { mouseX, mouseY } = getCanvasCoordinates(e);
			const result = findJointAtPosition(mouseX, mouseY);

			if (isRemovalMode && result) {
				// Remove the clicked stickman - only allow removing own stickmen in shared mode
				const stickmanToRemove = result.stickmanIndex;
				const stickmanId = stickmen[stickmanToRemove].id;

				// Check ownership in shared mode
				if (isShared && presence) {
					if (!isStickmanOwned(stickmanId)) {
						return; // Simply return without any action
					}
				}

				// Only show confirmation if there's more than one stickman AND the stickman has more than one frame
				const totalFrames = baseFrames[stickmanId] ? 1 + (deltaFrames[stickmanId] ? deltaFrames[stickmanId].length : 0) : 0;
				const shouldShowConfirmation = stickmen.length > 1 && totalFrames > 1;

				if (shouldShowConfirmation) {
					confirmationModal(stickmanId, stickmanToRemove);
				} else {
					// Directly remove without confirmation
					if (stickmen.length > 1) {
						// Broadcast removal in shared mode before removing locally
						if (isShared && presence) {
							broadcastStickmanRemoval(stickmanId);
						}

						stickmen.splice(stickmanToRemove, 1);

						// Remove stickman frames
						delete baseFrames[stickmanId];
						delete deltaFrames[stickmanId];
						delete currentFrameIndices[stickmanId];
						delete stickmanUserColors[stickmanId];

						// Adjust selected stickman index if needed
						if (selectedStickmanIndex === stickmanToRemove) {
							selectedJoint = null;
							selectedStickmanIndex = stickmen.length > 0 ? 0 : -1;
						} else if (selectedStickmanIndex > stickmanToRemove) {
							selectedStickmanIndex--;
						}

						updateTimeline();
						updateRemoveButtonState();

						// If only one stickman remains, automatically exit removal mode
						if (stickmen.length <= 1) {
							exitRemovalMode();
						}
					}
				}
				return;
			} if (isRemovalMode) {
				// Stay in removal mode when clicking on canvas - don't exit
				return;
			}

			// Normal selection 
			if (result) {
				const stickmanIndex = result.stickmanIndex;
				const stickmanId = stickmen[stickmanIndex].id;

				// Check ownership
				const isOwnStickman = isStickmanOwned(stickmanId);

				// For remote stickmen, only allow dragging via hip joint
				if (!isOwnStickman) {
					const selectedJointIndex = stickmen[stickmanIndex].joints.indexOf(result.joint);

					// Only allow dragging remote stickmen by the hip joint
					if (selectedJointIndex !== 2) {
						return;
					}

					selectedJoint = result.joint;
					selectedStickmanIndex = result.stickmanIndex;

					// Store original positions for local dragging only
					if (!remoteStickmanPositions[stickmanId]) {
						remoteStickmanPositions[stickmanId] = {
							offsetX: 0,
							offsetY: 0,
							originalJoints: deepClone(stickmen[stickmanIndex].joints)
						};
					}
					
					// Record the starting offset for this drag operation
					// This allows us to continue from the current visual position
					const startingOffsetX = remoteStickmanPositions[stickmanId].offsetX || 0;
					const startingOffsetY = remoteStickmanPositions[stickmanId].offsetY || 0;
					
					// Store these for use in mouse move
					remoteStickmanPositions[stickmanId].dragStartOffsetX = startingOffsetX;
					remoteStickmanPositions[stickmanId].dragStartOffsetY = startingOffsetY;

					// Start remote stickman drag
					isDraggingRemote = true;
					isDraggingWhole = true;
					dragStartPos = {
						x: mouseX,
						y: mouseY
					};

					return;
				}

				const previousSelectedIndex = selectedStickmanIndex;
				selectedJoint = result.joint;
				selectedStickmanIndex = result.stickmanIndex;

				// Update timeline if selected stickman changed
				if (previousSelectedIndex !== selectedStickmanIndex) {
					updateTimeline();
				}

				const selectedJointIndex = stickmen[selectedStickmanIndex].joints.indexOf(selectedJoint);

				originalJoints = deepClone(stickmen[selectedStickmanIndex].joints);

				// create frame if none exists at current position for this stickman
				const stickman = stickmen[selectedStickmanIndex];
				const stickmanIdSelected = stickman.id;
				if (!baseFrames[stickmanIdSelected]) {
					updateMiddleJoint(selectedStickmanIndex);
					enforceJointDistances(stickman.joints);
					baseFrames[stickmanIdSelected] = deepClone(stickman.joints);
					deltaFrames[stickmanIdSelected] = [];
					currentFrameIndices[stickmanIdSelected] = 0;
					updateTimeline();
				}

				if (selectedJointIndex === 2) {
					// Hip joint - drag whole stickman
					isDraggingWhole = true;
					dragStartPos = {
						x: mouseX,
						y: mouseY
					};
				} else if (isRotationalJoint(selectedJointIndex)) {
					// Start rotation for hierarchical joints
					isRotating = true;
					rotationPivot = getRotationPivot(selectedStickmanIndex, selectedJointIndex);
					rotationStartAngle = getAngle(
						rotationPivot, {
						x: mouseX,
						y: mouseY
					}
					);
				} else {
					// Regular joint dragging for non-hierarchical joints (head, hands, feet)
					isDragging = true;
				}
			} else {
				const previousSelectedIndex = selectedStickmanIndex;
				selectedJoint = null;
				selectedStickmanIndex = -1;
				originalJoints = [];

				// Update timeline if selection was cleared
				if (previousSelectedIndex !== -1) {
					updateTimeline();
				}
			}
		}

		function handleMouseMove(e) {
			const { mouseX, mouseY } = getCanvasCoordinates(e);

			if (isDraggingRemote && selectedStickmanIndex >= 0) {
				// Drag remote stickman locally only
				const stickmanId = stickmen[selectedStickmanIndex].id;
				const remoteData = remoteStickmanPositions[stickmanId];

				if (!remoteData) return;

				const deltaX = mouseX - dragStartPos.x;
				const deltaY = mouseY - dragStartPos.y;

				// Apply movement delta to the starting offset position, this ensures we continue from where the stickman was visually positioned
				const startingOffsetX = remoteData.dragStartOffsetX || 0;
				const startingOffsetY = remoteData.dragStartOffsetY || 0;
				
				remoteStickmanPositions[stickmanId].offsetX = startingOffsetX + deltaX;
				remoteStickmanPositions[stickmanId].offsetY = startingOffsetY + deltaY;

				// No broadcast for remote stickman movement - local only
				render();
			} else if (isDraggingWhole && selectedStickmanIndex >= 0) {
				// Drag entire stickman using hip as anchor
				const deltaX = mouseX - dragStartPos.x;
				const deltaY = mouseY - dragStartPos.y;

				stickmen[selectedStickmanIndex].joints.forEach((joint, index) => {
					joint.x = originalJoints[index].x + deltaX;
					joint.y = originalJoints[index].y + deltaY;
				});

				// Check if this is a remote stickman
				const stickmanId = stickmen[selectedStickmanIndex].id;
				const isOwnStickman = isStickmanOwned(stickmanId);

				if (isOwnStickman) {
					if (isShared && presence) {
						broadcastStickmanMovement(selectedStickmanIndex, 'drag_whole');
					}
					saveCurrentFrame();
					updateTimeline();
				} else {
					// For remote stickmen, broadcast the movement as remote movement
					if (isShared && presence) {
						broadcastRemoteStickmanMovement(selectedStickmanIndex, 'drag_whole');
					}
				}
			} else if (isRotating && selectedJoint && selectedStickmanIndex >= 0 && rotationPivot) {
				// Hierarchical rotation
				const currentAngle = getAngle(rotationPivot, { x: mouseX, y: mouseY });
				const angleDiff = currentAngle - rotationStartAngle;

				const selectedJointIndex = stickmen[selectedStickmanIndex].joints.indexOf(selectedJoint);

				// Reset to original positions before applying rotation
				stickmen[selectedStickmanIndex].joints.forEach((joint, index) => {
					joint.x = originalJoints[index].x;
					joint.y = originalJoints[index].y;
				});

				// Apply rotation
				rotateJointHierarchy(selectedStickmanIndex, selectedJointIndex, angleDiff);

				// Enforce joint distance constraints after rotation
				enforceJointDistances(stickmen[selectedStickmanIndex].joints);

				// Mark neck as manually moved if we're rotating the neck joint
				if (selectedJointIndex === 1) {
					neckManuallyMoved = true;
				}

				// Only update middle joint position if we're not rotating the neck
				if (selectedJointIndex !== 1) {
					updateMiddleJoint(selectedStickmanIndex);
				}

				// Broadcast real-time rotation in shared mode
				if (isShared && presence) {
					broadcastStickmanMovement(selectedStickmanIndex, 'rotate', {
						jointIndex: selectedJointIndex,
						angle: angleDiff
					});
				}

				saveCurrentFrame();
				updateTimeline();
			} else if (isDragging && selectedJoint && selectedStickmanIndex >= 0) {
				const selectedJointIndex = stickmen[selectedStickmanIndex].joints.indexOf(selectedJoint);

				selectedJoint.x = mouseX;
				selectedJoint.y = mouseY;

				// Mark neck as manually moved if we're dragging the neck joint
				if (selectedJointIndex === 1) {
					neckManuallyMoved = true;
				}

				enforceJointDistances(stickmen[selectedStickmanIndex].joints);

				// Update middle joint position only when hips moved
				if (selectedJointIndex === 2) {
					updateMiddleJoint(selectedStickmanIndex);
				}

				// Broadcast real-time joint movement in shared mode
				if (isShared && presence) {
					broadcastStickmanMovement(selectedStickmanIndex, 'drag_joint', {
						jointIndex: selectedJointIndex,
						position: { x: mouseX, y: mouseY }
					});
				}

				saveCurrentFrame();
				updateTimeline();
			}
		}

		function handleMouseUp() {
			const wasInteracting = isDragging || isDraggingWhole || isRotating || isDraggingRemote;

			if (isDraggingRemote && selectedStickmanIndex >= 0) {
				// For remote stickmen, keep the local offset but don't save to frames
				const stickmanId = stickmen[selectedStickmanIndex].id;
				
				// Clean up temporary drag variables
				if (remoteStickmanPositions[stickmanId]) {
					delete remoteStickmanPositions[stickmanId].dragStartOffsetX;
					delete remoteStickmanPositions[stickmanId].dragStartOffsetY;
				}
			}

			isDragging = false;
			isDraggingWhole = false;
			isDraggingRemote = false;
			isRotating = false;
			rotationPivot = null;

			// Check if remote stickman
			let isRemoteStickman = false;
			if (selectedStickmanIndex >= 0 && isShared && presence) {
				const stickmanId = stickmen[selectedStickmanIndex].id;
				isRemoteStickman = !isStickmanOwned(stickmanId);
			}

			if (selectedStickmanIndex >= 0 && originalJoints.length > 0) {
				// Only save frames and broadcast for own stickmen
				if (!isRemoteStickman) {
					// Always save the current frame
					saveCurrentFrame();
					updateTimeline();

					// Send final position update in shared mode after interaction ends
					if (wasInteracting && isShared && presence) {
						broadcastStickmanFinalPosition(selectedStickmanIndex);
					}
				}
			}

			originalJoints = [];
		}

		function getCanvasCoordinates(e) {
			const rect = canvas.getBoundingClientRect();
			const scaleX = canvas.width / rect.width;
			const scaleY = canvas.height / rect.height;
			return {
				mouseX: ((e.clientX - rect.left) * scaleX) / currentZoom,
				mouseY: ((e.clientY - rect.top) * scaleY) / currentZoom
			};
		}

		function findJointAtPosition(x, y) {
			for (let stickmanIndex = stickmen.length - 1; stickmanIndex >= 0; stickmanIndex--) {
				const joints = stickmen[stickmanIndex].joints;
				const stickmanId = stickmen[stickmanIndex].id;
				const isOwnStickman = isStickmanOwned(stickmanId);

				// Apply remote offset for hit detection if it exists
				let hitTestJoints = joints;
				if (!isOwnStickman && remoteStickmanPositions[stickmanId]) {
					const offsetX = remoteStickmanPositions[stickmanId].offsetX || 0;
					const offsetY = remoteStickmanPositions[stickmanId].offsetY || 0;

					hitTestJoints = joints.map(joint => ({
						x: joint.x + offsetX,
						y: joint.y + offsetY,
						name: joint.name
					}));
				}

				// For remote stickmen, only check hip joint with larger hit area
				if (!isOwnStickman) {
					const hipJoint = hitTestJoints[2];
					const dx = hipJoint.x - x;
					const dy = hipJoint.y - y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					// Larger hit area for remote stickman hip
					if (distance < 15) {
						return {
							joint: joints[2], // Return original joint, not offset one
							stickmanIndex: stickmanIndex
						};
					}
					continue;
				}

				// Define hit radii for different joint types
				const getHitRadius = (jointIndex) => {
					switch (jointIndex) {
						case 0:
							return 15; // head - largest hit area
						case 2:
							return 12; // hips - large for whole stickman drag
						case 11:
							return 10; // middle - medium for rotation
						case 1:
							return 10; // body/neck - medium for rotation
						default:
							return 8;  // hands, feet, elbows, knees
					}
				};

				// Check joints in order of interaction priority
				const priorityOrder = [2, 11, 1, 0, 7, 9, 3, 5, 8, 10, 4, 6];

				for (const jointIndex of priorityOrder) {
					if (jointIndex >= hitTestJoints.length) {
						continue;
					}

					const joint = hitTestJoints[jointIndex];
					const dx = joint.x - x;
					const dy = joint.y - y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const hitRadius = getHitRadius(jointIndex);

					if (distance < hitRadius) {
						return {
							joint: joints[jointIndex], // Return original joint, not offset one
							stickmanIndex: stickmanIndex
						};
					}
				}
			}
			return null;
		}

		// RENDERING LOOP

		function render() {
			// Clear the entire canvas accounting for zoom scaling
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to clear unscaled canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore(); // Restore the zoom transform

			// Handle empty canvas state
			if (stickmen.length === 0) {
				// Check if spinner element already exists
				let spinner = document.getElementById('canvas-loading-spinner');
				if (!spinner) {
					// Create spinner element
					spinner = document.createElement('div');
					spinner.id = 'canvas-loading-spinner';
					spinner.style.cssText = `
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						z-index: 10;
					`;

					const spinnerImg = document.createElement('img');
					spinnerImg.src = 'icons/spinner-light.gif';
					spinnerImg.style.cssText = `
						width: 64px;
						height: 64px;
						margin-bottom: 10px;
					`;

					const loadingText = document.createElement('p');
					loadingText.style.cssText = `
						text-align: center;
						color: #888;
						font-size: 16px;
						margin: 0;
						font-family: Arial, sans-serif;
					`;

					spinner.appendChild(spinnerImg);
					spinner.appendChild(loadingText);
					canvas.parentElement.appendChild(spinner);
				}
				requestAnimationFrame(render);
				return;
			} else {
				// Remove spinner when stickmen are present
				const spinner = document.getElementById('canvas-loading-spinner');
				if (spinner) {
					spinner.remove();
				}
			}

			// Draw onion skin of previous frame - only for selected stickman that is owned
			// do not show during playback or for remote stickmen
			if (!isPlaying && selectedStickmanIndex >= 0) {
				const stickmanId = stickmen[selectedStickmanIndex].id;

				// Only show onion skin for owned stickmen
				if (isStickmanOwned(stickmanId)) {
					const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;
					const currentFrameIndex = currentFrameIndices[stickmanId] || 0;

					// Only show onion skin if there's a previous frame
					if (totalFrames > 1 && currentFrameIndex > 0) {
						const prevFrameIndex = currentFrameIndex - 1;
						const prevFrame = reconstructFrameFromDeltas(stickmanId, prevFrameIndex);

						if (prevFrame) {
							ctx.save();
							ctx.globalAlpha = 0.3;
							ctx.strokeStyle = '#0066cc';
							ctx.lineWidth = 2;
							ctx.lineCap = 'round';
							ctx.lineJoin = 'round';

							drawStickmanSkeleton(ctx, prevFrame.joints);

							ctx.fillStyle = '#0066cc';
							prevFrame.joints.forEach((joint, index) => {
								// Skip middle joint
								if (index === 11)
									return;

								ctx.beginPath();
								if (index === 0) {
									ctx.arc(joint.x, joint.y, 4, 0, Math.PI * 2);
								} else {
									ctx.arc(joint.x, joint.y, 2, 0, Math.PI * 2);
								}
								ctx.fill();
							});

							ctx.restore();
						}
					}
				}
			}

			drawAllStickmen();
			requestAnimationFrame(render);
		}

		// EXPORT FUNCTIONALITY

		// Calculate bounding box for a single stickman
		function calculateStickmanBounds(joints) {
			if (!joints || joints.length === 0) return null;

			const xs = joints.map(joint => joint.x);
			const ys = joints.map(joint => joint.y);

			return {
				minX: Math.min(...xs),
				maxX: Math.max(...xs),
				minY: Math.min(...ys),
				maxY: Math.max(...ys)
			};
		}

		// Calculate global bounds across all stickmen and all frames
		function calculateGlobalBounds() {
			let globalMinX = Infinity;
			let globalMaxX = -Infinity;
			let globalMinY = Infinity;
			let globalMaxY = -Infinity;

			// Iterate through all stickmen and all their frames
			Object.keys(baseFrames).forEach(stickmanId => {
				const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;

				for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
					const frameData = reconstructFrameFromDeltas(stickmanId, frameIndex);
					if (frameData && frameData.joints) {
						const bounds = calculateStickmanBounds(frameData.joints);
						if (bounds) {
							globalMinX = Math.min(globalMinX, bounds.minX);
							globalMaxX = Math.max(globalMaxX, bounds.maxX);
							globalMinY = Math.min(globalMinY, bounds.minY);
							globalMaxY = Math.max(globalMaxY, bounds.maxY);
						}
					}
				}
			});

			// Return null if no valid bounds found
			if (globalMinX === Infinity)
				return null;

			return {
				minX: globalMinX,
				maxX: globalMaxX,
				minY: globalMinY,
				maxY: globalMaxY,
				width: globalMaxX - globalMinX,
				height: globalMaxY - globalMinY
			};
		}

		// Calculate optimal export bounds with fixed size and margin
		function calculateOptimalExportBounds(margin = 50) {
			const globalBounds = calculateGlobalBounds();
			if (!globalBounds) {
				// Fallback to canvas center if no stickmen
				return {
					x: canvas.width / 4,
					y: canvas.height / 4,
					width: canvas.width / 2,
					height: canvas.height / 2
				};
			}

			// Add margin around the content
			const boundedWidth = globalBounds.width + (margin * 2);
			const boundedHeight = globalBounds.height + (margin * 2);

			// Ensure minimum size for visibility
			const minSize = 200;
			const finalWidth = Math.max(boundedWidth, minSize);
			const finalHeight = Math.max(boundedHeight, minSize);

			// Calculate centered position
			const centerX = (globalBounds.minX + globalBounds.maxX) / 2;
			const centerY = (globalBounds.minY + globalBounds.maxY) / 2;

			const exportBounds = {
				x: centerX - finalWidth / 2,
				y: centerY - finalHeight / 2,
				width: finalWidth,
				height: finalHeight
			};

			// Ensure bounds don't go outside canvas
			exportBounds.x = Math.max(0, Math.min(exportBounds.x, canvas.width - exportBounds.width));
			exportBounds.y = Math.max(0, Math.min(exportBounds.y, canvas.height - exportBounds.height));

			return exportBounds;
		}

		function exportAnimation() {
			// Calculate optimal bounding box for export
			const exportBounds = calculateOptimalExportBounds(50); // 50px margin

			// Choose dimensions based on aspect ratio that fits the content well
			const aspectRatio = exportBounds.width / exportBounds.height;
			let videoWidth, videoHeight;
			
			if (aspectRatio > 1.77) { 
				// Wide content
				videoWidth = 1280;
				videoHeight = 720;
			} else if (aspectRatio > 1.33) { 
				// Standard widescreen
				videoWidth = 1280;
				videoHeight = 720;
			} else if (aspectRatio > 0.75) { 
				// Square-ish content
				videoWidth = 720;
				videoHeight = 720;
			} else { 
				// Tall content
				videoWidth = 720;
				videoHeight = 1280;
			}

			const recordCanvas = document.createElement('canvas');
			recordCanvas.width = videoWidth;
			recordCanvas.height = videoHeight;
			const recordCtx = recordCanvas.getContext('2d');

			const stream = recordCanvas.captureStream(15);
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'video/webm;codecs=vp9'
			});

			const chunks = [];
			mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks, { type: 'video/webm' });

				// Convert blob to data URL for journal storage
				const reader = new FileReader();
				reader.onload = function () {
					const dataURL = reader.result;
					saveVideoToJournal(dataURL);
				};
				reader.readAsDataURL(blob);
			};

			mediaRecorder.start();

			// Find the maximum number of frames across all stickmen
			let maxFrames = 0;
			Object.keys(baseFrames).forEach(stickmanId => {
				const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;
				maxFrames = Math.max(maxFrames, totalFrames);
			});

			// Create a copy of current stickmen for animation
			let animationStickmen = JSON.parse(JSON.stringify(stickmen));
			let exportFrameIndices = {};

			// Initialize frame indices for export
			stickmen.forEach(stickman => {
				exportFrameIndices[stickman.id] = 0;
			});

			let currentExportFrame = 0;
			const renderFrame = () => {
				if (currentExportFrame >= maxFrames) {
					mediaRecorder.stop();
					return;
				}

				// Clear with white background
				recordCtx.fillStyle = '#ffffff';
				recordCtx.fillRect(0, 0, recordCanvas.width, recordCanvas.height);

				// Save context for content rendering
				recordCtx.save();

				// Calculate scaling factor to fit content in standard video dimensions
				const scaleX = (videoWidth - 100) / exportBounds.width; // 100px total margin
				const scaleY = (videoHeight - 100) / exportBounds.height; // 100px total margin
				const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio

				// Center the content in the video canvas
				const scaledWidth = exportBounds.width * scale;
				const scaledHeight = exportBounds.height * scale;
				const offsetX = (videoWidth - scaledWidth) / 2;
				const offsetY = (videoHeight - scaledHeight) / 2;

				// Apply transformations: translate to center, scale to fit, then translate to crop area
				recordCtx.translate(offsetX, offsetY);
				recordCtx.scale(scale, scale);
				recordCtx.translate(-exportBounds.x, -exportBounds.y);

				// Update each stickman to its current frame for this export frame
				animationStickmen.forEach((stickman, index) => {
					const stickmanId = stickman.id;
					const totalFrames = baseFrames[stickmanId] ? 1 + deltaFrames[stickmanId].length : 0;

					if (totalFrames > 0) {
						// Only advance frame if this stickman has more frames
						if (exportFrameIndices[stickmanId] < totalFrames) {
							const frameIndex = exportFrameIndices[stickmanId];
							const frameData = reconstructFrameFromDeltas(stickmanId, frameIndex);

							if (frameData) {
								animationStickmen[index] = frameData;

								// Move to next frame for next export frame
								exportFrameIndices[stickmanId] = (exportFrameIndices[stickmanId] + 1) % totalFrames;
							}
						}

						// Draw the stickman in its current state with appropriate line width for the scaled video
						recordCtx.strokeStyle = '#000';
						const baseLineWidth = 12;
						const adjustedLineWidth = Math.max(2, Math.min(baseLineWidth / scale, 20));
						recordCtx.lineWidth = adjustedLineWidth;

						// Get user color for shared mode
						const userColor = stickmanUserColors[stickmanId] ||
							((currentenv && currentenv.user && currentenv.user.colorvalue)
								? currentenv.user.colorvalue
								: null);

						drawStickmanSkeleton(recordCtx, animationStickmen[index].joints, userColor);
					}
				});

				// Restore context
				recordCtx.restore();

				currentExportFrame++;
				// Use current speed setting for export timing (same as animation playback)
				const exportDelay = 1000 / (currentSpeed * 2);
				setTimeout(() => requestAnimationFrame(renderFrame), exportDelay);
			};

			renderFrame();
		}

		function saveVideoToJournal(dataURL) {
			// Get the mimetype from the data URL
			const mimetype = dataURL.split(';')[0].split(':')[1];
			const type = mimetype.split('/')[0];

			// Create metadata for the video entry
			const metadata = {
				mimetype: mimetype,
				title: "Video by " + (currentenv && currentenv.user ? currentenv.user.name : "User"),
				activity: "org.olpcfrance.MediaViewerActivity",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};

			// Save to datastore
			datastore.create(metadata, function (error, objectId) {
				if (error) {
					console.error("Error saving video to journal:", error);
					// Fallback to download if journal save fails
					const blob = dataURLtoBlob(dataURL);
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'stickman-animation.webm';
					a.click();
					URL.revokeObjectURL(url);
				} else {
					humane.log(l10n.get("AnimationSavedToJournal") || "Animation has been successfully saved to your Journal!");
				}
			}, dataURL);
		}

		function dataURLtoBlob(dataURL) {
			const arr = dataURL.split(',');
			const mime = arr[0].match(/:(.*?);/)[1];
			const bstr = atob(arr[1]);
			let n = bstr.length;
			const u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new Blob([u8arr], { type: mime });
		}

		// JOURNAL IMPORT FUNCTIONALITY

		function importFromJournal() {
			journalchooser.show(function (entry) {
				// No selection
				if (!entry) {
					return;
				}

				// Get object content
				var dataentry = new datastore.DatastoreObject(entry.objectId);
				dataentry.loadAsText(function (err, metadata, jsonData) {
					if (err) {
						console.log("Error loading journal entry:", err);
						return;
					}

					if (!jsonData) {
						return;
					}

					try {
						const savedData = JSON.parse(jsonData);

						// Check if savedData is valid
						if (!savedData || typeof savedData !== 'object') {
							return;
						}

						// Validate that this is stickman data
						if (!savedData.baseFrames || !savedData.deltaFrames || !savedData.currentFrameIndices) {
							return;
						}

						// Import the stickman data
						const importedStickmen = [];
						const importedBaseFrames = {};
						const importedDeltaFrames = {};
						const importedCurrentFrameIndices = {};
						const importedStickmanUserColors = {};
						const importedStickmenForSharing = [];

						// Process each stickman from the imported data
						Object.keys(savedData.baseFrames).forEach(stickmanIdStr => {
							try {
								const stickmanId = stickmanIdStr;
								const frameIndex = savedData.currentFrameIndices[stickmanId] || 0;

								// Reconstruct the stickman from delta system
								const baseFrame = savedData.baseFrames[stickmanId];
								const deltaFramesList = savedData.deltaFrames[stickmanId] || [];

								if (baseFrame && Array.isArray(baseFrame)) {
									// Create new ID for imported stickman - always use current user as owner
									let newStickmanId;
									if (currentenv && currentenv.user) {
										newStickmanId = `${currentenv.user.networkId}_${Date.now()}_imported_${Object.keys(importedBaseFrames).length}`;
									} else {
										newStickmanId = nextStickmanId++;
									}

									// Copy the base frame and delta frames with new ID
									importedBaseFrames[newStickmanId] = deepClone(baseFrame);
									importedDeltaFrames[newStickmanId] = deepClone(deltaFramesList);
									importedCurrentFrameIndices[newStickmanId] = 0;

									// Always assign current user's color to imported stickman, ignoring any original color
									if (currentenv && currentenv.user && currentenv.user.colorvalue) {
										importedStickmanUserColors[newStickmanId] = currentenv.user.colorvalue;
									}

									// Reconstruct the current frame
									const reconstructedFrame = reconstructFrame(newStickmanId, 0, importedBaseFrames, importedDeltaFrames);

									if (reconstructedFrame && reconstructedFrame.joints && Array.isArray(reconstructedFrame.joints)) {

										// Position the imported stickman at a random safe location
										const stickmanHeight = 160;
										const stickmanWidth = 80;
										const margin = 30;

										const minX = stickmanWidth / 2 + margin;
										const maxX = canvas.width - stickmanWidth / 2 - margin;
										const minY = 65 + margin;
										const maxY = canvas.height - 95 - margin;

										let centerX, centerY;
										let attempts = 0;
										const maxAttempts = 20;
										const minDistance = 100;

										// Find a random position that doesn't overlap with existing stickmen
										do {
											centerX = Math.random() * (maxX - minX) + minX;
											centerY = Math.random() * (maxY - minY) + minY;

											const isTooClose = stickmen.some(stickman => {
												const existingCenter = stickman.joints[11] || stickman.joints[2];
												const distance = Math.sqrt(
													Math.pow(centerX - existingCenter.x, 2) +
													Math.pow(centerY - existingCenter.y, 2)
												);
												return distance < minDistance;
											});

											if (!isTooClose) break;
											attempts++;
										} while (attempts < maxAttempts);

										// Fallback to sequential positioning if random placement fails
										if (attempts >= maxAttempts) {
											centerX = canvas.width / 2 + (importedStickmen.length * 150) - 300;
											centerY = canvas.height / 2;
										}

										// Calculate offset to move stickman to new position
										const currentCenter = {
											x: (
												Math.max(...reconstructedFrame.joints.map(p => p.x)) + Math.min(...reconstructedFrame.joints.map(p => p.x))
											) / 2,
											y: (
												Math.max(...reconstructedFrame.joints.map(p => p.y)) + Math.min(...reconstructedFrame.joints.map(p => p.y))
											) / 2
										};

										const offsetX = centerX - currentCenter.x;
										const offsetY = centerY - currentCenter.y;

										// Apply offset to all joints
										reconstructedFrame.joints.forEach(joint => {
											if (joint && typeof joint.x === 'number' && typeof joint.y === 'number') {
												joint.x += offsetX;
												joint.y += offsetY;
											}
										});

										// Update base frame with new position
										importedBaseFrames[newStickmanId] = deepClone(reconstructedFrame.joints);

										// Recalculate all delta frames with new base position
										const newDeltas = [];
										for (let i = 0; i < deltaFramesList.length; i++) {
											const originalDelta = deltaFramesList[i];
											if (originalDelta && Array.isArray(originalDelta)) {
												// Apply the same offset to delta movements
												const adjustedDelta = originalDelta.map(delta => ({
													dx: delta.dx || 0,
													dy: delta.dy || 0,
													name: delta.name || 'unknown'
												}));
												newDeltas.push(adjustedDelta);
											}
										}
										importedDeltaFrames[newStickmanId] = newDeltas;

										importedStickmen.push(reconstructedFrame);

										// Prepare for sharing in shared mode
										importedStickmenForSharing.push({
											stickman: {
												id: newStickmanId,
												joints: reconstructedFrame.joints,
												baseFrame: importedBaseFrames[newStickmanId],
												deltaFrames: importedDeltaFrames[newStickmanId],
												currentFrameIndex: importedCurrentFrameIndices[newStickmanId]
											},
											color: importedStickmanUserColors[newStickmanId]
										});
									}
								}
							} catch (stickmanError) {
								console.log("Error processing individual stickman:", stickmanIdStr, stickmanError);
							}
						});

						if (importedStickmen.length > 0) {
							// Add imported stickmen to current animation
							stickmen.push(...importedStickmen);
							Object.assign(baseFrames, importedBaseFrames);
							Object.assign(deltaFrames, importedDeltaFrames);
							Object.assign(currentFrameIndices, importedCurrentFrameIndices);
							Object.assign(stickmanUserColors, importedStickmanUserColors);

							// In shared mode, broadcast all imported stickmen to other users
							if (isShared && presence && importedStickmenForSharing.length > 0) {
								importedStickmenForSharing.forEach(importedStickmanData => {
									presence.sendMessage(presence.getSharedInfo().id, {
										user: presence.getUserInfo(),
										action: 'new_stickman',
										content: importedStickmanData
									});
								});
							}

							// Update middle joints for all imported stickmen
							const startIndex = stickmen.length - importedStickmen.length;
							for (let i = startIndex; i < stickmen.length; i++) {
								updateMiddleJoint(i);
							}

							// Select the first imported stickman
							selectedStickmanIndex = startIndex;

							updateTimeline();
							updateRemoveButtonState();
							render();

							humane.log((l10n.get("StickmanImported") || "Stickman imported successfully!"));
						}

					} catch (parseError) {
						console.log("Error parsing stickman data:", parseError);
						console.log("Raw data received:", jsonData ? jsonData.substring(0, 200) + "..." : "null");
					}
				});
			}, { activity: 'org.sugarlabs.Stickman' }); // Filter to show only Stickman entries
		}

		// VIDEO IMPORT FUNCTIONALITY WITH POSENET

		// Load PoseNet model
		async function loadPoseNet() {
			if (!posenetModel) {
				try {
					// Check if required dependencies are available
					if (!window.tf || !window.posenet) {
						console.error("TensorFlow.js or PoseNet not loaded");
						return null;
					}

					// Use network check to determine if we should try local models first
					let modelConfig = { ...posenetConfig };
					let shouldTryLocal = true;
					
					// Check if we have network check available and local models are not available
					if (typeof Stickman !== 'undefined' && Stickman.NetworkCheck) {
						const isConnected = Stickman.NetworkCheck.isConnected();
						shouldTryLocal = isConnected;
					}
					
					// Set local model URL based on architecture if we should try local
					if (shouldTryLocal) {
						if (posenetConfig.architecture === 'MobileNetV1') {
							modelConfig.modelUrl = './models/mobilenet/model-stride16.json';
						} else if (posenetConfig.architecture === 'ResNet50') {
							modelConfig.modelUrl = './models/resnet50/model-stride16.json';
						}
					}
					
					// Try loading with the determined configuration
					if (shouldTryLocal) {
						try {
							posenetModel = await posenet.load(modelConfig);
						} catch (localError) {
							console.warn('Local model loading failed, trying remote:', localError);
							shouldTryLocal = false; // Switch to remote
						}
					}
					
					// If local failed or we decided to skip local, try remote
					if (!posenetModel && !shouldTryLocal) {
						try {
							// For ResNet50, try remote download first before falling back to MobileNet
							if (posenetConfig.architecture === 'ResNet50') {
								delete modelConfig.modelUrl; 
								posenetModel = await posenet.load(modelConfig);
							} else {
								// For MobileNet, try remote
								delete modelConfig.modelUrl; 
								posenetModel = await posenet.load(modelConfig);
							}
						} catch (remoteError) {
							console.error('Remote loading failed:', remoteError);
							
							// Final fallback: try MobileNet from CDN if we were trying ResNet50
							if (posenetConfig.architecture === 'ResNet50') {
								try {
									const mobilenetConfig = { ...POSENET_CONFIGS.mobilenet };
									posenetModel = await posenet.load(mobilenetConfig);
								} catch (mobilenetError) {
									console.error('All loading attempts failed:', mobilenetError);
								}
							}
						}
					}

					// Warm up the model with a dummy prediction for better performance
					const dummyCanvas = document.createElement('canvas');
					dummyCanvas.width = posenetConfig.inputResolution;
					dummyCanvas.height = posenetConfig.inputResolution;
					const dummyCtx = dummyCanvas.getContext('2d');
					dummyCtx.fillStyle = '#000000';
					dummyCtx.fillRect(0, 0, posenetConfig.inputResolution, posenetConfig.inputResolution);

					await posenetModel.estimateSinglePose(dummyCanvas);

				} catch (error) {
					console.error(`Error loading ${posenetConfig.architecture} PoseNet model:`, error);

					// Fallback strategy: always try ResNet50 first, then MobileNet
					const fallbackConfig = POSENET_CONFIGS.resnet50;

					try {
						// Try local ResNet50 model first
						let fallbackModelConfig = { ...fallbackConfig };
						fallbackModelConfig.modelUrl = './models/resnet50/model-stride16.json';
						
						try {
							posenetModel = await posenet.load(fallbackModelConfig);
						} catch (localFallbackError) {
							console.warn('Local ResNet50 fallback failed, trying MobileNet:', localFallbackError);
							
							// Final fallback: try local MobileNet
							const mobilenetConfig = { ...POSENET_CONFIGS.mobilenet };
							mobilenetConfig.modelUrl = './models/mobilenet/model-stride16.json';
							
							try {
								posenetModel = await posenet.load(mobilenetConfig);
							} catch (mobilenetError) {
								console.warn('Local MobileNet fallback failed, trying remote MobileNet:', mobilenetError);
								delete mobilenetConfig.modelUrl;
								posenetModel = await posenet.load(POSENET_CONFIGS.mobilenet);
							}
						}
					} catch (fallbackError) {
						console.error("Both model architectures failed to load:", fallbackError);

						// Show user-friendly error message
						if (typeof humane !== 'undefined') {
							humane.log(l10n.get("PoseNetLoadError") || "Failed to load pose detection model. Video import may not work properly.");
						}
					}
				}
			}
			return posenetModel;
		}

		// Convert PoseNet keypoints to stickman joint format
		function convertPoseToStickman(pose, centerX, centerY) {
			const keypoints = pose.keypoints;

			function getKeypoint(name) {
				return keypoints.find(kp => kp.part === name);
			}

			function getKeypointPosition(name, fallback = null) {
				const kp = getKeypoint(name);
				if (kp && kp.score > 0.1) {
					return { x: kp.position.x, y: kp.position.y, score: kp.score };
				}
				return fallback;
			}

			// Get essential keypoints with fallbacks
			const nose = getKeypointPosition('nose');
			const leftShoulder = getKeypointPosition('leftShoulder');
			const rightShoulder = getKeypointPosition('rightShoulder');
			const leftHip = getKeypointPosition('leftHip');
			const rightHip = getKeypointPosition('rightHip');

			// Validation - require either nose OR at least one hip for valid pose
			if (!nose && !leftHip && !rightHip) {
				return null;
			}

			// Calculate hip center (use available hip if only one detected)
			let hipCenter;
			if (leftHip && rightHip) {
				hipCenter = {
					x: (leftHip.x + rightHip.x) / 2,
					y: (leftHip.y + rightHip.y) / 2
				};
			} else if (leftHip) {
				hipCenter = { x: leftHip.x, y: leftHip.y };
			} else {
				hipCenter = { x: rightHip.x, y: rightHip.y };
			}

			// Calculate shoulder center
			let shoulderCenter;
			if (leftShoulder && rightShoulder) {
				shoulderCenter = {
					x: (leftShoulder.x + rightShoulder.x) / 2,
					y: (leftShoulder.y + rightShoulder.y) / 2
				};
			} else if (leftShoulder) {
				shoulderCenter = { x: leftShoulder.x, y: leftShoulder.y };
			} else if (rightShoulder) {
				shoulderCenter = { x: rightShoulder.x, y: rightShoulder.y };
			} else {
				// Estimate shoulder position based on nose and hip
				shoulderCenter = {
					x: nose.x,
					y: nose.y + (hipCenter.y - nose.y) * 0.4
				};
			}

			// Calculate scale based on detected body size
			const detectedHeight = Math.abs(hipCenter.y - nose.y);
			const standardHeight = 80; // Head to hip distance in stickman
			const scale = detectedHeight > 20 ? standardHeight / detectedHeight : 1;

			// Create joints array with standard stickman proportions
			const joints = [];

			// Apply scaling and translation to center the stickman
			function transformPoint(x, y) {
				return {
					x: centerX + (x - hipCenter.x) * scale,
					y: centerY + (y - hipCenter.y) * scale
				};
			}

			// 0 - head
			const headPos = transformPoint(nose.x, nose.y);
			joints[0] = { x: headPos.x, y: headPos.y, name: 'head' };

			// 1 - body/neck
			const bodyPos = transformPoint(shoulderCenter.x, shoulderCenter.y);
			joints[1] = { x: bodyPos.x, y: bodyPos.y, name: 'body' };

			// 2 - hips
			joints[2] = { x: centerX, y: centerY, name: 'hips' };

			// 11 - middle (calculate first for reference)
			joints[11] = {
				x: (joints[1].x + joints[2].x) / 2,
				y: (joints[1].y + joints[2].y) / 2,
				name: 'middle'
			};

			// Generate other joints with fallback to standard positions
			const standardPositions = createStandardJointPositions(centerX, centerY);

			// Left leg
			const leftKnee = getKeypointPosition('leftKnee');
			const leftAnkle = getKeypointPosition('leftAnkle');

			if (leftKnee && leftKnee.score > 0.15) {
				const kneePos = transformPoint(leftKnee.x, leftKnee.y);
				joints[3] = { x: kneePos.x, y: kneePos.y, name: 'leftKnee' };
			} else {
				joints[3] = standardPositions[3];
			}

			if (leftAnkle && leftAnkle.score > 0.15) {
				const anklePos = transformPoint(leftAnkle.x, leftAnkle.y);
				joints[4] = { x: anklePos.x, y: anklePos.y, name: 'leftFoot' };
			} else {
				joints[4] = standardPositions[4];
			}

			// Right leg
			const rightKnee = getKeypointPosition('rightKnee');
			const rightAnkle = getKeypointPosition('rightAnkle');

			if (rightKnee && rightKnee.score > 0.15) {
				const kneePos = transformPoint(rightKnee.x, rightKnee.y);
				joints[5] = { x: kneePos.x, y: kneePos.y, name: 'rightKnee' };
			} else {
				joints[5] = standardPositions[5];
			}

			if (rightAnkle && rightAnkle.score > 0.15) {
				const anklePos = transformPoint(rightAnkle.x, rightAnkle.y);
				joints[6] = { x: anklePos.x, y: anklePos.y, name: 'rightFoot' };
			} else {
				joints[6] = standardPositions[6];
			}

			// Arms
			const leftElbow = getKeypointPosition('leftElbow');
			const leftWrist = getKeypointPosition('leftWrist');
			const rightElbow = getKeypointPosition('rightElbow');
			const rightWrist = getKeypointPosition('rightWrist');

			// Left arm
			if (leftElbow && leftElbow.score > 0.1) {
				const elbowPos = transformPoint(leftElbow.x, leftElbow.y);
				joints[7] = { x: elbowPos.x, y: elbowPos.y, name: 'leftElbow' };
			} else {
				joints[7] = standardPositions[7];
			}

			if (leftWrist && leftWrist.score > 0.1) {
				const wristPos = transformPoint(leftWrist.x, leftWrist.y);
				joints[8] = { x: wristPos.x, y: wristPos.y, name: 'leftHand' };
			} else {
				joints[8] = standardPositions[8];
			}

			// Right arm
			if (rightElbow && rightElbow.score > 0.1) {
				const elbowPos = transformPoint(rightElbow.x, rightElbow.y);
				joints[9] = { x: elbowPos.x, y: elbowPos.y, name: 'rightElbow' };
			} else {
				joints[9] = standardPositions[9];
			}

			if (rightWrist && rightWrist.score > 0.1) {
				const wristPos = transformPoint(rightWrist.x, rightWrist.y);
				joints[10] = { x: wristPos.x, y: wristPos.y, name: 'rightHand' };
			} else {
				joints[10] = standardPositions[10];
			}

			// Enforce joint constraints
			enforceBasicConstraints(joints);

			return joints;
		}

		// Create standard joint positions as fallback
		function createStandardJointPositions(centerX, centerY) {
			return [
				{ x: centerX, y: centerY - 65, name: 'head' },
				{ x: centerX, y: centerY - 45, name: 'body' },
				{ x: centerX, y: centerY + 15, name: 'hips' },
				{ x: centerX - 15, y: centerY + 55, name: 'leftKnee' },
				{ x: centerX - 20, y: centerY + 95, name: 'leftFoot' },
				{ x: centerX + 15, y: centerY + 55, name: 'rightKnee' },
				{ x: centerX + 20, y: centerY + 95, name: 'rightFoot' },
				{ x: centerX - 25, y: centerY - 35, name: 'leftElbow' },
				{ x: centerX - 40, y: centerY - 5, name: 'leftHand' },
				{ x: centerX + 25, y: centerY - 35, name: 'rightElbow' },
				{ x: centerX + 40, y: centerY - 5, name: 'rightHand' },
				{ x: centerX, y: centerY - 15, name: 'middle' }
			];
		}

		// Constraint enforcement to prevent extreme poses
		function enforceBasicConstraints(joints) {
			const maxLimbLength = 60;
			const minLimbLength = 20;

			// Check critical connections
			const connections = [
				[0, 1], [1, 11], [11, 2], // body chain
				[2, 3], [3, 4], [2, 5], [5, 6], // legs
				[1, 7], [7, 8], [1, 9], [9, 10] // arms
			];

			connections.forEach(([from, to]) => {
				const joint1 = joints[from];
				const joint2 = joints[to];

				if (!joint1 || !joint2) return;

				const dx = joint2.x - joint1.x;
				const dy = joint2.y - joint1.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance > maxLimbLength) {
					const ratio = maxLimbLength / distance;
					joint2.x = joint1.x + dx * ratio;
					joint2.y = joint1.y + dy * ratio;
				} else if (distance < minLimbLength && distance > 0) {
					const ratio = minLimbLength / distance;
					joint2.x = joint1.x + dx * ratio;
					joint2.y = joint1.y + dy * ratio;
				}
			});
		}

		// Create loading overlay for library check
		function createLibraryLoadingOverlay() {
			const overlay = document.createElement('div');
			overlay.id = 'library-loading-overlay';
			overlay.className = 'library-loading-overlay';

			const content = document.createElement('div');
			content.className = 'library-loading-content';

			const spinner = document.createElement('img');
			spinner.src = 'icons/spinner-light.gif';
			spinner.className = 'library-loading-spinner';
			spinner.alt = 'Loading...';

			content.appendChild(spinner);
			overlay.appendChild(content);

			return overlay;
		}

		function showLibraryLoadingOverlay() {
			// Disable the window by preventing interactions
			const existingOverlay = document.getElementById('library-loading-overlay');
			if (existingOverlay) {
				return; // Already showing
			}

			const overlay = createLibraryLoadingOverlay();
			document.body.appendChild(overlay);

			// Disable all toolbar buttons except the stop button
			const toolbar = document.getElementById('main-toolbar');
			if (toolbar) {
				const buttons = toolbar.querySelectorAll('button:not(#stop-button)');
				buttons.forEach(button => {
					button.style.pointerEvents = 'none';
					button.style.opacity = '0.5';
				});
			}

			// Disable canvas interactions
			const canvas = document.getElementById('stickman-canvas');
			if (canvas) {
				canvas.style.pointerEvents = 'none';
				canvas.style.opacity = '0.5';
			}

			// Disable timeline interactions
			const timeline = document.getElementById('timeline');
			if (timeline) {
				timeline.style.pointerEvents = 'none';
				timeline.style.opacity = '0.5';
			}
		}

		function hideLibraryLoadingOverlay() {
			const overlay = document.getElementById('library-loading-overlay');
			if (overlay) {
				document.body.removeChild(overlay);
			}

			// Re-enable toolbar buttons
			const toolbar = document.getElementById('main-toolbar');
			if (toolbar) {
				const buttons = toolbar.querySelectorAll('button');
				buttons.forEach(button => {
					button.style.pointerEvents = 'auto';
					button.style.opacity = '1';
				});
			}

			// Re-enable canvas interactions
			const canvas = document.getElementById('stickman-canvas');
			if (canvas) {
				canvas.style.pointerEvents = 'auto';
				canvas.style.opacity = '1';
			}

			// Re-enable timeline interactions
			const timeline = document.getElementById('timeline');
			if (timeline) {
				timeline.style.pointerEvents = 'auto';
				timeline.style.opacity = '1';
			}
		}

		// Check if required libraries are loaded
		function areLibrariesLoaded() {
			// Check if basic libraries are available
			if (!window.tf || !window.posenet) {
				return false;
			}

			// Check if model is loaded
			if (!posenetModel) {
				return false;
			}

			return true;
		}

		// video import
		async function importVideoAnimation() {
			try {
				// Check if libraries are loaded, if not show loading overlay
				if (!areLibrariesLoaded()) {
					showLibraryLoadingOverlay();

					try {
						// Try to load the libraries with a timeout
						const loadPromise = loadPoseNet();
						const timeoutPromise = new Promise((_, reject) =>
							setTimeout(() => reject(new Error('Library loading timeout')), 30000) // 30 second timeout
						);

						await Promise.race([loadPromise, timeoutPromise]);
						hideLibraryLoadingOverlay();

						// If loading failed, don't proceed
						if (!areLibrariesLoaded()) {
							humane.log(l10n.get("LibraryLoadError") || "Failed to load required libraries for video import");
							return;
						}
					} catch (error) {
						hideLibraryLoadingOverlay();
						console.error("Error loading libraries:", error);
						humane.log(l10n.get("LibraryLoadError") || "Failed to load required libraries for video import");
						return;
					}
				}

				journalchooser.show(function (entry) {
					// No selection
					if (!entry) {
						return;
					}

					// Get object content
					var dataentry = new datastore.DatastoreObject(entry.objectId);
					dataentry.loadAsText(function (err, metadata, data) {
						if (err) {
							console.log("Error loading journal entry:", err);
							humane.log(l10n.get("VideoLoadError") || "Error loading video from journal");
							return;
						}

						const mimeType = metadata && (metadata.mime_type || metadata.mimetype);
						if (mimeType && mimeType.startsWith('video/')) {
							if (typeof dataentry.load === 'function') {
								// For video files, we need to load as binary data
								dataentry.load(function (err, metadata, binaryData) {
									if (err) {
										humane.log(l10n.get("VideoLoadError") || "Error loading video data");
										return;
									}

									try {
										// Convert binary data to blob
										const blob = new Blob([binaryData], { type: mimeType });
										processVideoFile(blob);
									} catch (error) {
										console.error('Error processing video from journal:', error);
										humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
									}
								});
							} else if (typeof dataentry.loadAsDataURL === 'function') {
								dataentry.loadAsDataURL(function (err, metadata, dataURL) {
									if (err) {
										humane.log(l10n.get("VideoLoadError") || "Error loading video data");
										return;
									}

									try {
										// Convert data URL to blob
										fetch(dataURL)
											.then(res => res.blob())
											.then(blob => {
												processVideoFile(blob);
											})
											.catch(error => {
												console.error('Error converting data URL to blob:', error);
												humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
											});
									} catch (error) {
										console.error('Error processing video from journal:', error);
										humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
									}
								});
							} else if (data && data.length > 0) {
								try {
									// Try to treat the text data as base64 or data URL
									if (data.startsWith('data:')) {
										// It's already a data URL
										fetch(data)
											.then(res => res.blob())
											.then(blob => {
												processVideoFile(blob);
											})
											.catch(error => {
												console.error('Error converting text data URL to blob:', error);
												humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
											});
									} else {
										// Try base64 decode
										const binaryString = atob(data);
										const bytes = new Uint8Array(binaryString.length);
										for (let i = 0; i < binaryString.length; i++) {
											bytes[i] = binaryString.charCodeAt(i);
										}
										const blob = new Blob([bytes], { type: mimeType });
										processVideoFile(blob);
									}
								} catch (error) {
									console.error('Error processing text data as video:', error);
									humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
								}
							} else {
								humane.log(l10n.get("VideoLoadError") || "Cannot load video data from this entry");
							}
						} else {
							humane.log(l10n.get("NotVideoFile") || "Selected file is not a video");
						}
					});
				}, {
					mimetype: '%video/'
				});

			} catch (error) {
				console.error('Error importing video from journal:', error);
				humane.log(l10n.get("VideoImportError") || "Error importing video from journal");
			}
		}

		// Process the selected video file
		async function processVideoFile(file) {
			try {
				// Load PoseNet model if not already loaded
				await loadPoseNet();

				// Create video element
				const video = document.createElement('video');
				video.src = URL.createObjectURL(file);
				video.muted = true;
				video.loop = true;
				video.autoplay = true;
				video.style.display = 'none';
				document.body.appendChild(video);

				await showVideoProcessingDialog(video, file);

			} catch (error) {
				console.error("Error processing video file:", error);
				humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
			}
		}

		// Extract frames from video and convert to stickman poses
		async function extractFramesFromVideo(video, progressCallback = null) {
			const frames = [];
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Set canvas size based on the model's optimal input resolution
			const optimalResolution = posenetConfig.inputResolution;
			canvas.width = optimalResolution;
			canvas.height = optimalResolution;

			const duration = video.duration;

			// Adjust frame rate based on platform for better performance
			const platform = detectPlatform();
			const frameRate = platform.isMobile || platform.isLowEnd ? 8 : 10; // Lower frame rate for mobile
			const frameInterval = 1 / frameRate;

			// Center position for stickman
			const centerX = 200;
			const centerY = 200;

			video.currentTime = 0;

			let lastPoseKeypoints = null;
			let frameIndex = 0;
			const totalFramesToProcess = Math.ceil(duration * frameRate);

			for (let time = 0; time < duration; time += frameInterval) {
				try {
					// Update progress if callback is provided
					if (progressCallback) {
						const progress = (frameIndex / totalFramesToProcess) * 100;
						progressCallback(progress);
					}

					video.currentTime = time;

					// Wait for video to seek to the correct time
					await new Promise((resolve, reject) => {
						let attempts = 0;
						const maxAttempts = 50;

						const checkTime = () => {
							attempts++;
							if (Math.abs(video.currentTime - time) < 0.05) {
								resolve();
							} else if (attempts >= maxAttempts) {
								resolve();
							} else {
								requestAnimationFrame(checkTime);
							}
						};
						checkTime();
					});

					// Force a small delay to ensure frame is rendered
					await new Promise(resolve => setTimeout(resolve, 10));

					// Draw current frame to canvas
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					// Calculate aspect ratio to maintain video proportions
					const videoAspect = video.videoWidth / video.videoHeight;
					const canvasAspect = canvas.width / canvas.height;

					let drawWidth, drawHeight, offsetX, offsetY;
					if (videoAspect > canvasAspect) {
						drawWidth = canvas.width;
						drawHeight = canvas.width / videoAspect;
						offsetX = 0;
						offsetY = (canvas.height - drawHeight) / 2;
					} else {
						drawWidth = canvas.height * videoAspect;
						drawHeight = canvas.height;
						offsetX = (canvas.width - drawWidth) / 2;
						offsetY = 0;
					}

					ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

					// Store the video frame as ImageData for preview
					const videoFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

					// Use pose estimation with optimized parameters based on the model
					const estimationParams = {
						flipHorizontal: false,
						maxDetections: 1,
						nmsRadius: 20
					};

					// Adjust parameters based on the model architecture
					if (posenetConfig.architecture === 'MobileNetV1') {
						// More lenient parameters for MobileNet on mobile devices
						estimationParams.scoreThreshold = 0.05;
					} else {
						estimationParams.scoreThreshold = 0.1;
					}

					const poses = await posenetModel.estimateMultiplePoses(canvas, estimationParams);

					if (poses.length > 0 && poses[0].score > 0.15) {
						// Check if this pose is significantly different from the last one
						const currentPose = poses[0];
						let isDuplicatePose = false;

						if (lastPoseKeypoints) {
							// Compare key landmarks to detect duplicate poses
							const threshold = 8;
							let similarityCount = 0;
							const keyLandmarks = ['nose', 'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'];
							let totalComparisons = 0;

							for (const landmark of keyLandmarks) {
								const lastKp = lastPoseKeypoints.find(kp => kp.part === landmark);
								const currentKp = currentPose.keypoints.find(kp => kp.part === landmark);

								if (lastKp && currentKp && lastKp.score > 0.1 && currentKp.score > 0.1) {
									totalComparisons++;
									const distance = Math.sqrt(
										Math.pow(lastKp.position.x - currentKp.position.x, 2) +
										Math.pow(lastKp.position.y - currentKp.position.y, 2)
									);
									if (distance < threshold) {
										similarityCount++;
									}
								}
							}

							// Check for duplicate poses
							isDuplicatePose = totalComparisons >= 3 && similarityCount === totalComparisons;
						}

						if (!isDuplicatePose) {
							const stickmanJoints = convertPoseToStickman(currentPose, centerX, centerY);
							if (stickmanJoints) {
								// Store both the video frame and the stickman data
								frames.push({
									joints: stickmanJoints,
									videoFrame: videoFrameData,
									pose: currentPose,
									timestamp: time
								});

								// Update last pose for comparison
								lastPoseKeypoints = currentPose.keypoints;
							}
						}
					}

				} catch (error) {
					console.error(`Frame ${frameIndex} processing error:`, error);
					continue;
				}

				frameIndex++;

				// Add periodic cleanup for mobile devices to prevent memory issues
				if (platform.isMobile && frameIndex % 20 === 0) {
					// Force garbage collection hint (if available)
					if (window.gc) {
						window.gc();
					}
				}
			}

			// Final progress update
			if (progressCallback) {
				progressCallback(100);
			}

			return frames;
		}

		// Show video processing dialog with immediate display
		async function showVideoProcessingDialog(video, file) {
			const modalOverlay = document.createElement('div');
			modalOverlay.className = 'modal-overlay';
			modalOverlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, 0.7);
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 10000;
			`;

			const modal = document.createElement('div');
			modal.className = 'modal-content';
			modal.style.cssText = `
				background: white;
				border-radius: 10px;
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
				max-width: 700px;
				width: 90%;
				max-height: 90vh;
				overflow: hidden;
				display: flex;
				flex-direction: column;
			`;

			// Create container for side-by-side content
			const contentContainer = document.createElement('div');
			contentContainer.style.cssText = `
				display: flex;
				padding: 20px;
				gap: 20px;
				flex: 1;
				align-items: center;
			`;

			// Left side - Video display
			const leftSection = document.createElement('div');
			leftSection.style.cssText = `
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 320px;
				min-width: 320px;
				max-width: 320px;
			`;

			const videoDisplay = document.createElement('video');
			videoDisplay.src = video.src;
			videoDisplay.muted = true;
			videoDisplay.loop = true;
			videoDisplay.autoplay = true;
			videoDisplay.style.cssText = `
				width: 320px;
				height: 240px;
				object-fit: contain;
				border: 2px solid #666;
				border-radius: 8px;
				background: #f5f5f5;
				margin-bottom: 23px;
			`;

			leftSection.appendChild(videoDisplay);

			// Right side - Initially spinner, later stickman preview
			const rightSection = document.createElement('div');
			rightSection.style.cssText = `
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: 320px;
				min-width: 320px;
				max-width: 320px;
				min-height: 240px;
			`;

			// Create spinner content
			const spinnerContent = document.createElement('div');
			spinnerContent.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			`;

			const spinner = document.createElement('img');
			spinner.src = 'icons/spinner-light.gif';
			spinner.style.cssText = `
				width: 64px;
				height: 64px;
				margin-bottom: 20px;
			`;

			const processingText = document.createElement('p');
			processingText.textContent = l10n.get("ProcessingVideo") || "Processing Video...";
			processingText.style.cssText = `
				text-align: center;
				color: #666;
				font-size: 14px;
				margin: 0 0 10px 0;
			`;

			const progressText = document.createElement('p');
			progressText.id = 'processing-progress';
			progressText.textContent = '0%';
			progressText.style.cssText = `
				text-align: center;
				color: #666;
				font-size: 14px;
				margin: 0;
			`;

			spinnerContent.appendChild(spinner);
			spinnerContent.appendChild(processingText);
			spinnerContent.appendChild(progressText);
			rightSection.appendChild(spinnerContent);

			contentContainer.appendChild(leftSection);
			contentContainer.appendChild(rightSection);

			// Frame counter
			const frameCounterContainer = document.createElement('div');
			frameCounterContainer.style.cssText = `
				text-align: center;
				margin-top: 10px;
				display: none;
			`;

			const frameCounter = document.createElement('span');
			frameCounter.style.cssText = `
				font-size: 14px;
				color: #333;
				font-weight: bold;
			`;
			frameCounterContainer.appendChild(frameCounter);

			// Button container
			const buttonContainer = document.createElement('div');
			buttonContainer.style.cssText = `
				display: flex;
				justify-content: space-between;
				padding: 20px;
				border-top: 1px solid #e0e0e0;
				background: #f9f9f9;
			`;

			// Cancel button (always active)
			const cancelButton = document.createElement('button');
			cancelButton.style.cssText = `
				padding: 12px 24px;
				background: #666;
				color: white;
				border: none;
				border-radius: 22px;
				line-height: 0;
				cursor: pointer;
				font-size: 14px;
				display: flex;
				align-items: center;
				gap: 8px;
			`;
			cancelButton.innerHTML = `
				<span style="width: 16px; height: 16px; background: url('./icons/dialog-cancel.svg') no-repeat center; background-size: contain;"></span>
				${l10n.get("Cancel") || "Cancel"}
			`;

			// Insert button (initially disabled)
			const insertButton = document.createElement('button');
			insertButton.disabled = true;
			insertButton.style.cssText = `
				padding: 12px 24px;
				background: #cccccc;
				color: #666666;
				border: none;
				border-radius: 22px;
				line-height: 0;
				cursor: not-allowed;
				font-size: 14px;
				display: flex;
				align-items: center;
				gap: 8px;
			`;
			insertButton.innerHTML = `
				<span style="width: 16px; height: 16px; background: url('./icons/dialog-ok.svg') no-repeat center; background-size: contain;"></span>
				${l10n.get("Insert") || "Insert"}
			`;

			buttonContainer.appendChild(cancelButton);
			buttonContainer.appendChild(insertButton);

			// Assemble modal
			modal.appendChild(contentContainer);
			modal.appendChild(buttonContainer);
			modalOverlay.appendChild(modal);
			document.body.appendChild(modalOverlay);

			// Variables for processing state
			let isProcessing = true;
			let processedFrames = null;
			let currentFrame = 0;
			let animationId = null;

			// Cancel button functionality
			cancelButton.addEventListener('click', () => {
				if (animationId) clearTimeout(animationId);
				isProcessing = false;
				document.body.removeChild(video);
				URL.revokeObjectURL(video.src);
				document.body.removeChild(modalOverlay);
			});

			// Start processing when video is loaded
			video.addEventListener('loadedmetadata', async () => {
				try {
					// Get progress element
					const progressElement = document.getElementById('processing-progress');

					// Progress callback function
					const updateProgress = (percentage) => {
						if (progressElement) {
							progressElement.textContent = `${Math.round(percentage)}%`;
						}
					};

					const frames = await extractFramesFromVideo(video, updateProgress);

					if (frames.length > 0) {
						processedFrames = frames;
						isProcessing = false;

						// Switch right side to show stickman preview and replace left side with pose detection
						await showStickmanPreview(rightSection, frameCounterContainer, frameCounter, frames, leftSection, videoDisplay);

						// Enable insert button
						insertButton.disabled = false;
						insertButton.style.cssText = `
							padding: 12px 24px;
							background: #666;
							color: white;
							border: none;
							border-radius: 22px;
							line-height: 0;
							cursor: pointer;
							font-size: 14px;
							display: flex;
							align-items: center;
							gap: 8px;
						`;

						// Insert button functionality
						insertButton.addEventListener('click', () => {
							if (animationId) clearTimeout(animationId);
							document.body.removeChild(video);
							URL.revokeObjectURL(video.src);
							document.body.removeChild(modalOverlay);

							// Extract just the joints for the animation
							const jointFrames = frames.map(frame => frame.joints);
							addVideoAnimationToCanvas(jointFrames);
						});

					} else {
						// No frames detected
						document.body.removeChild(video);
						URL.revokeObjectURL(video.src);
						document.body.removeChild(modalOverlay);
						humane.log(l10n.get("NoFramesDetected") || "No pose detected in video");
					}
				} catch (error) {
					document.body.removeChild(video);
					URL.revokeObjectURL(video.src);
					document.body.removeChild(modalOverlay);
					console.error("Error processing video:", error);
					humane.log(l10n.get("VideoProcessingError") || "Error processing video file");
				}
			});

			video.addEventListener('error', () => {
				document.body.removeChild(video);
				URL.revokeObjectURL(video.src);
				document.body.removeChild(modalOverlay);
				humane.log(l10n.get("VideoLoadError") || "Error loading video file");
			});

			// Close modal when clicking overlay (only if processing is complete)
			modalOverlay.addEventListener('click', (e) => {
				if (e.target === modalOverlay && !isProcessing) {
					if (animationId) clearTimeout(animationId);
					document.body.removeChild(video);
					URL.revokeObjectURL(video.src);
					document.body.removeChild(modalOverlay);
				}
			});
		}

		const modalOverlay = document.createElement('div');
		modalOverlay.className = 'modal-overlay';

		const modal = document.createElement('div');
		modal.className = 'modal-content';
		modal.style.cssText = `
			max-width: 900px;
			width: 90%;
			max-height: 90vh;
			overflow-y: auto;
		`;

		const header = document.createElement('div');
		header.className = 'modal-header-preview';

		const title = document.createElement('h3');
		title.textContent = l10n.get("VideoPreview") || "Video Pose Mapping Preview";
		title.className = 'modal-title';
		title.style.cssText = `
			text-align: center;
			margin-bottom: 15px;
		`;

		const body = document.createElement('div');
		body.className = 'modal-body-preview';

		// Create container for side-by-side canvases
		const canvasContainer = document.createElement('div');
		canvasContainer.style.cssText = `
			display: flex;
			justify-content: center;
			gap: 20px;
			margin-bottom: 15px;
			flex-wrap: wrap;
		`;

		// Original video canvas
		const videoCanvas = document.createElement('canvas');
		videoCanvas.id = 'video-preview-canvas';
		videoCanvas.width = 320;
		videoCanvas.height = 240;
		videoCanvas.style.cssText = `
			border: 2px solid #007acc;
			border-radius: 8px;
			background: #f5f5f5;
		`;

		const videoSection = document.createElement('div');
		videoSection.appendChild(videoCanvas);

		// Stickman canvas
		const stickmanCanvas = document.createElement('canvas');
		stickmanCanvas.id = 'stickman-preview-canvas';
		stickmanCanvas.width = 320;
		stickmanCanvas.height = 240;
		stickmanCanvas.style.cssText = `
			border: 2px solid #ff6600;
			border-radius: 8px;
			background: white;
		`;

		const stickmanSection = document.createElement('div');
		stickmanSection.appendChild(stickmanCanvas);

		canvasContainer.appendChild(videoSection);
		canvasContainer.appendChild(stickmanSection);

		// Controls container
		const controlsContainer = document.createElement('div');
		controlsContainer.style.cssText = 'text-align: center; margin-bottom: 15px;';

		const playBtn = document.createElement('button');
		playBtn.innerHTML = `
			<img src="icons/play.svg" style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;">
			${l10n.get("Play") || "Play"}
		`;
		playBtn.style.cssText = 'margin: 0 5px; padding: 8px 12px; display: inline-flex; align-items: center; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;';

		const prevBtn = document.createElement('button');
		prevBtn.innerHTML = '⏮ Previous';
		prevBtn.style.cssText = 'margin: 0 5px; padding: 8px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;';

		const nextBtn = document.createElement('button');
		nextBtn.innerHTML = 'Next ⏭';
		nextBtn.style.cssText = 'margin: 0 5px; padding: 8px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;';

		controlsContainer.appendChild(prevBtn);
		controlsContainer.appendChild(playBtn);
		controlsContainer.appendChild(nextBtn);

		// Button container
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'modal-button-container';

		// Cancel button
		const cancelButton = document.createElement('button');
		cancelButton.className = 'modal-button';
		cancelButton.innerHTML = `
			<span class="modal-button-icon modal-button-icon-cancel"></span>${l10n.get("Cancel") || "Cancel"}
		`;

		// Add button
		const addButton = document.createElement('button');
		addButton.className = 'modal-button modal-button-confirm';
		addButton.innerHTML = `
				<span class="modal-button-icon modal-button-icon-ok"></span>${l10n.get("AddToCanvas") || "Add to Canvas"}
			`;

		// Draw keypoints on video frame
		function drawPoseKeypoints(ctx, pose, scaleX, scaleY) {
			const keypoints = pose.keypoints;

			// Draw keypoint connections first
			const connections = [
				['leftShoulder', 'rightShoulder'],
				['leftShoulder', 'leftElbow'],
				['leftElbow', 'leftWrist'],
				['rightShoulder', 'rightElbow'],
				['rightElbow', 'rightWrist'],
				['leftShoulder', 'leftHip'],
				['rightShoulder', 'rightHip'],
				['leftHip', 'rightHip'],
				['leftHip', 'leftKnee'],
				['leftKnee', 'leftAnkle'],
				['rightHip', 'rightKnee'],
				['rightKnee', 'rightAnkle'],
				['nose', 'leftShoulder'],
				['nose', 'rightShoulder']
			];

			ctx.strokeStyle = '#00ff00';
			ctx.lineWidth = 2;

			connections.forEach(([start, end]) => {
				const startPoint = keypoints.find(kp => kp.part === start);
				const endPoint = keypoints.find(kp => kp.part === end);

				if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
					ctx.beginPath();
					ctx.moveTo(startPoint.position.x * scaleX, startPoint.position.y * scaleY);
					ctx.lineTo(endPoint.position.x * scaleX, endPoint.position.y * scaleY);
					ctx.stroke();
				}
			});

			// Draw keypoints
			keypoints.forEach(keypoint => {
				if (keypoint.score > 0.3) {
					const x = keypoint.position.x * scaleX;
					const y = keypoint.position.y * scaleY;
					ctx.fillStyle = '#00ff00';
					ctx.beginPath();
					ctx.arc(x, y, 4, 0, Math.PI * 2);
					ctx.fill();

					// Add keypoint label
					ctx.fillStyle = '#000';
					ctx.font = '10px Arial';
					ctx.fillText(keypoint.part, x + 6, y - 6);
				}
			});
		}

		// Show stickman preview in the right section after processing
		async function showStickmanPreview(rightSection, frameCounterContainer, frameCounter, frames, leftSection, videoDisplay) {
			// Clear spinner content
			rightSection.innerHTML = '';

			// Replace the original video with Video + Pose Detection
			if (leftSection && videoDisplay) {
				// Clear the left section
				leftSection.innerHTML = '';

				// Create video preview canvas to show pose mapping
				const videoPoseCanvas = document.createElement('canvas');
				videoPoseCanvas.width = 320;
				videoPoseCanvas.height = 240;
				videoPoseCanvas.style.cssText = `
					width: 320px;
					height: 240px;
					border: 2px solid #666666;
					border-radius: 8px;
					background: #f5f5f5;
					margin-bottom: 23px;
				`;

				leftSection.appendChild(videoPoseCanvas);
			}

			// Create container for stickman preview in right section
			const previewContainer = document.createElement('div');
			previewContainer.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 10px;
				width: 100%;
			`;

			// Create stickman canvas
			const stickmanCanvas = document.createElement('canvas');
			stickmanCanvas.width = 320;
			stickmanCanvas.height = 240;
			stickmanCanvas.style.cssText = `
				width: 320px;
				height: 240px;
				border: 2px solid #666666;
				border-radius: 8px;
				background: white;
			`;

			previewContainer.appendChild(stickmanCanvas);

			rightSection.appendChild(previewContainer);

			// Frame counter under the stickman preview
			frameCounterContainer.appendChild(frameCounter);
			frameCounterContainer.style.display = 'block';
			rightSection.appendChild(frameCounterContainer);
			frameCounter.innerHTML = `Frame: <span id="frame-number">1</span> / ${frames.length}`;

			// Set up animation - get contexts for both canvases
			const videoPoseCtx = leftSection ? leftSection.querySelector('canvas')?.getContext('2d') : null;
			const stickmanCtx = stickmanCanvas.getContext('2d');
			let currentPreviewFrame = 0;

			// Draw frame function
			function drawPreviewFrame(frameIndex) {
				if (frameIndex >= frames.length) return;

				const frameData = frames[frameIndex];
				const { joints, videoFrame, pose } = frameData;

				// Clear canvases
				if (videoPoseCtx) {
					const canvas = videoPoseCtx.canvas;
					videoPoseCtx.clearRect(0, 0, canvas.width, canvas.height);
				}
				stickmanCtx.clearRect(0, 0, stickmanCanvas.width, stickmanCanvas.height);

				// Draw original video frame with pose keypoints (in left section)
				if (videoPoseCtx && videoFrame && pose) {
					const canvas = videoPoseCtx.canvas;
					const tempCanvas = document.createElement('canvas');
					tempCanvas.width = videoFrame.width;
					tempCanvas.height = videoFrame.height;
					const tempCtx = tempCanvas.getContext('2d');
					tempCtx.putImageData(videoFrame, 0, 0);

					// Scale video to fit canvas
					const scaleX = canvas.width / videoFrame.width;
					const scaleY = canvas.height / videoFrame.height;
					const scale = Math.min(scaleX, scaleY);

					const drawWidth = videoFrame.width * scale;
					const drawHeight = videoFrame.height * scale;
					const offsetX = (canvas.width - drawWidth) / 2;
					const offsetY = (canvas.height - drawHeight) / 2;

					videoPoseCtx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);

					// Draw pose keypoints on video
					videoPoseCtx.save();
					videoPoseCtx.translate(offsetX, offsetY);
					videoPoseCtx.scale(scale, scale);
					drawPoseKeypoints(videoPoseCtx, pose, 1, 1);
					videoPoseCtx.restore();
				}

				// Draw stickman (in right section)
				stickmanCtx.fillStyle = '#ffffff';
				stickmanCtx.fillRect(0, 0, stickmanCanvas.width, stickmanCanvas.height);

				// Center the stickman in the canvas
				const stickmanOffsetX = stickmanCanvas.width / 2;
				const stickmanOffsetY = stickmanCanvas.height / 2;

				const centeredJoints = joints.map(joint => ({
					x: joint.x - 200 + stickmanOffsetX,
					y: joint.y - 200 + stickmanOffsetY,
					name: joint.name
				}));

				// Draw stickman
				drawStickmanPreview(stickmanCtx, centeredJoints);

				// Update frame counter
				const frameNumberElement = document.getElementById('frame-number');
				if (frameNumberElement) {
					frameNumberElement.textContent = frameIndex + 1;
				}
			}

			// Animation loop for auto-play
			function animate() {
				drawPreviewFrame(currentPreviewFrame);
				currentPreviewFrame = (currentPreviewFrame + 1) % frames.length;

				return setTimeout(() => {
					requestAnimationFrame(animate);
				}, 200); // 5 FPS preview
			}

			// Start with first frame
			drawPreviewFrame(0);

			// Start auto-play animation
			return animate();
		}

		// Add the video animation frames to canvas as a new stickman
		function addVideoAnimationToCanvas(frames) {
			if (frames.length === 0) return;

			// Calculate random position for the imported stickman on main canvas
			const stickmanHeight = 160;
			const stickmanWidth = 80;
			const margin = 30;

			const minX = stickmanWidth / 2 + margin;
			const maxX = canvas.width - stickmanWidth / 2 - margin;
			const minY = 65 + margin;
			const maxY = canvas.height - 95 - margin;

			let centerX, centerY;
			let attempts = 0;
			const maxAttempts = 20;
			const minDistance = 100;

			// Find a random position that doesn't overlap with existing stickmen
			do {
				centerX = Math.random() * (maxX - minX) + minX;
				centerY = Math.random() * (maxY - minY) + minY;

				const isTooClose = stickmen.some(stickman => {
					const existingCenter = stickman.joints[11] || stickman.joints[2];
					const distance = Math.sqrt(
						Math.pow(centerX - existingCenter.x, 2) +
						Math.pow(centerY - existingCenter.y, 2)
					);
					return distance < minDistance;
				});

				if (!isTooClose) break;
				attempts++;
			} while (attempts < maxAttempts);

			// Fallback to center if random placement fails
			if (attempts >= maxAttempts) {
				centerX = canvas.width / 2;
				centerY = canvas.height / 2;
			}

			// Calculate offset to move from preview position (200, 200) to random position
			const offsetX = centerX - 200;
			const offsetY = centerY - 200;

			// Apply random positioning to all frames
			const repositionedFrames = frames.map(frame => {
				return frame.map(joint => ({
					x: joint.x + offsetX,
					y: joint.y + offsetY,
					name: joint.name
				}));
			});

			// Create new stickman ID
			let newStickmanId;
			if (currentenv && currentenv.user) {
				newStickmanId = `${currentenv.user.networkId}_${Date.now()}`;
			} else {
				newStickmanId = nextStickmanId++;
			}

			// Ensure all frames have proper joint distances
			repositionedFrames.forEach(frame => enforceJointDistances(frame));

			// Create new stickman with first frame
			const newStickman = {
				id: newStickmanId,
				joints: deepClone(repositionedFrames[0])
			};

			stickmen.push(newStickman);

			// Set up base frame and deltas
			baseFrames[newStickmanId] = deepClone(repositionedFrames[0]);
			deltaFrames[newStickmanId] = [];
			currentFrameIndices[newStickmanId] = 0;

			// Calculate deltas for subsequent frames
			for (let i = 1; i < repositionedFrames.length; i++) {
				const delta = calculateDeltas(repositionedFrames[i], repositionedFrames[i - 1]);
				if (delta) {
					deltaFrames[newStickmanId].push(delta);
				}
			}

			// Associate with current user's color
			if (currentenv && currentenv.user && currentenv.user.colorvalue) {
				stickmanUserColors[newStickmanId] = currentenv.user.colorvalue;
			}

			// Select the new stickman
			selectedStickmanIndex = stickmen.length - 1;
			neckManuallyMoved = false;

			// Broadcast in shared mode
			if (isShared && presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'new_stickman',
					content: {
						stickman: {
							id: newStickmanId,
							joints: newStickman.joints,
							baseFrame: baseFrames[newStickmanId],
							deltaFrames: deltaFrames[newStickmanId],
							currentFrameIndex: currentFrameIndices[newStickmanId]
						},
						color: stickmanUserColors[newStickmanId]
					}
				});
			}

			updateTimeline();
			updateRemoveButtonState();
			render();

			humane.log(`${l10n.get("VideoAnimationImported") || "Video animation imported successfully!"} (${repositionedFrames.length} ${l10n.get("Frames") || "frames"})`);
		}

		// function for reconstructing frames with custom base/delta frames
		function reconstructFrame(stickmanId, frameIndex, customBaseFrames = null, customDeltaFrames = null) {
			const baseFramesSource = customBaseFrames || baseFrames;
			const deltaFramesSource = customDeltaFrames || deltaFrames;

			if (!baseFramesSource[stickmanId] || frameIndex < 0) {
				return null;
			}

			if (frameIndex === 0) {
				// First frame is always the base 
				return {
					id: stickmanId,
					joints: deepClone(baseFramesSource[stickmanId])
				};
			}

			if (!deltaFramesSource[stickmanId] || frameIndex - 1 >= deltaFramesSource[stickmanId].length) {
				return null;
			}

			// Start with base frame and apply deltas incrementally
			let currentJoints = deepClone(baseFramesSource[stickmanId]);

			for (let i = 0; i < frameIndex; i++) {
				if (deltaFramesSource[stickmanId][i]) {
					currentJoints = applyDeltas(currentJoints, deltaFramesSource[stickmanId][i]);
					// Enforce joint distance constraints after each delta application
					enforceJointDistances(currentJoints);
				}
			}

			return {
				id: stickmanId,
				joints: currentJoints
			};
		}

		// START APPLICATION

		// Process localize event
		window.addEventListener("localized", function () {
			translateToolbarButtons();
		});

		activity.setup();
		
		// Initialize network check for AI model availability
		if (typeof Stickman !== 'undefined' && Stickman.NetworkCheck) {
			// Get environment asynchronously (it requires a callback)
			env.getEnvironment(function(err, environment) {
				if (err) {
					startNetworkCheck(null);
				} else {
					startNetworkCheck(environment);
				}
			});
		} else {
			initializeAnimator();
		}
		
		function startNetworkCheck(environment) {
			// Set remote base URL if we're connected to a Sugarizer server
			if (environment && environment.server) {
				Stickman.NetworkCheck.setRemoteBaseUrl(environment.server);
			}
			
			// Check model availability
			Stickman.NetworkCheck.check(function(hasLocalModels) {
				// Network check completed, models will load based on availability
			});
			
			initializeAnimator();
		}
	});
});