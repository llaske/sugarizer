function StandardAbacusColumn(x,starty,endy,blockstop,blocksbottom,blocksheight,colcols,blockcols,abacus,value,isupper,aging,schety){
	if (aging === undefined) aging=true;
	if (schety === undefined) schety=false;
	this.elements = [];
	this.colWidthScale = 8/33;
	this.blockcols = blockcols;
	this.value = value;
	this.drawColumn = function(){
		//grey: A0A0A0, stroke 6B6B6B
		var width = this.colWidthScale*abacus.blockWidth;
		var height = endy-starty;
		//console.log(width);
		//console.log(height);
		//console.log(x);
		//console.log(starty);
		var rect = new createjs.Shape();
		rect.graphics.beginFill(this.blockcols[0]).drawRect(-1*(width/2),0,width,height);
		rect.graphics.beginStroke(this.blockcols[1]);
		rect.graphics.setStrokeStyle(width/8);
		rect.graphics.moveTo(-1*(width/2),0);
		rect.graphics.lineTo(-1*(width/2),height);
		rect.graphics.moveTo((width/2),0);
		rect.graphics.lineTo((width/2),height);
		rect.x = x;
		rect.y = starty;
		abacus.stage.addChild(rect);
	}

	this.updateY = function(){
		var bmargin = (abacus.verticalMargin*abacus.blockHeight);
		var start = starty+(bmargin/2);
		var incr = abacus.blockHeight+bmargin;
		for (var i = 0; i<blocksheight; i++){
			if (this.elements[i]!=null){
				this.elements[i].updateIndex(i);
				this.elements[i].updateY(start);
				if (isupper==true&&this.elements.lastIndexOf(null)<i){
					this.elements[i].updateValue(true);
				} else if (isupper==false&&this.elements.indexOf(null)>i){
					this.elements[i].updateValue(true);
				} else {
					this.elements[i].updateValue(false);
				}
			}
			start+=incr;
		}
		//console.log(this.howManyInUse());
		abacus.updateTextItems();
	}

	this.initElements = function(){
		this.elements = [];
		var middlea;
		var middleb;
		if (schety==true){
			middlea=(blocksheight-blocksbottom)+blocksbottom/2-1;
			middleb=(blocksheight-blocksbottom)+(blocksbottom/2);
		}
		for (var i = 0; i<blocksheight; i++){
			if ((i<blockstop)||(i>=blocksheight-blocksbottom)){
				if (schety==true&&(i==middlea||i==middleb)){
					var b = new AbacusBead(x,starty,"#000",abacus,this,i,value);
				} else {
					var b = new AbacusBead(x,starty,colcols,abacus,this,i,value);
				}
				b.init();
				//console.log(b);
				this.elements.push(b);
			} else {
				this.elements.push(null);
			}
		}
	}

	this.shuntLeft = function(index){
		if (this.elements.lastIndexOf(null)<index){
			var placeindex = this.elements.indexOf(null);
			var startindex = this.elements.lastIndexOf(null)+1;
			var length = index-startindex+1;
			var movearray = this.elements.splice(startindex,length);
			//for (var i = 0; i<movearray.length; i++){
			//	movearray[i].resetAge();
			//}
			var args = [placeindex, 0].concat(movearray);
			Array.prototype.splice.apply(this.elements, args);
			this.updateY();
		}
	}

	this.shuntRight = function(index){
		if (this.elements.indexOf(null)>index){
			console.log("start");
			console.log(this.elements);
			var placeindex = this.elements.lastIndexOf(null)+1;
			var endindex = this.elements.indexOf(null)-1;
			var length = endindex-index+1;
			var movearray = this.elements.splice(index,length);
			console.log(movearray);
			//for (var i = 0; i<movearray.length; i++){
			//	movearray[i].resetAge();
			//}
			console.log(this.elements);
			var args = [placeindex-length, 0].concat(movearray);
			Array.prototype.splice.apply(this.elements, args);
			this.updateY();
			//console.log(this.elements);
		}
	}

	this.howManyInUse = function(){
		if (isupper==true){
			var index = this.elements.lastIndexOf(null);
			if (index!=this.elements.length-1){
				return this.elements.slice(index+1,this.elements.length);
			} else {
				return [];
			}
		} else {
			var index = this.elements.indexOf(null);
			if (index!=0){
				return this.elements.slice(0,index);
			} else {
				return [];
			}
		}
	}

	this.updateAges = function(){
		for (var i = 0; i<this.elements.length; i++){
			if (this.elements[i]!=null&&aging==true){
				this.elements[i].updateAge();
			}
		}
	}

	this.restore = function(arr){
		var newelements = [];
		for (var i = 0; i<this.elements.length; i++){
			if (this.elements[i]!=null){
				newelements.push(this.elements[i]);
			}
		}
		this.elements = newelements;
		for (var i = 0; i<arr.length; i++){
			if (arr[i] == null){
				this.elements.splice(i, 0, null);
			}
		}
		//console.log(this.elements);
		this.updateY();
	}

	this.restoreAge = function(arr){
		for (var i = 0; i<this.elements.length; i++){
			if (this.elements[i]!=null){
				this.elements[i].forceAge(arr[i]);
			}
		}
	}

	this.save = function(){
		var arr = [];
		for (var i = 0; i<this.elements.length; i++){
			if (this.elements[i]==null){
				arr.push(null);
			} else {
				arr.push(this.elements[i].age);
			}
		}
		return arr;
	}

	this.init = function(){
		this.drawColumn();
		this.initElements();
		this.updateY();
	}
}
