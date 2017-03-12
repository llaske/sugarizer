function Game(stage,xocolor,doc,datastore,activity){
	this.margin = 0;
	//These must be even
	this.gridwidth = 10;
	this.gridheight = 6;
	this.circleswidth = 0;
	this.circlesheight = 0;
	this.radius = 0;
	console.log(xocolor);
	this.verticalline = null;
	this.horizontalline = null;
	this.mode = null;
	this.dotsarr = [];
	this.buddy = ["#FFFFFF","#000000",xocolor.fill,xocolor.stroke];
	this.rainbow = ['#FFFFFF','#000000','#FF0000','#FF8000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF'];
	this.colours = this.buddy;
	this.robot = false;
	this.gameOver = false;
	//0 = horizontal, 1 = vertical, 2 = bilateral

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

	this.removeLines = function(){
		if (this.verticalline!=null){
			stage.removeChild(this.verticalline);
			this.verticalline = null;
		}
		if (this.horizontalline!=null){
			stage.removeChild(this.horizontalline);
			this.horizontalline = null;
		}
	}

	this.addVerticalLine = function(){
		this.verticalline = new createjs.Shape();
		this.verticalline.graphics.beginFill("#000000").drawRect(0,0,this.margin/3,this.circlesheight-this.margin);
		this.verticalline.x = stage.canvas.width/2-this.margin/6;
		this.verticalline.y = this.margin/2;
		stage.addChild(this.verticalline);
	}

	this.addHorizontalLine = function(){
		this.horizontalline = new createjs.Shape();
		this.horizontalline.graphics.beginFill("#000000").drawRect(0,0,this.circleswidth-this.margin,this.margin/3);
		this.horizontalline.x = (stage.canvas.width-this.circleswidth)/2+this.margin/2;
		this.horizontalline.y = this.circlesheight/2-this.margin/6;
		stage.addChild(this.horizontalline);
	}

	//Game Inits

	this.initHorizontalGame = function(colours){
		if (colours === undefined) colours=false;
		this.gameOver = false;
		this.removeLines();
		this.addVerticalLine();
		this.mode = 0;
		if (colours==false){
			this.initDots();
		} else {
			this.initDotsFromSave(colours);
		}
	}

	this.initVerticalGame = function(colours){
		if (colours === undefined) colours=false;
		this.gameOver = false;
		this.removeLines();
		this.addHorizontalLine();
		this.mode = 1;
		if (colours==false){
			this.initDots();
		} else {
			this.initDotsFromSave(colours);
		}
	}

	this.initBilateralGame = function(colours){
		if (colours === undefined) colours=false;
		this.gameOver = false;
		this.removeLines();
		this.addHorizontalLine();
		this.addVerticalLine();
		this.mode = 2;
		if (colours==false){
			this.initDots();
		} else {
			this.initDotsFromSave(colours);
		}
	}

	this.setBuddyStyle = function(){
		var buddyicon = doc.getElementById("buddy-button");
		buddyicon.style.backgroundColor = "#808080";
		var rainbowicon = doc.getElementById("rainbow-button");
		rainbowicon.removeAttribute("style");
	}

	this.initBuddy = function(){
		this.setBuddyStyle();
		this.colours = this.buddy;
		switch(this.mode) {
			case 0:
				this.initHorizontalGame();
				break;
			case 1:
				this.initVerticalGame();
				break;
			case 2:
				this.initBilateralGame();
				break;
		}
	}

	this.setRainbowStyle = function(){
		var buddyicon = doc.getElementById("buddy-button");
		buddyicon.removeAttribute("style");
		var rainbowicon = doc.getElementById("rainbow-button");
		rainbowicon.style.backgroundColor = "#808080";
	}

	this.initRainbow = function(){
		this.setRainbowStyle();
		this.colours = this.rainbow;
		switch(this.mode) {
			case 0:
				this.initHorizontalGame();
				break;
			case 1:
				this.initVerticalGame();
				break;
			case 2:
				this.initBilateralGame();
				break;
		}
	}

	this.initDots = function(){
		this.dotsarr = [];
		var temparr = [];
		var incr = (this.radius*2+this.margin);
		var xp = (stage.canvas.width-this.circleswidth)/2+this.margin;
		var yp = this.margin;

		for (var x = 0; x<this.gridwidth; x++){
			temparr = [];
			yp = this.margin;
			for (var y = 0; y<this.gridheight; y++){
				//console.log(x);
				//console.log(y);
				var s = new SymmetryDot(stage,true,xp+this.radius,yp+this.radius,this.radius,this.colours,Math.floor(Math.random()*this.colours.length),this,x,y);
				s.init();
				temparr.push(s);
				//console.log(s);
				yp+=incr;
			}
			this.dotsarr.push(temparr);
			xp+=incr;
		}
		//console.log(this.dotsarr);
	}

	this.initDotsFromSave = function(cols){
		this.dotsarr = [];
		var temparr = [];
		var incr = (this.radius*2+this.margin);
		var xp = (stage.canvas.width-this.circleswidth)/2+this.margin;
		var yp = this.margin;
		//console.log("colour array");
		//console.log(cols);
		for (var x = 0; x<this.gridwidth; x++){
			temparr = [];
			yp = this.margin;
			for (var y = 0; y<this.gridheight; y++){
				//console.log(x);
				//console.log(y);
				var s = new SymmetryDot(stage,true,xp+this.radius,yp+this.radius,this.radius,this.colours,cols[x][y],this,x,y);
				s.init();
				temparr.push(s);
				//console.log(s);
				yp+=incr;
			}
			this.dotsarr.push(temparr);
			xp+=incr;
		}
		//console.log(this.dotsarr);
	}

	//Game Logic

	this.checkHorizontalGame = function(){
		var correct = true;
		for (var x = 0; x<this.gridwidth/2; x++){
			for (var y = 0; y<this.gridheight; y++){
				if (this.dotsarr[x][y].colour!=this.dotsarr[(this.gridwidth-1)-x][y].colour){
					correct = false;
				}
			}
		}
		if (correct==true){
			for (var x = 0; x<this.gridwidth; x++){
				for (var y = 0; y<this.gridheight; y++){
					this.gameOver = true;
					this.dotsarr[x][y].clickable = false;
					this.dotsarr[x][y].showSmile();
				}
			}
		}
	}

	this.checkVerticalGame = function(){
		var correct = true;
		for (var x = 0; x<this.gridwidth; x++){
			for (var y = 0; y<this.gridheight/2; y++){
				if (this.dotsarr[x][y].colour!=this.dotsarr[x][(this.gridheight-1)-y].colour){
					correct = false;
				}
			}
		}
		if (correct==true){
			for (var x = 0; x<this.gridwidth; x++){
				for (var y = 0; y<this.gridheight; y++){
					this.gameOver = true;
					this.dotsarr[x][y].clickable = false;
					this.dotsarr[x][y].showSmile();
				}
			}
		}
	}

	this.checkBilateralGame = function(){
		var correct = true;
		for (var x = 0; x<this.gridwidth/2; x++){
			for (var y = 0; y<this.gridheight/2; y++){
				if (this.dotsarr[x][y].colour!=this.dotsarr[(this.gridwidth-1)-x][y].colour ||
					this.dotsarr[x][y].colour!=this.dotsarr[x][(this.gridheight-1)-y].colour ||
					this.dotsarr[x][y].colour!=this.dotsarr[(this.gridwidth-1)-x][(this.gridheight-1)-y].colour){
					correct = false;
				}
			}
		}
		if (correct==true){
			for (var x = 0; x<this.gridwidth; x++){
				for (var y = 0; y<this.gridheight; y++){
					this.gameOver = true;
					this.dotsarr[x][y].clickable = false;
					this.dotsarr[x][y].showSmile();
				}
			}
		}
	}

	this.checkColours = function(){
		switch(this.mode) {
			case 0:
				this.checkHorizontalGame();
				break;
			case 1:
				this.checkVerticalGame();
				break;
			case 2:
				this.checkBilateralGame();
				break;
		}
	}

	//Robot Functions

	this.robotOff = function(){
		var robo = doc.getElementById("robot-button");
		robo.title="Turn on the Robot";
		robo.style.backgroundImage = "url('./icons/robot-off.svg')";
		this.robot = false;
	}

	this.robotOn = function(){
		var robo = doc.getElementById("robot-button");
		robo.title="Turn off the Robot";
		robo.style.backgroundImage = "url('./icons/robot-on.svg')";
		this.robot = true;
	}

	this.toggleRobot = function(){
		if (this.robot){
			this.robotOff();
		} else {
			this.robotOn();
		}
	}

	this.robotColours = function(x,y,index){
		switch(this.mode) {
			case 0:
				this.horizontalColour(x,y,index);
				break;
			case 1:
				this.verticalColour(x,y,index);
				break;
			case 2:
				this.bilateralColour(x,y,index);
				break;
		}
	}

	this.horizontalColour = function(x,y,index){
		this.dotsarr[(this.gridwidth-1)-x][y].setColour(index);
	}

	this.verticalColour = function(x,y,index){
		this.dotsarr[x][(this.gridheight-1)-y].setColour(index);
	}

	this.bilateralColour = function(x,y,index){
		this.dotsarr[(this.gridwidth-1)-x][y].setColour(index);
		this.dotsarr[x][(this.gridheight-1)-y].setColour(index);
		this.dotsarr[(this.gridwidth-1)-x][(this.gridheight-1)-y].setColour(index);
	}

	//Save-related things

	this.stop = function(restart){
		if (restart === undefined) restart=false;
		//store mode, dotsarr (as colour index), robot on/off, game over, buddy
		var arr = {};
		arr.mode = this.mode;
		var dots = [];
		var temparr = [];
		for (var x = 0; x<this.gridwidth; x++){
			temparr = [];
			for (var y = 0; y<this.gridheight; y++){
				temparr.push(this.dotsarr[x][y].colour);
			}
			dots.push(temparr);
		}
		arr.dots = dots;
		arr.robot = this.robot;
		arr.gameOver = this.gameOver;
		if (this.colours.length == this.buddy.length){
			arr.buddy = true;
		} else {
			arr.buddy = false;
		}
		console.log(arr);
		var js = JSON.stringify(arr);
		activity.getDatastoreObject().setDataAsText(js);
		if (restart == true){
			activity.getDatastoreObject().save(function(){
				location.reload();
			});
		} else {
			activity.getDatastoreObject().save(function(){
				activity.close();
			});
		}
	}

	this.resize = function(){
		this.circleswidth = 0;
		this.circlesheight = 0;
		this.radius = 0;
		this.margin = 0;
		var go = this.gameOver;
		var r = this.canDoFromX();
		if (r==false){
			//console.log("position based on y");
			r = this.radiusFromY();
		}
		this.radius = r;
		//console.log(r);
		this.circleswidth = this.radius*2*this.gridwidth+this.margin*(this.gridwidth+1);
		this.circlesheight = this.radius*2*this.gridheight+this.margin*(this.gridheight+1);
		var dots = [];
		var temparr = [];
		for (var x = 0; x<this.gridwidth; x++){
			temparr = [];
			for (var y = 0; y<this.gridheight; y++){
				temparr.push(this.dotsarr[x][y].colour);
			}
			dots.push(temparr);
		}
		switch(this.mode) {
			case 0:
				this.initHorizontalGame(dots);
				break;
			case 1:
				this.initVerticalGame(dots);
				break;
			case 2:
				this.initBilateralGame(dots);
				break;
		}
		if (go == true){
			this.gameOver = true;
			for (var x = 0; x<this.gridwidth; x++){
				for (var y = 0; y<this.gridheight; y++){
					this.dotsarr[x][y].clickable = false;
					this.dotsarr[x][y].showSmile();
				}
			}
		}
	}

	//Load-related things

	this.init = function(){
		console.log("init");
		console.log(activity.getDatastoreObject());
		activity.getDatastoreObject().getMetadata(this.init_canaccessdatastore.bind(this));
	}

	this.init_canaccessdatastore = function(error,mdata){
		console.log("datastore check");
		var d = new Date().getTime();
		if (Math.abs(d-mdata.creation_time)<2000){
			console.log("Time too short");
			this.initActivity(false,[]);
		} else {
			activity.getDatastoreObject().loadAsText(this.init_getdatastore.bind(this));
		}
	}

	this.init_getdatastore = function(error,metadata,data){
		if (error==null&&data!=null){
			data = JSON.parse(data);
			this.initActivity(true,data);
		} else {
			this.initActivity(false,[]);
		}
	}

	this.initActivity = function(isdata,data){
		console.log(isdata);
		console.log(data);
		var r = this.canDoFromX();
		if (r==false){
			console.log("position based on y");
			r = this.radiusFromY();
		}
		this.radius = r;
		console.log(r);
		this.circleswidth = this.radius*2*this.gridwidth+this.margin*(this.gridwidth+1);
		this.circlesheight = this.radius*2*this.gridheight+this.margin*(this.gridheight+1);
		console.log(data);
		if (isdata==false||data==null){
			this.initHorizontalGame();
		} else {
			//mode, dotsarr (as colour index), robot on/off, game over, buddy
			if (data.buddy == true){
				this.colours = this.buddy;
			} else {
				this.colours = this.rainbow;
			}
			switch(data.mode) {
			case 0:
				this.initHorizontalGame(data.dots);
				break;
			case 1:
				this.initVerticalGame(data.dots);
				break;
			case 2:
				this.initBilateralGame(data.dots);
				break;
			}
			if (data.gameOver == true){
				this.gameOver = true;
				for (var x = 0; x<this.gridwidth; x++){
					for (var y = 0; y<this.gridheight; y++){
						this.dotsarr[x][y].clickable = false;
						this.dotsarr[x][y].showSmile();
					}
				}
			}
			if (data.robot == true){
				this.robotOn();
			} else {
				this.robotOff();
			}
		}
		if (this.colours==this.buddy){
			this.setBuddyStyle();
		} else {
			this.setRainbowStyle();
		}
	}
}
