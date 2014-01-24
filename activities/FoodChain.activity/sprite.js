
// Light sprite class
enyo.kind({
	name: "Sprite",	
	published: { x: 0, y: 0, width: 0, height: 0, heading: 0, images: [], index: -1, sound: "" },

	// Create component
	create: function() {	
		this.inherited(arguments);
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;
		this.animating = false;
	},
	
	// Draw the sprite in the canvas context
	draw: function(ctx) {
		// Go to pos and heading and draw current image
		ctx.save();		
		ctx.translate(this.x, this.y);
		var rotate = (90-this.heading) * (Math.PI / 180);
		ctx.rotate(rotate);
		ctx.translate(-this.halfWidth,-this.halfHeight);
		var image = document.getElementById(this.images[this.index]);		
		ctx.drawImage(image, 0, 0);	
		ctx.restore();	
	},
	
	// Compute min rectangle around sprite
	computeRect: function() {
		var rotate = (90-this.heading) * (Math.PI / 180);

		var wc = this.halfWidth*Math.cos(rotate);
		var hc = this.halfHeight*Math.cos(rotate);
		var ws = this.halfWidth*Math.sin(rotate);
		var hs = this.halfHeight*Math.sin(rotate);
		var sx0 = this.x-wc+hs;
		var sy0 = this.y-hc+ws;
		var sx1 = this.x+wc+hs;
		var sy1 = this.y-hc-ws;
		var sx2 = this.x+wc-hs;
		var sy2 = this.y+hc-ws;
		var sx3 = this.x-wc-hs;
		var sy3 = this.y+hc+ws;	
		
		var x0 = Math.min(sx0, Math.min(sx1, Math.min(sx2, sx3)));
		var y0 = Math.min(sy0, Math.min(sy1, Math.min(sy2, sy3)));		
		var x1 = Math.max(sx1, Math.max(sx1, Math.max(sx2, sx3)));
		var y1 = Math.max(sy1, Math.max(sy1, Math.max(sy2, sy3)));
		
		return { x: x0, y: y0, dx: x1-x0, dy: y1-y0 };
	},
	
	// Draw border around sprite
	drawBorder: function(ctx) {
		ctx.save();		
		ctx.strokeStyle = "blue";
		var rect = this.computeRect();
		ctx.strokeRect(rect.x, rect.y, rect.dx, rect.dy);
		ctx.restore();		
	},
	
	// Undraw the sprite: i.e. clear canvas at the sprite pos
	unDraw: function(ctx) {
		var rect = this.computeRect();	
		ctx.clearRect(rect.x, rect.y, rect.dx, rect.dy);	
	},
	
	// Use first image for sprite
	firstImage: function() {
		this.index = 0;
	},
	
	// Use next image for sprite
	nextImage: function(max) {
		this.index = this.index + 1;
		if (max === undefined)
			max = this.images.length;
		if (this.index >= max)
			this.index = 0;
	},
	
	// Use a specific image
	useImage: function(index) {
		this.index = index;
	},
	
	// Play sound of the sprite
	playSound: function() {
		if (this.sound != "")
			FoodChain.sound.play(this.sound);	
	},
	
	// Test if the sprite intersect another sprite
	intersect: function(sprite) {
		var r1 = this.computeRect();
		var r2 = sprite.computeRect();

		return !(r2.x > (r1.x+r1.dx) || (r2.x+r2.dx) < r1.x || 
			r2.y > (r1.y+r1.dy) || (r2.y+r2.dy) < r1.y);		
	},
	
	// Compute distance between two sprites
	distance: function(sprite) {
		var dx = sprite.x-this.x;
		var dy = sprite.y-this.y;
		var dist = Math.sqrt(dx*dx+dy*dy);
		
		return dist;	
	},
	
	// Animate the sprite using a list of image and a movement 
	animate: function(ctx, images, dx, dy, action) {
		if (this.animating)
			return;
		this.animating = true;
		this.animation = {ctx: ctx, index: 0, images: images, dx: dx, dy: dy, action: action };
		this.animation.job = window.setInterval(enyo.bind(this, "animateTimer"), 50);
	},
	
	// Timer use of animation
	animateTimer: function() {
		// End of animation ?
		if (this.animation.index == this.animation.images.length) {
			this.animating = false;
			window.clearInterval(this.animation.job);
			return;
		}
		
		// Draw current frame
		this.unDraw(this.animation.ctx);
		if (this.animation.dx != undefined)
			this.x += this.animation.dx;
		if (this.animation.dy != undefined)
			this.y += this.animation.dy;
		this.useImage(this.animation.images[this.animation.index]);
		this.draw(this.animation.ctx);
		
		// Action to do at each move
		if (this.animation.action != undefined) {
			if (!this.animation.action(this)) {
				this.animating = false;
				this.animation.index = this.animation.images.length;
				window.clearInterval(this.animation.job);
				return;			
			}
		}
		
		// Next frame
		this.animation.index = this.animation.index + 1;
	},
});	