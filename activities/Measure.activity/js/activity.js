define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial","speechpalette",'sugar-web/datastore'], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial, speechpalette,datastore) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		// Initialize the activity.
		activity.setup();
		var retreived_datastore;
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
				setRetreivedDatastore(data);
				initiator();

			}
			else{

				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						pawns = JSON.parse(data);
						console.log(pawns);
						check_data=pawns;
						trans();
						data=check_data;
						console.log(data);

					}

				});
			}

		});
		function setRetreivedDatastore(data_val){
			retreived_datastore=data_val;
			console.log("retreived",retreived_datastore);
		}
		function trans(){
			console.log(check_data);
			setRetreivedDatastore(check_data);
			initiator(retreived_datastore);
		}
		document.getElementById("save-image-button").addEventListener('click',screenshot);
function screenshot(){
	// html2canvas(document.getElementById('container')).then(function(canvas) {
	// 	var imagee= canvas.toDataURL();
  // 	console.log(imagee);
  
  // });
  console.log("te");
  var ss = document.getElementById("canvas");
  html2canvas(ss).then(function(canvas){
	var mimetype = 'image/jpeg';
	  var inputData=canvas.toDataURL("image/jpeg",1);
	console.log(inputData);
	var metadata = {
		mimetype: mimetype,
		title: "Image Moon",
		activity: "org.olpcfrance.MediaViewerActivity",
		timestamp: new Date().getTime(),
		creation_time: new Date().getTime(),
		file_size: 0
	};
	datastore.create(metadata, function() {
		console.log("export done.")
	}, inputData);
  });
  console.log("tew");
}
		//receives retreived_datastore
		function initiator(initial_values){
			var a = initial_values
			console.log("initial values",initial_values);
			console.log("A",a);
			if(initial_values==null){
				retreived_datastore.palettechecker=0; //change
				timebased();
				retreived_datastore.time_flag=1;
				retreived_datastore.freq_flag=0;
				console.log("one check");
				data.last_graph=1;

			}
			else{
				if(initial_values.last_graph==1){
					console.log("two check");
					retreived_datastore.palettechecker=0; //change
					timebased(initial_values);
					retreived_datastore.time_flag=1;
					retreived_datastore.freq_flag=0;
					retreived_datastore.last_graph=1;
				}
				else if(initial_values.last_graph==0){
					console.log("for freq initial",initial_values);
					console.log("three check");
					data.palettechecker=1;
					console.log("for freq initial",initial_values);
					retreived_datastore.palettechecker=1;
					freqbased(initial_values,retreived_datastore.palettechecker); //cahnge

					retreived_datastore.freq_flag=1;
					retreived_datastore.time_flag=0;
					retreived_datastore.last_graph=0;
				}
			}
			
		};
		//last_graph if 1 -> timebased,if 0 -> freqbased
		var data={
			timexp:"2",
			timeyp:"2",
			freqxp:"1.1",
			freqyp:"0.5",
			last_graph:"1",
			palettechecker:"0",
			time_flag:"0",
			freq_flag:"0"
		};
		document.getElementById("stop-button").addEventListener('click',function(){
			console.log("writing");
			console.log("data to save",retreived_datastore);
			var jsonData = JSON.stringify(retreived_datastore);
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
		document.getElementById("timeratevalue").value=retreived_datastore.timeyp; //change
		document.getElementById("timepitchvalue").value=retreived_datastore.timexp; //change

		retreived_datastore.time_flag=1; //change
		retreived_datastore.freq_flag=0; //change

		retreived_datastore.last_graph=1; //change
		
	});
	
	document.getElementById("freqbased2").addEventListener('click',function(){
		document.getElementById("one").style.display="none";
		document.getElementById("two").style.display="block";
		document.getElementById("freqbased2").style.visibility="hidden";
		document.getElementById("timebased2").style.width="47px";
		document.getElementById("timebased2").style.height="47px";

		document.getElementById("freqbased2").style.width="0px";
		document.getElementById("freqbased2").style.height="0px";
		document.getElementById("timebased2").style.visibility="visible";

		document.getElementById("timepitchvalue").min="1";
		document.getElementById("timepitchvalue").max="2";
		document.getElementById("timeratevalue").min="0.2";
		document.getElementById("timeratevalue").max="2";
		document.getElementById("timepitchvalue").value=retreived_datastore.freqxp; //change
		document.getElementById("timeratevalue").value=retreived_datastore.freqyp; //change
		retreived_datastore.freq_flag=1; //change
		retreived_datastore.time_flag=0; //change
		retreived_datastore.last_graph=0; //change
		
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
		// data.freq_flag=0;
		// data.time_flag=1;
		if(argument_values == null){

		}
		else{
			var pop=argument_values.timeyp;
		}
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
			if(retreived_datastore.palettechecker != 1){
				console.log("time plateet");
				var speechButton = document.getElementById("speech-button");
			
				var speechButtonPalette = new speechpalette.ActivityPalette(
					speechButton);
			}
			
	
	
			p.mic1 = new p5.AudioIn();
			p.mic1.start();
			p.fft = new p5.FFT();
			p.fft.setInput(p.mic1);
	
			
			p.bg=p.loadImage('images/bg.jpg');
			document.getElementById("timepitchvalue").min="1.3";
			document.getElementById("timepitchvalue").max="6.3";
			document.getElementById("timepitchvalue").value="1.3";
			if(argument_values==null){
				p.txp=retreived_datastore.timexp;
				document.getElementById("timepitchvalue").value=retreived_datastore.timexp;
			}else{
				p.txp=argument_values.timexp;
				document.getElementById("timepitchvalue").value=argument_values.timexp;
			}
			
			data.timexp=p.txp; //remove if fine work
			retreived_datastore.timexp=p.txp; // change
			console.log(retreived_datastore.time_flag,retreived_datastore.freq_flag,"timebbase"); //change
			document.getElementById("timepitchvalue").addEventListener('click',function(){
				if(retreived_datastore.time_flag==1){ //change
					console.log("tt");
					p.txp=this.value;
					retreived_datastore.timexp=p.txp; //change
					console.log(retreived_datastore); //change
					document.getElementById("timepitchvalue").value=retreived_datastore.timexp;
				}
				
				
			});
			document.getElementById("timeratevalue").min="1";
			document.getElementById("timeratevalue").max="5";
			document.getElementById("timeratevalue").value="1";
			if(argument_values==null){
				p.typ=retreived_datastore.timeyp;
				document.getElementById("timeratevalue").value=retreived_datastore.timeyp;
			}else{
				p.typ=argument_values.timeyp;
				document.getElementById("timeratevalue").value=argument_values.timeyp;
				
			}
			data.timeyp=p.typ;
			retreived_datastore.timeyp=p.typ; //change
			document.getElementById("timeratevalue").addEventListener('click',function(){
				if(retreived_datastore.time_flag==1){ //change
					console.log("argument_values.timeyp",pop);
					console.log("ttt");
					p.typ=this.value;
					retreived_datastore.timeyp=p.typ; //change
					console.log(retreived_datastore); //change
					document.getElementById("timeratevalue").value=retreived_datastore.timeyp;
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
	
	//test for data.palettechecker=1
	if(data.palettechecker==1){
		retreived_datastore.freq_flag=0; //change
		retreived_datastore.time_flag=1; //change
		console.log("if time base check data",retreived_datastore); //change
		timebased(retreived_datastore); //change
		console.log("test1");
		document.getElementById("one").style.display="block";
		document.getElementById("two").style.display="none";

		document.getElementById("freqbased2").style.width="47px";
		document.getElementById("freqbased2").style.height="47px";
		document.getElementById("freqbased2").style.left="-20px";
		document.getElementById("freqbased2").style.visibility="visible";
		retreived_datastore.last_graph=1; //change
	}
	else{
		console.log("else time base check data",check_data);
		data.freq_flag=0;
		data.time_flag=1;
		timebased(check_data);
		data.last_graph=1;
	}
	
	});
	
	function freqbased(argument_values,x){
		retreived_datastore.last_graph=0; // change
		data.freq_flag=1;
		data.time_flag=0;
		if(document.getElementById("freqbased").value == 0){
			console.log("freq",argument_values);
			console.log("freqdata",data);

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
				if(x==1){
					console.log("freq palete");
					var speechButtonn = document.getElementById("speech-button");
					console.log(x,"pal");
					var speechButtonPalette = new speechpalette.ActivityPalette(
						speechButtonn);
					x=1;
					// retreived_datastore.palettechecker=0;
						
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
					p.fxp=retreived_datastore.freqxp;
					document.getElementById("timepitchvalue").value=retreived_datastore.freqxp;
				}else{
					p.fxp=argument_values.freqxp;
					document.getElementById("timepitchvalue").value=argument_values.freqxp;
				}
				data.freqxp=p.fxp;
				retreived_datastore.freqxp = p.fxp; // change
				document.getElementById("timepitchvalue").addEventListener('click',function(){
					if(retreived_datastore.freq_flag==1){ // change
						console.log("ff");
						p.fxp=this.value;
						retreived_datastore.freqxp=p.fxp; //change
						console.log(retreived_datastore); //change
						document.getElementById("timepitchvalue").value=retreived_datastore.freqxp; //change
					}
					
				});
				
				document.getElementById("timeratevalue").min="0.2";
				document.getElementById("timeratevalue").max="2";
				document.getElementById("timeratevalue").value="0.2";
				if(argument_values==null){
					p.fyp=retreived_datastore.freqyp;
					document.getElementById("timeratevalue").value=retreived_datastore.freqyp;
				}else{
					p.fyp=argument_values.freqyp;
					document.getElementById("timeratevalue").value=argument_values.freqyp;
				}
				data.freqyp=p.fyp;
				retreived_datastore.freqyp = p.fyp;//change
				document.getElementById("timeratevalue").addEventListener('click',function(){
					if(retreived_datastore.freq_flag==1){ //change
						console.log("fff");
						p.fyp=this.value;
						retreived_datastore.freqyp=p.fyp; //change
						console.log(retreived_datastore); //change
						document.getElementById("timeratevalue").value=retreived_datastore.freqyp; //change
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
			console.log("tee");
			if(x==1){
				document.getElementById("timebased2").style.width="0px";
				document.getElementById("timebased2").style.height="0px";
				document.getElementById("timebased2").style.visibility="hidden";
				// document.getElementById("timebased2").style.display="none";
				console.log(x,"pal2");
			}
			else{
				document.getElementById("timebased2").style.visibility="visible";
			}

			
			document.getElementById("one").style.display="none";
		
			}
	}
	document.getElementById("freqbased").addEventListener("click",function(event){
		
		retreived_datastore.time_flag=0; //change
		retreived_datastore.freq_flag=1; //change
		freqbased(retreived_datastore); //change
		retreived_datastore.last_graph=0; //change


	});  
	
	// timebased();
	});
	
});


