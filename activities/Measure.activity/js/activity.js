define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial","speechpalette",'sugar-web/datastore'], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial, speechpalette,datastore) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		// Initialize the activity.
		activity.setup();
		var retreived_datastore;
		var pawns;
		var check_data;
		var play=0;
		var pause=1;
		var isImageDiplayed=0;
		var timegraphDisplay=0;
		var freqgraphDisplay=0;
		var isResized=0;
		var time_waveform;
		var time_i;
		var time_x;
		var time_y;
		var freq_spectrum;
		var freq_i;
		var freq_x;
		var freq_h;
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			
			if(!environment.objectId){
				setRetreivedDatastore(data);
				initiator();
			}
			else{
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						pawns = JSON.parse(data);
						check_data=pawns;
						trans();
						data=check_data;
					}
				});
			}
		});

		function setRetreivedDatastore(data_val){
			retreived_datastore=data_val;
		}

		function trans(){
			setRetreivedDatastore(check_data);
			initiator(retreived_datastore);
		}
		document.getElementById("save-image-button").addEventListener('click',screenshot);
		function screenshot(){
			var ss = document.getElementById("canvas");
			html2canvas(ss).then(function(canvas){
				var mimetype = 'image/jpeg';
				var inputData=canvas.toDataURL("image/jpeg",1);
				var metadata = {
					mimetype: mimetype,
					title: "Measure Image",
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				datastore.create(metadata, function() {
				}, inputData);
			});
		}
		document.getElementById("pause").addEventListener('click',pauseGraph);
		function pauseGraph(){

			if(pause==1){
				var ssplaypause = document.getElementById("canvas");
				
				html2canvas(ssplaypause).then(function(canvas){
					
					var playpauseInputData=canvas.toDataURL("image/jpeg",1);
					document.getElementById("graph-image").src=playpauseInputData;
					isImageDiplayed=1;
					pause=0;
					play=1;
					
					document.getElementById("graph-image").style.display="block";
					document.getElementById("pause").style.display="none";
					document.getElementById("play").style.display="inline";
					if(document.getElementById("one").style.display!="none"){
						document.getElementById("one").style.display="none";
						timegraphDisplay=1;
					}
					else if(document.getElementById("two").style.display!="none"){
						document.getElementById("two").style.display="none";
						freqgraphDisplay=1;
					}
				});
			}
		}
		var ct = "data:image/png;base64,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";
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
			document.getElementById("timebased2").style.display="none";
			document.getElementById("freqbased2").style.width="47px";
			document.getElementById("freqbased2").style.height="47px";
			document.getElementById("freqbased2").style.visibility="visible";
			document.getElementById("freqbased2").style.display="inline";
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
				
				document.getElementById("defaultCanvas0").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas0").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas0").style.marginLeft="25px";
				document.getElementById("defaultCanvas1").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas1").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas1").style.marginLeft="25px";
			}
		});

		//Return to normal size
		document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			if(isResized==0){
				var calcHeight=incSizeHeight(document.getElementById("defaultCanvas0").style.height,0);
				var calcWidth=incSizeWidth(document.getElementById("defaultCanvas0").style.width,0);

				document.getElementById("defaultCanvas0").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas0").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas1").style.height=String(calcHeight)+"px";
				document.getElementById("defaultCanvas1").style.width=String(calcWidth)+"px";
				document.getElementById("defaultCanvas0").style.marginLeft="50px";
				document.getElementById("defaultCanvas1").style.marginLeft="50px";
			}
		});
		// var dataa;
		// var xhr = new XMLHttpRequest();
		// 	xhr.open("GET","../Measure.activity/images/bg.jpg",true);
		// 	xhr.responseType = 'blob';
		// 	xhr.onload = function(){
		// 		dataa = URL.createObjectURL(this.response);
		// 		console.log("pressed");
		// 		console.log(dataa);
		// 	};
		// 	xhr.send();
		


		// function toDataURL(url, callback) {
		// 	var xhr = new XMLHttpRequest();
		// 	xhr.onload = function() {
		// 		var reader = new FileReader();
		// 		reader.onloadend = function() {
		// 		callback(reader.result);
		// 		}
		// 		reader.readAsDataURL(xhr.response);
		// 	};
		// 	xhr.open('GET', url);
		// 	xhr.responseType = 'blob';
		// 	xhr.send();
		// 	}
			
		// 	toDataURL('images/bg.jpg', function(dataUrl) {
		// 	console.log('RESULT:', dataUrl)
		// 	})	


		// var img;
		// var raw = new Image();

		// raw.source='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAATG0lEQVR42u1ce1RU17n/nSMMCBhAUERRUXwRrSWGEsVbNKlxsUyuxkcEYq4r1cpKNFLTZqnXVyPapdGmWo2JpIlpclPT1kdBJdZrMOhCEGMjCvjARBA0AgqIPAaGme93/wicy8AMzMCAJit7rb1g9tmv8zvf3t9jf98GfkydSsrDNiERAQAnAB4AdABUAEYA1QDqAEBV1R8BJAmSfQGEARgHYDSAYQACAPRuBK45UgKgFkAxgAIAeQAuADgLIEdVVeMPHkARUQGEA5gBIBLAo4qiqCTNJ6UosLPsHoBUAMkAEhVFuasoyg8HQBEJBLAIwIsABnUSrDbLABgA/C+ADwAceVCU6ZC9TETGicg+EWngA0giki8ir4qI6/cNvBEickBETN0FVllZGUXEGpC3RORXIuL0sAPnJiKbRKReRNhVuaioiOfOnWNaWhovX75MEWFCQgKDgoK4ceNGVldXW2t7XkTGP6zghYvItabJNn55s2xLWXFxMbOzs3nhwgVevXqVd+7codFoNKtz6NAhzp49m35+fgTA3bt3U0S4a9cuent786mnnmprjAYR2eqoZa04ADgVwEoA6xvlt04xgn/961/4/PPPkZ2djZycHBQXF8PV1RUBAQEICgrScmBgIPr37w+9Xo+4uDgsWrQIr776Ku7cuYNnn30WJ06cgLu7e1vMJgtAlKqqeQ+S6jxEJKmz+9f9+/f51ltv8U9/+hP37dvH9PR05ufns7Kykrm5ufzpT39KAFpWVZWqqpqVAeCWLVtIkidPnqTRaLSFyVSIyLQHQoEi0g9AsqIo4zozgYKCAkRFRcHX1xdubm4oKirCrVu3YDKZUFJS0qSZmCVnZ2e89957iIyMREFBAb788kvs378fGRkZyM3NRWBgIJydnc2EdmtyIUkjgKUAdnebhiMigc33u47mM2fO0M/Pj7NmzeKKFSu4atUq7ty5k4cPH2Z4eHgrCmtJhW+99ZZZfykpKTxy5AhFhCaTiSLC8vJyLlu2zJb5rLT0sboCvAAR+aa9CbXHMJKSkujm5tYmSC1z3759+eSTT3LJkiV8++23+cUXX7RiMCRZWlrK1157TSuLiopiaWlpu/MTkeVdCqKI9BaR3OaDN/3fckJtAZiVlUUXF5d2ARsyZAhjY2P5t7/9jYWFhRpVtTfGqVOn6OrqyuLiYooIjx49yv3799vS1iQiv+oq8HQi8kVnGYbRaOT48eMtAtajRw9OnDiRW7Zs4aVLl6wKxu0lvV7PgIAArl+/viPNG0RkSlcAuLOz4JlMJu7atcsMNEVROHHiRO7YsYM3b97sMGgt05YtW+jv70+9Xt8RFbBMRIY6Erw5jtAgTCYTZ82apYH34osv8uuvv3a4pnLx4kWGhIQQAP/yl790tJ9MEdE5Arz+jV/ErglY2mMaGhrYq1cvAuCCBQs6pbG0VZaXl6d9pHHjxrWaQ2Zmpq39bei00VNEDrRkFB1lIlevXiUAPvLIIywvL+8yAEWEo0aN0raIs2fP0mg0sqqqipMnT2ZISIit/dWLSEhbGKntADgNwKwmdajlX2tlln4rioLz588DAKKjo+Ht7W21niPKpkyZgpkzZ+Ls2bMYMWIE7t69i82bN+Ojjz6CoiiorKy0pT8dgF2N6qrdS9dJRC47cm96+umnCYCfffYZu9JaIyLcvXs3AdDJyYnHjx9nTk4OPT09mZOTw/fff5/Hjx+3p7/ojlDgS4qijGr5lTqaS0tLceLECaiqivHjx8NR/VrLAwcOBAA89dRTOHfuHMaOHYv4+HiMHj0aHh4eSE9Pt7kvABus2RJVa9QH4L8bD346lJsdHIEk0tLSYDKZMGDAAHh5eVmt56iyAQMGAABcXV3Rq1cv6HQ6REREgCSKioqQnp5uc3+Nh10v2LN851raXDvDRDZu3EgADA8PdzjDsFRWWlqqjUeS8+bNo06n49GjR1lWVsaKigp7x7hgSc2zZuJe0tJ6YYlhWHvWshwAysrKAAA+Pj5t1nNUWe/eveHm5oba2losWLAAc+bMwZgxY2A0GvHVV19hyhTLykYbY4wlGQHgVJsAisgIABEWDJCdFokAwMPDA47u2+LepKoYNGgQsrKykJWVhdLSUsydOxcBAQFYvHgxvvrqK4gIli9fDjuOQBe2CyCAeV1xpurp6antSd11Zjt8+HBcuXIFAJCcnAwRQa9evZCRkYGMjAwAwL1797B582ZbieA5EXFTVbXWIoCNa3yWIyikpRl90KBBmjG0ebmtpv+ioiIcOXIEBQUFcHZ2RmBgIMaNG4ef/OQnZsbT5m3Hjh2Lw4cPa89eeeUV5OWZW/Bv3bql1bdhLo8AmALgkDUKDAQwpmVHTb9b/rX0zFoaPXq0Vj8pKQmZmZmorKyEv78/fvGLX2DChAkW2zU0NGDlypXYuXMnjMbWZ+QeHh6IjIzEhg0bMHLkSLNnYWFhZr/z8vKQm5trVlZbW2svbfxncwCVFhS4QFGUD7piOen1evj4+KCurg4k4ezsDJ1Oh5qaGgBAeHg4PvzwQ4wYMQIAcP/+fSQmJmLu3LlISUlBVlYWDAYDDAYDjEYj9Ho9ysvLUVBQgHPnzsHNzQ3p6el49NFHtTErKirg5+eHhoYGq/MKCwtDZmamPXv5dQBBFs3/IvJBV2oHs2bNoqurKxMSElhbW0uTycTs7GxGRkYSAH19fZmXl0cRYUFBAVVV5WOPPcbt27czMTGRSUlJ3L9/P/fu3csDBw4wIyODNTU1LC0t5ZYtWyya7qdMmdKm0dbX17cj79Lfmvx3oSu9B1JSUrhr1y4WFxczJiaGo0ePpru7u9kLLVy4UJO9pk+f3q7V2t3dnUuWLNHkupbpz3/+c7tnK5WVlfbaC6dbszg7zKPAklBqMploMBj4/PPPEwCHDh3a6oXmzZuntU1NTWVwcDC3b99OFxcX6nQ6rly5kkFBQa3aBQQEcNGiRTx27JjZmKmpqWb1vLy8uHr1au7du1crKyoqsktYF5FVlphIIABdk4jhaCbSJJspigInJyds3LgRL730En73u99pe9vf//53PP/881r9iIgInD9/HjqdDgkJCQgJCcG6deuwfv16HDx4EJmZmaiqqoKIoKysDPX19Rg7dqzZmMHBwWZzCwoKwoQJEzBt2jS8/fbbSE9PR48ePezd0oMtUeDU7vScKiws5D/+8Q+uXr2aU6dOpYeHB+fPn2/VpH/58mXOnj2bXl5enDx5MufMmcM5c+ZwwYIFLC8vb/MYwdPTsxXFLlq0iIcOHaKnpycbGhrsXcInLQE4v6tNTE25vLycI0eO1PagJ554gnv37rWp7aVLl7hixQqGhobSz8+PoaGhvHDhQpttpk2bpi3fmJgYRkREUKfT8erVq3z33Xc78g5XLQG4rDsp0Gg08ubNm6yqqurwQZKt7W7cuMFf/vKXzM/P19o1nSd3cNw7TYYFpRmAqwD83mGur3Y6FxkMBuh0Oov1bty4AR8fH3h4eDjMk7WTXrC1ANxVVf1/e6CiKE4tTfWdscTY6x+zZMkSq8+Li4sRFhaGY8eOPSzefGorW6qIrHkQbrhGo5GTJk1iRkZGm/VefvllKorCZcuWsa6ujg8yiYi+lW1QRH7TXUykeV67di0VRWF8fDz1er1WXlhYyOrqat6/f5+ffvopfXx86OvrSwAMCwvj9evX7R7LYDDwxo0bPHXqFPft29eZeZdZAnBBd37F2tpaLl++XNMm3N3d6ePjw4iICA4ZMkQ7klQUhc7OztyxYwdramq4dOlSKopCb29vHjhwwGZGcObMGTo7O2tiTGBgYGed11sB+KwjKastqX7Pnj3s06cPAbBPnz7MzMzk/v37qShKK3nN39+faWlpZv199tln7NevHwEwNjaWNTU17Y5bVFRk1u+aNWs6fGwgIpmWxJiQ5l/T0WcizctmzJiheV9duXJFe/7GG2+YveSYMWNYWFhosb+SkhKtn9jY2HbHNRgM7NmzJ/39/RkfH8+GhobOALjPEoCPdFdYQnp6Or29vTlp0iT+9a9/5f3797WJ/vGPf+T48eMZFxfHiooKq/JfRUUF33zzTbq6unLqVNuUqJKSEppMJkcwkU2t7IGNazq/USfu8nT79m0sXrwYSUlJ6NmzJyZNmoRRo0ZpsiAAGAwG1NXVQa/Xo7q6GlVVVaiqqkJlZSWuX7+O+vp6/OxnP0N8fDymTp0KADAajXBy6vJwkP9SVfUTS1R4oJvFAX788cf08vKyy1O1Z8+ejI2NZXZ2trbM7t69y5iYGCYnJ3f5nEXkUWv2wN90BxNpWVZYWMgpU6bQzc2NW7du5fHjx5mRkcHs7Gzm5+fz5s2bfO2119ivXz/Gx8dr7rrN+1u6dCmHDh1Ko9HI2tpanj9/vqvOnsua+8q0NOmPUxTl344wZ9mrKpHEjh07sG7dOowZMwbBwcFwcXHBt99+i7q6OsTExCAqKgouLi6t2ooIJkyYgC+//BIJCQn49NNP4eXlhYMHD3aFKpeoqupMq0EzInL7QUr5169f57Jlyzh58mQuXLiQp0+fblfW27p1q9kS79+/P1NSUlheXs7Dhw87egnHthknIiIJAGK7W7k8ceIEUlNTMXr0aEyfPh3V1dXIycmBs7MzBg8eDB8fH1RWVgIA/P39zU7VAgMD4e/vj5EjR6Kurg579uxBWVkZnnvuObzxxhuIiopy1DSNAAaqqlrcll/M5AdBeRUVFZpw3Lt3b+p0ulYO6OHh4ayurjZr995773Hw4MGaR76I8ODBg/T09OSAAQNYU1NDkqyrq2vVtgPUd7zdM3OSqi1xII5kIs01jJbAAeDAgQO5adMmM125qe3ly5d5584dighra2sZFxdHRVGoqioPHz6s1Tt9+jSdnJz4zDPPaGFgHZjzi7Z6Zy3vSk2krbJLly5x27Zt/MMf/sBPPvmEFy9etOmF09LSGBwcrIHePIqpqd7UqVMJgCdPnuzI/EpsjvBsDKip5PcgFRQUcP78+WbBhxs2bLDIeN555x0C4K9//Wvm5ORw4cKFXLNmjU3aiYist9fF980HYd6yNWdlZXHRokWtIp5++9vfthn+AIBubm7s0aOH1mb79u3tjVcpIr3tBdBXRCq6k5r0ej3z8/NpMBhanazduXOHn3/+OdeuXdsq/LUpx8bGthnmWlFRYbGdn58f6+vrHUd9zUB8vTuZiIgwOjqarq6uHDBgAIcPH84hQ4bQ09PToqmrebTT6tWrtaVobYyUlBSrfdy4ccOa5eWWiHh0Jj4ut7uYSENDA5944gm79GIXFxd+9NFHNo3xwgsvWOzDzc1NE3fs8dC3FcTw7rq2pMmPGgDj4uI0o6u17OXlxcTERG7bto3btm1r92jTkojUlIODg5mamsoWNtHDDgl/bbyJo0uZwokTJ+jk5KS90Pvvv98qMLFlnjhxImfOnMm0tLR2+1+yZEm71KwoCmfPnt1k5Smx6oXVwaV8uqsoLycnh7179zZ7meTkZBoMBk22GzhwoBYmFhcXZxZI2F765ptvbIpPDgkJYWRkJFVVNS1evDiyKyLVbzmaiVy8eFG7vqR5PnfuHEWER44cIQAeO3aM7u7unDFjBo1GI5cuXcrk5GSbxoiOjrZpPx02bBivXbtGAGu6Kug6VESqHMVEkpOTrRpTm2KHRYRz587lvXv3NDc0e8Y4ffp0mxy8pa/gmTNn/qe9GMLOgjhVRPSdWbJVVVVctmyZxatLmgwHJSUlnVb+jUYjQ0ND7eHqyfjuzsKuTY1HoHp7GUV9fT337Nmj7WfWsr+/P9PT07l8+fJOMaYm1c3GfAyAW7fZ7xopscpWasjKyrLokWoph4WF8cqVK/Tz8+uwG8ft27fp7e1tK3gHAHT/DW+N19sVtcdESktL+fjjj5vpn23l6OhomkwmDh8+nJs2beqQYB4TE2MreNvaCHnrFhD7Nd3m0dbL3b17lz//+c9teql169ZRRJiYmEgnJyeuWLGCX3/9Nevr683uiWnSk8+cOcOzZ89qZUePHrVlnBoA8x8KX6/G4Ox1IlJviWFs3ry5Xa2ief7ggw+09h9//LHmotujRw96eHhw8ODBfPzxxxkWFsZ+/fpxwoQJzMvLI0nW1NRYdEJvzmlDQ0PP9+rV61E8bKlxSf+75dK1R7cFwISEBDPqraio4IcffsjY2FhGRkbyySef5OzZs7l27Vrt0Kkpv/766231rX/mmWfWOeQ2ji6mxpfLy8tLHnvsMbvBA8BXXnmlQ4wjKSnJmmhkAvBPfBc4/f1Iffr0eQTAKgAl9gLo6+ur+U7bKjRnZma2CtppBO4ogPH4Hic3AL8C8G97QFyxYoXNAF67do19+/Zt3r4SQAKAsfiBpbGNjuy5tqhVthyKFxcXc9iwYU2gHQAQje9uQf/Bp0H47l7pdwFkNAJgBqKHhwdzc3MtaRkNjUev/4yLi1sF4D+6RQWzFI3wkIHaF99dBd8X3wU3u8bGxqq7d+9uuku/HMC3AG4qilLXXZHvP6Yf08Ob/g/T1+x0oEKGPAAAAABJRU5ErkJggg==';
		// img = createImage(raw.width,raw.height);
		// img.drawingContext.drawImage(raw,0,0);
		function timebased(argument_values){
			if(document.getElementById("timebased").value == 0){
				var s = function(p){
					p.setup = function(){
						p.createCanvas(window.innerWidth-100,window.innerHeight-320);
						if(retreived_datastore.palettechecker != 1){
							var speechButton = document.getElementById("speech-button");
							var speechButtonPalette = new speechpalette.ActivityPalette(
								speechButton);
						}
						p.mic1 = new p5.AudioIn();
						p.mic1.start();
						p.fft = new p5.FFT();
						p.fft.setInput(p.mic1);
						// p.bg=p.loadImage('images/bg.jpg');
						p.bg = p.loadImage('data:text/xml;base64,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');
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
						time_waveform = p.fft.waveform();
						p.noFill();
						p.beginShape();
						p.stroke(255);
						for (time_i = 0; time_i < time_waveform.length; time_i++){
							time_x = p.map(time_i*p.txp, 0, time_waveform.length, 0, p.width);
							time_y = p.map( time_waveform[time_i]*p.typ, -1, 1, 0, p.height);
							p.vertex(time_x,time_y);
						}
						p.endShape();
					};
					p.windowResized = function(){
						isResized=1
						p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
						document.getElementById("fullscreen-button").addEventListener('click',function(){
							p.resizeCanvas(window.innerWidth-70,window.innerHeight-150);
							document.getElementById("defaultCanvas0").style.marginLeft="33px";
							document.getElementById("defaultCanvas1").style.marginLeft="33px";
						});
						document.getElementById("unfullscreen-button").addEventListener('click',function(){
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
			document.getElementById("timebased2").style.display="none";
			document.getElementById("timebased2").style.width="0px";
			document.getElementById("timebased2").style.height="0px";
			document.getElementById("freqbased2").style.display="none";
			document.getElementById("freqbased2").style.width="0px";
			document.getElementById("freqbased2").style.height="0px";
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
				document.getElementById("freqbased2").style.display="inline";
				document.getElementById("freqbased2").style.width="47px";
				document.getElementById("freqbased2").style.height="47px";
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
					p.setup = function(){
						p.cnv=p.createCanvas(window.innerWidth-100,window.innerHeight-320);
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
						// p.bg = p.loadImage('images/bg.jpg');
						p.bg=dataa;
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
						freq_spectrum = p.fft.analyze();
						p.noStroke();
						p.fill(255, 255, 255);
						for (freq_i = 0; freq_i< freq_spectrum.length; freq_i++){
							freq_x = p.map(freq_i*p.fxp, 0, freq_spectrum.length, 0, p.width);
							freq_h = -p.height + p.map(freq_spectrum[freq_i]*p.fyp, 0, 255, p.height, 0);
							p.rect(freq_x, p.height, p.width / freq_spectrum.length, freq_h )
						}
						p.stroke(255);
					};
			
					p.windowResized = function(){
						isResized=1;
						p.resizeCanvas(window.innerWidth-100,window.innerHeight-200);
						document.getElementById("fullscreen-button").addEventListener('click',function(){
							p.resizeCanvas(window.innerWidth-70,window.innerHeight-140);
							document.getElementById("defaultCanvas0").style.marginLeft="33px";
							document.getElementById("defaultCanvas1").style.marginLeft="33px";
						});
						document.getElementById("unfullscreen-button").addEventListener('click',function(){
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
			document.getElementById("timebased2").style.display="inline";
			document.getElementById("timebased2").style.width="47px";
			document.getElementById("timebased2").style.height="47px";
			freqbased(retreived_datastore);
			retreived_datastore.last_graph=0;
		});
	});
});