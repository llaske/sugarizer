// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
let app = new Vue({
	el: '#app',
	components: {
		'toolbar': Toolbar, 'localization': Localization, 'tutorial': Tutorial,
		'slope-template': SlopeTemplate
	},
	data: {
		currentUser: {
			colorvalue: {
				stroke: "#000",
				fill: "#000"
			}
		},
		full: false,
		context: null,
		mode: 'fractions',
		img: null,
		interval: null,
		touchEvent: null,
		touchInterval: null,
		cx: 100,
		cy: 500,
		vx: 0,
		vy: -7,
		radius: 40,
		gravity: 0.05,
		damping: 0.1,
		traction: 0.1,
		paused: true,
		onSlope: true,

		frameInterval: 20,
		launchDelay: 1000,
		height: 100,
		parts: 4,
		answer: -1,
		correctAnswers: 0,
		log: {},
		userFractions: []
	},

	created: function () {
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			// Initialize Sugarizer
			activity.setup();
		});
	},

	watch: {
		mode: function(newVal, oldVal) {

		}
	},

	mounted: function () {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/presencepalette", "humane"], function (activity, env, presencepalette, humane) {
			env.getEnvironment(function (err, environment) {

				env.getEnvironment(function (err, environment) {
					vm.currentUser = environment.user;
				});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							let context = JSON.parse(data);
							vm.userFractions = context.userFractions;
						} else {
							console.log("Error loading from journal");
						}
					});
				}

				// Shared instances
				if (environment.sharedId) {
					console.log("Shared instance");
					vm.presence = activity.getPresenceObject(function (error, network) {
						if (error) {
							console.log(error);
						}
						network.onDataReceived(vm.onNetworkDataReceived);
						network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
					});
				}
			});

			vm.humane = humane;

			vm.palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			vm.palette.addEventListener('shared', function () {
				vm.palette.popDown();
				console.log("Want to share");
				vm.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						console.log("Sharing error");
						return;
					}
					network.createSharedActivity('org.sugarlabs.Chess', function (groupId) {
						console.log("Activity shared");
						vm.isHost = true;
					});
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			vm.unfullscreen();
		});
		
		// handle resize
		window.addEventListener('resize', function() {
			vm.init();
		});

		this.init();
	},

	methods: {

		localized: function () {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		// Handle fullscreen mode
		fullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			this.full = true;
			this.init();
		},
		unfullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			this.full = false;
			this.init();
		},

		init: function () {
			let vm = this;
			mainCanvas.width = window.innerWidth;
			if(this.full){
				document.getElementById('content').style.top = '-55px';
				mainCanvas.height = window.innerHeight;
			} else {
				document.getElementById('content').style.top = '0';
				mainCanvas.height = window.innerHeight - 56;
			}
			// Initializing the slope
			this.$refs.slopecanvas.initSlope();

			this.context = mainCanvas.getContext('2d');
			// Loading the ball
			this.img = document.createElement('img');
			this.context.translate(-this.radius, -2 * this.radius);
			this.img.onload = function () {
				vm.context.drawImage(this, vm.cx, vm.cy);
			}
			this.img.src = 'images/soccerball.svg';
			this.img.width = this.radius; this.img.height = this.radius; this.img.style.width = this.radius; this.img.style.height = this.radius;
			this.cx = mainCanvas.width / 2;
			this.cy = this.calcY(mainCanvas.width / 2) - this.radius;

			// start by clicking ball
			document.getElementById('slopeCanvas').addEventListener('click', this.startGame);
		},

		startGame: function (event) {
			let x = event.pageX,
			y = event.pageY;
			if (x <= this.cx + this.radius && x >= this.cx - this.radius && y <= this.cy + 5 * this.radius / 2 && y >= this.cy + this.radius / 2) {
				this.paused = !this.paused;
				if(!this.paused) {
					this.launch();
				}
			}
		},

		launch: function() {
			if(this.onSlope) {
				this.vy = -7;
				this.cy -= this.cy + this.radius - this.calcY(this.cx) + 1;
				this.onSlope = false;
				this.next();
			} else {
				// Game was paused
				this.interval = setInterval(this.drawBall, this.frameInterval);
			}
		},

		next: function () {
			let upper = 8,
				lower = 3;

			let selection = Math.floor(Math.random()*2);
			if(selection == 1 && this.userFractions.length > 0) {
				let i = Math.floor(Math.random()*this.userFractions.length);
				this.parts = this.userFractions[i].den;
				this.answer = this.userFractions[i].num;
			} else {
				this.parts = Math.floor((Math.random() * (upper - lower)) + lower);
				this.answer = Math.floor((Math.random() * (this.parts - 1)) + 1);
			}
			this.$refs.slopecanvas.updateSlope(this.parts);

			document.addEventListener("keydown", this.changeSpeed);
			slopeCanvas.addEventListener("touchstart", this.onTouchStart);
			slopeCanvas.addEventListener("mousedown", this.onTouchStart);
			slopeCanvas.addEventListener("touchend", this.onTouchEnd);
			slopeCanvas.addEventListener("mouseup", this.onTouchEnd);
			this.interval = setInterval(this.drawBall, this.frameInterval);
		},

		drawBall: function () {
			let vm = this;
			this.clearCanvas();
			if (this.paused) {
				clearInterval(this.interval);
			}

			if (this.cx + this.radius >= mainCanvas.width) {
				this.vx = -this.vx * this.damping;
				this.cx = mainCanvas.width - this.radius;
			} else if (this.cx - this.radius <= 0) {
				this.vx = -this.vx * this.damping;
				this.cx = this.radius;
			}

			if (this.cy + this.radius >= this.calcY(this.cx)) {
				this.vx = 0;
				document.removeEventListener("keydown", this.changeSpeed);
				slopeCanvas.removeEventListener("touchstart", this.onTouchStart);
				slopeCanvas.removeEventListener("mousedown", this.onTouchStart);
				this.onTouchEnd();
				if (this.vy < 0.5) {
					let result = this.$refs.slopecanvas.checkAnswer();
					if (result == this.answer) {
						this.correctAnswers++;
						if (this.log.hasOwnProperty(this.answer + '/' + this.parts)) {
							this.log[this.answer + '/' + this.parts].push(true);
						} else {
							this.log[this.answer + '/' + this.parts] = [true];
						}
					} else {
						if (this.log.hasOwnProperty(this.answer + '/' + this.parts)) {
							this.log[this.answer + '/' + this.parts].push(false);
						} else {
							this.log[this.answer + '/' + this.parts] = [false];
						}
					}
					clearInterval(this.interval);
					this.onSlope = true;
					setTimeout(function () {
						vm.launch();
					}, this.launchDelay);
				}
				this.vy = -this.vy * this.damping;
				this.cy = this.calcY(this.cx) - this.radius;
				// traction here
				this.vx *= this.traction;
			} else if (this.cy - this.radius <= 0) {
				this.vy = -this.vy * this.damping;
				this.cy = this.radius;
			}

			this.vy += this.gravity;

			this.cx += this.vx;
			this.cy += this.vy;


			this.context.font = "24px Times New Roman";
			let str = '';
			switch(this.mode) {
				case 'percents':
					str = Math.round((this.answer/this.parts*100 + Number.EPSILON) * 100) / 100 + '%';
					// Custom image is set
					if(this.img.getAttribute('src')[0] == 'd') {
						this.context.translate(0, this.radius);
						this.context.drawImage(this.img, this.cx, this.cy, 2*this.radius, 2*this. radius);
						this.context.translate(0, -this.radius);
						// Top Rectangle
						this.createTopRectangle();
					} else {
						this.context.drawImage(this.img, this.cx, this.cy);
					}
					break;
				case 'fractions':
					str = this.answer + '/' + this.parts;
					// Custom image is set
					if(this.img.getAttribute('src')[0] == 'd') {
						this.context.translate(0, this.radius);
						this.context.drawImage(this.img, this.cx, this.cy, 2*this.radius, 2*this. radius);
						this.context.translate(0, -this.radius);
						// Top Rectangle
						this.createTopRectangle()
					} else {
						this.context.drawImage(this.img, this.cx, this.cy);
					}
					break;
				case 'sectors':
					str = this.answer + '/' + this.parts;
					this.context.translate(this.radius, 2 * this.radius);
					// Numerator
					this.context.fillStyle = this.currentUser.colorvalue.fill;
					this.context.beginPath();
					this.context.moveTo(this.cx, this.cy);
					this.context.arc(this.cx, this.cy, this.radius, 0 - this.toRadians(90), this.toRadians(this.answer/this.parts*360) - this.toRadians(90));
					this.context.lineTo(this.cx, this.cy);
					this.context.closePath();
					this.context.fill();
					// Denominator
					this.context.fillStyle = this.currentUser.colorvalue.stroke;
					this.context.beginPath();
					this.context.moveTo(this.cx, this.cy);
					this.context.arc(this.cx, this.cy, this.radius, this.toRadians(this.answer/this.parts*360) - this.toRadians(90), 0 - this.toRadians(90));
					this.context.lineTo(this.cx, this.cy);
					this.context.closePath();
					this.context.fill();
					//Outline
					this.context.strokeStyle = this.currentUser.colorvalue.stroke;
					this.context.beginPath();
					this.context.arc(this.cx, this.cy, this.radius, 0, this.toRadians(360));
					this.context.closePath();
					this.context.stroke();

					this.context.translate(-this.radius, -2 * this.radius);
					
					// Top Rectangle
					this.createTopRectangle()
					break;
			}
			this.context.fillStyle = "#000";
			this.context.textAlign = "center";
			this.context.fillText(str, vm.cx + this.radius, vm.cy + this.radius - 15);
		},

		toRadians: function(deg) {
			return deg * Math.PI / 180;
		},

		createTopRectangle: function() {
			this.context.fillStyle = '#fff';
			this.context.beginPath();
			this.context.moveTo(this.cx + 10, this.cy);
			this.context.lineTo(this.cx + 2*this.radius - 10, this.cy);
			this.context.quadraticCurveTo(this.cx + 2*this.radius, this.cy, this.cx + 2*this.radius, this.cy + 10);
			this.context.lineTo(this.cx + 2*this.radius, this.cy + 35 - 10);
			this.context.quadraticCurveTo(this.cx + 2*this.radius, this.cy + 35, this.cx + 2*this.radius - 10, this.cy + 35);
			this.context.lineTo(this.cx + 10, this.cy + 35);
			this.context.quadraticCurveTo(this.cx, this.cy + 35, this.cx, this.cy + 35 - 10);
			this.context.lineTo(this.cx, this.cy + 10);
			this.context.quadraticCurveTo(this.cx, this.cy, this.cx + 10, this.cy);
			this.context.closePath();
			this.context.fill();
		},

		clearCanvas: function() {
			this.context.translate(this.radius, 2 * this.radius);
			this.context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
			this.context.translate(-this.radius, -2 * this.radius);
		},

		onTouchStart: function(event) {
			this.touchEvent = event;
			this.touchInterval = setInterval(this.changeSpeed, 2*this.frameInterval);
		},

		onTouchEnd: function(event) {
			this.touchEvent = null;
			clearInterval(this.touchInterval);
		},

		changeSpeed: function (event) {
			let vm = this;

			if(this.touchEvent) {
				//Touch event
				if((this.touchEvent.touches && this.touchEvent.touches[0].clientX > this.cx) ||
					//Mouse event
					(this.touchEvent.clientX > this.cx)) {
					this.vx += 10;
				} else {
					this.vx -= 10;
				}
			}
			// Keyboard event
			else {
				switch (event.keyCode) {
					case 37:
						this.vx -= 10;
						break;
					case 39:
						this.vx += 10;
						break;
				}
			}
			setTimeout(function () {
				vm.vx = 0;
			}, this.frameInterval);
		},

		calcY(x) {
			return ((-this.height / mainCanvas.width) * x + mainCanvas.height);
		},

		onFractionAdded: function(event) {
			this.userFractions.push({
				num: event.numerator,
				den: event.denominator
			});
		},

		onBallSelected: function(event) {
			let vm = this;
			this.clearCanvas();
			if(event.ball == "journal-ball") {
				this.insertImage('ball');
				return;
			}

			this.img.src = 'images/' + event.ball + '.svg';
			switch(event.ball) {
				case 'rugbyball':
				case 'soccerball':
					document.body.style.backgroundImage = 'url(images/grass_background.png)';
					break;
				case 'bowlingball':
				case 'basketball':
					document.body.style.backgroundImage = 'url(images/parquet_background.png)';
					break;
				case 'feather':
					document.body.style.backgroundImage = 'url(images/feather_background.png)';
					break;
				case 'beachball':
					document.body.style.backgroundImage = 'url(images/beach_background.png)';
					break;
			}
		},

		onBgSelected: function(event) {
			let vm = this;
			if(event.bg == "journal-bg") {
				this.insertImage('bg');
				return;
			}
			switch(event.bg) {
				case 'grass':
					document.body.style.backgroundImage = 'url(images/grass_background.png)';
					break;
				case 'wood':
					document.body.style.backgroundImage = 'url(images/parquet_background.png)';
					break;
				case 'clouds':
					document.body.style.backgroundImage = 'url(images/feather_background.png)';
					break;
				case 'sand':
					document.body.style.backgroundImage = 'url(images/beach_background.png)';
					break;
			}
		},

		insertImage: function(to) {
			let vm = this;
			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser"], function(datastore, journalchooser) {
				setTimeout(function() {
					journalchooser.show(function(entry) {
						if (!entry) {
							return;
						}
						var dataentry = new datastore.DatastoreObject(entry.objectId);
						dataentry.loadAsText(function(err, metadata, data) {
							if(to == 'ball') {
								vm.img.src = data;
							} else if(to == 'bg') {
								document.body.style.backgroundImage = 'url(' + data + ')';
							}
						});
					}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
				}, 10);
			});
		},

		changeMode: function(mode) {
			this.mode = mode;
		},

		onHelp: function (type) {
			this.$refs.tutorial.show(type);
		},

		onNetworkDataReceived: function (msg) {
			if (this.presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}

			switch (msg.content.action) {
				case 'init':
					this.currentcolor = 'b';
					this.opponent = msg.user.networkId;
					this.opponentColors = msg.user.colorvalue;
					this.currentpgn = msg.content.gamePGN;
					break;
				case 'move':
					this.$refs.chesstemplate.makeMove(msg.content.move.from, msg.content.move.to, true);
					this.$refs.chesstemplate.onSnapEnd();
					break;
			}
		},

		onNetworkUserChanged: function (msg) {
			let vm = this;

			// If user joins
			if (msg.move == 1) {
				// Handling only by the host
				if (this.isHost) {
					if (this.opponent == null) {
						// No opponent => make opponent
						this.opponent = msg.user.networkId;
						this.opponentColors = msg.user.colorvalue;
						this.presence.sendMessage(this.presence.getSharedInfo().id, {
							user: vm.presence.getUserInfo(),
							content: {
								action: 'init',
								gamePGN: vm.$refs.chesstemplate.game.pgn()
							}
						});
					} else {
						// Opponent => Spectator
						this.presence.sendMessage(this.presence.getSharedInfo().id, {
							user: vm.presence.getUserInfo(),
							content: {
								action: 'spectate',
								gamePGN: vm.$refs.chesstemplate.game.pgn()
							}
						});
					}
				}
			}
			// If user leaves
			else {
				if (msg.user.networkId == this.opponent) {
					this.opponent = null;
					this.opponentColors = {
						stroke: "#000",
						fill: "#000"
					}
					vm.currentcolor = 'w';
				}
			}

			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			if (this.presence.getUserInfo().networkId !== msg.user.networkId) {
				this.humane.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			}
		},

		onStop: function () {
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function (activity) {
				console.log("writing...");

				let context = {
					userFractions: vm.userFractions
				};
				var jsonData = JSON.stringify(context);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
		}
	}
});
