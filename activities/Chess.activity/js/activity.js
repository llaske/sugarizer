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
		'chess-template': ChessTemplate
	},
	data: {
		currentUser: {
			colorvalue: {
				stroke: "#000000",
				fill: "#000000"
			}
		},
		isHost: false,
		presence: null,
		palette: null,
		humane: null,
		currentpgn: null,
		currentcolor: 'w',
		level: 2,
		opponent: null,
		opponentColors: {
			stroke: "#000000",
			fill: "#000000"
		},
		spectator: false,
		tutorialRunning: false
	},

	computed: {
		whiteColors: function() {
			return this.currentcolor == 'w' ? this.currentUser.colorvalue : this.opponentColors;
		},
		blackColors: function() {
			return this.currentcolor == 'w' ? this.opponentColors : this.currentUser.colorvalue;
		},
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
					document.getElementById('canvas').style.background = environment.user.colorvalue.fill;
				});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							let context = JSON.parse(data);
							vm.currentpgn = context.gamePGN;
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
					console.log('presence created', vm.presence);
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});


		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			vm.unfullscreen();
		});
	},

	methods: {

		localized: function () {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.chesstemplate.localized(this.$refs.localization);
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

		onDifficultySelected: function (difficulty) {
			this.level = difficulty.index;
			console.log(this.level);
		},

		restartGame: function () {
			if(this.spectator) return;
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
			if(this.spectator) return;
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
			if(type == 'rules') {
				this.tutorialRunning = true;
			}
			this.$refs.tutorial.show(type);
		},

		onTutStartPos: function() {
			this.$refs.chesstemplate.onTutStartPos();
		},

		onHelpEnd: function(type) {
			if(type == 'ui') {
				this.$refs.tutorial.show('rules');
				this.tutorialRunning = true;
			} else {
				this.tutorialRunning = false;
			}
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
