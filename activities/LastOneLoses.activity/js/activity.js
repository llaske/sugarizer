define(["sugar-web/activity/activity", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/graphics/presencepalette", "sugar-web/env"], function (activity, radioButtonsGroup, presencepalette, env) {
	var app;
	var presence=null;
	var less=0;
	var items = [];
	var isHost=false;
	var sum=0;
	var updated=false;
	var gamesize=null;
	var firsttime=true;
	env.getEnvironment(function(err, environment) {
		// Shared instances
		if (environment.sharedId) {
			console.log("Shared instance");
			presence = activity.getPresenceObject(function(error, network) {
				network.onDataReceived(app.onNetworkDataReceived);
				network.onSharedActivityUserChanged(app.onNetworkUserChanged);
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
		var levelRadio = new radioButtonsGroup.RadioButtonsGroup([
			document.getElementById("level-easy-button"),
			document.getElementById("level-medium-button"),
			document.getElementById("level-hard-button")]
		);
		document.getElementById("switch-player-button").onclick = function() {
			app.switchPlayer();
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
					isHost=true;
				});
				network.onDataReceived(app.onNetworkDataReceived);
				network.onSharedActivityUserChanged(app.onNetworkUserChanged);
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
			
			// Init color
			this.activity.getXOColor(function(error, colors) {console.log(colors);});
			
			// Init level
			document.getElementById("level-easy-button").classList.remove('active');
			document.getElementById("level-medium-button").classList.remove('active');
			document.getElementById("level-hard-button").classList.remove('active');		
			if (this.level == 1) document.getElementById("level-easy-button").classList.add('active');
			else if (this.level == 2) document.getElementById("level-medium-button").classList.add('active');
			else if (this.level == 3) document.getElementById("level-hard-button").classList.add('active');
				
			// Draw board
			this.drawBoard();
		},
		
		// Redraw the board
		drawBoard: function() {
			// Clean board
			this.selectedCount = 0;
			enyo.forEach(this.$.box.getControls(), function(item) {
				items.push(item);
			});	
			for (var i = 0 ; i < items.length ; i++) {
				items[i].destroy();
			}
			
			// Redraw board
			if(!updated) gamesize= this.game.getLength();
			for (var i = 0 ; i < gamesize; i++) {
				this.$.box.createComponent(
					{ kind: "LOLItem", ontap: "selectItem" },
					{ owner: this }
				).render();
			}
			
			if(!presence){
				document.getElementById("switch-player-button").disabled = (this.game.getLength() != this.size);
			}
			
			this.showCurrentPlayer();
			
			
			// Test end condition
			if (this.game.endOfGame()) {
				this.$.endmessage.addClass(this.game.getPlayer() != this.player ? "end-message-win" : "end-message-lost");
				this.$.endmessage.removeClass(this.game.getPlayer() != this.player ? "end-message-lost" : "end-message-win");
				this.$.endaudio.setSrc(this.game.getPlayer() != this.player ? "audio/applause.ogg" : "audio/disappointed.ogg");
				this.$.endaudio.play();
				this.$.endmessage.show();
			}
			this.$.endmessage.setShowing(this.game.endOfGame());		
			
			// Play for computer
			if (this.game.getPlayer() != this.player && !this.game.endOfGame() && !presence)
				this.computerPlay();
		},
		
		onNetworkDataReceived: function(msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			switch(msg.action){
				case 'init':
					gamesize=msg.content;
					updated=true;
					app.drawBoard();
					break;
				case 'update':
					gamesize=msg.content;
					updated=true;
					app.drawBoard();
					break;
			}
			
		},

		onNetworkUserChanged: function(msg) {
			if (isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'init',
					content: gamesize
				});
			}
			console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
		},

		// Get current level
		getLevel: function() {
			if (document.getElementById("level-easy-button").classList.contains('active'))
				return 1;
			if (document.getElementById("level-medium-button").classList.contains('active'))
				return 2;
			if (document.getElementById("level-hard-button").classList.contains('active'))
				return 3;	
			return 0;
		},
		
		// Show the current player turn
		showCurrentPlayer: function() {
			console.log(this.game.getPlayer());
			if (this.player == this.game.getPlayer() && !this.game.endOfGame())
				this.$.player.removeClass("empty-image");
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
			gamesize-=this.selectedCount;
			console.log(gamesize);
			if (presence) {
				console.log("update sent");
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "update",
					content: gamesize
				});
			}
			this.save(this.game.play(this.selectedCount));
			this.drawBoard();
			this.$.playbutton.hide();
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
				gamesize-=this.selectedCount;
				this.save(this.game.play(this.selectedCount));
				this.drawBoard();
			}
		},
		
		// Start a new game
		doRenew: function() {
			this.level = this.getLevel();	
			this.init();
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
			if (this.selected)
				this.addClass(className);
			else
				this.removeClass(className);
		},	
	});

});
