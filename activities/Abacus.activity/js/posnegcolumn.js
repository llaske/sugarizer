function PosNegColumn(x,starty,endy,blocks,blocksheight,colcols,blockcols,abacus,value,aging,rods){
	if (aging === undefined) aging=true;
	if (rods === undefined) rods=false;
	this.elements = [];
	this.colWidthScale = 8/33;
	this.blockcols = blockcols;
	this.value = value;
	this.nullheight = 0;
	this.abaheight = 0;
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
				if (this.elements.indexOf(null)>i){
					this.elements[i].updateValue(true,true);
				} else if (this.elements.lastIndexOf(null)<i){
					this.elements[i].updateValue(true,false);
				} else {
					this.elements[i].updateValue(false);
				}
				if (rods==false){
					start+=incr;
				} else {
					start+=this.abaheight;
				}
			} else {
				start+=this.nullheight;
			}
		}
		//console.log(this.howManyInUse());
		abacus.updateTextItems();
	}

	this.initElements = function(){
		this.elements = [];
		if (rods==false){
			this.nullheight = endy-starty-blocks*(abacus.blockHeight+(abacus.verticalMargin*abacus.blockHeight));
			this.nullheight=this.nullheight/2;
		} else {
			this.nullheight = abacus.blockHeight;
		}
		console.log(endy-starty-this.nullheight);
		console.log(blocks);
		this.abaheight = (endy-starty-this.nullheight*2)/blocks;
		console.log(this.abaheight);
		var block = blocksheight-blocks;
		this.elements.push(null);
		for (var i = 0; i<blocks; i++){
			console.log("make bead");
			if (rods==false){
				var b = new AbacusBead(x,starty,colcols,abacus,this,i,value);
			} else {
				var b = new AbacusBead(x,starty,colcols,abacus,this,i,value,this.abaheight);
			}
			b.init();
			console.log(b);
			this.elements.push(b);
		}
		this.elements.push(null);
	}

	this.shuntLeft = function(index){
		if (this.elements.lastIndexOf(null,index)!=-1){
			console.log("shuntLeft");
			var placeindex = this.elements.lastIndexOf(null,index);
			var startindex = placeindex+1;
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
		if (this.elements.indexOf(null,index)!=-1){
			console.log("start");
			console.log(this.elements);
			var placeindex = this.elements.indexOf(null,index)+1;
			var endindex = placeindex-2;
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
		var arr = [];
		var index = this.elements.indexOf(null);
		if (index!=0){
			arr.push(this.elements.slice(0,index));
		} else {
			arr.push([]);
		}
		var index = this.elements.lastIndexOf(null);
		if (index!=this.elements.length-1){
			arr.push(this.elements.slice(index+1,this.elements.length));
		} else {
			arr.push([]);
		}
		return arr;
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
		if (aging==true){
			for (var i = 0; i<this.elements.length; i++){
				if (this.elements[i]!=null){
					this.elements[i].forceAge(arr[i]);
				}
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
