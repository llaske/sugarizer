define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial","speechpalette"], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial, speechpalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		// Initialize the activity.
		activity.setup();
		var pawns;
		var check_data;
		var freq_flag;
		var time_flag;
		var palettechecker=0;
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
		
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			
			if(!environment.objectId){
				console.log("New INstance");
				initiator();
			}
			else{
				console.log("old instance");
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						pawns = JSON.parse(data);
						console.log(pawns);
						check_data=pawns;
						trans();
						// drawPawns();
					}
					// console.log("pawn2",pawns);
					// initiator(pawns);
				});
				
				// initiator(check_data);
			}

		});
		function trans(){
			console.log(check_data);
			initiator(check_data);
		}

		function initiator(initial_values){
			var a = initial_values
			console.log("initial values",initial_values);
			console.log("A",a);
			if(initial_values==null){
				timebased();
				time_flag=1;
				freq_flag=0;
				
				console.log("one check");
				data.last_graph=1;
				// console.log("null value")
			}
			else{
				if(initial_values.last_graph==1){
					console.log("two check");
					timebased(initial_values);
					time_flag=1;
					freq_flag=0;
					// hideElementsfreq();
					data.last_graph=1;
				}
				else if(initial_values.last_graph==0){
					console.log("three check");
					freqbased(initial_values);
					// hideElementstime();
					data.last_graph=0;
					palettechecker=1;
				}
				// console.log(initial_values);
			}
			
		};
		//last_graph if 1 -> timebased,if 0 -> freqbased
		var data={
			timexp:"2",
			timeyp:"2",
			freqxp:"1.1",
			freqyp:"0.5",
			last_graph:"1"
		};
		document.getElementById("stop-button").addEventListener('click',function(){
			console.log("writing");
			var jsonData = JSON.stringify(data);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
					console.log(data);
					console.log("json",jsonData);
				} else {
					console.log("write failed.");
				}
			});
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

		document.getElementById("timepitchvalue").min="1.3";
		document.getElementById("timepitchvalue").max="6.3";
		document.getElementById("timeratevalue").min="1";
		document.getElementById("timeratevalue").max="5";
		document.getElementById("timeratevalue").value=data.timeyp;
		document.getElementById("timepitchvalue").value=data.timexp;

		time_flag=1;
		freq_flag=0;

		data.last_graph=1;
		
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

		document.getElementById("timepitchvalue").min="1";
		document.getElementById("timepitchvalue").max="2";
		document.getElementById("timeratevalue").min="0.2";
		document.getElementById("timeratevalue").max="2";
		document.getElementById("timepitchvalue").value=data.freqxp;
		document.getElementById("timeratevalue").value=data.freqyp;
		freq_flag=1;
		time_flag=0;
		data.last_graph=0;
		
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
	
	function timebased(argument_values){
		if(document.getElementById("timebased").value == 0){
			console.log("time",argument_values)
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
			document.getElementById("timepitchvalue").min="1.3";
			document.getElementById("timepitchvalue").max="6.3";
			// document.getElementById("pitchvalue").value="1.3";
			if(argument_values==null){
				p.txp=data.timexp;
				document.getElementById("timepitchvalue").value=data.timexp;
			}else{
				p.txp=argument_values.timexp;
				document.getElementById("timepitchvalue").value=argument_values.timexp;
			}
			
			data.timexp=p.txp;
			
			document.getElementById("timepitchvalue").addEventListener('click',function(){
				if(time_flag==1){
					p.txp=this.value;
					data.timexp=p.txp;
					console.log(data);
					document.getElementById("timepitchvalue").value=data.timexp;
				}
				
			});
			document.getElementById("timeratevalue").min="1";
			document.getElementById("timeratevalue").max="5";
			document.getElementById("timeratevalue").value="1";
			if(argument_values==null){
				p.typ=data.timeyp;
				document.getElementById("timeratevalue").value=data.timeyp;
			}else{
				p.typ=argument_values.timexp;
				document.getElementById("timeratevalue").value=argument_values.timexp;
			}
			data.timeyp=p.typ;
			document.getElementById("timeratevalue").addEventListener('click',function(){
				if(time_flag==1){
					p.typ=this.value;
					data.timeyp=p.typ;
					console.log(data);
					document.getElementById("timeratevalue").value=data.timeyp;
				}
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
				let x = p.map(i*p.txp, 0, waveform.length, 0, p.width);
				let y = p.map( waveform[i]*p.typ, -1, 1, 0, p.height);
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
	};
document.getElementById("timebased").addEventListener("click",function(event){
	timebased(check_data);
	// hideElementsfreq();
	// data.last_graph=1;
	
	
	});
	
	function freqbased(argument_values){
		if(document.getElementById("freqbased").value == 0){
			console.log("freq",argument_values);
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
				if(palettechecker==1){
					var speechButtonn = document.getElementById("speech-button");
			
					var speechButtonPalette = new speechpalette.ActivityPalette(
						speechButtonn);
						palettechecker=0;
				}
				p.mic2 = new p5.AudioIn();
				p.mic2.start();
				p.fft = new p5.FFT();
				p.fft.setInput(p.mic2);
				p.bg = p.loadImage('images/bg.jpg');
				document.getElementById("timepitchvalue").min="1";
				document.getElementById("timepitchvalue").max="2";
				document.getElementById("timepitchvalue").value="1";
				if(argument_values==null){
					p.fxp=data.freqxp;
					document.getElementById("timepitchvalue").value=data.freqxp;
				}else{
					p.fxp=argument_values.freqxp;
					document.getElementById("timepitchvalue").value=argument_values.freqxp;
				}
				data.freqxp=p.fxp;
				document.getElementById("timepitchvalue").addEventListener('click',function(){
					if(freq_flag==1){
						p.fxp=this.value;
						data.freqxp=p.fxp;
						console.log(data);
						document.getElementById("timepitchvalue").value=data.freqxp;
					}
					
				});
				
				document.getElementById("timeratevalue").min="0.2";
				document.getElementById("timeratevalue").max="2";
				document.getElementById("timeratevalue").value="0.2";
				if(argument_values==null){
					p.fyp=data.freqyp;
					document.getElementById("timeratevalue").value=data.freqyp;
				}else{
					p.fyp=argument_values.freqyp;
					document.getElementById("timeratevalue").value=argument_values.freqyp;
				}
				data.freqyp=p.fyp;
				document.getElementById("timeratevalue").addEventListener('click',function(){
					if(freq_flag==1){
						p.fyp=this.value;
						data.freqyp=p.fyp;
						console.log(data);
						document.getElementById("timeratevalue").value=data.freqyp;
					}
					
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
					let x = p.map(i*p.fxp, 0, spectrum.length, 0, p.width);
					let h = -p.height + p.map(spectrum[i]*p.fyp, 0, 255, p.height, 0);
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
	}
	document.getElementById("freqbased").addEventListener("click",function(event){
		freqbased(check_data);
		time_flag=0;
		freq_flag=1;
		data.last_graph=0;
		// document.getElementById("freqratevalue").style.display="block";
		// document.getElementById("freqratevalue").style.visibility="visible";
		// document.getElementById("freqpitchvalue").style.display="block";
		// document.getElementById("freqpitchvalue").style.visibility="visible";
		// // // timebtnx1
		// document.getElementById("freqbtnx1").style.display="block";
		// document.getElementById("freqbtnx1").style.visibility="visible";
		// document.getElementById("freqbtnx2").style.display="block";
		// document.getElementById("freqbtnx2").style.visibility="visible";
		// document.getElementById("freqbtny1").style.display="block";
		// document.getElementById("freqbtny1").style.visibility="visible";
		// document.getElementById("freqbtny2").style.display="block";
		// document.getElementById("freqbtny2").style.visibility="visible";

		// document.getElementById("timeratevalue").style.display="none";
		// document.getElementById("timeratevalue").style.visibility="hidden";
		// document.getElementById("timepitchvalue").style.display="none";
		// document.getElementById("timepitchvalue").style.visibility="hidden";
		// // // // timebtnx1
		// document.getElementById("timebtnx1").style.display="none";
		// document.getElementById("timebtnx1").style.visibility="hidden";
		// document.getElementById("timebtnx2").style.display="none";
		// document.getElementById("timebtnx2").style.visibility="hidden";
		// document.getElementById("timebtny1").style.display="none";
		// document.getElementById("timebtny1").style.visibility="hidden";
		// document.getElementById("timebtny2").style.display="none";
		// document.getElementById("timebtny2").style.visibility="hidden";
		// hideElementstime();
		// data.last_graph=0;

	});  
		
	// timebased();
	});
	
});


