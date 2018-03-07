function Dot(stage,x,y,colours,index,radius,game,xpos,ypos){
	this.colour = index;
	this.colours = colours;
	this.radius = radius;
	this.circle = null;
	this.clickable = true;
	this.x = x;
	this.y = y;

	this.setCircle = function(){
		this.circle.x = this.x;
		this.circle.y = this.y;
		stage.addChild(this.circle);
	}

	this.setColour = function(index){
		this.circle.graphics.clear().beginFill(this.colours[index]).drawCircle(0,0,this.radius).endFill();
		this.colour = index;
	}

	this.flipSelf = function(){
		//console.log("flip");
		if (this.colour==0){
			this.colour = 1;
			this.setColour(1);
		} else {
			this.colour = 0;
			this.setColour(0);
		}
	}

	this.setClickListener = function(){
		var c = this.circle;
		var d = this;
		var g = game;
		this.circle.on("click", function (evt) {
			if (d.clickable==true){
				g.flip(xpos,ypos);
			}
		});
	}

	this.showSmile = function(){
		var s = new createjs.Shape();
		var g = s.graphics;
		var scale = 150;
		var colour = "";
		if (this.colours[this.colour]=="#000"||this.colours[this.colour]=="#000000"){
			colour = "#FFFFFF";
		} else {
			colour = "#000000";
		}
		g.setStrokeStyle(10/scale*this.radius, 'round', 'round');
		g.beginStroke(colour);
		g.beginFill();
		g.drawCircle(0, 0, 100/scale*this.radius);
		g.beginFill();
		g.arc(0, 0, 60/scale*this.radius, 0, Math.PI);
		g.beginStroke();
		g.beginFill(colour);
		g.drawCircle(-30/scale*this.radius, -30/scale*this.radius, 15/scale*this.radius);
		g.drawCircle(30/scale*this.radius, -30/scale*this.radius, 15/scale*this.radius);
		s.x = this.circle.x;
		s.y = this.circle.y;
		stage.addChild(s);
		//console.log(s);
	}

	this.init = function(){
		var circle = new createjs.Shape();
		circle.graphics.beginFill(this.colours[this.colour]).drawCircle(0,0,this.radius).endFill();
		this.circle = circle;
		this.setCircle();
		this.setClickListener();
		//console.log(this.circle);
	}
}