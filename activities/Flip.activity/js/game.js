function Game(stage,xocolor,doc,datastore,activity,sizepalette){
	this.margin = 0;
	this.radius = 0;
	this.circleswidth = 0;
	this.circlesheight = 0;
	this.colours = [xocolor.stroke,xocolor.fill];

	this.gridwidth = 7;
	this.gridheight = 7;
	this.numFlips = 14;
	this.startgridwidth = 4;
	this.startgridheight = 4;

	this.dots = [];
	this.stack = [];

	this.solveTimeout;
	this.newGameTimeout;


	//Helper functions
	this.radiusFromX = function(){
		this.margin = 1/50*stage.canvas.width;
		var diameter = (stage.canvas.width-(this.margin*(this.gridwidth+1)))/this.gridwidth;
		var radius = diameter/2;
		return radius;
	}

	this.radiusFromY = function(){
		this.margin = 1/50*stage.canvas.height;
		var diameter = (stage.canvas.height-(this.margin*(this.gridheight+1)))/this.gridheight;
		var radius = diameter/2;
		return radius;
	}

	this.canDoFromX = function(){
		var rad = this.radiusFromX();
		this.margin = 1/50*stage.canvas.width;
		if ((((rad*2)*this.gridheight)+(this.margin*(this.gridheight+1)))<=stage.canvas.height){
			return rad;
		} else {
			return false;
		}
	}

	this.checkGameOver = function(){
		for (var x = 0; x<this.startgridwidth; x++){
			for (var y = 0; y<this.startgridheight; y++){
				if (this.dots[x][y].colour!=0){
					return false;
				}
			}
		}
		return true;
	}

	//Flipping

	this.flip = function(x,y,playing,stack){
		if (playing===undefined){playing=true;}
		if (stack===undefined){stack=true;}
		if (stack){
			this.stack.push([x,y]);
		}
		//console.log("flipdots");
		this.dots[x][y].flipSelf();
		if (0<y){
			this.dots[x][y-1].flipSelf();
		}
		if (0<x){
			this.dots[x-1][y].flipSelf();
		}
		if (y<this.startgridheight-1){
			this.dots[x][y+1].flipSelf();
		}
		if (x<this.startgridwidth-1){
			this.dots[x+1][y].flipSelf();
		}
		if (playing){
			if (this.checkGameOver()){
				this.gameOver();
			}
		}
	}

	this.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	this.flipRandomDot = function(){
		this.flip(this.getRandomInt(0,this.startgridwidth-1),this.getRandomInt(0,this.startgridheight-1),false);
	}

	//Solve

	this.solve = function(){
		if (this.stack.length == 0){
			return;
		} else {
			var dot = this.stack.pop();
			this.flip(dot[0],dot[1],false,false);
			//var t = this;
			//this.solveTimeout = setTimeout(function(){t.solve();},750);
		}
	}

	//Game Over

	this.gameOver = function(){
		for (var x = 0; x<this.startgridwidth; x++){
			for (var y = 0; y<this.startgridheight; y++){
				this.dots[x][y].showSmile();
				this.dots[x][y].clickable = false;
			}
		}
		if (this.startgridwidth<this.gridwidth){
			this.startgridwidth++;
			this.startgridheight++;
		}
		this.palette.setUsed();
		var t = this;
		this.newGameTimeout = setTimeout(function(){t.newGame();},2000);
	}

	//Save

	this.stop = function(){
		//store stack, dots, startgridwidth, startgridheight
		var arr = {};
		arr.stack = this.stack;
		arr.startgridwidth = this.startgridwidth;
		arr.startgridheight = this.startgridheight;
		arr.dots = [];
		for (var x = 0; x<this.startgridwidth; x++){
			temparr = [];
			for (var y = 0; y<this.startgridheight; y++){
				temparr.push(this.dots[x][y].colour);
			}
			arr.dots.push(temparr);
		}
		//console.log(arr);
		var js = JSON.stringify(arr);
		//console.log(js);
		activity.getDatastoreObject().setDataAsText(js);
		activity.getDatastoreObject().save(function(){
			activity.close();
		});
	}

	//Init
	
	this.initialiseFromArray = function(){
		clearTimeout(this.newGameTimeout);
		clearTimeout(this.solveTimeout);
		stage.removeAllChildren();
		this.calculateDimensions();
		var incr = (this.radius*2+this.margin);
		var xp = (stage.canvas.width-this.circleswidth)/2+this.margin;
		var yp = this.margin;
		for (var x = 0; x<this.startgridwidth; x++){
			yp = this.margin;
			for (var y = 0; y<this.startgridheight; y++){
				this.dots[x][y].radius = this.radius;
				this.dots[x][y].x = xp+this.radius;
				this.dots[x][y].y = yp+this.radius;
				this.dots[x][y].init();
				yp+=incr;
			}
			xp+=incr;
		}
	}

	this.initDots = function(dotsindex){
		this.dots = [];
		var temparr = [];
		var incr = (this.radius*2+this.margin);
		var xp = (stage.canvas.width-this.circleswidth)/2+this.margin;
		var yp = this.margin;

		for (var x = 0; x<this.startgridwidth; x++){
			temparr = [];
			yp = this.margin;
			for (var y = 0; y<this.startgridheight; y++){
				//console.log(x);
				//console.log(y);
				var ind = 0;
				if (dotsindex!=undefined){
					ind = dotsindex[x][y];
				}
				var s = new Dot(stage,xp+this.radius,yp+this.radius,this.colours,ind,this.radius,this,x,y);
				s.init();
				temparr.push(s);
				//console.log(s);
				yp+=incr;
			}
			this.dots.push(temparr);
			xp+=incr;
		}
		//console.log(this.dotsarr);
	}

	this.calculateDimensions = function(){
		var rad = this.canDoFromX();
		if (rad===false){
			rad = this.radiusFromY();
		}
		this.radius = rad;
		this.circleswidth = this.radius*2*this.startgridwidth+this.margin*(this.startgridwidth+1);
		this.circlesheight = this.radius*2*this.startgridheight+this.margin*(this.startgridheight+1);
	}

	this.newGame = function(){
		clearTimeout(this.newGameTimeout);
		clearTimeout(this.solveTimeout);
		stage.removeAllChildren();
		this.calculateDimensions();
		this.initDots();
		//console.log(this.dots);
		this.stack = [];
		for (var i = 0; i<14; i++){
			this.flipRandomDot();
		}
	}

	this.setSize = function(size){
		this.startgridwidth = size;
		this.startgridheight = size;
		this.newGame();
	}

	this.init = function(){
		//console.log("init");
		//console.log(activity.getDatastoreObject());
		this.palette = new sizepalette.SizePalette(this,doc.getElementById('size-button'),undefined);
		activity.getDatastoreObject().getMetadata(this.init_canaccessdatastore.bind(this));
	}

	this.init_canaccessdatastore = function(error,mdata){
		//console.log("datastore check");
		var d = new Date().getTime();
		if (Math.abs(d-mdata.creation_time)<2000){
			//console.log("Time too short");
			this.newGame();
		} else {
			activity.getDatastoreObject().loadAsText(this.init_getdatastore.bind(this));
		}
	}

	this.init_getdatastore = function(error,metadata,data){
		if (error==null&&data!=null){
			data = JSON.parse(data);
			this.restoreFromDatastore(data);
		} else {
			this.newGame();
		}
	}

	this.restoreFromDatastore = function(data){
		this.stack = data.stack;
		this.startgridwidth = data.startgridwidth;
		this.startgridheight = data.startgridheight;
		clearTimeout(this.newGameTimeout);
		clearTimeout(this.solveTimeout);
		stage.removeAllChildren();
		this.calculateDimensions();
		this.initDots(data.dots);
	}
}