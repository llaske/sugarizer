define(["sugar-web/activity/activity","tutorial","l10n","sugar-web/env"], function (activity,tutorial,l10n,env) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity
		activity.setup();

		// Initialize variables
		var body = document.getElementById("body");
		var innerWidth = body.offsetWidth;
		var innerHeight = body.offsetHeight;
		var toolbarHeight = 55;
		var outerWidth = 0;
		var init = false;
		var gravityMode = 0;
		var currentType = 0;
		var physicsActive = true;
		var speedMultiplier = 1;
		var readyToWatch = true;
		var sensorMode = false;
		var newtonMode = false;
		var resizeTimer = null;
		var savedPositions = null; // Add variable to store positions

		// Initialize buttons
		var sensorButton = document.getElementById("sensor-button");
		var gravityButton = document.getElementById("gravity-button");
		var appleButton = document.getElementById("apple-button");
		var runButton = document.getElementById("run-button");
		var timelapseButton = document.getElementById("timelapse-button");

		// Set initial icon for timelapse button
		timelapseButton.style.backgroundImage = "url(../../activities/PhysicsJS.activity/icons/speed-1x-icon.png)";
		timelapseButton.title = "Speed: 1x";

		// Set language
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);
		});

		// Initialize cordova
		var useragent = navigator.userAgent.toLowerCase();
		if (useragent.indexOf('android') != -1 || useragent.indexOf('iphone') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('mozilla/5.0 (mobile') != -1) {
			document.addEventListener('deviceready', function() {
				readyToWatch = true;
			}, false);
			sensorButton.disabled = false;
			sensorButton.classList.add('active');
		} else {
			sensorButton.disabled = true;
		}

		// Initialize the physics world with adjusted timestep
		Physics({ timestep: 6 }, function (world) {

			// bounds of the window
			var viewWidth = innerWidth
				,viewportBounds = Physics.aabb(0-outerWidth, toolbarHeight, innerWidth+outerWidth, innerHeight)
				,edgeBounce
				,renderer
				;

			// let's use the pixi renderer
			requirejs(['pixi'], function( PIXI ){
				window.PIXI = PIXI;
				// create a renderer
				renderer = Physics.renderer('pixi', {
					el: 'viewport'
				});

				// add the renderer
				world.add(renderer);
				// render on each step
				world.on('step', function () {
					world.render();
					if (!init) {
						init = true;
						zoom();
					}
					if (readyToWatch) {
						if (window.Accelerometer) {
							var accelerometer = new Accelerometer({ frequency: 500 });
							if (accelerometer) {
								accelerometer.addEventListener('reading', accelerationChanged);
								accelerometer.start();
							}
							readyToWatch = false;
						} else if (navigator.accelerometer) {	
							navigator.accelerometer.watchAcceleration(accelerationChanged, null, { frequency: 500 });
							readyToWatch = false;
						}
					}
				});
				// add the interaction
				world.add(Physics.behavior('interactive', { el: renderer.container }));
			});

			// constrain objects to these bounds
			edgeBounce = Physics.behavior('edge-collision-detection', {
				aabb: viewportBounds
				,restitution: 0.2
				,cof: 0.8
			});

			// resize events
			window.addEventListener('resize', function () {
				if (resizeTimer) {
					clearTimeout(resizeTimer);
				}
				resizerTimer = setTimeout(function() {
					renderer.resize(body.offsetWidth,body.offsetHeight);
					// as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
					viewportBounds = Physics.aabb(0-outerWidth, toolbarHeight, renderer.width+outerWidth, renderer.height);
					// update the boundaries
					edgeBounce.setAABB(viewportBounds);
					innerWidth = body.offsetWidth;
					innerHeight = body.offsetHeight;
					zoom();
				}, 500);

			}, true);

			// handle toolbar buttons
			document.getElementById("box-button").addEventListener('click', function (e) {
				currentType = 1;
				document.getElementById("box-button").classList.add('active');
				document.getElementById("circle-button").classList.remove('active');
				document.getElementById("polygon-button").classList.remove('active');
				document.getElementById("triangle-button").classList.remove('active');
				document.getElementById("clear-button").classList.remove('active');
			}, true);

			document.getElementById("circle-button").addEventListener('click', function (e) {
				currentType = 0;
				document.getElementById("circle-button").classList.add('active');
				document.getElementById("box-button").classList.remove('active');
				document.getElementById("polygon-button").classList.remove('active');
				document.getElementById("triangle-button").classList.remove('active');
				document.getElementById("clear-button").classList.remove('active');
			}, true);

			document.getElementById("triangle-button").addEventListener('click', function (e) {
				currentType = 2;
				document.getElementById("triangle-button").classList.add('active');
				document.getElementById("box-button").classList.remove('active');
				document.getElementById("circle-button").classList.remove('active');
				document.getElementById("polygon-button").classList.remove('active');
				document.getElementById("clear-button").classList.remove('active');
			}, true);

			document.getElementById("polygon-button").addEventListener('click', function (e) {
				currentType = 3;
				document.getElementById("polygon-button").classList.add('active');
				document.getElementById("box-button").classList.remove('active');
				document.getElementById("circle-button").classList.remove('active');
				document.getElementById("triangle-button").classList.remove('active');
				document.getElementById("clear-button").classList.remove('active');
			}, true);

			document.getElementById("clear-button").addEventListener('click', function (e) {
				currentType = -1;
				document.getElementById("clear-button").classList.add('active');
				document.getElementById("box-button").classList.remove('active');
				document.getElementById("circle-button").classList.remove('active');
				document.getElementById("polygon-button").classList.remove('active');
				document.getElementById("triangle-button").classList.remove('active');
			}, true);

			gravityButton.addEventListener('click', function () {
				setGravity((gravityMode + 1)%8);
			}, true);

			runButton.addEventListener('click', function () {
				togglePause();
			}, true);

			// Launch tutorial
			document.getElementById("help-button").addEventListener('click', function(e) {
				tutorial.start();
			});

			document.getElementById("fullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.zIndex = -1;
				document.getElementById("unfullscreen-button").style.visibility = "visible";
				toolbarHeight = 0;
				document.dispatchEvent(new Event('resize'));
				event.preventDefault();
			});

			document.getElementById("unfullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.zIndex = 2;
				document.getElementById("unfullscreen-button").style.visibility = "hidden";
				toolbarHeight = 55;
				document.dispatchEvent(new Event('resize'));
				event.preventDefault();
			});

			// Handle acceleration and gravity mode
			sensorButton.addEventListener('click', function () {
				sensorMode = !sensorMode;
				if (sensorMode)
					sensorButton.classList.add('active');
				else
					sensorButton.classList.remove('active');
			}, true);

			appleButton.addEventListener('click', function () {
				newtonMode = !newtonMode;
				if (newtonMode) {
					world.remove(gravity);
					world.add(newton);
					appleButton.classList.add('active');
					gravityButton.disabled = true;
				} else {
					world.remove(newton);
					world.add(gravity);
					appleButton.classList.remove('active');
					gravityButton.disabled = false;
				}
			}, true);

			// Add function to save positions
			function savePositions() {
				var bodies = world.getBodies();
				savedPositions = [];
				for(var i = 0; i < bodies.length; i++) {
					savedPositions.push({
						x: bodies[i].state.pos.x,
						y: bodies[i].state.pos.y,
						angle: bodies[i].state.angular.pos,
						vel: {
							x: bodies[i].state.vel.x,
							y: bodies[i].state.vel.y
						}
					});
				}
			}

			// Add function to restore positions
			function restorePositions() {
				if (!savedPositions) return;
				var bodies = world.getBodies();
				for(var i = 0; i < bodies.length && i < savedPositions.length; i++) {
					bodies[i].state.pos.x = savedPositions[i].x;
					bodies[i].state.pos.y = savedPositions[i].y;
					bodies[i].state.angular.pos = savedPositions[i].angle;
					bodies[i].state.vel.x = savedPositions[i].vel.x;
					bodies[i].state.vel.y = savedPositions[i].vel.y;
				}
				savedPositions = null;
			}

			// Add timelapse button event listener
			document.getElementById("timelapse-button").addEventListener("click", function() {
				// Only increase speed up to 4x
				if (speedMultiplier < 4) {
					speedMultiplier = speedMultiplier + 1;
					this.style.backgroundImage = "url(../../activities/PhysicsJS.activity/icons/speed-" + speedMultiplier + "x-icon.png)";
					this.title = "Speed: " + speedMultiplier + "x";
					
					// Wake up all bodies when speed changes
					world.each(function(body) {
						if (body.treatment === "dynamic") {
							body.sleep(false);
						}
					});
				}
			});

			function accelerationChanged(accelerationEvent) {
				if (!sensorMode) return;
				var acceleration = window.Accelerometer ? accelerationEvent.target : accelerationEvent;
				if (acceleration.x < -4.5) {
					if (acceleration.y > 4.75)
						setGravity(3);
					else if (acceleration.y < -4.75)
						setGravity(5);
					else
						setGravity(4);
				} else if (acceleration.x <= 4.5 && acceleration.x >= -4.5) {
					if (acceleration.y > 4.75)
						setGravity(2);
					else if (acceleration.y < -4.75)
						setGravity(6);
				} else if (acceleration.x > 4.5) {
					if (acceleration.y > 4.75)
						setGravity(1);
					else if (acceleration.y < -4.75)
						setGravity(7);
					else
						setGravity(0);
				}
			}

			// Save/Load world
			loadWorld();
			var stopButton = document.getElementById("stop-button");
			stopButton.addEventListener('click', function (event) {
				console.log("writing...");
				saveWorld(function (error) {
					if (error === null) {
						console.log("write done.");
					}
					else {
						console.log("write failed.");
					}
				});
			});

			// Force resize renderer at startup to avoid glitch margin
			var initialResize = function() {
				if (renderer) {
					renderer.resize(body.offsetWidth,body.offsetHeight);
				} else {
					setTimeout(initialResize, 300);
				}
			};
			setTimeout(initialResize, 300);

			var colors = [
				['0x268bd2', '0x0d394f']
				,['0xc93b3b', '0x561414']
				,['0xe25e36', '0x79231b']
				,['0x6c71c4', '0x393f6a']
				,['0x58c73c', '0x30641c']
				,['0xcac34c', '0x736a2c']
			];

			function zoom() {
				if (window.devicePixelRatio == 1) {
					return;
				}
				var canvas = document.getElementById("viewport").children[0];
				var zoom = 1.0 / window.devicePixelRatio;
				canvas.style.zoom = zoom;
				var useragent = navigator.userAgent.toLowerCase();
				if (useragent.indexOf('chrome') == -1) {
					canvas.style.MozTransform = "scale("+zoom+")";
					canvas.style.MozTransformOrigin = "0 0";
				}
				world.wakeUpAll();
			}

			function random( min, max ){
				return (Math.random() * (max-min) + min)|0;
			}

			function dropInBody(type, pos){
				var body;
				var c;

				switch (type){
					case 0: // circle
						c = colors[random(0, colors.length-1)];
						body = Physics.body('circle', {
							x: pos.x,
							y: pos.y,
							vx: random(-5, 5)/100,
							vy: random(-5, 5)/100,
							radius: 40,
							restitution: 0.9,
							styles: {
								fillStyle: c[0],
								strokeStyle: c[1],
								lineWidth: 1,
								angleIndicator: c[1]
							}
						});
						break;

					case 1: // square
						c = colors[random(0, colors.length-1)];
						var l = random(0, 70);
						body = Physics.body('rectangle', {
							width: 50+l,
							height: 50+l,
							x: pos.x,
							y: pos.y,
							vx: random(-5, 5)/100,
							vy: random(-5, 5)/100,
							restitution: 0.9,
							styles: {
								fillStyle: c[0],
								strokeStyle: c[1],
								lineWidth: 1,
								angleIndicator: c[1]
							}
						});
						break;

					case 2: // triangle
					case 3: // polygon
						var s = (type == 2 ? 3 : random( 5, 10 ));
						c = colors[ random(0, colors.length-1) ];
						body = Physics.body('convex-polygon', {
							vertices: Physics.geometry.regularPolygonVertices( s, 30 ),
							x: pos.x,
							y: pos.y,
							vx: random(-5, 5)/100,
							vy: random(-5, 5)/100,
							angle: random( 0, 2 * Math.PI ),
							restitution: 0.9,
							styles: {
								fillStyle: c[0],
								strokeStyle: c[1],
								lineWidth: 1,
								angleIndicator: c[1]
							}
						});
						break;
				}

				body.treatment = "static";
				world.add(body);
				return body;
			}

			// Save world to datastore
			function saveWorld(callback) {
				// Build bodies list
				var bodies = world.getBodies();
				var objects = [];
				for(var i = 0 ; i < bodies.length ; i++) {
					var object = serializeObject(bodies[i]);
					objects.push(object);
				}

				// Save to datastore
				var datastoreObject = activity.getDatastoreObject();
				var jsonData = JSON.stringify({world: objects});
				datastoreObject.setDataAsText(jsonData);
				datastoreObject.save(callback);
			}

			function serializeObject(body) {
				var object = {};
				object.type = body.geometry.name;
				if (object.type == "circle") {
					object.radius = body.radius;
				} else if (body.geometry.name == "rectangle") {
					object.width = body.view.width;
					object.height = body.view.height;
				} else if (body.geometry.name == "convex-polygon") {
					object.vertices = body.vertices;
				}
				object.restitution = body.restitution;
				object.styles = body.styles;
				object.x = body.view.x;
				object.y = body.view.y;
				return object;
			}

			// Load world from datastore
			function loadWorld(objects) {
				var datastoreObject = activity.getDatastoreObject();
				datastoreObject.loadAsText(function (error, metadata, data) {
					var data = JSON.parse(data);
					if (data == null)
						return;

					// Create bodies
					var objects = data.world;
					for(var i = 0 ; i < objects.length ; i++) {
						var newBody = deserializeObject(objects[i]);
						world.add(newBody);
					}
				});
			}

			function deserializeObject(savedObject) {
				var newOptions = {
					x: savedObject.x,
					y: savedObject.y,
					restitution: savedObject.restitution,
					styles: savedObject.styles
				};
				if (savedObject.angle)
					newOptions.angle = savedObject.angle;
				if (savedObject.type == "circle") {
					newOptions.radius = savedObject.radius;
				} else if (savedObject.type == "rectangle") {
					newOptions.width = savedObject.width;
					newOptions.height = savedObject.height;
				} else if (savedObject.type = "convex-polygon") {
					newOptions.vertices = savedObject.vertices;
				}
				return Physics.body(savedObject.type, newOptions);
			}

			function setBodiesTreatmentStatic() {
				var bodies = world.getBodies();
				bodies.forEach(function(item, index, array) {
					item.treatment = 'static';
				});
			}

			function setBodiesTreatmentDynamic() {
				var bodies = world.getBodies();
				bodies.forEach(function(item, index, array) {
					item.treatment = 'dynamic';
				});
			}

			function togglePause() {
			    if (physicsActive) {
					document.getElementById("run-button").classList.remove('running');
					document.getElementById("run-button").setAttribute('title', 'Play');
					Physics.util.ticker.stop(); // Stop the physics ticker
					setBodiesTreatmentStatic();
				} else {
					document.getElementById("run-button").classList.add('running');
					document.getElementById("run-button").setAttribute('title', 'Pause');
					Physics.util.ticker.start(); // Start the physics ticker
					setBodiesTreatmentDynamic();
					world.wakeUpAll(); // Ensure all bodies are active when resuming
				}
				physicsActive = !physicsActive;
			}

			// Change gravity value
			function setGravity(value) {
				if (gravityMode == value) return;
				var acc = {};
				switch(value) {
				case 0:
					acc = { x: 0, y: 0.0004 };
					break;
				case 1:
					acc = { x: 0.0004, y: 0.0004 };
					break;
				case 2:
					acc = { x: 0.0004, y: 0 };
					break;
				case 3:
					acc = { x: 0.0004, y: -0.0004 };
					break;
				case 4:
					acc = { x: 0, y: -0.0004 };
					break;
				case 5:
					acc = { x: -0.0004, y: -0.0004 };
					break;
				case 6:
					acc = { x: -0.0004, y: 0 };
					break;
				case 7:
					acc = { x: -0.0004, y: 0.0004 };
					break;
				}
				var reverse = (window.orientation == -90 ? -1 : 1);
				acc = { x: acc.x * reverse, y: acc.y * reverse };
				document.getElementById("gravity-button").style.backgroundImage = "url(icons/gravity"+(reverse == -1 ? (value+4)%8 : value)+".svg)";
				gravity.setAcceleration(acc);
				world.wakeUpAll();
				gravityMode = value;
			}

			function isEdgeCollision (distance, createdStart, type) {
				if (type == "rectangle") distance /= 1.5; //root2 ceil to 1.5 for diagonal
				return (
					distance > createdStart.x ||
					distance > innerWidth-createdStart.x ||
					distance > createdStart.y-toolbarHeight ||
					distance > innerHeight-createdStart.y
				);
			}

			// add some fun interaction
			var createdBody = null;
			var createdStart = null;
			var distance = null;
			world.on({
				'interact:poke': function( pos ){
					// make previously created body dynamic
					if (createdBody && physicsActive) {
						createdBody.treatment = "dynamic";
					}
					// create body at a static place
					if (currentType != -1 && pos.y > toolbarHeight) {
						createdBody = dropInBody(currentType, pos);
						createdStart = pos;
					}
				}
				,'interact:move': function( pos ){
					// update size of created body
					if (createdBody != null) {
						// compute new size
						var distx = createdStart.x - pos.x;
						var disty = createdStart.y - pos.y;
						var prevDistance = distance;
						distance = Math.sqrt(Math.abs(distx*distx-disty*disty)) | 0;
						
						if (isEdgeCollision(distance, createdStart, createdBody.geometry.name)) {
							distance = prevDistance;
						}
						if (createdBody.view != null) {
							// Recreate the object with new size
							var object = serializeObject(createdBody);
							if (object.type == "circle") {
								object.radius = Math.max(40, distance);
							} else if (object.type == "rectangle") {
								object.width = object.height = Math.max(50, distance);
							} else if (object.type == "convex-polygon") {
								object.vertices = Physics.geometry.regularPolygonVertices( object.vertices.length, Math.max(30, distance));
							}
							world.removeBody(createdBody);
							var v1 = new Physics.vector(createdStart.x, 0);
							var v2 = new Physics.vector(pos.x-createdStart.x, pos.y-createdStart.y);
							object.angle = -v1.angle(v2);
							createdBody = deserializeObject(object);
							createdBody.treatment = "static";
							world.add(createdBody);
						}
					}
				}
				,'interact:release': function( pos ){
					if (physicsActive) {
						if (createdBody != null) {
							createdBody.treatment = "dynamic";
						}
						world.wakeUpAll();
					}
					createdBody = null;
				}
				,'interact:grab': function ( data ) {
					if (currentType == -1) {
						world.remove(data.body);
					}
				}
			});

			// add things to the world
			var gravity = Physics.behavior('constant-acceleration');
			var newton = Physics.behavior('newtonian', { strength: .5 });
			world.add([
				gravity
				,Physics.behavior('body-impulse-response')
				,Physics.behavior('body-collision-detection')
				,Physics.behavior('sweep-prune')
				,edgeBounce
			]);

			// subscribe to ticker to advance the simulation
			Physics.util.ticker.on(function( time ) {
				// next step with speed multiplier
				world.step( time * speedMultiplier );

				// remove bodies out of bounds with adjusted limits
				var bodies = world.getBodies();
				var limit = outerWidth / 2;
				if (limit > 0) {
					for(var i = 0 ; i < bodies.length ; i++) {
						var body = bodies[i];
						// Adjust limits based on speed
						var adjustedLimit = limit * speedMultiplier * 2;
						// Only remove if object is completely out of bounds
						if (body.state.pos.x < -adjustedLimit || 
							body.state.pos.x > innerWidth + adjustedLimit ||
							body.state.pos.y < -adjustedLimit || 
							body.state.pos.y > innerHeight + adjustedLimit) {
							world.remove(body);
						}
					}
				}
			});
		});
    });

});
