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
		var resizeFlag=0;
		var play=0;
		var pause=1;
		var isImageDiplayed=0;
		var timegraphsDisplay=0;
		var freqgraphDisplay=0;
		var isResized=0;
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
			var ss = document.getElementById("canvas");
			html2canvas(ss).then(function(canvas){
				var mimetype = 'image/jpeg';
				var inputData=canvas.toDataURL("image/jpeg",1);
				console.log(inputData);
				var metadata = {
					mimetype: mimetype,
					title: "Measure",
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				datastore.create(metadata, function() {
					console.log("export done.")
				}, inputData);
			});
		}
		document.getElementById("pause").addEventListener('click',pauseGraph);
		function pauseGraph(){
			// if(play==1){
			// 	document.getElementById("one").style.display="block";
			// 	document.getElementById("play-pause").style.backgroundImage="url('../icons/pause.svg')";
			// 	play=0;
			// 	pause=1;
			// }
			if(pause==1){
				var ssplaypause = document.getElementById("canvas");
				html2canvas(ssplaypause).then(function(canvas){
					
					var playpauseInputData=canvas.toDataURL("image/jpeg",1);
					document.getElementById("graph-image").src=playpauseInputData;
					isImageDiplayed=1;
					pause=0;
					play=1;
					
					document.getElementById("graph-image").style.display="block";
					
					// document.getElementById("two").style.display="none";
					document.getElementById("pause").style.display="none";
					// document.getElementById("pause").style.visibility="hidden";
					document.getElementById("play").style.display="inline";
					if(document.getElementById("one").style.display!="none"){
						document.getElementById("one").style.display="none";
						timegraphDisplay=1;
						console.log("true");
					}
					else if(document.getElementById("two").style.display!="none"){
						document.getElementById("two").style.display="none";
						freqgraphDisplay=1;
					}
					// if(document.getElementById("one").style.display=="block"){
					// 	console.log("fal");
					// }
					// console.log(playpauseInputData);
				});
				
			}
			
			

		}

		document.getElementById("play").addEventListener('click',playGraph);
		function playGraph(){
			if(play==1){
				isImageDiplayed=0;
				document.getElementById("play").style.display="none";
				document.getElementById("graph-image").style.display="none";
				document.getElementById("pause").style.display="inline";
				if(document.getElementById("one").style.display=="none" && timegraphDisplay==1){
					document.getElementById("one").style.display="block";
					timegraphDisplay=0;
				}
				if(document.getElementById("two").style.display=="none" && freqgraphDisplay==1)
					document.getElementById("two").style.display="block";
					freqgraphDisplay=0;
				// document.getElementById("two").style.display="block";
				play=0;
				pause=1;
			}
		}

		window.onresize = changeImageSize;

		function changeImageSize(){
			document.getElementById("graph-image").style.height=window.innerHeight-150;
			document.getElementById("graph-image").style.width=window.innerWidth-50;
		}

		//receives retreived_datastore
		function initiator(initial_values){
			var a = initial_values;
			if(initial_values==null){
				retreived_datastore.palettechecker=0;
				timebased();
				retreived_datastore.time_flag=1;
				retreived_datastore.freq_flag=0;
				data.last_graph=1;
			}
			else{
				if(initial_values.last_graph==1){
					retreived_datastore.palettechecker=0;
					timebased(initial_values);
					retreived_datastore.time_flag=1;
					retreived_datastore.freq_flag=0;
					retreived_datastore.last_graph=1;
				}
				else if(initial_values.last_graph==0){
					data.palettechecker=1;
					retreived_datastore.palettechecker=1;
					freqbased(initial_values,retreived_datastore.palettechecker);
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
			document.getElementById("timebased2").style.display="none"; //change
			document.getElementById("freqbased2").style.width="47px";
			document.getElementById("freqbased2").style.height="47px";
			// document.getElementById("freqbased2").style.left="-20px";
			document.getElementById("freqbased2").style.visibility="visible";
			document.getElementById("freqbased2").style.display="inline";//change
			document.getElementById("timepitchvalue").min="1.3";
			document.getElementById("timepitchvalue").max="6.3";
			document.getElementById("timeratevalue").min="1";
			document.getElementById("timeratevalue").max="5";
			document.getElementById("timeratevalue").value=retreived_datastore.timeyp;
			document.getElementById("timepitchvalue").value=retreived_datastore.timexp;

			retreived_datastore.time_flag=1;
			retreived_datastore.freq_flag=0;
			retreived_datastore.last_graph=1;
			
		});
	
		document.getElementById("freqbased2").addEventListener('click',function(){
			document.getElementById("one").style.display="none";
			document.getElementById("two").style.display="block";
			document.getElementById("freqbased2").style.display="none";
			document.getElementById("timebased2").style.width="47px";
			document.getElementById("timebased2").style.height="47px";

			document.getElementById("freqbased2").style.width="0px";
			document.getElementById("freqbased2").style.height="0px";
			document.getElementById("timebased2").style.visibility="visible";
			document.getElementById("timebased2").style.display="inline";
			document.getElementById("timepitchvalue").min="1";
			document.getElementById("timepitchvalue").max="2";
			document.getElementById("timeratevalue").min="0.2";
			document.getElementById("timeratevalue").max="2";
			document.getElementById("timepitchvalue").value=retreived_datastore.freqxp;
			document.getElementById("timeratevalue").value=retreived_datastore.freqyp;

			retreived_datastore.freq_flag=1;
			retreived_datastore.time_flag=0;
			retreived_datastore.last_graph=0;
		});
		function incSizeHeight(a,b){
			var hei=a.split("p");
			if(b==1){
				return Number(hei[0])+100
			}
			else if(b==0){
				return Number(hei[0])-100
			}
			
		}
		function incSizeWidth(a,c){
			var wid=a.split("p");
			if(c==1){
				return Number(wid[0])+50
			}
			else if(c==0){
				return Number(wid[0])-50
			}
		}
		document.getElementById("fullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			if(isResized==0){
				var calcHeight=incSizeHeight(document.getElementById("defaultCanvas0").style.height,1);
				var calcWidth=incSizeWidth(document.getElementById("defaultCanvas0").style.width,1);
				console.log(calcWidth,calcHeight,"cac");
				
				document.getElementById("defaultCanvas0").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas0").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas0").style.marginLeft="25px";
				document.getElementById("defaultCanvas1").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas1").style.width=String(calcWidth)+"px";
				
				document.getElementById("defaultCanvas1").style.marginLeft="25px";
				
				// document.getElementById("defaultCanvas1").style.height="801px";
			}
			// if(isImageDiplayed==1){
			// 	console.log(innerwidth,innerheight,"hei");
			// 	document.getElementById("graph-image").style.height=innerheight;
			// 	document.getElementById("graph-image").style.width=innerwidth;
			// 	console.log("tp");
			// }
			
			// document.getElementById("defaultCanvas0").style.height="801px";
			// document.getElementById("defaultCanvas1").style.height="801px";
		});

		//Return to normal size
		document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if(isResized==0){
				var calcHeight=incSizeHeight(document.getElementById("defaultCanvas0").style.height,0);
				var calcWidth=incSizeWidth(document.getElementById("defaultCanvas0").style.width,0);
				console.log(calcWidth,calcHeight,"cac");
				document.getElementById("defaultCanvas0").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas0").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas1").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas1").style.width=String(calcWidth)+"px";
				
				document.getElementById("defaultCanvas0").style.marginLeft="50px";
				document.getElementById("defaultCanvas1").style.marginLeft="50px";
				// document.getElementById("defaultCanvas1").style.height="801px";
			}
		});
	
		function timebased(argument_values){
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
						if(retreived_datastore.palettechecker != 1){
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
						}
						else{
							p.txp=argument_values.timexp;
							document.getElementById("timepitchvalue").value=argument_values.timexp;
						}
						data.timexp=p.txp;
						retreived_datastore.timexp=p.txp;
						document.getElementById("timepitchvalue").addEventListener('click',function(){
							if(retreived_datastore.time_flag==1){
								p.txp=this.value;
								retreived_datastore.timexp=p.txp;
								document.getElementById("timepitchvalue").value=retreived_datastore.timexp;
							}
						});
						document.getElementById("timeratevalue").min="1";
						document.getElementById("timeratevalue").max="5";
						document.getElementById("timeratevalue").value="1";
						if(argument_values==null){
							p.typ=retreived_datastore.timeyp;
							document.getElementById("timeratevalue").value=retreived_datastore.timeyp;
						}
						else{
							p.typ=argument_values.timeyp;
							document.getElementById("timeratevalue").value=argument_values.timeyp;
							
						}
						data.timeyp=p.typ;
						retreived_datastore.timeyp=p.typ;
						document.getElementById("timeratevalue").addEventListener('click',function(){
							if(retreived_datastore.time_flag==1){
								p.typ=this.value;
								retreived_datastore.timeyp=p.typ;
								document.getElementById("timeratevalue").value=retreived_datastore.timeyp;
							}
							
						});
						p.timegraphtitle=webL10n.get("TimeGraph")
						p.xaxis1=p.createP(p.timegraphtitle);
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
						isResized=1
						p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
						document.getElementById("fullscreen-button").addEventListener('click',function(){
							console.log("po");
							p.resizeCanvas(window.innerWidth-70,window.innerHeight-150);
							document.getElementById("defaultCanvas0").style.marginLeft="33px";
							document.getElementById("defaultCanvas1").style.marginLeft="33px";
							console.log(document.getElementById("defaultCanvas0").style.height,document.getElementById("defaultCanvas1").style.height,"height01");
							
						});
						document.getElementById("unfullscreen-button").addEventListener('click',function(){
							console.log("pot");
							p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
							document.getElementById("defaultCanvas0").style.marginLeft="50px";
							document.getElementById("defaultCanvas1").style.marginLeft="50px";
							
						});
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
			document.getElementById("timebased2").style.display="none"; //change
			document.getElementById("timebased2").style.width="0px"; //change
			document.getElementById("timebased2").style.height="0px"; //change
			document.getElementById("freqbased2").style.display="none"; //change
			document.getElementById("freqbased2").style.width="0px"; //change
			document.getElementById("freqbased2").style.height="0px"; //change
			}
		};

		document.getElementById("timebased").addEventListener("click",function(event){
			//test for data.palettechecker=1
			if(data.palettechecker==1){
				retreived_datastore.freq_flag=0;
				retreived_datastore.time_flag=1;
				timebased(retreived_datastore);
				document.getElementById("one").style.display="block";
				document.getElementById("two").style.display="none";
				document.getElementById("freqbased2").style.display="inline"; //change
				document.getElementById("freqbased2").style.width="47px";
				document.getElementById("freqbased2").style.height="47px";
				// document.getElementById("freqbased2").style.left="-20px";
				document.getElementById("freqbased2").style.visibility="visible";
				retreived_datastore.last_graph=1;
			}
			else{
				data.freq_flag=0;
				data.time_flag=1;
				timebased(check_data);
				data.last_graph=1;
			}
			
		});
	
		function freqbased(argument_values,x){
			retreived_datastore.last_graph=0;
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
						if(x==1){
							var speechButtonn = document.getElementById("speech-button");
							var speechButtonPalette = new speechpalette.ActivityPalette(
								speechButtonn);
							x=1;
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
						}
						else{
							p.fxp=argument_values.freqxp;
							document.getElementById("timepitchvalue").value=argument_values.freqxp;
						}
						data.freqxp=p.fxp;
						retreived_datastore.freqxp = p.fxp;
						document.getElementById("timepitchvalue").addEventListener('click',function(){
							if(retreived_datastore.freq_flag==1){
								p.fxp=this.value;
								retreived_datastore.freqxp=p.fxp;
								document.getElementById("timepitchvalue").value=retreived_datastore.freqxp;
							}
						});
						document.getElementById("timeratevalue").min="0.2";
						document.getElementById("timeratevalue").max="2";
						document.getElementById("timeratevalue").value="0.2";
						if(argument_values==null){
							p.fyp=retreived_datastore.freqyp;
							document.getElementById("timeratevalue").value=retreived_datastore.freqyp;
						}
						else{
							p.fyp=argument_values.freqyp;
							document.getElementById("timeratevalue").value=argument_values.freqyp;
						}
						data.freqyp=p.fyp;
						retreived_datastore.freqyp = p.fyp;
						document.getElementById("timeratevalue").addEventListener('click',function(){
							if(retreived_datastore.freq_flag==1){
								p.fyp=this.value;
								retreived_datastore.freqyp=p.fyp;
								document.getElementById("timeratevalue").value=retreived_datastore.freqyp;
							}
						});
						p.frequencygraphtitle=webL10n.get("FrequencyGraph")
						p.xaxis=p.createP(p.frequencygraphtitle);
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
						isResized=1;
						console.log("changed",resizeFlag);
						p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
						document.getElementById("fullscreen-button").addEventListener('click',function(){
							console.log("po");
							p.resizeCanvas(window.innerWidth-70,window.innerHeight-140);
							document.getElementById("defaultCanvas0").style.marginLeft="33px";
							document.getElementById("defaultCanvas1").style.marginLeft="33px";
							console.log(document.getElementById("defaultCanvas0").style.height,document.getElementById("defaultCanvas1").style.height,"height01");
						});
						document.getElementById("unfullscreen-button").addEventListener('click',function(){
							console.log("pot");
							p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
							document.getElementById("defaultCanvas0").style.marginLeft="50px";
							document.getElementById("defaultCanvas1").style.marginLeft="50px";
							
						});
					};
				};
				var myp5 = new p5(t,'two');
				document.getElementById("freqbased").style.visibility="hidden";
				document.getElementById("freqbased").style.display="none";
				if(x==1){
					document.getElementById("timebased2").style.display="none";
					document.getElementById("freqbased2").style.display="none";
					document.getElementById("timebased2").style.width="0px";
					document.getElementById("timebased2").style.height="0px";
					document.getElementById("timebased2").style.visibility="hidden";
				}
				else{
					document.getElementById("timebased2").style.visibility="visible";
				}
				document.getElementById("one").style.display="none";
			}
		}
		document.getElementById("freqbased").addEventListener("click",function(event){
			retreived_datastore.time_flag=0;
			retreived_datastore.freq_flag=1;
			document.getElementById("timebased2").style.visibility="visible";
			document.getElementById("timebased2").style.display="inline"; //change
			document.getElementById("timebased2").style.width="47px"; //change
			document.getElementById("timebased2").style.height="47px"; //change
			// document.getElementById("speech-button").style.left="-20px"; //change
			// document.getElementsByClassName("palette")[1].style.left="162px";
			freqbased(retreived_datastore);
			retreived_datastore.last_graph=0;
		});
	});
});