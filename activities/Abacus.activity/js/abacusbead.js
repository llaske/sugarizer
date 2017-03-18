function AbacusBead(x,y,blockcol,abacus,column,i,value,beadheight){
	if (beadheight === undefined) beadheight=-1;
	var Color = net.brehaut.Color;

	this.bead = null;
	this.originaly = null;
	this.index = i;
	this.value = value;
	this.text = null;
	this.containerbead = null;
	this.age = 4;
	this.y = y;
	this.updateY = function(y){
		this.containerbead.y = y;
		this.y = y;
	}

	this.resetAge = function(){
		this.age = -1;
	}

	this.forceAge = function(age){
		this.age = age-1;
		console.log(this.age);
		this.updateAge();
	}

	this.updateAge = function(){
		// HACK: On iOS, Android and Safari, remove age handling to avoid black beads (saturation not supported)
		var ua = navigator.userAgent.toLowerCase();
		if ((ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1) || /Android/i.test(ua) || ua.match(/ipad|iphone|ipod/g)) {
			return;
		}
		this.age+=1;
		if (this.age<=0){
			this.redraw("#FFF");
			this.age = 0;
		} else if (this.age<3){
			var col = Color(blockcol);
			col = col.setSaturation(col.getSaturation()/3);
			col.s = col.s/2;
			console.log(col.toRGB());
			this.redraw(col.toRGB());
		} else if (this.age==3){
			this.redraw(blockcol);
		}
	}

	this.redraw = function(colour){
		var bh;
		if (beadheight==-1){
			bh = abacus.blockHeight;
		} else {
			bh = beadheight;
		}
		this.bead.graphics.clear().beginStroke("#000000").setStrokeStyle(abacus.blockWidth/25).beginFill(colour).drawRoundRect(-1*abacus.blockWidth/2,0,abacus.blockWidth,bh,abacus.blockHeight/2);
	}

	this.drawBead = function(colour){
		if (colour === undefined) colour=blockcol;
		var bh;
		if (beadheight==-1){
			bh = abacus.blockHeight;
		} else {
			bh = beadheight;
		}
		this.bead = new createjs.Shape();
		this.bead.graphics.beginStroke("#000000");
		this.bead.graphics.setStrokeStyle(abacus.blockWidth/25);
		this.bead.graphics.beginFill(colour).drawRoundRect(-1*abacus.blockWidth/2,0,abacus.blockWidth,bh,abacus.blockHeight/2);
		this.bead.x = 0;
		this.bead.y = 0;
		this.containerbead = new createjs.Container();
		this.containerbead.addChild(this.bead);
		this.containerbead.x = x;
		this.containerbead.y = this.y;
		abacus.stage.addChild(this.containerbead);
	}

	this.updateIndex = function(i){
		var oldi = this.index;
		this.index = i;
		if (this.index!=oldi){
			this.resetAge();
		}
	}

	this.addClickListeners = function(){
		var th = this;
		var col = column;
		this.bead.on("mousedown", function(evt) {
		    th.originaly = evt.stageY;
		});

		this.bead.on("pressup", function(evt) {
		    if (th.originaly<evt.stageY){
		    	//moved down
		    	console.log("down");
		    	col.shuntRight(th.index);
		    } else if (th.originaly>evt.stageY){
		    	console.log("up");
		    	col.shuntLeft(th.index);
		    }
		});
	}

	this.updateValue = function(on,positive){
		if (positive === undefined) positive=true;
		if (on==true&&this.value.toFraction(true).length<=4){
			if (positive==false){
				this.text.text = "-"+this.value.toFraction(true);
			} else {
				this.text.text = this.value.toFraction(true);
			}
		} else {
			this.text.text = "";
		}
	}

	this.drawText = function(){
		var usecol;
		if (blockcol=="#000"||blockcol=="#000000"){
			usecol = "#FFF";
		} else {
			usecol = "#000";
		}
		var text = new createjs.Text("",(abacus.blockWidth/3).toString()+"px Arial", usecol);
		text.set({
		    textAlign: 'center'
		});
		text.x = 0;
		var bh;
		if (beadheight==-1){
			bh = abacus.blockHeight/3;
		} else {
			bh = beadheight/2-abacus.blockHeight/3;
		}
		text.y = bh;
		this.containerbead.addChild(text);
		this.text = text;
	}

	this.init = function(){
		this.drawBead();
		this.addClickListeners();
		this.drawText();
	}
}
