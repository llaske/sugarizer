define([
		"sugar-web/activity/activity",
		"messages","print",
		"activity/jquery-1.11.2.min",
		"activity/ol",
		"activity/hammer.min",
		"l10n/l10n",
		"config","colormyworld","map","roll_up_div","util","languagepalette","sugar-web/graphics/colorpalette","filterpalette","modepalette"
	],
	function (activity,messages,print,jquery,ol,hammer,l10n,config,colormyworld,map,rollupdiv,util,languagepalette,colorpalette,filterpalette,modepalette){

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
/*
//Was copying from SpeakActivity ... but taking shortcut now ... just cycle as built
		var datastoreObject = activity.getDatastoreObject();
		var languageButton = document.getElementById("select-language-button");
		var languagePalette = new languagepalette.ActivityPalette(languageButton, datastoreObject);
*/
		print(colormyworld.test());
		print(map.test());
		map.setup_map();
//		colormyworld.change_areaCB(1,INSTALLED['keys'][0]);
//		window.onresize=util.updateTitle;
		let lang=document.webL10n.getLanguage();
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

/*
		var regionButton = document.getElementById("select-region-button");
		var regionLabel = document.getElementById("select-region-label");
		regionButton.onclick = function () {
			print(colormyworld.current);
			var region_idx=INSTALLED['keys'].indexOf(colormyworld.current);
			print(region_idx);
			region_idx+=1;
			print(region_idx);
			if(region_idx>INSTALLED['keys'].length-1)region_idx=0;
			region=INSTALLED['keys'][region_idx];
			print("colormyworld.current="+region);
			regionLabel.innerHTML="Region: "+region;
			colormyworld.change_areaCB(1,region);//keep adding/updating
		}
*/
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
/*
		var filterButton = document.getElementById("filter-button");
		filterpalette = new filterpalette.FilterPalette(filterButton, undefined);
		filterpalette.addEventListener('filter', function() {
			console.log(filterpalette.getFilter());
			// USE: filterpalette.setFilter('europe'); TO CHANGE CURRENT SELECTION
			colormyworld.change_areaCB(true,filterpalette.getFilter());
			filterpalette.popDown();
		});
*/
		var modeButton = document.getElementById("mode-button");
		modepalette = new modepalette.ModePalette(modeButton, undefined);
/*
		modepalette.addEventListener('mode', function() {
			console.log(modepalette.getMode());
			if(modepalette.getMode()=="Tour"){
				console.log("Mode: Tour");
				colormyworld.setMode(1);
			}
			else if(modepalette.getMode()=="Interactive"){
				console.log("Mode: Interactive");
				colormyworld.setMode(2);
			}
			else if(modepalette.getMode()=="Coloring"){
				console.log("Mode: Coloring");
				colormyworld.setMode(0);
			}
			else{
				console.log("Mode: Unknown");
			}
			// USE: modepalette.setMode('tour'); TO CHANGE CURRENT SELECTION
			modepalette.popDown();
		});
*/
/*
		var modeButton = document.getElementById("select-mode-button");
		var modeLabel = document.getElementById("select-mode-label");
		modeButton.onclick = function () {
		    if(colormyworld.getTour()==true){
					colormyworld.setTour(false);
					modeButton.title="Mode: Interactive";
					modeLabel.innerHTML="Mode: Interactive";
				}
				else{
					colormyworld.setTour(true);
					modeButton.title="Mode: Tour"
					modeLabel.innerHTML="Mode: Tour";
				}
//				$(".control_panel").toggleClass("show");
		}
*/
//		filterpalette.setFilter('Africa');
//		modepalette.setMode('Tour');
		colormyworld.change_areaCB(true,'Africa');
/*
		$("#tb").click(function(e){
			print("tb clicked");
			$("#control_panel").toggleClass("hhide");
		});
*/
/*
		var layer_checkboxCB=function(e){
			if(true)console.log(e.target.id);
			var img=e.target;
			var category=e.target.id.split("_")[0];
			category=category.replace("ZZZ"," ");
			var layer_name=e.target.id.split("_")[1];
			layer_name=layer_name.replace("ZZZ"," ");

			if(util.get_basename(img.src)=="checkbox-0.png"){
				img.src="img/checkbox-1.png";
				if(category=="Base Layers"){
					print("Base Layer");
					//window.map.getLayers().insertAt(0, window.app.CATEGORIES[category][layer_name]['layer']);
					//window.app.CATEGORIES[category][layer_name]['toggle']=true;
					colormyworld.change_areaCB(true,layer_name);
				}
				else{
					print("Non Base Layer");
					//window.map.addLayer(window.app.CATEGORIES[category][layer_name]['layer']);
					//window.app.CATEGORIES[category][layer_name]['toggle']=true;
					colormyworld.change_areaCB(true,layer_name);
				}
			}
			else{
				print("removing ..."+e.target.id);
				print(category);
				print(layer_name);
				img.src="img/checkbox-0.png";
				colormyworld.change_areaCB(false,layer_name);
			}
		}
*/
/*
		var make_layer_row=function(category,layer_name){
			if(true)console.log("make_layer_row: "+category+"."+layer_name);
			var rdiv=document.createElement("div");
			var rtab=document.createElement("table");
			rtab.className="layer_table";
			var rrtab=rtab.insertRow(-1);
			var crtab=rrtab.insertCell(-1);

			var layer_label=document.createElement("div");
			layer_label.innerHTML=layer_name;
			layer_label.className="layer_label";
			var id=layer_name+parseInt(1E9*Math.random()).toString();
			layer_label.id=id;
			crtab.className="layer_cell";
			crtab.appendChild(layer_label);

			var crtab=rrtab.insertCell(-1);
			crtab.className="icon_cell";
			var idn=category.replace("_"," ")+"_"+layer_name+"_"+parseInt(1E9*Math.random());
			if(true)console.log("idn="+idn);
			var img=new Image();
			img.id=idn;
			img.className="icon";

			var toggle=false;
			toggle=INSTALLED[layer_name]['toggle'];
			if(toggle){
				img.src="img/checkbox-1.png";
				colormyworld.change_areaCB(true,layer_name);
			}
			else
				img.src="img/checkbox-0.png";

			crtab.appendChild(img);
			img.addEventListener("click",layer_checkboxCB,false);

			var crtab=rrtab.insertCell(-1);
			crtab.className="icon_cell";
			var idn=category+"_"+layer_name+"_hamburger_"+parseInt(1E9*Math.random());
			var img=new Image();
			img.id=idn;
			img.className="icon";
			img.src="img/interface-1.png";
			crtab.appendChild(img);
//			img.addEventListener("click",me.popoutCB,false);


			rdiv.appendChild(rtab);
			return rdiv;
		}
*/
/*
		$("#control_panel").append(util.make_hr("hr0"));
		var category="Regions";
		var opts={
			'category':category,
			'parent_id':'control_panel',
			'id':category.replace("_"," "),
			'className':'roll_up_div',
			'roll_up_class':'rollup',
			'roll_up_name':category.replace("_"," "),
			'arrow_img':'img/arrow.png',
			'roll_up_icon_src':'img/arrow.png',
		};
		var rollup=new RollUpDiv(opts);
		var lt=document.createElement("table");//lt=LayersTable
		lt.className="layer_table";
		var layer_names=INSTALLED['keys'];
		for(var lidx=0;lidx<layer_names.length;lidx++){
			var layer_name=layer_names[lidx];
			var r=lt.insertRow(-1);
			var c=r.insertCell(-1);
			c.appendChild(make_layer_row(category,layer_name));
		}
		rollup.rollup.appendChild(lt);
		$("#control_panel").append(util.make_hr("hr1"));
*/
	});
});
