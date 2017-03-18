function OneColumnAbacus(stage,rods,number,base,colours,startvalue,schety,fractions,caacupe,rodf){
	if (startvalue === undefined) startvalue=rods;
	if (schety === undefined) schety=false;
	if (fractions === undefined) fractions=false;
	if (caacupe === undefined) caacupe=false;
	if (rodf === undefined) rodf=false;
	//top bar: 8/5*blockh
	//middle bar: blockh
	//bottom bar: 8/5*blockh
	//margin between blocks: blockw/3
	//margin between blocks on line: blockh/20
	//block 25,33
	//top margin: screen height/10
	//blockheight given screen: 9*screen height/10
	this.blockScaleYFromX = 25/33;
	this.topBottomBarScale = 8/5;
	this.leftRightBarScale = 8/5*this.blockScaleYFromX;
	this.middleBarScale = 1;
	this.horizontalMargin = 1/3;
	this.verticalMargin = 1/20;
	this.extraBeads = 2;
	this.rods = rods;

	this.blockHeight = 0;
	this.blockWidth = 0;
	this.abacusHeight = 0;
	this.abacusWidth = 0;
	this.upperBlockHeight = 0;
	this.lowerBlockHeight = 0;
	this.colHeight = 0;

	this.stage = stage;
	this.columns = [];
	this.rodtext = [];
	this.answertext = null;

	this.trix = null;
	this.startx = null;

	this.schetyColumns = [1000000000,100000000,10000000,1000000,100000,10000,1000,100,10,1,0.25,0.1,0.01,0.001,0.0001];
	this.fractionColumns = [100000,10000,1000,100,10,1,[1,2],[1,3],[1,4],[1,5],[1,6],[1,8],[1,9],[1,10],[1,12]];
	this.rodsColumns = [[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10]];
	this.rodsColours = ["#FFFFFF","#FC0D1B","#88FD31","#FC28FC","#FFFD38","#1FCC23","#000000","#AA6717","#23CCFC","#FD8824"];
	this.blockGivenWidth = function(width){
		var blockwidth = width/((2*this.leftRightBarScale)+rods+this.horizontalMargin*rods);
		return blockwidth;
	}

	this.blockGivenHeight = function(height){
		var blockheight = height/((2*this.topBottomBarScale)+(number+this.extraBeads)+this.verticalMargin*(number+this.extraBeads));
		return blockheight;
	}

	this.heightGivenBlockWidth = function(blockwidth){
		var blockheight = this.blockScaleYFromX*blockwidth;
		var h = blockheight*((2*this.topBottomBarScale)+(number+this.extraBeads)+this.verticalMargin*(number+this.extraBeads));
		return h;
	}

	this.widthGivenBlockWidth = function(blockwidth){
		var w = blockwidth*((2*this.leftRightBarScale)+rods+this.horizontalMargin*rods);
		return w;
	}

	this.initValues = function(){
		var height = (9/10-1/20)*stage.canvas.height;
		var width = 9/10*stage.canvas.width;
		var w = this.blockGivenWidth(width);
		var h = this.blockScaleYFromX*w;
		if (this.heightGivenBlockWidth(w)>height){
			h = this.blockGivenHeight(height);
			w = h/this.blockScaleYFromX;
			console.log("Using height");
		}
		this.blockHeight = h;
		this.blockWidth = w;
		this.abacusHeight = this.heightGivenBlockWidth(this.blockWidth);
		this.abacusWidth = this.widthGivenBlockWidth(this.blockWidth);
		this.colHeight = this.blockHeight*((number+this.extraBeads)+this.verticalMargin*(number+this.extraBeads));
		console.log(this.blockHeight);
		console.log(this.blockWidth);
		console.log(this.abacusHeight);
		console.log(this.abacusWidth);
		this.startx = ((stage.canvas.width-this.abacusWidth)/2)+(this.leftRightBarScale*this.blockWidth)+((this.horizontalMargin*this.blockWidth)/2)+(this.blockWidth/2);
	}

	this.initRectangle = function(){
		var rect = new createjs.Shape();
		rect.graphics.beginStroke("#000000");
		rect.graphics.setStrokeStyle(this.leftRightBarScale*this.blockWidth);
		rect.graphics.beginFill("#C0C0C0").drawRoundRect((this.leftRightBarScale*this.blockWidth)/2,(this.leftRightBarScale*this.blockWidth)/2,this.abacusWidth-(this.leftRightBarScale*this.blockWidth),this.abacusHeight-(this.leftRightBarScale*this.blockWidth),2/3*this.blockWidth);
		rect.x = (stage.canvas.width-this.abacusWidth)/2;
		rect.y = stage.canvas.height/10;
		stage.addChild(rect);
	}

	this.initTriangle = function(){
		this.tri = new createjs.Shape();
		var width = this.blockWidth/4*3;
		var y = stage.canvas.height/10+2*(this.leftRightBarScale*this.blockWidth)/3;
		var startx = ((stage.canvas.width-this.abacusWidth)/2)+(this.leftRightBarScale*this.blockWidth)+((this.horizontalMargin*this.blockWidth)/2)+(this.blockWidth/2);
		var incr = ((this.horizontalMargin*this.blockWidth))+this.blockWidth;
		var x = startx+(incr*(rods-1));
		this.tri.graphics.moveTo(0-width/2,0).beginFill("#FC0D1B").lineTo(0+width/2,0).lineTo(0,0+(this.leftRightBarScale*this.blockWidth)/3).lineTo(0-width/2,0).closePath();
		this.tri.x = x-(this.blockWidth/2);
		this.tri.y = y;
		this.trix = this.tri.x-this.startx;
		stage.addChild(this.tri);
		var c = this.tri;
		var t = this;
		this.tri.on("mousedown", function (evt) {
			this.offset = {x: c.x - evt.stageX, y: c.y - evt.stageY};
		});

		this.tri.on("pressmove", function (evt) {
			if (evt.stageX + this.offset.x < startx-(t.blockWidth/2)){
				c.x = startx-(t.blockWidth/2);
			} else if (evt.stageX + this.offset.x > x+(t.blockWidth/2)){
				c.x = x+(t.blockWidth/2);
			} else {
				c.x = evt.stageX + this.offset.x;
			}
			t.trix = c.x-t.startx;
		});
	}

	this.initColumns = function(){
		var startx = ((stage.canvas.width-this.abacusWidth)/2)+(this.leftRightBarScale*this.blockWidth)+((this.horizontalMargin*this.blockWidth)/2)+(this.blockWidth/2);
		var incr = ((this.horizontalMargin*this.blockWidth))+this.blockWidth;
		//console.log("======");
		//console.log(startx);
		//console.log(incr);
		var starty = stage.canvas.height/10+(this.leftRightBarScale*this.blockWidth);
		var endy = starty+this.colHeight;
		var grey = ["#A0A0A0","#6B6B6B"];
		var black = ["#000000","#000000"];
		var colinuse;
		console.log(colours);
		var fill = colours.fill;
		var stroke = colours.stroke;
		var xocolinuse;
		var val;
		if (schety==false&&fractions==false&&caacupe==false&&rodf==false){
			for (var item = 0; item<rods; item++){
				if (item%2==0){
					colinuse = black;
					xocolinuse = fill;
				} else {
					colinuse = grey;
					xocolinuse = stroke;
				}
				if (startvalue-item-1<0){
					var div = new window.Fraction(1);
					val = new window.Fraction(Math.pow(base,Math.abs(startvalue-item-1)));
					val = div.div(val);
				} else {
					val = new window.Fraction(Math.pow(base,startvalue-item-1));
				}
				var c = new StandardAbacusColumn(startx,starty,endy,0,number,number+this.extraBeads,xocolinuse,colinuse,this,val,false);
				c.init();
				this.columns.push(c);
				startx+=incr;
			}
		} else if (schety==true){
			var heightcol = number+this.extraBeads;
			var theight;
			for (var item = 0; item<rods; item++){
				if (item%2==0){
					colinuse = black;
					xocolinuse = fill;
				} else {
					colinuse = grey;
					xocolinuse = stroke;
				}
				val = new window.Fraction(this.schetyColumns[item]);
				console.log(val);
				if(item==10){
					theight=4;
				} else {
					theight=number;
				}
				var c = new StandardAbacusColumn(startx,starty,endy,0,theight,heightcol,xocolinuse,colinuse,this,val,false,false,true);
				c.init();
				this.columns.push(c);
				startx+=incr;
			}
		} else if (caacupe==true||fractions==true){
			var heightcol = number+this.extraBeads;
			var theight;
			for (var item = 0; item<rods; item++){
				if (item%2==0){
					colinuse = black;
					xocolinuse = fill;
				} else {
					colinuse = grey;
					xocolinuse = stroke;
				}
				if (item>5){
					xocolinuse="#000000";
				}
				val = new window.Fraction(this.fractionColumns[item]);
				console.log(val);
				if(item>5){
					theight=this.fractionColumns[item][1];
				} else {
					theight=10;
				}
				if (caacupe==true){
					var c = new PosNegColumn(startx,starty,endy,theight,heightcol,xocolinuse,colinuse,this,val,false,false);
				} else {
					var c = new StandardAbacusColumn(startx,starty,endy,0,theight,heightcol,xocolinuse,colinuse,this,val,false,false);
				}
				c.init();
				this.columns.push(c);
				startx+=incr;
			}
		} else {
			console.log("rods");
			var heightcol = number+this.extraBeads;
			var theight;
			for (var item = 0; item<rods; item++){
				if (item%2==0){
					colinuse = black;
				} else {
					colinuse = grey;
				}
				xocolinuse = this.rodsColours[item];
				val = new window.Fraction(this.rodsColumns[item]);
				console.log(val);
				theight = this.rodsColumns[item][1];
				var c = new PosNegColumn(startx,starty,endy,theight,heightcol,xocolinuse,colinuse,this,val,false,true);
				c.init();
				this.columns.push(c);
				console.log(c);
				startx+=incr;
			}
		}
	}

	this.restore = function(arr){
		for (var i = 0; i<arr.length; i++){
			this.columns[i].restore(arr[i]);
		}
		for (var i = 0; i<arr.length; i++){
			this.columns[i].restoreAge(arr[i]);
		}
	}

	this.save = function(){
		var arr = [];
		for (var i = 0; i<this.columns.length; i++){
			arr.push(this.columns[i].save());
		}
		return arr;
	}

	this.saveTri = function(){
		console.log(this.trix);
		return this.trix/this.abacusWidth;
	}

	this.restoreTri = function(x){
		console.log(x);
		this.tri.x = this.startx+(x*this.abacusWidth);
		this.trix = this.tri.x-this.startx;
		console.log(this.tri.x);
	}

	this.initTextItems = function(){
		var startx = ((stage.canvas.width-this.abacusWidth)/2)+(this.leftRightBarScale*this.blockWidth)+((this.horizontalMargin*this.blockWidth)/2)+(this.blockWidth/2);
		var incr = ((this.horizontalMargin*this.blockWidth))+this.blockWidth;
		for (var i = 0; i<rods; i++){
			var text = new createjs.Text("",(stage.canvas.width/70).toString()+"px Arial", "#FFF");
			text.set({
			    textAlign: 'center'
			});
			text.x = startx;
			text.y = stage.canvas.height/10+this.abacusHeight-(this.leftRightBarScale*this.blockWidth)/2;
			stage.addChild(text);
			this.rodtext.push(text);
			startx += incr;
		}
		var text = new createjs.Text("",(this.blockWidth).toString()+"px Arial", "#000");
		text.set({
		    textAlign: 'center'
		});
		text.x = stage.canvas.width/2;
		text.y = stage.canvas.height/40;
		stage.addChild(text);
		this.answertext = text;
	}

	this.updatePosNegTextItems = function(){
		if (this.columns.length==rods){
			var sumarr = [];
			var total = new window.Fraction(0,1);
			for (var i = 0; i<rods; i++){
				this.columns[i].updateAges();
				var huse = this.columns[i].howManyInUse();
				var usep = huse[0];
				var usen = huse[1];
				var sum = usep.length-usen.length;
				if (sum!=0){
					this.rodtext[i].text=sum.toString();
				} else {
					this.rodtext[i].text="";
				}
				var tempsum = this.columns[i].value.mul(usep.length);
				var ntempsum = this.columns[i].value.mul(usen.length);
				var tsum = tempsum.sub(ntempsum);
				var zero = new window.Fraction(0);
				if (!tsum.equals(zero)){
					sumarr.push(tsum.toFraction(true));
					total=total.add(tsum);
				}
			}
			var zero = new window.Fraction(0);
			if (sumarr.length==1){
				var str = total.toFraction(true);
				this.answertext.text = str;
			} else if (!total.equals(zero)){
				var str = "";
				for (var i = 0; i<sumarr.length-1; i++){
					str += sumarr[i]+" + ";
				}
				str += sumarr[sumarr.length-1]+" = "+total.toFraction(true);
				this.answertext.text = str;
			} else {
				this.answertext.text = "";
			}
		}
	}

	this.updateTextItems = function(){
		if (caacupe==true||rodf==true){
			this.updatePosNegTextItems();
		} else if (this.columns.length==rods){
			var sumarr = [];
			var total = new window.Fraction(0,1);
			for (var i = 0; i<rods; i++){
				this.columns[i].updateAges();
				var use = this.columns[i].howManyInUse();
				var sum = use.length;
				if (sum!=0){
					this.rodtext[i].text=sum.toString();
				} else {
					this.rodtext[i].text="";
				}
				var tempsum = this.columns[i].value.mul(use.length);
				var zero = new window.Fraction(0);
				if (!tempsum.equals(zero)){
					sumarr.push(tempsum.toFraction(true));
					total=total.add(tempsum);
				}
			}
			var zero = new window.Fraction(0);
			if (sumarr.length==1){
				var str = total.toFraction(true);
				this.answertext.text = str;
			} else if (!total.equals(zero)){
				var str = "";
				for (var i = 0; i<sumarr.length-1; i++){
					str += sumarr[i]+" + ";
				}
				str += sumarr[sumarr.length-1]+" = "+total.toFraction(true);
				this.answertext.text = str;
			} else {
				this.answertext.text = "";
			}
		}
	}

	this.init = function(){
		this.initValues();
		this.initRectangle();
		this.initColumns();
		this.initTextItems();
		this.initTriangle();
	}
}
