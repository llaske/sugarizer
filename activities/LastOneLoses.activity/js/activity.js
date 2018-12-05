define(["sugar-web/activity/activity", "sugar-web/graphics/radiobuttonsgroup", "sugar-web/graphics/presencepalette", "sugar-web/env", "sugar-web/graphics/icon", "sugar-web/datastore"], function (activity, radioButtonsGroup, presencepalette, env, icon, datastore) {
	var app;
	var presence=null;
	var less=0;
	var items = [];
	var isHost=false;
	var sum=0;
	var sizeupdated=false;
	var playerupdated=false;
	var gamesize=null;
	var firsttime=true;
	var newgame=false;
	var onejoined=false;
	var numberofplayers=0;
	var switchclicked=false;
	env.getEnvironment(function(err, environment) {
		currentenv=environment;
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

		if(!presence){
			var levelRadio = new radioButtonsGroup.RadioButtonsGroup([
				document.getElementById("level-easy-button"),
				document.getElementById("level-medium-button"),
				document.getElementById("level-hard-button")]
			);
		}

		document.getElementById("switch-player-button").onclick = function() {
			app.switchPlayer();
			switchclicked=true;
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "update",
					content: gamesize,
					curplayer: this.player
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
					switchclicked=false;
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
			switchclicked=false;
			if(presence&&!isHost){
				if(this.game.getPlayer()==0){
					this.player=1;
				}else{
					this.player=0;
				}
			} 
			this.count = this.size;
			this.selectedCount = 0;
			
			// Init color
			this.activity.getXOColor(function(error, colors) {console.log(colors);});
			
			// Init level
			document.getElementById("level-easy-button").classList.remove('active');
			document.getElementById("level-medium-button").classList.remove('active');
			document.getElementById("level-hard-button").classList.remove('active');		
			if (this.level == 1&&!presence) document.getElementById("level-easy-button").classList.add('active');
			else if (this.level == 2&&!presence) document.getElementById("level-medium-button").classList.add('active');
			else if (this.level == 3&&!presence) document.getElementById("level-hard-button").classList.add('active');
		
			// Draw board
			this.drawBoard();
		},
		
		// Redraw the board
		drawBoard: function() {
			// Clean board
			this.selectedCount = 0;
			
			if(presence&&playerupdated){
				if(this.player!=this.game.getPlayer()){
					this.player=this.game.getPlayer();
					playerupdated=false;
				}
			}
		
			enyo.forEach(this.$.box.getControls(), function(item) {
				items.push(item);
			});
			for (var i = 0 ; i < items.length ; i++) {
				items[i].destroy();
			}

			// Redraw board
			if(!sizeupdated) gamesize= this.game.getLength();
			for (var i = 0 ; i < gamesize; i++) {
				this.$.box.createComponent(
					{ kind: "LOLItem", ontap: "selectItem" },
					{ owner: this }
				).render();
			}

			if(presence&&switchclicked)
				document.getElementById("switch-player-button").disabled = true;
			else if(!presence)
				document.getElementById("switch-player-button").disabled = (this.game.getLength() != this.size);
			else 
				document.getElementById("switch-player-button").disabled = false;
			this.showCurrentPlayer();
			
			// Test end condition
			if (!presence&&this.game.endOfGame()) {
				this.$.endmessage.addClass(this.game.getPlayer() != this.player ? "end-message-win" : "end-message-lost");
				this.$.endmessage.removeClass(this.game.getPlayer() != this.player ? "end-message-lost" : "end-message-win");
				this.$.endaudio.setSrc(this.game.getPlayer() != this.player ? "audio/applause.ogg" : "audio/disappointed.ogg");
				this.$.endaudio.play();
				this.$.endmessage.show();
			}
			this.$.endmessage.setShowing(this.game.endOfGame());

			if(presence&&gamesize==0){
				if(this.game.getPlayer()==this.player){
					console.log("win");
					this.$.player.addClass("empty-image");
					this.$.computer.addClass("empty-image");
					this.$.computer.removeClass("oponent-image");
					this.$.endmessage.addClass("end-message-win");
					this.$.endmessage.removeClass("end-message-lost");
					this.$.endaudio.setSrc("audio/applause.ogg");
					this.$.endaudio.play();
					this.$.endmessage.show();
				}else{
					console.log("lost");
					this.$.player.addClass("empty-image");
					this.$.computer.removeClass("oponent-image");
					this.$.computer.addClass("empty-image");
					this.$.endmessage.addClass("player-lost");
					this.$.endmessage.removeClass("end-message-win");
					this.$.endaudio.setSrc("audio/disappointed.ogg");
					this.$.endaudio.play();
					this.$.endmessage.show();
				}
			}

			// Play for computer
			if (this.game.getPlayer() != this.player && !this.game.endOfGame()&&gamesize>0){
				if(presence){
					this.oponentPlay();
				}else{
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
					gamesize=msg.content;
					sizeupdated=true;
					playerupdated=false;
					app.drawBoard();
					secondplayer=true;
					break;
				case 'update':
					console.log("update");
					gamesize=msg.content;
					sizeupdated=true;
					playerupdated=true;
					this.player=msg.curplayer;
					switchclicked=true;
					app.drawBoard();
					break;
				case 'newgame':
					console.log("new game");
					newgame=true;
					app.doRenew();
					break;
				case 'exit':
					console.log("already two players");
					if(numberofplayers<2){
						app.Stop();
					}
					break;
			}
			
		},

		onNetworkUserChanged: function(msg) {
			if (isHost&&!onejoined) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'init',
					content: gamesize
				});
				onejoined=true;
			}else if(isHost&&onejoined){
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: 'exit'
				});
			}
			numberofplayers++;
			console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "leave"));
			if(!isHost) this.player=1;
		},

		// Get current level
		getLevel: function() {
			if (document.getElementById("level-easy-button").classList.contains('active')&&!presence)
				return 1;
			if (document.getElementById("level-medium-button").classList.contains('active')&&!presence)
				return 2;
			if (document.getElementById("level-hard-button").classList.contains('active')&&!presence)
				return 3;	
			return 0;
		},
		
		// Show the current player turn
		showCurrentPlayer: function() {
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
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					action: "update",
					content: gamesize,
					curplayer: this.player
				});
			}
			this.save(this.game.play(this.selectedCount));
			this.drawBoard();
			this.$.playbutton.hide();
		},

		oponentPlay: function() {
			if (this.player == this.game.getPlayer() && !this.game.endOfGame())
				this.$.player.removeClass("empty-image");
			else
				this.$.player.addClass("empty-image");
			if (this.player != this.game.getPlayer() && !this.game.endOfGame()){
				this.$.computer.removeClass("empty-image");
				this.$.computer.addClass("oponent-image");
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
				gamesize-=this.selectedCount;
				this.save(this.game.play(this.selectedCount));
				this.drawBoard();
			}
		},
		
		// Start a new game
		doRenew: function() {
			if((presence&&isHost)||!presence||newgame){
				this.level = this.getLevel();
				switchclicked=false;
				gamesize=13;
				this.init();
				if (presence&&isHost) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						action: 'newgame',
						content: gamesize,
						curplayer: this.player
					});
				}
				newgame=false;
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
			if (this.selected)
				this.addClass(className);
			else
				this.removeClass(className);
		},	
	});

});
