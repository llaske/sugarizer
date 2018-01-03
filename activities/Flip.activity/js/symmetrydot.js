function SymmetryDot(stage,clickable,x,y,radius,colours,index,game,xpos,ypos){
	this.clickable = clickable;
	this.colour = index;
	this.colours = colours;
	this.radius = radius;
	this.circle = null;

	this.setCircle = function(x,y){
		this.circle.x = x;
		this.circle.y = y;
		stage.addChild(this.circle);
	}

	this.getNewColour = function(){
		this.colour++;
		if (this.colour>(this.colours.length-1)){
			this.colour = 0;
		}
	}

	this.setColour = function(index){
		this.circle.graphics.clear().beginFill(this.colours[index]).drawCircle(0,0,this.radius).endFill();
		this.colour = index;
	}

	this.setClickListener = function(){
		var c = this.circle;
		var d = this;
		var g = game;
		this.circle.on("click", function (evt) {
			if (d.clickable==true){
				d.getNewColour();
				console.log(d.colours[d.colour]);
				d.setColour(d.colour);
				if (g.robot){
					g.robotColours(xpos,ypos,d.colour);
				}
				g.checkColours();
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
		this.setCircle(x,y);
		this.setClickListener();
		//console.log(this.circle);
	}
}