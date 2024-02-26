define([
		"sugar-web/activity/activity",
		"messages","print",
		"jquery.min",
		"activity/ol",
		"activity/hammer.min",
		"webL10n",
		"config","colormyworld","map","roll_up_div","util","languagepalette","sugar-web/graphics/colorpalette","filterpalette","modepalette","tutorial","sugar-web/env"
	],
	function (activity,messages,print,jquery,ol,hammer,webL10n,config,colormyworld,map,rollupdiv,util,languagepalette,colorpalette,filterpalette,modepalette,tutorial,env){

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		print(colormyworld.test());
		print(map.test());
		map.setup_map();
//		colormyworld.change_areaCB(1,INSTALLED['keys'][0]);
//		window.onresize=util.updateTitle;

		document.webL10n.getLanguage();
		if(typeof('lang')=='undefined'){
			print("setting english");
			lang='en';
			document.webL10n.getLanguage(lang);
		}

		var stopButton = document.getElementById("stop-button");
		stopButton.addEventListener('click', function (event) {
			console.log("writing...");
			var datastoreObject = activity.getDatastoreObject();
			var jsonData = colormyworld.saveStateCB();
			datastoreObject.setDataAsText(jsonData);
			datastoreObject.save(function (error) {
				if (error === null) {
					console.log("write done.");
				}
				else {
					console.log("write failed.");
				}
			});
		});

		var updateTitle=window.onresize=function(){
			activity.getDatastoreObject().getMetadata(function(error,metadata){
				var d = new Date().getTime();
				if (Math.abs(d-metadata.creation_time)>=2000){
					var datastoreObject = activity.getDatastoreObject();
					datastoreObject.loadAsText(function (error, metadata, data) {
						colormyworld.loadStateCB(data);
					});
				}
			});
			var app_name=document.webL10n.get('appname');
			if (app_name == "{{appname}}") app_name = '';
			var app_title=app_name.split('');
			var persistent_title_div=document.getElementById("persistent_title_div");
			html="";
			for(var tidx=0;tidx<app_title.length;tidx++){
				var rand_color=colormyworld.mkBrightRGBA();
				html+="<span style='text-shadow:none;font-family:Mickey;color:"+rand_color+";'>"+app_title[tidx]+"</span>";
			}
			persistent_title_div.innerHTML=html;
			util.resize();
		}
		window.setTimeout(updateTitle,1000);

		var runButton = document.getElementById("run-button");
		runButton.onclick = function () {
			colormyworld.toggleRunning();
		}

		colormyworld.setRGBColorString('rgb(0, 150, 0)');
		var colorButton = document.getElementById("color-button");
		var changeColorPalette = new colorpalette.ColorPalette(colorButton);
		changeColorPalette.setColor(colormyworld.getRGBColorString()); // Initial color
		changeColorPalette.addEventListener('colorChange', function(e) {
			print(e.detail.color); // New color selected
			colormyworld.setRGBColorString(e.detail.color);
		});

		var modeButton = document.getElementById("mode-button");
		modepalette = new modepalette.ModePalette(modeButton, undefined);
		colormyworld.change_areaCB(true,'World');
		});
		// Full screen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
		});

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		env.getEnvironment(function(err, environment) {
			currentenv = environment;

			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			document.webL10n.setLanguage(language);

		});
	});
