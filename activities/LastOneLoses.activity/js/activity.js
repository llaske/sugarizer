define(["sugar-web/activity/activity", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/graphics/presencepalette", "sugar-web/env", "sugar-web/graphics/icon", "sugar-web/datastore", "webL10n", "humane"], function (activity, radioButtonsGroup, presencepalette, env, icon, datastore, webL10n, humane) {
	var app;
	var presence=null;
	var isHost=false;
	var numberofplayers=0;
	var opponentuser=null;
	var levelRadio;
	var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

	var generateXOLogoWithColor = function(color) {
		var coloredLogo = xoLogo;
		coloredLogo = coloredLogo.replace("#010101", color.stroke)
		coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
		return "data:image/svg+xml;base64," + btoa(coloredLogo);
	}

	env.getEnvironment(function(err, environment) {
		currentenv=environment;
		// Set current language to Sugarizer
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		webL10n.language.code = language;

		// Shared instances
		if (environment.sharedId) {
			console.log("Shared instance");
			document.getElementById("level-easy-button").classList.remove('active');
			document.getElementById("level-medium-button").classList.remove('active');
			document.getElementById("level-hard-button").classList.remove('active');
			document.getElementById("level-easy-button").setAttribute('disabled', 'disabled');
			document.getElementById("level-easy-button").setAttribute('title', 'Not available in multiplayer');
			document.getElementById("level-medium-button").setAttribute('disabled', 'disabled');
			document.getElementById("level-medium-button").setAttribute('title', 'Not available in multiplayer');
			document.getElementById("level-hard-button").setAttribute('disabled', 'disabled');
			document.getElementById("level-hard-button").setAttribute('title', 'Not available in multiplayer');
			document.getElementById("switch-player-button").setAttribute('disabled', 'disabled');
			document.getElementById("switch-player-button").setAttribute('title', 'Only Host can do it');
			document.getElementById("new-game-button").setAttribute('disabled', 'disabled');
			document.getElementById("new-game-button").setAttribute('title', 'Only Host can do it');
			presence = activity.getPresenceObject(function(error, network) {
				network.listSharedActivityUsers(environment.sharedId, function(users) {
					for (var i = 0 ; i < users.length ;i++) {
						if (users[i].networkId != network.getUserInfo().networkId) {
							opponentuser = users[i];
							break;
						}
					}
				});
				network.onDataReceived(enyo.bind(app, "onNetworkDataReceived"));
				network.onSharedActivityUserChanged(enyo.bind(app, "onNetworkUserChanged"));
			});
		}
	});


    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the Sugar activity.
        activity.setup();

		// Initialize buttons
		document.getElementById("new-game-button").onclick = function() {
			app.doRenew();
		};

		levelRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("level-easy-button"),
			document.getElementById("level-medium-button"),
			document.getElementById("level-hard-button")]
		);

		document.getElementById("switch-player-button").onclick = function() {
			app.switchPlayer();
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "update",
					content: 0
				});
			}
			if(isHost)
				document.getElementById("switch-player-button").disabled = true;
		};

        // Initialize the game
		app = new LOLGameApp({activity: activity});
		app.load();
		app.renderInto(document.getElementById("canvas"));

		// Link presence palette
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		palette.addEventListener('shared', function() {
			palette.popDown();
			console.log("Want to share");
			presence = activity.getPresenceObject(function(error, network) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity('org.olpc-france.LOLActivity', function(groupId) {
					console.log("Activity shared");
					document.getElementById("level-easy-button").classList.remove('active');
					document.getElementById("level-medium-button").classList.remove('active');
					document.getElementById("level-hard-button").classList.remove('active');
					document.getElementById("level-easy-button").setAttribute('disabled', 'disabled');
					document.getElementById("level-easy-button").setAttribute('title', 'Not available in multiplayer');
					document.getElementById("level-medium-button").setAttribute('disabled', 'disabled');
					document.getElementById("level-medium-button").setAttribute('title', 'Not available in multiplayer');
					document.getElementById("level-hard-button").setAttribute('disabled', 'disabled');
					document.getElementById("level-hard-button").setAttribute('title', 'Not available in multiplayer');
					isHost=true;
					app.drawBoard();
				});
				network.onDataReceived(enyo.bind(app, "onNetworkDataReceived"));
				network.onSharedActivityUserChanged(enyo.bind(app, "onNetworkUserChanged"));
			});
		});
	});



	// Main app class
	enyo.kind({
		name: "LOLGameApp",
		kind: enyo.Control,
		published: {size: 13, level: 1, count: 13, activity: null},
		components: [
			{classes: "playboard", components:[
				{name: "player", classes: "player-image"},
				{name: "box", classes: "lol-box", components: [
				]},
				{name: "computer", classes: "computer-image"}
			]},
			{name: "playbutton", kind: "Image", src: "icons/play.png", classes: "play", ontap: "doPlay", showing: false},
			{name: "endaudio", kind: "HTML5.Audio", preload: "auto", autobuffer: true, controlsbar: false},
			{name: "endmessage", content: "", showing: false, classes: "end-message"}
		],

		// Constructor
		create: function() {
			this.inherited(arguments);
			this.init();
		},

		// Init game
		init: function() {
			// Init game context
			this.game = new LOLGame(this.count);
			if (this.count > 0) this.player = this.game.getPlayer();
			this.count = this.size;
			this.selectedCount = 0;

			// Initialize level
			document.getElementById("level-easy-button").classList.remove('active');
			document.getElementById("level-medium-button").classList.remove('active');
			document.getElementById("level-hard-button").classList.remove('active');
			if (!presence) {
				if (this.level == 1) document.getElementById("level-easy-button").classList.add('active');
				else if (this.level == 2) document.getElementById("level-medium-button").classList.add('active');
				else if (this.level == 3) document.getElementById("level-hard-button").classList.add('active');
			}
		},

		// Render
		rendered: function() {
			this.inherited(arguments);

			// Draw board
			this.drawBoard();
		},

		// Redraw the board
		drawBoard: function() {
			// Clean board
			this.selectedCount = 0;

			var items = [];
			enyo.forEach(this.$.box.getControls(), function(item) {
				items.push(item);
			});
			for (var i = 0 ; i < items.length ; i++) {
				items[i].destroy();
			}

			// Redraw board
			for (var i = 0 ; i < this.game.getLength(); i++) {
				this.$.box.createComponent(
					{ kind: "LOLItem", ontap: "selectItem" },
					{ owner: this }
				).render();
			}
			this.showCurrentPlayer();

			document.getElementById("switch-player-button").disabled = (this.game.getLength() != this.size);

			// Test end condition
			if (this.game.endOfGame()) {
				if (!presence) {
					this.$.endmessage.addClass(this.game.getPlayer() != this.player ? "end-message-win" : "end-message-lost");
					this.$.endmessage.removeClass(this.game.getPlayer() != this.player ? "end-message-lost" : "end-message-win");
				} else {
					this.$.player.addClass("empty-image");
					this.$.computer.addClass("empty-image");
					this.$.computer.removeClass("oponent-image");
					this.$.endmessage.removeClass("end-message-lost");
					this.$.endmessage.addClass(this.game.getPlayer() != this.player ? "end-message-win" : "player-lost");
					this.$.endmessage.removeClass(this.game.getPlayer() != this.player ? "player-lost" : "end-message-win");
				}
				this.$.endaudio.setSrc(this.game.getPlayer() != this.player ? "audio/applause.ogg" : "audio/disappointed.ogg");
				this.$.endaudio.play();
				this.$.endmessage.show();
			}
			this.$.endmessage.setShowing(this.game.endOfGame());

			// Play for computer
			if (this.game.getPlayer() != this.player && !this.game.endOfGame()) {
				if (presence) {
					this.oponentPlay();
				} else {
					this.computerPlay();
				}
			}
		},

		Stop: function() {
			var stopEvent = document.createEvent("CustomEvent");
			stopEvent.initCustomEvent('activityStop', false, false, {
				'cancelable': true
			});
            var result = window.dispatchEvent(stopEvent);
            if (result) {
                activity.close();
            }
        },

		onNetworkDataReceived: function(msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			switch(msg.action){
				case 'init':
					console.log("init");
					this.game = new LOLGame(msg.content);
					this.game.reverse();
					app.drawBoard();
					opponentuser=msg.user;
					break;
				case 'update':
					console.log("update");
					if (msg.content > 0) {
						this.doOpponent(msg.content);
					} else {
						this.game.reverse();
						app.drawBoard();
					}
					break;
				case 'exit':
					console.log("already two players");
					if(msg.content == presence.getUserInfo().networkId){
						app.Stop();
					}
					break;
			}

		},

		onNetworkUserChanged: function(msg) {
			var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";
			humane.log(html + webL10n.get((msg.move == 1 ? "PlayerJoin":"PlayerLeave"),{user: msg.user.name}));
			console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
			if (msg.move != 1) return;
			if (isHost) {
				if (numberofplayers==0) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: 'init',
						content: this.game.getLength()
					});
					numberofplayers++;
					opponentuser = msg.user;
				} else {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: 'exit',
						content: msg.user.networkId
					});
				}
			}
		},

		// Get current level
		getLevel: function() {
			var buttons = ["level-easy-button","level-medium-button","level-hard-button"];
			console.log(buttons.indexOf(levelRadio.getActive().id)+1);
			return buttons.indexOf(levelRadio.getActive().id)+1;
		},

		// Show the current player turn
		showCurrentPlayer: function() {
			if (this.player == this.game.getPlayer() && !this.game.endOfGame()) {
				this.$.player.removeClass("empty-image");
				if (this.$.player.hasNode()) icon.colorize(this.$.player.hasNode(), currentenv.user.colorvalue, function() {});
			}
			else
				this.$.player.addClass("empty-image");
			if (this.player != this.game.getPlayer() && !this.game.endOfGame())
				this.$.computer.removeClass("empty-image");
			else
				this.$.computer.addClass("empty-image");
		},

		// Select an item
		selectItem: function(item) {
			if (this.player != this.game.getPlayer())
				return;
			var value = item.getSelected();
			if (this.selectedCount == 3 && !value) {
				this.$.playbutton.show();
				return;
			}
			this.selectedCount = !value ? this.selectedCount + 1 : this.selectedCount - 1;
			item.setSelected(!value);
			if (this.selectedCount > 0)
				this.$.playbutton.show();
			else
				this.$.playbutton.hide();
		},

		// Switch player
		switchPlayer: function() {
			this.game.reverse();
			this.player = this.player % 2;
			this.drawBoard();
		},

		// Play for the player
		doPlay: function() {
			if (this.player != this.game.getPlayer())
				return;
			if (this.selectedCount == 0)
				return;
			this.save(this.game.play(this.selectedCount));
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "update",
					content: this.selectedCount
				});
			}
			this.drawBoard();
			this.$.playbutton.hide();
		},

		oponentPlay: function() {
			if (this.player == this.game.getPlayer() && !this.game.endOfGame()) {
				this.$.player.removeClass("empty-image");
				icon.colorize(this.$.player.hasNode(), currentenv.user.colorvalue, function() {});
			} else {
				this.$.player.addClass("empty-image");
			}
			if (this.player != this.game.getPlayer() && !this.game.endOfGame()){
				this.$.computer.removeClass("empty-image");
				this.$.computer.addClass("oponent-image");
				if (opponentuser) icon.colorize(this.$.computer.hasNode(), opponentuser.colorvalue, function() {})
			}else
				this.$.computer.addClass("empty-image");
		},

		// Let's computer play
		computerPlay: function() {
			if (this.player == this.game.getPlayer())
				return;
			this.selectedCount = 0;
			this.step = 0;
			this.timer = window.setInterval(enyo.bind(this, "doComputer"), 400+50*this.getLevel());
		},

		// Play for the computer
		doComputer: function() {
			// First, think to the shot and select item
			if (this.step == 0) {
				this.step++;
				var shot = this.game.think(this.getLevel());
				var context = this;
				enyo.forEach(this.$.box.getControls(), function(item) {
					if (context.selectedCount < shot) {
						item.setSelected(true);
						context.selectedCount++;
					}
				});
				this.step++;
			}

			// Then play
			else if (this.step == 2) {
				window.clearInterval(this.timer);
				this.save(this.game.play(this.selectedCount));
				this.drawBoard();
			}
		},

		// Play opponent
		doOpponent: function(shot) {
			var that = this;
			enyo.forEach(this.$.box.getControls(), function(item) {
				if (that.selectedCount < shot) {
					item.setSelected(true);
					that.selectedCount++;
				}
			});
			window.setTimeout(function() {
				that.game.play(shot);
				that.drawBoard();
			}, 400);
		},

		// Start a new game
		doRenew: function() {
			this.level = this.getLevel();
			this.game = new LOLGame(this.count);
			this.init();
			this.drawBoard();
			if (presence&&isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'init',
					content: this.game.getLength()
				});
			}
		},

		// Load game from datastore
		load: function() {
			var datastoreObject = this.activity.getDatastoreObject();
			var currentthis = this;
			datastoreObject.loadAsText(function (error, metadata, data) {
				var data = JSON.parse(data);
				if (data == null)
					return;
				currentthis.size = data.size;
				currentthis.count = data.count;
				currentthis.level = data.level;
				currentthis.player = data.player;
				currentthis.init();
			});
		},

		// Save game in datastore
		save: function(count) {
			var datastoreObject = this.activity.getDatastoreObject();
			var jsonData = JSON.stringify({size: this.size, count: count, level: this.getLevel(), player: this.game.getPlayer()});
			datastoreObject.setDataAsText(jsonData);
			datastoreObject.save(function() {});
		}
	});


	// Class for an item
	enyo.kind({
		name: "LOLItem",
		kind: enyo.Control,
		classes: "lol-item",
		published: { selected: false },

		// Constructor
		create: function() {
			this.inherited(arguments);
			this.selectedChanged();
		},

		// Selection changed
		selectedChanged: function() {
			var className = "lol-item-selected";
			if (this.selected) {
				this.addClass(className);
				this.applyStyle("background-color", currentenv.user.colorvalue.stroke);
			}
			else {
				this.removeClass(className);
				this.applyStyle("background-color", currentenv.user.colorvalue.fill);
			}
		},
	});

});
