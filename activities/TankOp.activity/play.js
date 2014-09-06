
// Play class
enyo.kind({
	name: "TankOp.Play",
	kind: enyo.Control,
	classes: "board",
	published: { level: 0 },
	components: [	
		// Playing zone
		{name: "gamebox", classes: "game-box", ontap: "gameClick", components: [
		]},
		
		// Status and score
		{classes: "status-line", components: [
			{content: "WAVE", classes: "wave-text no-select-content"},
			{name: "wave", content: "1", classes: "wave-value no-select-content"},
			{content: "SCORE", classes: "score-text no-select-content"},
			{name: "score", content: "0000", classes: "score-value no-select-content"}
		]},		
		
		// Home button
		{kind: "Image", classes: "home-button no-select-content", src: "images/gohome.png", ontap: "goHome"},
		
		// LCD counter and Keyboard
		{name: "keyboard", classes: "keyboard-set no-select-content", components: [
			{classes: "display-line", components: [
				{name: "lcd", kind: "LcdDisplay", classes: "lcd-value", size: 3, value: ""}
			]},
			{classes: "keyboard-line", components: [
				{kind: "Image", src: "images/key_1.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_2.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_3.svg", classes: "keyboard", ontap: "virtkeyPressed"}			
			]},
			{classes: "keyboard_line", components: [
				{kind: "Image", src: "images/key_4.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_5.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_6.svg", classes: "keyboard", ontap: "virtkeyPressed"}
			]},
			{classes: "keyboard_line", components: [
				{kind: "Image", src: "images/key_7.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_8.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_9.svg", classes: "keyboard", ontap: "virtkeyPressed"}
			]},	
			{classes: "keyboard_line", components: [
				{kind: "Image", src: "images/key_0.svg", classes: "keyboard", ontap: "virtkeyPressed"},
				{kind: "Image", src: "images/key_fire.svg", classes: "keyboard", ontap: "virtkeyPressed"}
			]}				
		]},
		
		// Key handling
		{kind: "Signals", onkeypress: "keyPressed"},

		// Image cache
		{kind: "ImageCache", showing: false, onCacheLoaded: "cacheLoaded"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		play = this;
		this.imagesToLoad++;
		this.endOfGame = false;
		this.pausedGame = true;
		this.initializedGame = false;
		this.waitForClick = false;
		
		// Init canvas
		var wsize = document.body.clientWidth;
		if (wsize <= 480) {
			this.zoom = 0.4;
		} else if (wsize <= 640) {
			this.zoom = 0.55;
		} else if (wsize <= 768) {
			this.zoom = 0.62;
		} else if (wsize <= 854) {
			this.zoom = 0.65;			
		} else if (wsize <= 960) {
			this.zoom = 0.75;	
		} else if (wsize <= 1024) {
			this.zoom = 0.88;
		} else {
			this.zoom = 1;
		}		
		
		this.$.gamebox.setStyle("max-height: "+(this.zoom*constant.areaHeight)+"px;");		
		this.canvas = this.$.gamebox.createComponent({kind: "Canvas", id: "acanvas", name: "canvas", attributes: {width: constant.areaWidth, height: constant.areaHeight}});	

		// Start game loop
		this.loopTimer = window.setInterval(enyo.bind(this, "gameLoopTick"), constant.loopInterval);		
	},
	
	// Init game
	initGame: function() {
		// Game init
		var level = this.currentlevel = settings.levels[this.level];
		var settings_map = level.map;
		var settings_hq = level.defense[0];
		var settings_soldier = level.defense[1];
		var settings_tank = level.defense[2];
		var settings_canon = level.defense[3];
		var settings_helo = level.defense[4];
		
		// Init board
		this.initializedGame = true;
		this.game = util.createMap(settings.gameMap(settings_map));
		this.targetpos = {x: 7, y: 4};

		// Init units
		var width = constant.boardWidth, height = constant.boardHeight;
		var goodEngine = enyo.bind(this, "goodEngine");
		this.units = []

		// Set HQ
		var step = constant.boardHeight/(settings_hq+1);
		var hqs = [];
		for (var i = 0 ; i < settings_hq ; i++) {
			var hq = util.createUnit({type: "hq", color: "blue", x: 0, y: Math.floor((i+1)*step), engine: null});
			this.units.push(hq);
			hqs.push(hq);
		}
		
		// Create defending units
		var defense = [];
		for(var i = 0 ; i < settings_helo ; i++)
			defense.push({type: "helo", color: "blue", engine: goodEngine});
		for(var i = 0 ; i < settings_canon ; i++)
			defense.push({type: "canon", color: "blue", engine: goodEngine});
		for(var i = 0 ; i < settings_tank ; i++)
			defense.push({type: "tank", color: "blue", engine: goodEngine});
		for(var i = 0 ; i < settings_soldier ; i++)
			defense.push({type: "soldier", color: "blue", engine: goodEngine});
		
		// Set defense around hq
		if (defense.length > 0) {
			var hqindex = 0;
			var defenselength = Math.min(defense.length, 1+hqs.length*2);
			for (var i = 0 ; i < defenselength ; i++) {
				var position = {};
				do {
					var arounds = [{dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
					for (j = 0 ; j < arounds.length ; j++) {
						position = {x: hqs[hqindex].x+arounds[j].dx, y: hqs[hqindex].y+arounds[j].dy};
						if (util.lookForUnit(position) == null)
							break;
						else
							position = {x: -1, y: -1};
					}
					hqindex = (hqindex + 1) % hqs.length;
				} while (position.x == -1);
				defense[i].x = position.x;
				defense[i].y = position.y;
				this.units.push(util.createUnit(defense[i]));
			}
		}
		
		// Prepare bad units arrival
		this.score = 0;		
		this.wave = 1;
		this.enemyCount = level.attack;
		this.enemyWaveSize = constant.waveInitSize;
		this.enemyNextWaveCount = constant.waveInitSize;
		this.enemyWaveCount = 0;
		this.enemyArrivalTurn = constant.startArrival;		
		
		// Let's Go !
		this.pausedGame = false;
	},
	
	// Render
	rendered: function() {
		// Init game
		if (!this.initializedGame) {
			// Init context
			this.initGame();

			// Set zoom
			this.canvas.hasNode().style.MozTransform = "scale("+this.zoom+")";
			this.canvas.hasNode().style.MozTransformOrigin = "0 0";
			this.canvas.hasNode().style.zoom = this.zoom;			
		}
	},
	
	cacheLoaded: function() {
	},
	
	// Draw
	draw: function() {
		// Clear all
		var ctx = this.canvas.hasNode().getContext('2d');	
		ctx.clearRect(0, 0, this.canvas.attributes.width, this.canvas.attributes.height);
		
		// Draw board
		var grass = document.getElementById("grass");
		var trees = document.getElementById("trees");
		var mountain = document.getElementById("mountain");
		var water = document.getElementById("water");
		for (var i = 0 ; i < constant.boardHeight ; i++ ) {
			for (var j = 0 ; j < constant.boardWidth ; j++ ) {
				ctx.save();
				ctx.translate(j*constant.tileSize, i*constant.tileSize);
				ctx.drawImage(grass, 0, 0);
				var tileType = this.game[i][j];
				if (tileType == constant.tileTrees)
					ctx.drawImage(trees, 0, 0);
				else if (tileType == constant.tileMountain)
					ctx.drawImage(mountain, 0, 0);
				else if (tileType == constant.tileWater)
					ctx.drawImage(water, 0, 0);
				ctx.restore();
			}
		}
		
		// Draw tanks
		if (!this.endOfGame) {
			for (var i = 0 ; i < this.units.length ; i++)
				this.units[i].draw(ctx);
			
			// Draw target
			var target = document.getElementById("target");		
			ctx.save();
			ctx.translate(this.targetpos.x*constant.tileSize, this.targetpos.y*constant.tileSize);
			ctx.drawImage(target, 0, 0);
			ctx.restore();				
		}
		
		// End of game
		else {	
			// Draw end of game screen
			var endscreen = this.win ? document.getElementById("endgame_victory") :  document.getElementById("endgame_defeat");
			ctx.save();
			ctx.translate((constant.areaWidth-constant.endGameWidth)/2, (constant.areaHeight-constant.endGameHeight)/2);
			ctx.drawImage(endscreen, 0, 0);	
			ctx.restore();
			
			// Play end of game sound
			if (!this.waitForClick) {
				sound.play(this.win ? "audio/mission_completed" :  "audio/mission_failed", true);
				this.waitForClick = true;
			}
		}
				
	},
	
	// A key was pressed
	keyPressed: function(s, e) {
		var key = e.charCode;
		if (this.endOfGame)
			return;
			
		// Digit key
		if (key >= 48 && key <= 57) {
			// Add digit to string
			var value = this.$.lcd.getValue();
			if (value.length == this.$.lcd.getSize())
				value = value.substr(1);
			value += String.fromCharCode(key);
			this.$.lcd.setValue(value);
		}

		// Dash key
		else if (key == 45) {
			this.$.lcd.setValue("-");
		}
		
		// Fire key
		else if (key == 32) {
			// Look for unit with the value
			var units = util.lookForValue(this.$.lcd.getValue().replace(/ /g,''));
			if (units.length != 0) {
				for (var i = 0 ; i < units.length ; i++) {
					util.processFight(null, units[i], constant.userPower);
					this.targetpos.x = units[i].x;
					this.targetpos.y = units[i].y;			
				}
			}
			else
				sound.play("audio/missed");
			this.$.lcd.setValue("");
		}
	},
	
	// A virtual key is pressed
	virtkeyPressed: function(s) {
		var classes = s.getSrc().replace(".svg", "");
		var value = classes.substr("images/key_".length,classes.indexOf("key_"));
		if (value == "fire")
			this.keyPressed(null, {charCode: 32});
		else
			this.keyPressed(null, {charCode: 48+parseInt(value)});
	},
	
	goHome: function() {
		// Click at the end of game
		if (this.waitForClick) {
			this.gameClick();
			return;
		}
		
		// Stop game loop
		window.clearInterval(this.loopTimer);

		// Back to app
		app.init();			
		app.renderInto(document.getElementById("board"));
	},

	// A tap occur on the game
	gameClick: function() {		
		// At end of game, quit		
		if (this.endOfGame) {
			// Stop game loop
			window.clearInterval(this.loopTimer);
			
			// Set mission result
			if (this.win) {
				settings.levels[this.level].completed = true;
				app.nextMission();
				app.save();
			}
			app.init();
			
			// Back to app
			app.renderInto(document.getElementById("board"));
		}
			
		// Compute direction
		var screen_width = document.documentElement.clientWidth;
		var screen_height = document.documentElement.clientHeight;
		var center_x = Math.floor(screen_width/2.0);
		var center_y = Math.floor((screen_height+constant.pubHeight)/2.0);
		var diffx = mouse.position.x-center_x, diffy = mouse.position.y-center_y;
		var absdiffx = Math.abs(diffx);
		var absdiffy = Math.abs(diffy);
		if (absdiffx >= 0 && absdiffx < constant.fireZoneWidth && absdiffy >= 0 && absdiffy < constant.fireZoneHeight) {
			var targetunit = util.lookForUnit(this.targetpos);
			if (targetunit != null)
				util.processFight(null, targetunit);
			return;
		} else if (absdiffx > absdiffy) {
			dx = diffx > 0 ? 1 : -1;
			dy = 0;
		} else {
			dx = 0;
			dy = diffy > 0 ? 1 : -1;
		}
		
		// Move target
		var newX = this.targetpos.x + dx;
		var newY = this.targetpos.y + dy;
		if (newX < 0 || newX == constant.boardWidth || newY < 0 || newY == constant.boardHeight)
			return;
		this.targetpos.x = newX;
		this.targetpos.y = newY;
	},
	
	// Tick for game loop
	gameLoopTick: function() {
		if (this.pausedGame)
			return;
		
		// Sanitize: clean dead units and compute victory/defeat conditions
		var alives = [];
		var hqs = [];
		var livingHq = 0;
		var livingEnemy = 0;
		for (var i = 0 ; i < this.units.length ; i++) {
			var unit = this.units[i];
			var isRed = unit.getCurrentImage().indexOf("red") != -1;
			if (unit.power > 0) {
				alives.push(unit);
			} else {
				if (isRed) {
					this.enemyNextWaveCount--;
					this.score += util.unitPowers[util.getUnitType(unit)];
				}
				continue;
			}
			if (util.getUnitType(unit) == 0) {
				hqs[livingHq++] = unit;
			}
			if (isRed)
				livingEnemy++;				
		}
		this.units = alives;
		this.endOfGame = (livingHq == 0 || (livingEnemy == 0 && this.enemyCount == 0));
		this.win = (livingHq > 0);
		
		// Game play
		if (!this.endOfGame) {
			// Next wave
			if (this.enemyNextWaveCount == 0) {
				this.wave++;
				this.enemyWaveSize += 2;
				this.enemyWaveCount = 0;
				this.enemyNextWaveCount = this.enemyWaveSize;
				this.enemyArrivalTurn = constant.startArrival;				
			}
			
			// Enemy arrival
			else if (this.enemyWaveCount != this.enemyWaveSize) {
				if (this.enemyArrivalTurn == 0 && this.enemyCount > 0) {
					var badEngine = enyo.bind(this, "badEngine");
					var unit = util.createUnit({
						type: util.randomUnit(this.currentlevel.stats),
						color: "red",
						heading: 0,
						engine: badEngine,
						x: constant.boardWidth-1,
						y: util.random(constant.boardHeight)
					});
					unit.value = this.currentlevel.generator();
					this.units.push(unit);
					this.enemyCount = this.enemyCount-1;
					this.enemyWaveCount++;
					this.enemyArrivalTurn = constant.startArrival;
				} else {
					this.enemyArrivalTurn = this.enemyArrivalTurn - 1;
				}
			}
			
			// Launch engine for each unit
			for (var i = 0 ; i < this.units.length ; i++) {
				var engine = this.units[i].engine;
				if (engine != null)
					engine(this.units[i], hqs);
			}
		}
		
		// Draw
		this.draw();
		
		// HACK: On Android, force redraw of canvas
		if (enyo.platform.android && document.location.protocol.substr(0,4) != "http") {
			document.getElementById('acanvas').style.display='none';
			document.getElementById('acanvas').offsetHeight;
			document.getElementById('acanvas').style.display='block';
		}
		
		// Draw score
		this.$.wave.setContent(String("0000"+this.wave).slice(-4))
		this.$.score.setContent(String("0000"+this.score).slice(-4))
	},
	
	// Engine for good tank moves
	goodEngine: function(that, hqs) {
		// Look for enemy unit
		var opponent = util.lookForOpponent(that);
		if (opponent != null) {
			// Change heading toward opponent
			that.heading = opponent.heading;
			
			// Fight
			util.processFight(that, opponent.unit);			
			return;
		}
	},
	
	// Engine for bad tank moves
	badEngine: function(that, hqs) {
		// Look for enemy unit around
		var opponent = util.lookForOpponent(that);
		if (opponent != null) {
			// Change heading toward opponent
			that.heading = opponent.heading;
			
			// Fight
			util.processFight(that, opponent.unit);
			return;
		}
		
		// Change heading to go toward the nearest HQ
		var nearestHQ = util.nearestUnit(that, hqs);
		if (nearestHQ != null) {
			var dx = that.x - nearestHQ.x;
			var dy = that.y - nearestHQ.y;
			if (Math.abs(dx) > Math.abs(dy))
				that.heading = dx > 0 ? 0 : 2;
			else
				that.heading = dy > 0 ? 1 : 3;
		}

		// Is it a valid position ?
		var next = util.nextPositionOnHeading(that);		
		while (!util.isValidPosition(next, that)) {
			// No, try a random heading
			that.heading = util.random(4);
			next = util.nextPositionOnHeading(that);
		}
		next = util.nextPositionOnHeading(that);
		that.x = next.x;
		that.y = next.y;
	}
});
