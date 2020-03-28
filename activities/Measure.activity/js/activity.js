define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial","speechpalette"], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial, speechpalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		// Initialize the activity.
		activity.setup();
			
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
		});

	document.getElementById("help-button").addEventListener('click', function(e) {
		tutorial.start();
	});

	document.getElementById("timebased2").addEventListener('click',function(){
		document.getElementById("one").style.display="block";
		document.getElementById("two").style.display="none";
		document.getElementById("timebased2").style.width="0px";
		document.getElementById("timebased2").style.height="0px";
		document.getElementById("timebased2").style.visibility="hidden";
		document.getElementById("freqbased2").style.width="47px";
		document.getElementById("freqbased2").style.height="47px";
		document.getElementById("freqbased2").style.left="-20px";
		document.getElementById("freqbased2").style.visibility="visible";
		
	});
	
	document.getElementById("freqbased2").addEventListener('click',function(){
		document.getElementById("one").style.display="none";
		document.getElementById("two").style.display="block";
		document.getElementById("freqbased2").style.visibility="hidden";
		document.getElementById("timebased2").style.width="47px";
		document.getElementById("timebased2").style.height="47px";
		document.getElementById("timebased2").style.visibility="hidden";
		document.getElementById("freqbased2").style.width="0px";
		document.getElementById("freqbased2").style.height="0px";
		document.getElementById("timebased2").style.visibility="visible";
		
	});

	
	document.getElementById("fullscreen-button").addEventListener('click', function(event) {
		document.getElementById("main-toolbar").style.opacity = 0;
		document.getElementById("canvas").style.top = "0px";
		document.getElementById("unfullscreen-button").style.visibility = "visible";
	});

	  //Return to normal size
	document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
		document.getElementById("main-toolbar").style.opacity = 1;
		document.getElementById("canvas").style.top = "55px";
		document.getElementById("unfullscreen-button").style.visibility = "hidden";
	});
	
	
document.getElementById("timebased").addEventListener("click",function(event){
	if(document.getElementById("timebased").value == 0){
		var s = function(p){
		p.mic1;
		p.yslider;
		p.xslider;
		p.buttonx1;
		p.buttony1;
		p.buttonx2;
		p.buttony2;
		p.bg;
		p.img;
		p.setup = function(){
		
		p.createCanvas(window.innerWidth-100,window.innerHeight-250);
		var speechButton = document.getElementById("speech-button");
		
		var speechButtonPalette = new speechpalette.ActivityPalette(
			speechButton);


		p.mic1 = new p5.AudioIn();
		p.mic1.start();
		p.fft = new p5.FFT();
		p.fft.setInput(p.mic1);

		
		p.bg=p.loadImage('images/bg.jpg');
		document.getElementById("pitchvalue").min="1.3";
		document.getElementById("pitchvalue").max="6.3";
		document.getElementById("pitchvalue").addEventListener('click',function(){

			p.xp=this.value;
		});
		document.getElementById("ratevalue").min="1";
		document.getElementById("ratevalue").max="5";
		document.getElementById("ratevalue").addEventListener('click',function(){
			p.yp=this.value;
			
		});
		p.xaxis1=p.createP("Sound  Time Base");
		p.xaxis1.style('padding-left:40%');
		p.xaxis1.style('color:white');
		};
		p.draw = function(){

		p.background(p.bg);
		let waveform = p.fft.waveform();
		p.noFill();
		p.beginShape();
		p.stroke(255);
		for (let i = 0; i < waveform.length; i++){
			let x = p.map(i*p.xp, 0, waveform.length, 0, p.width);
			let y = p.map( waveform[i]*p.yp, -1, 1, 0, p.height);
			p.vertex(x,y);
		}
		p.endShape();
		
		};
		
		p.windowResized = function(){
		p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
		};
	};
	var myp5 = new p5(s,'one');

	document.getElementById("timebased").style.visibility="hidden";
	document.getElementById("timebased").style.display="none";
	document.getElementById("timebased").style.width="0px";
	document.getElementById("timebased").style.height="0px";
	document.getElementById("freqbased").style.visibility="visible";
	document.getElementById("freqbased").style.width="47px";
	document.getElementById("freqbased").style.height="47px";
	
	}
	
	
	});
	document.getElementById("freqbased").addEventListener("click",function(event){
	if(document.getElementById("freqbased").value == 0){
	var t = function(p){
		p.mic2;
		p.cnv;
		p.yslider;
		p.xslider;
		p.yaxis;
		p.xaxis;
		p.bg;
		p.px;
		p.py;
		p.setup = function(){
		p.cnv=p.createCanvas(window.innerWidth-100,window.innerHeight-250);	
		p.mic2 = new p5.AudioIn();
		p.mic2.start();
		p.fft = new p5.FFT();
		p.fft.setInput(p.mic2);
		p.bg = p.loadImage('images/bg.jpg');
		document.getElementById("pitchvalue").min="1";
		document.getElementById("pitchvalue").max="2";
		document.getElementById("pitchvalue").addEventListener('click',function(){

			p.xp=this.value;

		});
		document.getElementById("ratevalue").min="0.2";
		document.getElementById("ratevalue").max="2";
		document.getElementById("ratevalue").addEventListener('click',function(){

			p.yp=this.value;

		});
		p.xaxis=p.createP("Sound  Frequency Base");
		p.xaxis.style('padding-left:40%');
		p.xaxis.style('color:white');
		};
		p.draw = function(){
		p.background(p.bg);
		let spectrum = p.fft.analyze();
		p.noStroke();
		p.fill(255, 255, 255);
		
		for (let i = 0; i< spectrum.length; i++){
			let x = p.map(i*p.xp, 0, spectrum.length, 0, p.width);
			let h = -p.height + p.map(spectrum[i]*p.yp, 0, 255, p.height, 0);
			p.rect(x, p.height, p.width / spectrum.length, h )
		}
		p.stroke(255);	
		};

		p.windowResized = function(){
		p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
		};
		
	};
	var myp5 = new p5(t,'two');

	document.getElementById("freqbased").style.visibility="hidden";
	document.getElementById("freqbased").style.display="none";
	document.getElementById("timebased2").style.visibility="visible";
	document.getElementById("one").style.display="none";

	}

	});  
		
	
	});
	
});


