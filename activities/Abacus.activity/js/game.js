function Game(activity,stage,xocolor,Fraction,doc,abacuspalette,custompalette,datastore){
	this.palette = null;
	this.custompalette = null;
	this.abacus = null;
	//rods top bottom factor base
	this.customarr = [15,1,4,5,10];
	this.abacustype = null;

	//Custom Abacus
	this.updateCustom = function(rods,top,bottom,factor,base){
		this.customarr[0] = rods;
		this.customarr[1] = top;
		this.customarr[2] = bottom;
		this.customarr[3] = factor;
		this.customarr[4] = base;
	}

	this.Custom = function(stage,xocolor){
		this.abacustype = 10;
		var c = this.customarr;
		this.abacus = new StandardAbacus(stage,c[0],c[1],c[3],c[2],c[4],xocolor);
		this.abacus.init();
	}

	//Inits for other abaci
	this.Decimal = function(stage,xocolor){
		this.abacustype = 0;
		this.abacus = new OneColumnAbacus(stage,15,10,10,xocolor);
		this.abacus.init();
	}
	this.Soroban = function(stage,xocolor){
		this.abacustype = 1;
		this.abacus = new StandardAbacus(stage,15,1,5,4,10,xocolor,8);
		this.abacus.init();
	}
	this.Suanpan = function(stage,xocolor){
		this.abacustype = 2;
		this.abacus = new StandardAbacus(stage,15,2,5,5,10,xocolor);
		this.abacus.init();
	}
	this.Nepohualtzintzin = function(stage,xocolor){
		this.abacustype = 3;
		this.abacus = new StandardAbacus(stage,13,3,5,4,20,xocolor);
		this.abacus.init();
	}
	this.Hexadecimal = function(stage,xocolor){
		this.abacustype = 4;
		this.abacus = new StandardAbacus(stage,15,1,8,7,16,xocolor);
		this.abacus.init();
	}
	this.Binary = function(stage,xocolor){
		this.abacustype = 5;
		this.abacus = new OneColumnAbacus(stage,15,1,2,xocolor);
		this.abacus.init();
	}
	this.Schety = function(stage,xocolor){
		this.abacustype = 6;
		this.abacus = new OneColumnAbacus(stage,15,10,10,xocolor,null,true);
		this.abacus.init();
	}
	this.Fractions = function(stage,xocolor){
		this.abacustype = 7;
		this.abacus = new OneColumnAbacus(stage,15,12,10,xocolor,null,false,true);
		this.abacus.init();
	}
	this.Caacupé = function(stage,xocolor){
		this.abacustype = 8;
		this.abacus = new OneColumnAbacus(stage,15,12,10,xocolor,null,false,false,true);
		this.abacus.init();
	}
	this.Rods = function(stage,xocolor){
		this.abacustype = 9;
		this.abacus = new OneColumnAbacus(stage,10,12,10,xocolor,null,false,false,false,true);
		this.abacus.init();
	}

	//Copy
	this.copy = function(){
		var text = "";
		console.log(this.abacus);
		if (this.abacus!=null){
			if (this.abacus.answertext!=null){
				if (this.abacus.answertext.text.length>0){
					text = this.abacus.answertext.text;
					if (text.indexOf('=') > -1){
						text = text.substring(text.indexOf('=')+2);
					}
				}
			}
		}
		function copyToClipboard(t) {
			var copyText = document.getElementById('copytext');
			copyText.value = t;
			copyText.select();
			try {
				document.execCommand('copy');
			} catch (err) {
				window.prompt("Copy to clipboard: ", t);
			}
		}
		copyToClipboard(text);
	}

	//Resize/clear

	this.resize = function(){
		var d = this.makeData();
		stage.removeAllChildren();
		this.customarr = d.customarr;
		this.initAbacus(d.mode);
		this.abacus.restore(d.abacusinuse);
		this.abacus.restoreTri(d.trix);
	}

	this.clear = function(){
		stage.removeAllChildren();
		this.initAbacus(this.abacustype);
	}

	//Save related things

	this.makeData = function(){
		var arr = {};
		arr.mode = this.abacustype;
		arr.customarr = this.customarr;
		arr.abacusinuse = this.abacus.save();
		arr.trix = this.abacus.saveTri();
		console.log("arr");
		console.log(arr);
		return arr;
	}

	this.stop = function(restart){
		if (restart === undefined) restart=false;
		var arr = this.makeData();
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

	//Load related things

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

	//Init related things
	this.initAbacus = function(abacus){
		stage.removeAllChildren();
		switch(abacus) {
			case 0:
				this.Decimal(stage,xocolor);
				break;
			case 1:
				this.Soroban(stage,xocolor);
				break;
			case 2:
				this.Suanpan(stage,xocolor);
				break;
			case 3:
				this.Nepohualtzintzin(stage,xocolor);
				break;
			case 4:
				this.Hexadecimal(stage,xocolor);
				break;
			case 5:
				this.Binary(stage,xocolor);
				break;
			case 6:
				this.Schety(stage,xocolor);
				break;
			case 7:
				this.Fractions(stage,xocolor);
				break;
			case 8:
				this.Caacupé(stage,xocolor);
				break;
			case 9:
				this.Rods(stage,xocolor);
				break;
			case 10:
				this.Custom(stage,xocolor);
				break;
		}
	}

	this.initActivity = function(isdata,data){
		console.log(isdata);
		console.log(data);
		window.Fraction = Fraction;
		this.palette = new abacuspalette.AbacusPalette(this,doc.getElementById('abacus-button'),undefined);
		this.custompalette = new custompalette.CustomPalette(this,doc.getElementById('settings-button'),undefined);
		//var a = new StandardAbacus(stage,15,2,5,5,10,xocolor);
		if (isdata){
			this.customarr = data.customarr;
			this.initAbacus(data.mode);
			this.abacus.restore(data.abacusinuse);
			this.abacus.restoreTri(data.trix);
		} else {
			this.Suanpan(stage,xocolor);
		}
		this.palette.setUsed();
	}
}
