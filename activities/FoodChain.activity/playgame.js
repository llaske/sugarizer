// Level config
FoodChain.playLevels = [
	{ flies: 2, rocks: 2, snakes: 0, time: 15 },   // Level 1
	{ flies: 2, rocks: 3, snakes: 0, time: 10 },   // Level 2
	{ flies: 3, rocks: 3, snakes: 0, time: 15 },   // Level 3
	{ flies: 3, rocks: 4, snakes: 1, time: 30 },   // Level 4
	{ flies: 4, rocks: 4, snakes: 1, time: 40 },  // Level 5
	{ flies: 3, rocks: 3, snakes: 2, time: 50 },  // Level 6
];

// Key to use
FoodChain.playKeys = [
	{ key: 75, heading: 0, dx: 1, dy: 0 },
	{ key: 107, heading: 0, dx: 1, dy: 0 },
	{ key: 73, heading: 90, dx: 0, dy: -1 },
	{ key: 105, heading: 90, dx: 0, dy: -1 },
	{ key: 74, heading: 0, dx: 1, dy: 0 },
	{ key: 106, heading: 180, dx: -1, dy: 0 },
	{ key: 76, heading: 270, dx: 0, dy: 1 },
	{ key: 108, heading: 270, dx: 0, dy: 1 }
];

// Play area size
FoodChain.playArea = {
	width: -1,
	height: -1
};

// Sprite size constant
FoodChain.sprites = {
	frog: { dx: 100, dy: 152 },
	rock: { dx: 112, dy: 101 },
	fly: { dx: 50, dy: 80 },
	snake: { dx: 100, dy: 250 }
};


// Play Game class
enyo.kind({
	name: "FoodChain.PlayGame",
	kind: enyo.Control,
	published: {level: 1, life: 3},
	classes: "board",
	components: [
		{ name: "cards", ontap: "clickToMove", classes: "cards", components: [
			// Level - Score - Time bar			
			{ classes: "status-bar", components: [
				{ classes: "level-zone", components: [
					{ name: "textlevel", classes: "title level-value" },
					{ name: "level", content: "0", classes: "title level-value" }
				]},
				{ classes: "score-zone", components: [
					{ name: "textscore", classes: "title score-text" },
					{ name: "score", content: "0000", classes: "title score-value" },
					{ name: "timercount", content: "0:0,0", classes: "title timer-value" }					
				]}				
			]},	
			{ name: "lifes", classes: "life-border", components: [
				{ kind: "Image", classes: "life", src:"images/frog9.png" },
				{ kind: "Image", classes: "life", src:"images/frog9.png" },
				{ kind: "Image", classes: "life", src:"images/frog9.png" }
			]},				
			
			// Playing zone
			{ name: "gamebox", classes: "game-box", components: [				
			]},
				
			// Buttons bar
			{ name: "play", kind: "ShadowButton", img: "play", classes: "play", ontap: "play" },	
			{ name: "pause", kind: "ShadowButton", img: "pause", classes: "play", ontap: "pause" },	
			{ name: "forward", kind: "ShadowButton", img: "forward", classes: "restart", ontap: "next" },
			{ name: "home", kind: "ShadowButton", img: "home", classes: "home2", ontap: "home" },

			// End of sound event
			{kind: "Signals", onEndOfSound: "endSound", onkeypress: "keyPressed"},
			
			// Preload all images for the game
			{showing: false, components: [
				{kind: "Image", id: "frog1", src:"images/frog1.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog2", src:"images/frog2.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog3", src:"images/frog3.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog4", src:"images/frog4.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog5", src:"images/frog5.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog6", src:"images/frog6.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog7", src:"images/frog7.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "frog8", src:"images/frog8.png", classes: "image-preload", onload: "imageLoaded" },					
				{kind: "Image", id: "frog9", src:"images/frog9.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "fly1", src:"images/fly1.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "fly2", src:"images/fly2.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake1", src:"images/snake1.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake2", src:"images/snake2.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake3", src:"images/snake3.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake4", src:"images/snake4.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake5", src:"images/snake5.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake6", src:"images/snake6.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake7", src:"images/snake7.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "snake8", src:"images/snake8.png", classes: "image-preload", onload: "imageLoaded" },
				{kind: "Image", id: "rock", src:"images/rock.png", classes: "image-preload", onload: "imageLoaded" }
			]}
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.imagesToLoad = 20;
		this.nextaction = 0;
		FoodChain.playArea = {		
			width: 984,
			height: 560
		};
		var zoom = FoodChain.getZoomLevel();
		this.$.gamebox.setStyle("max-height: "+(FoodChain.playArea.height*zoom)+"px;"+"max-width: "+(FoodChain.playArea.width*zoom)+"px;");	
		this.canvas = this.$.gamebox.createComponent({kind: "Canvas", id: "acanvas", name: "canvas", attributes: {width: FoodChain.playArea.width, height: FoodChain.playArea.height}}, {owner: this});
		this.createComponent({ name: "timer", kind: "Timer", paused: true, onTriggered: "updateTimer" }, {owner: this});		
		this.createComponent({ name: "timerMonster", kind: "Timer", baseInterval: 500, onTriggered: "monsterEngine" }, {owner: this});
		this.setLocale();		
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
		FoodChain.context.game = this.kindName;
		this.levelChanged();
	},
	
	// Localization changed, update cards and string resource
	setLocale: function() {
		// Update string resources
		this.$.textlevel.setContent(__$FC("level"));
		this.$.textscore.setContent(__$FC("score"));	
	},
	
	// Level changed, init board then start game
	levelChanged: function() {
		
		// Init frog
		FoodChain.context.level = this.level;
		this.frog = new Sprite({
			x: 70, y: (FoodChain.playArea.height/2)-20, heading: 0, images: ["frog1", "frog2", "frog3", "frog4", "frog5", "frog6", "frog7", "frog8", "frog9"],
			width: FoodChain.sprites.frog.dx, height: FoodChain.sprites.frog.dy, index: 0, sound: "audio/frog"
		});
		this.frog.alive = true;
		
		// Set randomely rocks
		this.rocks = [];
		for(var i = 0 ; i < FoodChain.playLevels[this.level-1].rocks ; i++) {
			// Ensure distance between blocks and between block and frog is sufficient
			var rock = FoodChain.createWithCondition(
				// Create randomly a new rock...
				function() {
					var x = 130+Math.floor(Math.random()*(FoodChain.playArea.width-300));
					var y = 130+Math.floor(Math.random()*(FoodChain.playArea.height-200));
					var h = Math.floor(Math.random()*4)*90;
					return new Sprite({
						x: x, y: y, heading: h, images: ["rock"], width: FoodChain.sprites.rock.dx, height: FoodChain.sprites.rock.dy, index: 0
					});
				},
				
				// ... while don't intersect with ...
				function(n, s) {
					return !n.intersect(s);
				},
				
				// ... other rocks and frog
				enyo.cloneArray(this.rocks).concat(this.frog)
			);
			this.rocks.push(rock);
		}
		
		// Set randomely flies
		this.flies = [];
		for(var i = 0 ; i < FoodChain.playLevels[this.level-1].flies ; i++) {
			// Ensure not on a rock, on the frog or on other fly
			var fly = FoodChain.createWithCondition(
				// Create randomly a new fly...
				function() {
					var x = 100+Math.floor(Math.random()*(FoodChain.playArea.width-300));
					var y = 100+Math.floor(Math.random()*(FoodChain.playArea.height-200));					
					var h = Math.floor(Math.random()*4)*90;
					return new Sprite({
						x: x, y: y, heading: h, images: ["fly1", "fly2"], width: FoodChain.sprites.fly.dx, height: FoodChain.sprites.fly.dy, index: 0, sound: "audio/flies"
					});
				},
				
				// ... while don't intersect with ...
				function(n, s) {
					return !n.intersect(s);
				},
				
				// ... other rocks, flies and frog
				enyo.cloneArray(this.rocks).concat(this.flies).concat(this.frog)
			);			
			
			// Create the new fly
			fly.alive = true;
			this.flies.push(fly);
		}
		
		// Create snakes (dead at init)
		this.snakes = [];
		for(var i = 0 ; i < FoodChain.playLevels[this.level-1].snakes ; i++) {
			var snake = new Sprite({
				x: 0, y: 0, heading: 0, images: ["snake1", "snake2", "snake3", "snake4", "snake5", "snake6", "snake7", "snake8"], 
				width: FoodChain.sprites.snake.dx, height: FoodChain.sprites.snake.dy, index: 0, sound: "audio/snake"
			});
			snake.alive = false;
			this.snakes.push(snake);
		}
		
		// Saving context
		FoodChain.saveContext();
		
		// Button handling
		this.$.play.hide();
		this.$.pause.show();
		this.$.forward.hide();
		this.$.home.hide();
		
		// Timer and level init
		this.$.level.setContent(" "+this.level);
		this.timecount = {mins:0, secs:0, tenth:0};
		this.$.timercount.removeClass("timer-overtime");
		this.displayTimer();
	},
	
	// One image load
	imageLoaded: function() {
		if (--this.imagesToLoad == 0)
			this.initGame();
	},
	
	// All image loaded, start displaying game
	initGame: function() {
		var zoom = FoodChain.getZoomLevel();
		this.canvas.hasNode().style.MozTransform = "scale("+zoom+")";
		this.canvas.hasNode().style.MozTransformOrigin = "0 0";
		this.canvas.hasNode().style.zoom = zoom;	
		this.ctx = this.canvas.node.getContext('2d');
		this.ctx.clearRect(0, 0, this.canvas.attributes.width, this.canvas.attributes.height);		
		
		// Draw rocks
		for(var i = 0 ; i < this.rocks.length ; i++) {
			this.rocks[i].draw(this.ctx);
		}
		
		// Draw frog
		this.frog.draw(this.ctx);
		
		// Draw flies
		for(var i = 0 ; i < this.flies.length ; i++) {
			this.flies[i].draw(this.ctx);
		}	

		// Start timer
		this.$.timer.resume();
	},
	
	// Show direction to frog using click on board
	clickToMove: function(s, e) {
		// Compute direction comparing click with frog position
		var rect = this.canvas.node.getBoundingClientRect();
		var mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
		var dx = mouseX - this.frog.getX(), dy = mouseY - this.frog.getY();
		if (dx == 0 && dy == 0)
			return;
		if (Math.abs(dx) > Math.abs(dy)) {
			dx = dx > 0 ? 1 : -1;
			dy = 0;
		} else {
			dx = 0;
			dy = dy > 0 ? 1 : -1;
		}
		
		// Simulate the equivalent key direction
		for (var i = 0 ; i < FoodChain.playKeys.length ; i++ ) {
			var playKey = FoodChain.playKeys[i];
			if (playKey.dx == dx && playKey.dy == dy) {
				e.charCode = playKey.key;
				this.keyPressed(s, e);
				return;
			}
		}
	},
	
	// A key was pressed
	keyPressed: function(s, e) {
		var key = e.charCode;
		
		// Game paused
		if (this.$.timer.paused)
			return;
			
		// Frog is dead
		if (!this.frog.alive)
			return;
		
		// Compute asked direction
		var newHeading;
		var dx = 0, dy = 0;
		var foundKey = false;
		for (var i = 0 ; i < FoodChain.playKeys.length ; i++ ) {
			var playKey = FoodChain.playKeys[i];
			if (key == playKey.key) {
				dx = playKey.dx;
				dy = playKey.dy;
				newHeading = playKey.heading;
				foundKey = true;
			}
		}
		if (!foundKey) {
			FoodChain.log("key pressed: " + key);		
			return;
		}
		
		// Move frog
		this.frog.unDraw(this.ctx);		
		if (newHeading != this.frog.getHeading()) {
			// Just change heading
			this.frog.setHeading(newHeading);
			this.frog.firstImage();
		} else {
			// Move frog
			this.frog.animate(this.ctx, [1, 2, 3, 4, 5, 6, 0], dx*10, dy*10, enyo.bind(this, "frogEngine"));
		}
		this.frog.draw(this.ctx);
	},
	
	// Frog engine: test collition between frog and other sprites
	frogEngine: function() {		
		// Test if not collide with a rock
		for(var i = 0 ; i < this.rocks.length ; i++) {
			if (this.frog.intersect(this.rocks[i])) {
				// Yes, frog is dead
				this.frog.unDraw(this.ctx);			
				this.frog.useImage(7);
				this.frog.draw(this.ctx);
				this.rocks[i].draw(this.ctx);
				this.frog.alive = false;
				this.testEndOfGame();
				return false;
			}
		}
		
		// Test if eat a fly
		for(var i = 0 ; i < this.flies.length ; i++) {
			if (this.flies[i].alive && this.frog.intersect(this.flies[i])) {
				// Yes, flies is dead
				this.flies[i].unDraw(this.ctx);
				this.flies[i].alive = false;
				
				// Animate the happy frog, score and test for next level
				this.frog.playSound();
				this.addScore(1);				
				return !this.testEndOfGame();
			}
		}
		
		// Test if out of playboard
		if (this.frog.getX() <= this.frog.width/2 || this.frog.getX() >= this.canvas.attributes.width-this.frog.width/2 ||
			this.frog.getY() <= this.frog.height/2 || this.frog.getY() >= this.canvas.attributes.height-this.frog.height/2) {
			// Yes, replace it on the limit
			this.frog.setX(Math.max(this.frog.width/2+1, this.frog.getX()));
			this.frog.setX(Math.min(this.canvas.attributes.width-this.frog.width/2-1, this.frog.getX()));
			this.frog.setY(Math.max(this.frog.height/2+1, this.frog.getY()));
			this.frog.setY(Math.min(this.canvas.attributes.height-this.frog.height/2-1, this.frog.getY()));
			this.frog.unDraw(this.ctx);			
			this.frog.firstImage();
			this.frog.draw(this.ctx);		
			this.frog.playSound();
			return false;
		}	
		
		// Test if not collide with a rock
		for(var i = 0 ; i < this.snakes.length ; i++) {
			if (this.frog.intersect(this.snakes[i])) {
				// Yes, frog is dead
				this.frog.unDraw(this.ctx);			
				this.frog.useImage(7);
				this.frog.draw(this.ctx);
				this.snakes[i].draw(this.ctx);
				this.frog.alive = false;
				this.testEndOfGame();
				return false;
			}
		}		
		
		return true;
	},
	
	// Periodic engine wake up for flies and snakes
	monsterEngine: function() {
		// Flies engine
		this.fliesEngine();
		
		// Snakes engine
		this.snakesEngine();
	},
	
	// Flies engine: move and sound flies periodically
	fliesEngine: function() {		
		// Game paused
		if (this.$.timer.paused)
			return;
	
		// For each fly
		for(var i = 0 ; i < this.flies.length ; i++) {
			// Dead fly, nothing to do
			if (!this.flies[i].alive)
				continue;
				
			// Randomly decide what to do
			var n = Math.floor(Math.random()*10);
			
			// Move the fly
			if (n == 1) {
				this.moveFly(this.flies[i]);			
			// Just animate the fly
			} else if (n <= 2) {
				this.flies[i].animate(this.ctx, [0, 1, 0, 1, 0, 1], 0, 0, enyo.bind(this, "testFlyDead"));			
			}
		}
	},
	
	// Move the fly due to periodic change or snake collision
	moveFly: function(fly) {
		var currentfly = fly;
		var dummyfly = FoodChain.createWithCondition(
			// Create randomly a new fly...
			function() {
				var x = 100+Math.floor(Math.random()*(FoodChain.playArea.width-300));
				var y = 100+Math.floor(Math.random()*(FoodChain.playArea.height-200));
				var h = Math.floor(Math.random()*4)*90;
				return new Sprite({x: x, y: y, heading: h, width: FoodChain.sprites.fly.dx, height: FoodChain.sprites.fly.dy});
			},
			
			// ... while don't intersect with ...
			function(n, s) {
				return s == currentfly || !n.intersect(s);
			},
			
			// ... other rocks, flies, frog and snakes
			enyo.cloneArray(this.rocks).concat(this.flies).concat(this.frog).concat(this.snakes)
		);				
		
		// Redraw
		currentfly.unDraw(this.ctx);
		currentfly.setX(dummyfly.getX());
		currentfly.setY(dummyfly.getY());
		currentfly.setHeading(dummyfly.getHeading());
		currentfly.draw(this.ctx);
		currentfly.playSound();	
	},

	// Snake engine: create and animate snake periodically
	snakesEngine: function() {
		// Game paused
		if (this.$.timer.paused)
			return;
	
		// For each snake
		for(var i = 0 ; i < this.snakes.length ; i++) {	
			// Randomly decide what to do
			var n = Math.floor(Math.random()*4);
			if (n != 0)
				continue;
			
			// Snake has end its course
			var currentsnake = this.snakes[i];
			var maxheight = this.canvas.attributes.height;
			var maxwidth = this.canvas.attributes.width;			
			if ((currentsnake.getHeading() == 90 && currentsnake.getY()+currentsnake.height < 0)
				|| (currentsnake.getHeading() == 270 && currentsnake.getY()-currentsnake.height/2 > maxheight))
				currentsnake.alive = false;
				
			// Snake out of game, reintroduce it
			if (!currentsnake.alive) {

				// Compute trajectory free of rock & snakes interval
				var spritesToAvoid = enyo.cloneArray(this.rocks).concat(this.snakes);
				var freeInterval = [];
				for (var x = 100 ; x < FoodChain.playArea.width-300 ; x = x + 50) {
					// Compute is this interval is free
					var free = true;
					for (var j = 0 ; free && j < spritesToAvoid.length ; j++) {
						// Test each sprite
						var s = spritesToAvoid[j];
						if (s == currentsnake) continue;
						if ((x > s.getX() && x-currentsnake.width/2 < s.getX()+s.width/2) || (x < s.getX() && x+currentsnake.width/2 > s.getX()-s.width/2)) {
							free = false;
						}
					}
					
					// No, add to busyList
					if (free)
					freeInterval.push(x);
				}

				// Compute the snake position
				x = freeInterval[Math.floor(Math.random()*freeInterval.length)];
				var h = (Math.floor(Math.random()*2) == 0) ? 90 : 270;
				var y = (h == 90) ? maxheight : 0;

				// Set alive and launch animation
				currentsnake.setX(x);
				currentsnake.setY(y);
				currentsnake.setHeading(h);
				currentsnake.alive = true;
				currentsnake.playSound();
				var dy = (currentsnake.getHeading() == 90) ? -6 : 6;
				currentsnake.animate(this.ctx, [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7], 0, dy, enyo.bind(this, "snakeCollisionEngine"));
			}
			
			// Animate it
			else {
				var dy = (currentsnake.getHeading() == 90) ? -6 : 6;
				currentsnake.animate(this.ctx, [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7], 0, dy, enyo.bind(this, "snakeCollisionEngine"));
			}
		}
	},
	
	// Snake collision engine
	snakeCollisionEngine: function(snake) {
		// Hit frog ?
		if (snake.intersect(this.frog)) {
			// Yes but already dead
			if (!this.frog.alive) {
				this.frog.draw(this.ctx);
				return true;
			}
			
			// Yes, frog is dead
			this.frog.alive = false;			
			this.frog.unDraw(this.ctx);			
			this.frog.useImage(7);
			this.frog.draw(this.ctx);
			this.testEndOfGame();
			return true;		
		}
		
		// Test if eat a fly
		for(var i = 0 ; i < this.flies.length ; i++) {
			if (this.flies[i].alive && snake.intersect(this.flies[i])) {
				// Yes move the fly	
				this.moveFly(this.flies[i]);
				return true;
			}
		}		
		
		return true;
	},
	
	// Force end of fly animation if fly is dead
	testFlyDead: function(fly) {
		if (!fly.alive) {
			fly.unDraw(this.ctx);
			return false;
		}
		return true;
	},
	
	// Test end of game
	testEndOfGame: function() {
		// Frog is dead
		if (!this.frog.alive) {
			// Delete a life
			this.life--;		
			this.$.lifes.getControls()[this.life].hide();
			
			// Is it last life ?
			if (this.life > 0) {
				// No, next frog
				this.nextaction = 1;
			} else {
				// Yes
				this.$.timer.pause();
				this.$.pause.hide();
				this.$.home.show();
			}
			FoodChain.sound.play("audio/disappointed");			
		}
		
		// Frog is alive: last fly eaten ?
		else {
			// Count living fly
			var flies = 0;
			for(var i = 0 ; i < this.flies.length ; i++) {
				if (this.flies[i].alive) flies++;
			}
			
			// Not the last, continue
			if (flies > 0)
				return false;

			// Show happy frog
			this.frog.unDraw(this.ctx);
			this.frog.setX(this.frog.getX()+50);
			this.frog.setY(this.frog.getY()+50);
			this.frog.useImage(8);
			this.frog.setHeading(90);
			this.frog.draw(this.ctx);
			
			// No more, go to next level
			this.$.timer.pause();
			FoodChain.sound.play("audio/applause");
			this.computeLevelScore();
			this.$.play.hide();
			this.$.pause.hide();				
			this.$.home.show();
			if (this.level != FoodChain.playLevels.length)
				this.$.forward.show();

			return true;
		}
	},
	
	// Sound ended
	endSound: function(e, s) {	
	
		// Next life
		if (this.nextaction == 1) {
			this.nextaction = 0;
			this.frog.unDraw(this.ctx);
			this.frog.setX(70);
			this.frog.setY((FoodChain.playArea.height/2)-20);
			this.frog.setHeading(0);
			this.frog.useImage(0);
			this.frog.draw(this.ctx);
			this.frog.alive = true;
			return;
		}
		
	},
	
	// Display timer value
	displayTimer: function() {
		this.$.timercount.setContent(this.timecount.mins+":"+String("00"+this.timecount.secs).slice(-2)+","+this.timecount.tenth);
	},
	
	// Update timer
	updateTimer: function(s, e) {
		this.timecount.tenth = this.timecount.tenth + 1;
		if (this.timecount.tenth == 10) {
			this.timecount.tenth = 0;
			this.timecount.secs = this.timecount.secs + 1;
			var currentcount = this.timecount.mins * 60 + this.timecount.secs;
			if (currentcount >= FoodChain.playLevels[this.level-1].time) {
				this.$.timercount.addClass("timer-overtime");
			}
			if (this.timecount.secs == 60) {
				this.timecount.secs = 0;
				this.timecount.mins = this.timecount.mins + 1;
			}
		}
		this.displayTimer();
	},
	
	// Compute score
	addScore: function(score) {
		FoodChain.context.score += score;
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
	},
	
	// Compute score for this level
	computeLevelScore: function() {
		var score = 0;
		var currentcount = this.timecount.mins * 60 + this.timecount.secs;
		if (currentcount < FoodChain.playLevels[this.level-1].time) {
			score += (FoodChain.playLevels[this.level-1].time - currentcount);
		}
		this.addScore(score);
	},	
	
	// Resume game
	play: function() {
		this.$.timer.resume();
		this.$.play.hide();		
		this.$.pause.show();
		this.$.home.hide();
		return true; // Prevent event from bubbling up and causing "clickToMove" to be triggered
	},
	
	// Pause game
	pause: function() {	
		this.$.timer.pause();
		this.$.pause.hide();
		this.$.play.show();
		this.$.home.show();
		return true; // Prevent event from bubbling up and causing "clickToMove" to be triggered
	},
	
	// Go to the next level
	next: function() {
		this.level = this.level + 1;
		this.levelChanged();
		this.initGame();
		return true; // Prevent event from bubbling up and causing "clickToMove" to be triggered
	},
	
	// Go to the home page of the app
	home: function() {
		this.$.timer.stop();	
		this.$.timerMonster.stop();	
		FoodChain.goHome();
		return true; // Prevent event from bubbling up and causing "clickToMove" to be triggered
	}
});
