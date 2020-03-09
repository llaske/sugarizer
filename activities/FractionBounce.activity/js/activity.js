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
		context: null,
		img: null,
		interval: null,
		cx: 100,
		cy: 500,
		vx: 0,
		vy: -7,
		radius: 40,
		gravity: 0.05,
		damping: 0.1,
		traction: 0.1,
		paused: false,

		frameInterval: 20,
		launchDelay: 1000,
		height: 100,
		parts: 4,
		answer: null,
		correctAnswers: 0,
		log: {}
	},

	created: function () {
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			// Initialize Sugarizer
			activity.setup();
		});
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
							console.log(context);
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
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
		},
		unfullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
		},

		init: function () {
			let vm = this;
			mainCanvas.width = window.innerWidth;
			mainCanvas.height = window.innerHeight - 56;
			// Initializing the slope
			this.$refs.slopecanvas.initSlope();

			this.context = mainCanvas.getContext('2d');
			// Loading the ball
			this.img = document.createElement('img');
			this.context.translate(-this.radius, -2 * this.radius);
			this.img.onload = function () {
				vm.context.drawImage(this, vm.cx, vm.cy);
			}
			this.img.src = 'images/beachball.svg';
			this.img.width = this.radius; this.img.height = this.radius;
			this.cx = mainCanvas.width / 2;
			this.cy = this.calcY(mainCanvas.width / 2) - this.radius;

			// start by clicking ball
			document.getElementById('slopeCanvas').addEventListener('click', this.startGame);
		},

		startGame: function (event) {
			let x = event.pageX,
				y = event.pageY;
			if (x <= this.cx + this.radius && x >= this.cx - this.radius && y <= this.cy + 5 * this.radius / 2 && y >= this.cy + this.radius / 2) {
				this.launch();
				document.getElementById('slopeCanvas').removeEventListener('click', this.startGame);
			}
		},

		launch: function() {
			this.vy = -7;
			this.cy -= this.cy + this.radius - this.calcY(this.cx) + 1;
			this.next();
		},

		next: function () {
			let upper = 8,
				lower = 3;
			this.parts = Math.floor((Math.random() * (upper - lower)) + lower);
			this.answer = Math.floor((Math.random() * (this.parts - 1)) + 1);
			this.$refs.slopecanvas.updateSlope(this.parts);
			console.log('answer: ', this.answer + '/' + this.parts);
			this.startAnimation();
		},

		startAnimation: function () {
			document.addEventListener("keydown", this.changeSpeed);
			this.interval = setInterval(this.drawBall, this.frameInterval);
		},

		drawBall: function () {
			let vm = this;
			this.context.translate(this.radius, 2 * this.radius);
			this.context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
			this.context.translate(-this.radius, -2 * this.radius);
			this.context.fillStyle = "#0000ff";

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

			this.vy += this.gravity; // <--- this is it

			this.cx += this.vx;
			this.cy += this.vy;

			// this.context.beginPath();
			// this.context.arc(this.cx, this.cy, this.radius, 0, Math.PI*2, true); 
			// this.context.closePath();
			// this.context.fill();
			vm.context.drawImage(this.img, vm.cx, vm.cy);
			this.context.font = "28px Times New Roman";
			let str = this.answer + '/' + this.parts;
			this.context.fillStyle = "#000";
			this.context.textAlign = "center";
			this.context.fillText(str, vm.cx + this.radius, vm.cy + this.radius - 15);
		},

		changeSpeed: function (event) {
			let vm = this;
			switch (event.keyCode) {
				case 37:
					this.vx -= 10;
					break;
				case 39:
					this.vx += 10;
					break;
			}
			setTimeout(function () {
				vm.vx = 0;
			}, this.frameInterval);
		},

		calcY(x) {
			return ((-this.height / mainCanvas.width) * x + mainCanvas.height);
		},

		restartGame: function () {
			if (this.spectator) return;
			this.$refs.chesstemplate.startNewGame();
			// presence
			if (this.opponent && this.presence) {
				this.presence.sendMessage(this.presence.sharedInfo.id, {
					user: this.presence.getUserInfo(),
					content: {
						action: 'restart',
					}
				});
			}
		},

		undo: function () {
			if (this.spectator) return;
			this.$refs.chesstemplate.undo();
			// presence
			if (this.opponent && this.presence) {
				this.presence.sendMessage(this.presence.sharedInfo.id, {
					user: this.presence.getUserInfo(),
					content: {
						action: 'undo',
					}
				});
			}
		},

		onMove: function (move) {
			if (this.opponent && this.presence) {
				this.presence.sendMessage(this.presence.getSharedInfo().id, {
					user: this.presence.getUserInfo(),
					content: {
						action: 'move',
						move: {
							from: move.from,
							to: move.to
						}
					}
				});
			}
		},

		onHelp: function (type) {
			if (type == 'rules') {
				this.tutorialRunning = true;
			}
			this.$refs.tutorial.show(type);
		},

		onTutStartPos: function () {
			this.$refs.chesstemplate.onTutStartPos();
		},

		onHelpEnd: function () {
			this.tutorialRunning = false;
		},

		onNetworkDataReceived: function (msg) {
			if (this.presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}

			switch (msg.content.action) {
				case 'init':
					this.humane.log("Synchronizing Board...");
					this.currentcolor = 'b';
					this.opponent = msg.user.networkId;
					this.opponentColors = msg.user.colorvalue;
					this.currentpgn = msg.content.gamePGN;
					break;
				case 'move':
					console.log('move received', msg.content.move);
					this.$refs.chesstemplate.makeMove(msg.content.move.from, msg.content.move.to, true);
					this.$refs.chesstemplate.onSnapEnd();
					break;
				case 'restart':
					console.log('restart received');
					this.$refs.chesstemplate.startNewGame();
					break;
				case 'undo':
					console.log('undo received');
					this.$refs.chesstemplate.undo();
					break;
				case 'spectate':
					console.log('spectator');
					if (this.opponent == null) {
						this.spectator = true;
						this.currentpgn = msg.content.gamePGN;
					}
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
					gamePGN: vm.$refs.chesstemplate.game.pgn()
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
