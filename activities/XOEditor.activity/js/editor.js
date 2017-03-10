function Editor(stage,xocol,doc,colors,activity,env,datastore,forcereload){
	if (forcereload === undefined) forcereload=false;
	this.radius = 22.5;
	this.scale = stage.canvas.width/1200;
	this.cxy = [stage.canvas.width/2,stage.canvas.height/2];
	this.xy = [stage.canvas.width/2+(120*this.scale),stage.canvas.height/2-(this.radius*this.scale)];
	this.dotsizeplus = this.radius*3*this.scale;
	this.dmin = 0;
	this.dmax = stage.canvas.height-(this.dotsizeplus/2.2);
	this.zones = [];
	this.dots = [];
	this.stage = stage;
	this.xo = null;
	this.width = stage.canvas.width;
	this.height = stage.canvas.height;
	this.env = env;
	this.ds = datastore;

	this.hexToRgb = function(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}

	this.contrast = function(rgb1, rgb2){
		var v1 = rgb1.r * 0.3 + rgb1.g * 0.6 + rgb1.b * 0.1;
		var v2 = rgb2.r * 0.3 + rgb2.g * 0.6 + rgb2.b * 0.1;
		return Math.abs(v2 - v1);
	}

	this.hue = function(rgb){
		var a = 0.5 * (2.0 * rgb.r - rgb.g - rgb.b);
		var b = 0.87 * (rgb.g - rgb.b);
		var h = Math.atan2(b, a);
		return h * 180 / Math.PI;
	}


	this.deltahue = function(rgb1, rgb2){
		h1 = this.hue(rgb1);
		h2 = this.hue(rgb2);
		return Math.abs(h2 - h1);
	}

	this.zone = function(dv, dh){
		var zone;
		if (dh < 75){
			zone = 0;
		}
		else if (dh > 150){
			zone = 1;
		} else{
			zone = 2;
		}
		if (dv > 48){
			zone += 1;
		}
		return zone;
	}

	this.calczones = function(self){
		for (var col in xocol.colors){
			rgb1 = this.hexToRgb(xocol.colors[col].stroke);
			rgb2 = this.hexToRgb(xocol.colors[col].fill);
			dv = this.contrast(rgb1, rgb2);
			dh = this.deltahue(rgb1, rgb2);
			this.zones.push(this.zone(dv, dh));
		}
	}

	this.nextdotposition = function(){
		var dx = this.xy[0]-this.cxy[0];
		var dy = this.xy[1]-this.cxy[1];
		var r = Math.sqrt(dx*dx+dy*dy);
		var c = 2*r*Math.PI;
		var a = Math.atan2(dy, dx);
		var da = (this.dotsizeplus/c)*2*Math.PI;
		a += da;
		r += this.dotsizeplus/(c/this.dotsizeplus);
		this.xy[0] = r*Math.cos(a)+this.cxy[0]
		this.xy[1] = r*Math.sin(a)+this.cxy[1]
		if (this.xy[1]<this.dmin||this.xy[1]>this.dmax){
			this.nextdotposition();
		}
	}

	this.saveColours = function(){
		var jsonparsed = this.ds.localStorage.getValue('sugar_settings');
		jsonparsed.colorvalue.stroke = this.xo.stroke;
		jsonparsed.colorvalue.fill = this.xo.fill;
		jsonparsed.color = this.xo.colnumber;
		this.ds.localStorage.setValue('sugar_settings', jsonparsed);
		if (jsonparsed.networkId != null) {
			// HACK: When connected to the server, should call the /api/users to update color on the server
			var server = jsonparsed.server;
			if (server == null) {
				if (document.location.protocol.substr(0,4) == "http") {
					var url = window.location.href.substr(document.location.protocol.length+2);
					server = url.substring(0, url.indexOf('/activities'));;
				} else {
					server = "localhost";
				}
			}
			server = "http://" + server + "/api/users/" + jsonparsed.networkId;
			var request = new XMLHttpRequest();
			request.open("PUT",server,true);
			request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.send("user="+encodeURI(JSON.stringify({color: {stroke: this.xo.stroke, fill: this.xo.fill}})));
		}
	}

	this.stop = function(){
		var arr = [];
		var temparr = {};
		temparr.x = this.width;
		temparr.y = this.height;
		arr.push(temparr);

		for (var i in this.dots){
			temparr = {};
			temparr.fill = this.dots[i].innercol;
			temparr.stroke = this.dots[i].outercol;
			temparr.x = this.dots[i].circle.x;
			temparr.y = this.dots[i].circle.y;
			temparr.num = this.dots[i].number;
			arr.push(temparr);
		}

		var js = JSON.stringify(arr);
		activity.getDatastoreObject().setDataAsText(js);
		activity.getDatastoreObject().save();
	}

	this.init = function(){
		if (forcereload==true){
			this.init_getsettings(false,[]);
		} else {
			activity.getDatastoreObject().getMetadata(this.init_canaccessdatastore.bind(this));
		}
	}

	this.init_canaccessdatastore = function(error,mdata){
		var d = new Date().getTime();
		if (Math.abs(d-mdata.creation_time)<2000){
			this.init_getsettings(false,[]);
		} else {
			activity.getDatastoreObject().loadAsText(this.init_getdatastore.bind(this));
		}
	}

	this.init_getdatastore = function(error,metadata,data){
		if (error==null&&data!=null){
			data = JSON.parse(data);
			this.init_getsettings(true,data);
		} else {
			this.init_getsettings(false,[]);
		}
	}

	this.init_getsettings = function(isdata,data) {
		this.ds.localStorage.load(function() {
			var preferences = this.ds.localStorage.getValue('sugar_settings');
			this.init_activity(isdata,data,preferences);
		}.bind(this));
	}

	this.init_activity = function(isdata,data,settings){
		this.dots = [];
		this.calczones();

		var cnum = settings;
		var xo = new XOMan(colors.fill,colors.stroke,this,cnum.color);
		xo.init();
		this.xo = xo;

		if (isdata==false) {
			for (var z = 0; z<4; z++){
				for (var i in xocol.colors){
					if (this.zones[i]==z){
						var c = new ColourCircle(xocol.colors[i].fill,xocol.colors[i].stroke,this.xy[0]+15,this.xy[1],stage,this.xo,i);
						c.init();
						this.dots.push(c);
						this.nextdotposition();
					}
				}
			}
		} else {
			var scalex = this.width/data[0].x;
			var scaley = this.height/data[0].y;
			for (var i = 1; i<data.length; i++){
				var c = new ColourCircle(data[i].fill,data[i].stroke,data[i].x*scalex,data[i].y*scaley,stage,this.xo,data[i].num);
				c.init();
				this.dots.push(c);
			}
		}
	}
}
