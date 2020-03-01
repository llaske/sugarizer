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
		currentUser: null,
		isHost: false,
		presense: null,
		palette: null,
		currentpgn: null,
	},

	created: function() {
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			// Initialize Sugarizer
			activity.setup();
		});
	},

	mounted: function() {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/presencepalette"], function(activity, env, presencepalette) {
			env.getEnvironment(function(err, environment) {
					
					env.getEnvironment(function(err, environment) {
						vm.currentUser = environment.user;
					});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error == null && data != null) {
							let context = JSON.parse(data);
							vm.currentpgn = context.gamePGN;
						} else {
							console.log("Error loading from journal");
						}
					});
				}
			});

			vm.palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			vm.palette.addEventListener('shared', function() {
				vm.palette.popDown();
				console.log("Want to share");
				vm.presence = activity.getPresenceObject(function(error, network) {
					if (error) {
						console.log("Sharing error");
						return;
					}
					network.createSharedActivity('org.sugarlabs.Pawn', function(groupId) {
						console.log("Activity shared");
						vm.isHost = true;
					});
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			vm.unfullscreen();
		});
	},

	methods: {

		localized: function() {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		displayTemplateView: function() {
			var vm = this;
			vm.$refs.toolbar.$refs.lines.isDisabled = true;
			vm.$refs.toolbar.$refs.zoombutton.isDisabled = true;
			vm.currentView = TemplateViewer;
			vm.$refs.toolbar.$refs.insertimage.isDisabled = !vm.$refs.view.editMode;
			document.getElementById("canvas").style.backgroundColor = vm.color.fill;
			document.getElementById("settings-button").style.backgroundImage = vm.$refs.view.editMode?"url(icons/play.svg)":"url(icons/settings.svg)";
		},

		// Handle fullscreen mode
		fullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if (vm.currentView === Player) {
				vm.$refs.view.doFullscreen(true);
			}
		},
		unfullscreen: function() {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if (vm.currentView === Player) {
				vm.$refs.view.doFullscreen(false);
			}
		},

		restartGame: function() {
			this.$refs.chesstemplate.startNewGame();
		},
	
		undo: function() {
			this.$refs.chesstemplate.undo();
		},

		onZoom: function(item) {
			var vm = this;
			if (vm.currentView === Player) {
				vm.$refs.view.doZoom(item.detail);
			}
		},

		onInsertImage: function() {
			var vm = this;
			if (vm.currentView !== TemplateViewer || !vm.$refs.view.editMode) {
				return;
			}
			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser"], function(datastore, journalchooser) {
				setTimeout(function() {
					journalchooser.show(function(entry) {
						if (!entry) {
							return;
						}
						var dataentry = new datastore.DatastoreObject(entry.objectId);
						dataentry.loadAsText(function(err, metadata, data) {
							vm.currentTemplate.images.push({image: data});
						});
					}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
				}, 0);
			});
		},

		onHelp: function() {
			var vm = this;
			var options = {};
			options.currentView = vm.currentView;
			options.editMode = vm.$refs.view.editMode || vm.currentView === Editor;
			options.templatebutton = vm.$refs.toolbar.$refs.templatebutton.$el;
			options.fullscreenbutton = vm.$refs.toolbar.$refs.fullscreen.$el;
			options.settingsbutton = vm.$refs.toolbar.$refs.settings.$el;
			if (vm.currentView === TemplateViewer) {
				options.insertimagebutton = vm.$refs.toolbar.$refs.insertimage.$el;
				if (vm.currentTemplate && vm.currentTemplate.images && vm.currentTemplate.images[0]) {
					options.item = vm.$refs.view.$refs.item0[0].$el;
				}
			} else {
				options.linesbutton = vm.$refs.toolbar.$refs.lines.$el;
				options.zoombutton = vm.$refs.toolbar.$refs.zoombutton.$el;
				options.backbutton = document.getElementById("back");
				options.restartbutton = document.getElementById("player-restart");
				options.editoraddbutton = document.getElementById("editor-add");
				options.editorremovebutton = document.getElementById("editor-remove");
				options.editoraddpathbutton = document.getElementById("editor-addpath");
				options.editorremovepathbutton = document.getElementById("editor-removepath");
			}
			this.$refs.tutorial.show(options);
		},

		onNetworkDataReceived: function() {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
		},

		onNetworkUserChanged: function() {
			if (this.isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init',
						data: pawns
					}
				});
			}
		},

		onStop: function() {
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function(activity) {
				console.log("writing...");
				
				let context = {
					gamePGN: vm.$refs.chesstemplate.game.pgn()
				};
				var jsonData = JSON.stringify(context);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function(error) {
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
