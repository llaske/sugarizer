define(["sugar-web/activity/activity","tutorial","l10n","sugar-web/env"], function (activity,tutorial,l10n,env) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity
		activity.setup();

		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);
		});

		// Initialize cordova
		var useragent = navigator.userAgent.toLowerCase();
		var sensorButton = document.getElementById("sensor-button");
		var gravityButton = document.getElementById("gravity-button");
		var appleButton = document.getElementById("apple-button");
		var waterButton = document.getElementById("water-button");
		var runButton = document.getElementById("run-button");
		var readyToWatch = false;
		var sensorMode = true;
		var newtonMode = false;
		var resizeTimer = null;
		var watermode = false;
		var currentGravity = { x: 0, y: 0.0004 };


		if (useragent.indexOf('android') != -1 || useragent.indexOf('iphone') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('mozilla/5.0 (mobile') != -1) {
			document.addEventListener('deviceready', function() {
				readyToWatch = true;
			}, false);
			sensorButton.disabled = false;
			sensorButton.classList.add('active');
		} else {
			sensorButton.disabled = true;
		}

		// Initialize the world
		var body = document.getElementById("body");
		var innerWidth = body.offsetWidth;
		var innerHeight = body.offsetHeight;
		var prevWidth = innerWidth;
		var prevHeight = innerHeight;
		var toolbarHeight = 55;
		var outerWidth = 0; // Use to determine if items could disappear, could be 300;
		var init = false;
		var gravityMode = 0;
		var currentType = 0;
		var physicsActive = true;

		Physics({ timestep: 6 }, function (world) {

			window.world = world;

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

			
			
			const WATER_PERCENTAGE = 0.60; // fraction of screen water covers
			const WATER = {
				enabled: false,
				region: null,      // 'bottom', 'top', 'left', 'right', 'bottom-right', etc
				boundary: null,    // {x1,y1,x2,y2} for rectangles, {p1,p2,p3} for triangles
				density: 0.0011,
				drag: 0.02,
				lift: 0.9,
				
				updateBoundary: function() {
					const w = innerWidth, h = innerHeight;
					const px = currentGravity.x, py = currentGravity.y;
					// Reset
					this.boundary = null;
					this.region = null;
					
					if (Math.abs(px) < 0.0001 && py > 0) {
						this.region = 'bottom';
						this.boundary = { x1: 0, y1: h*(1-WATER_PERCENTAGE), x2: w, y2: h };
					} else if (Math.abs(px) < 0.0001 && py < 0) { 
						this.region = 'top';
						this.boundary = { x1: 0, y1: 0, x2: w, y2: h*WATER_PERCENTAGE };
					} else if (px > 0 && Math.abs(py) < 0.0001) { 
						this.region = 'right';
						this.boundary = { x1: w*(1-WATER_PERCENTAGE), y1: 0, x2: w, y2: h };
					} else if (px < 0 && Math.abs(py) < 0.0001) { 
						this.region = 'left';
						this.boundary = { x1: 0, y1: 0, x2: w*WATER_PERCENTAGE, y2: h };
					} else if (px > 0 && py > 0) { 
						this.region = 'bottom-right';
						this.boundary = {
							p1: {x: w*(1-WATER_PERCENTAGE), y: h}, 
							p2: {x: w, y: h}, 
							p3: {x: w, y: h*(1-WATER_PERCENTAGE)}
						};
					} else if (px < 0 && py > 0) { 
						this.region = 'bottom-left';
						this.boundary = {
							p1: {x: 0, y: h*(1-WATER_PERCENTAGE)}, 
							p2: {x: 0, y: h}, 
							p3: {x: w*WATER_PERCENTAGE, y: h}
						};
					} else if (px > 0 && py < 0) { 
						this.region = 'top-right';
						this.boundary = {
							p1: {x: w*(1-WATER_PERCENTAGE), y: 0}, 
							p2: {x: w, y: 0}, 
							p3: {x: w, y: h*WATER_PERCENTAGE}
						};
					} else if (px < 0 && py < 0) { 
						this.region = 'top-left';
						this.boundary = {
							p1: {x: 0, y: 0}, 
							p2: {x: w*WATER_PERCENTAGE, y: 0}, 
							p3: {x: 0, y: h*WATER_PERCENTAGE}
						};
					}
					const viewport = document.getElementById('viewport');
					if (viewport && this.region) {
						viewport.setAttribute('data-water-region', this.region);
					}
				},
				isInside: function(body) {
					if (!this.boundary) return false;
					const x = body.state.pos.x;
					const y = body.state.pos.y;
					// Rectangle check
					if (this.boundary.x1 !== undefined) {
						return x >= this.boundary.x1 && x <= this.boundary.x2 &&
						y >= this.boundary.y1 && y <= this.boundary.y2;
					}
					// Triangle check using barycentric coordinates
					if (this.boundary.p1) {
						const {p1, p2, p3} = this.boundary;
						const denom = (p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y);
						const a = ((p2.y - p3.y)*(x - p3.x) + (p3.x - p2.x)*(y - p3.y)) / denom;
						const b = ((p3.y - p1.y)*(x - p3.x) + (p1.x - p3.x)*(y - p3.y)) / denom;
						const c = 1 - a - b;
						return a >= 0 && b >= 0 && c >= 0;
					}
					return false;
				}
			};




			

			const DENSITY_MAP = {
				VERY_LIGHT: 0.0008,
				LIGHT: 0.0009,
				MEDIUM: 0.0012,
				HEAVY: 0.0018,
				VERY_HEAVY: 0.0025
			};
			function getDensityBySize(body) {
				if (body.geometry.name === 'circle') {
					const r = body.radius;
					if (r < 50) return DENSITY_MAP.VERY_LIGHT;
					else if (r < 60 && r >= 50) return DENSITY_MAP.LIGHT;
					else if (r >= 100) return DENSITY_MAP.VERY_HEAVY;
					else if (r > 80) return DENSITY_MAP.HEAVY;
					else return DENSITY_MAP.MEDIUM;
				} 
    
				if (body.geometry.name === 'rectangle') {
					const size = Math.max(body.geometry.width, body.geometry.height);
					if (size < 50) return DENSITY_MAP.VERY_LIGHT;
					else if (size < 70) return DENSITY_MAP.LIGHT;
					else if (size > 80) return DENSITY_MAP.HEAVY;
					else if (size >= 100) return DENSITY_MAP.VERY_HEAVY;
					else return DENSITY_MAP.MEDIUM;
				}

				if (body.geometry.name === 'convex-polygon') {
					const q=body.geometry.vertices[0];
					const polyRadius = Math.sqrt(q.x * q.x + q.y * q.y);
					if (polyRadius < 50) {
						return DENSITY_MAP.VERY_LIGHT;
					} else if (polyRadius < 70 && polyRadius >= 50) {
						return DENSITY_MAP.LIGHT;
					} else if (polyRadius > 80) {
						return DENSITY_MAP.HEAVY;
					} else if (polyRadius >= 100) {
						return DENSITY_MAP.VERY_HEAVY;
					}
					else{
						return DENSITY_MAP.MEDIUM;
					}
				}
				return DENSITY_MAP.MEDIUM; 
				}
			
				


			var waterBehavior = Physics.behavior('water', function (parent) {
				return {
					behave: function (data) {
						if (!WATER.enabled) return;
						var bodies = data.bodies;
						const gravityAccX = currentGravity.x || 0;
						const gravityAccY = currentGravity.y || 0; 
						const g=0.0004;
						const gravityAcc = Math.sqrt(gravityAccX * gravityAccX + gravityAccY * gravityAccY);

						for (var i = 0; i < bodies.length; i++) {
							var body = bodies[i];
							if (!WATER.isInside(body)) continue;
							body.density = getDensityBySize(body);
							const v = body.state.vel;
							// Dynamic Drag
							const dragFactor = (body.density > WATER.density) ? WATER.drag * 0.5 : WATER.drag;
							body.applyForce({
								x: -v.x * dragFactor * body.mass,
								y: -v.y * dragFactor * body.mass
							});
							// Archimedes Buoyancy Buoyancy Force = Weight of displaced water
							// Formula: F = -(Density_Water / Density_Body) * Weight_of_Body
							const displacementRatio = WATER.density / body.density;
							const weight = body.mass * g;
							let buoyancyForceX=0;
							let buoyancyForceY=0;
							if(gravityAccX > 0){
								buoyancyForceX = -(displacementRatio * weight);
							} else if(gravityAccX < 0){ 
								buoyancyForceX = (displacementRatio * weight);
							}
							if(gravityAccY > 0){
								buoyancyForceY = -(displacementRatio * weight);
							} else if(gravityAccY < 0){
								buoyancyForceY = (displacementRatio * weight);
							}
							body.applyForce({
								x: buoyancyForceX * WATER.lift,
								y: buoyancyForceY * WATER.lift
							});
							// If density is higher than water, adding a little extra downward push
							if (body.density > WATER.density) {
								body.applyForce({ x: gravityAccX*body.mass*0.2, y:  gravityAccY*body.mass*0.2 });
							}
							body.state.angular.vel *= 0.95;
						}
						
					}
					
				};
			});



			// resize events
			// Optimized Real-Time Resize
			window.addEventListener('resize', function () {
				const newWidth = body.offsetWidth;
				const newHeight = body.offsetHeight;
				// 1. Calculate the instantaneous scale ratio
				const scaleX = newWidth / prevWidth;
				const scaleY = newHeight / prevHeight;
				// 2. Update Physics Bounds immediately
				viewportBounds = Physics.aabb(0 - outerWidth, toolbarHeight, newWidth + outerWidth, newHeight);
				edgeBounce.setAABB(viewportBounds);
				// 3. Update all bodies smoothly
				var physicsBodies = world.getBodies();
				physicsBodies.forEach(function(b) {
					// Update positions based on the change ratio
					b.state.pos.x *= scaleX;
					b.state.pos.y *= scaleY;
					// Scale velocity so they don't lose or gain momentum unnaturally
					b.state.vel.x *= scaleX;
					b.state.vel.y *= scaleY;
					b.recalc(); 
				});

				// 4. Update the renderer immediately for visual feedback
				if (renderer) {
					renderer.resize(newWidth, newHeight);
				}
				// 5. Update global state for the NEXT resize event
				innerWidth = newWidth;
				innerHeight = newHeight;
				prevWidth = newWidth;
				prevHeight = newHeight;
				// Update water and force a render frame
				WATER.updateBoundary();
				world.wakeUpAll();
				world.render(); 
			}, true);
			// handle toolbar buttons
			document.getElementById("box-button").addEventListener('click', function (e) {
				currentType = 1;
				switchToType(currentType);
			}, true);
			document.getElementById("circle-button").addEventListener('click', function (e) {
				currentType = 0;
				switchToType(currentType);
			}, true);

			document.getElementById("triangle-button").addEventListener('click', function (e) {
				currentType = 2;
				switchToType(currentType);
			}, true);

			document.getElementById("polygon-button").addEventListener('click', function (e) {
				currentType = 3;
				switchToType(currentType);
			}, true);

			gravityButton.addEventListener('click', function () {
				setGravity((gravityMode + 1)%8);
			}, true);

			runButton.addEventListener('click', function () {
				togglePause();
			}, true);

			document.getElementById("clear-button").addEventListener('click', function () {
				currentType = -1;
				switchToType(currentType);
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
					world.remove(waterBehavior);
					WATER.enabled = false;
					watermode = false; 
					waterButton.classList.remove('active');
					document.getElementById('viewport').classList.remove('water-mode');
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
			
			waterButton.addEventListener('click', function () {
				watermode = !watermode;
				if (watermode) {
					WATER.enabled = true;
					newtonMode = false;
					world.remove(newton);
					appleButton.classList.remove('active');
					world.add(gravity);
					world.add(waterBehavior);
        			waterButton.classList.add('active');
					gravityButton.disabled = false;
					WATER.updateBoundary();
        			document.getElementById('viewport').classList.add('water-mode');
    			} else {
					world.remove(waterBehavior);
					WATER.enabled = false;
        			waterButton.classList.remove('active');
					gravityButton.disabled = false;
        			document.getElementById('viewport').classList.remove('water-mode');
    			}
			}, true);

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

			function switchToType(newtype) {
				document.getElementById("box-button").classList.remove('active');
				document.getElementById("circle-button").classList.remove('active');
				document.getElementById("polygon-button").classList.remove('active');
				document.getElementById("triangle-button").classList.remove('active');
				document.getElementById("clear-button").classList.remove('active');
				if (newtype == 0) document.getElementById("circle-button").classList.add('active');
				else if (newtype == 1) document.getElementById("box-button").classList.add('active');
				else if (newtype == 2) document.getElementById("triangle-button").classList.add('active');
				else if (newtype == 3) document.getElementById("polygon-button").classList.add('active');
				else if (newtype == -1) document.getElementById("clear-button").classList.add('active');
			}

			

			function dropInBody(type, pos){

				var body;
				var c;

				switch (type){

						// add a circle
					case 0:
						c = colors[random(0, colors.length-1)];
						body = Physics.body('circle',{
							x: pos.x
							,y: pos.y
							,vx: random(-5, 5)/100
							,radius: 40
							,restitution: 0.9
							,styles: {
								fillStyle: c[0]
								,strokeStyle: c[1]
								,lineWidth: 1
								,angleIndicator: c[1]
							}
						});
						break;

						// add a square
					case 1:
						c = colors[random(0, colors.length-1)];
						var l = random(0, 70)
						body = Physics.body('rectangle',{
							width: 50+l
							,height: 50+l
							,x: pos.x
							,y: pos.y
							,vx: random(-5, 5)/100
							,restitution: 0.9
							,styles: {
								fillStyle: c[0]
								,strokeStyle: c[1]
								,lineWidth: 1
								,angleIndicator: c[1]
							}
						});
						break;


						// add a polygon
					case 2:
					case 3:
						var s = (type == 2 ? 3 : random( 5, 10 ));
						c = colors[ random(0, colors.length-1) ];
						body = Physics.body('convex-polygon',{
							vertices: Physics.geometry.regularPolygonVertices( s, 30 )
							,x: pos.x
							,y: pos.y
							,vx: random(-5, 5)/100
							,angle: random( 0, 2 * Math.PI )
							,restitution: 0.9
							,styles: {
								fillStyle: c[0]
								,strokeStyle: c[1]
								,lineWidth: 1
								,angleIndicator: c[1]
							}
						});
						break;
				}

				body.treatment = "static";
				body.density = getDensityBySize(body);
				world.add( body );
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
				var jsonData = JSON.stringify({
					world: objects
					,watermode: watermode
				});
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
					if (data.watermode) {
						watermode = true;
						WATER.enabled = true;
						world.add(waterBehavior);
						document.getElementById('viewport').classList.add('water-mode');
						WATER.updateBoundary();
						waterButton.classList.add('active');
						gravityButton.disabled = false;
					} else {
						watermode = false;
						WATER.enabled = false;
						document.getElementById('viewport').classList.remove('water-mode');
						waterButton.classList.remove('active');
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
				} else if (savedObject.type == "convex-polygon") {
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
					setBodiesTreatmentStatic();
				} else {
					document.getElementById("run-button").classList.add('running');
					document.getElementById("run-button").setAttribute('title', 'Pause');
					Physics.util.ticker.start();
					setBodiesTreatmentDynamic();
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
				currentGravity.x = acc.x;
				currentGravity.y = acc.y;
				WATER.updateBoundary();
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
					if (currentType != -1 && pos.y > 55) {
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
							createdBody.treatment = watermode ? "dynamic" : "static";
							
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
			var waterBehavior = Physics.behavior('water');
			world.add([
				gravity
				,Physics.behavior('body-impulse-response')
				,Physics.behavior('body-collision-detection')
				,Physics.behavior('sweep-prune')
				,edgeBounce
			]);

			// subscribe to ticker to advance the simulation
			Physics.util.ticker.on(function( time ) {
				// next step
				world.step( time );

				// remove bodies out of
				var bodies = world.getBodies();
				var limit = outerWidth / 2;
				if (limit > 0) {
					for(var i = 0 ; i < bodies.length ; i++) {
						var body = bodies[i];
						if (body.state.pos.x < 0-limit || body.state.pos.x > innerWidth+limit)
							world.remove(body);
					}
				}
			});
		});
	});
});
