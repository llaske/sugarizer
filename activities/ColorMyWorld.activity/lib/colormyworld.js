define(["activity/ol","util","print","l10n/l10n",],function(ol,util,print,l10n){
	var me={};
	me.popup=document.createElement("div");
	me.popup.id="popup";
	me.test=function(){return 'ColorMyWorld';}
	//me.current = INSTALLED["keys"][0];
	me.currents=[];
	me.collective_bbox=[];
	me.current_feature=null;
	me.last_timeout=null;
	me.mode=COLORING;
	me.DELAY=1500.;
	me.RUNNING=false;

	me.saveStateCB=function(){
		print("saveStateCB");
		//create a json-serializable structure which can be used to orchestrate
		//reconstruction of state in loadStateCB.   We'll save it in global memory
		//while developing, so can wreck state in any way, then push reload-stateB
		//and get back to the same thing.
		var state={}
		state['currents']=me.currents;
		state['lang']=document.webL10n.getLanguage();
		state['mode']=me.mode;
		state['cmw_bg']=me.background_color;
		//Now dictionary of features with: color, candidate=t/f
		//So loop over all features:
		state['features']=me.loopOverAllFeatures("get",{});

		var stateObj=JSON.stringify(state);
		return stateObj;
	}
	me.loopOverAllFeatures=function(directive,stateFeatures){
		print("loopOverAllFeatures:"+directive);
		print("loopOverAllFeatures:"+stateFeatures);

		var categories=me.CATEGORIES['keys'];
		for(var cidx=0;cidx<categories.length;cidx++){
			var category=categories[cidx];
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				print("loopOverAllFeatures.layer_names: "+layer_name);
				var features=me.CATEGORIES[category][layer_name]['source'].getFeatures();
				print("features: "+features);
				print("features.length: "+features.length);
				for(var fidx=0;fidx<features.length;fidx++){
					var feature_name=null;
					feature_name=features[fidx].get("Name");
					if(!feature_name)feature_name=features[fidx].get("NAME");
					if(!feature_name)feature_name=features[fidx].get("name");
					print("loopOverAllFeatures.features: "+feature_name);
					if(directive=='get'){
							print("GET "+feature_name);
							var f=me.CATEGORIES[category][layer_name]['features'][feature_name];
							//f['feature'].setStyle(me.random_styles[0]);
							var default_fill=INSTALLED[category]["polygon_sources"][0]["fill"];
							stateFeatures[feature_name]={
								'candidate':f['candidate'],
								'stroke_color':INSTALLED[category]["polygon_sources"][0]["color"],
								'stroke_width':INSTALLED[category]["polygon_sources"][0]["width"],
								'fill_color':INSTALLED[category]["polygon_sources"][0]["fill"],
							}
							if(f['feature'].getStyle()){
								print(feature_name+" stroke_color="+f['feature'].getStyle().getStroke().getColor());
								print(feature_name+" stroke_width="+f['feature'].getStyle().getStroke().getWidth());
								print(feature_name+" fill_color="+f['feature'].getStyle().getFill().getColor());
								stateFeatures[feature_name]['stroke_color']=f['feature'].getStyle().getStroke().getColor();
								stateFeatures[feature_name]['stroke_width']=f['feature'].getStyle().getStroke().getWidth();
								stateFeatures[feature_name]['fill_color']=f['feature'].getStyle().getFill().getColor();
							}
					}
					else if(directive=='set'){
						print("SET "+feature_name);
						var f=stateFeatures[feature_name];
						me.CATEGORIES[category][layer_name]['features'][feature_name]['candidate']=f['candidate'];
//						var ridx=parseInt(Math.random()*(me.random_styles.length-1));
//						print("WE HAVE: "+me.CATEGORIES[category][layer_name]['features'].length);
						var reload_style=new ol.style.Style({
									fill: new ol.style.Fill({
										color: f['fill_color']
								}),
									stroke:new ol.style.Stroke({
										color: f['stroke_color'],
										width: f['stroke_width']
									}),
							});
						me.CATEGORIES[category][layer_name]['features'][feature_name]['feature'].setStyle(reload_style);
					}
				}
			}
		}
		return stateFeatures;
	}

	me.sleep=function(ms) {
		//return new Promise(resolve => setTimeout(resolve, ms));
	  return new Promise(function(resolve) { setTimeout(resolve, ms); });
	}

	me.loadStateCB=function(stateObj){
		//in order to reload, we make use of everything we've already developed
		//and then go back and apply color and candidacy, only.  Saving state
		//thus means modes, langs and a list of feature_name:color, candidacy pairs.
		print("loadStateCB");
		var state=null;
		if(stateObj!=null){
			state=JSON.parse(stateObj);
		}
		if(!state)return;
		print("Loading: "+state);
		me.currents=state['currents'];
		for(var cidx=0;cidx<state['currents'].length;cidx++){
			me.change_areaCB(1,state['currents'][cidx]);
		}

		var regionNum=me.getRegion();
		document.getElementById("regionlabel").src=REGION_ICONS[regionNum];

		me.mode=state['mode'];
		var modeNum=me.getMode();
		document.getElementById("modelabel").innerHTML=MODE_NAMES[modeNum];

		document.webL10n.setLanguage(state['lang']);
		var languageNum=LANGUAGE_NAMES["keys"].indexOf(state['lang'])
		document.getElementById("languagelabel").innerHTML=(languageNum!=-1 ? LANGUAGE_NAMES[LANGUAGE_NAMES["keys"][languageNum]]:"English");

		me.set_background(state['cmw_bg'])

		print("sleeping 2000");
//		me.sleep(2000).then(()=>{
		me.sleep(2000).then(function(){
			print("continuing");
			dummy=me.loopOverAllFeatures("set",state['features']);
			me.updateTitle();
		});


	}
	me.mkBrightRGBA=function(){
		var R_CHANNEL=parseInt(Math.random()*255);
		var G_CHANNEL=parseInt(Math.random()*255);
		var B_CHANNEL=parseInt(Math.random()*255);

		if(R_CHANNEL+G_CHANNEL+B_CHANNEL<300){
			var dice=parseInt(Math.random()*3);
			if(dice==0)B_CHANNEL=255;
			else if(dice==1)R_CHANNEL=255;
			else if(dice==2)G_CHANNEL=255;
			else{;}
		}

		var A_CHANNEL=255;
		var rval="RGBA("+R_CHANNEL+","+G_CHANNEL+","+B_CHANNEL+","+A_CHANNEL+")";
		return rval;
	}
	me.updateTitle=function(){
		var app_name=document.webL10n.get('appname');
		var app_title=app_name.split('');
		var persistent_title_div=document.getElementById("persistent_title_div");
		html="";
		for(var tidx=0;tidx<app_title.length;tidx++){
			var rand_color=me.mkBrightRGBA();
			html+="<span style='text-shadow:none;font-family:Mickey;color:"+rand_color+";'>"+app_title[tidx]+"</span>";
		}
		persistent_title_div.innerHTML=html;
		util.resize();
	}

	me.setMode=function(val){
		me.mode=val;
	}
	me.getMode=function(){
		return me.mode;
	}
	me.getRegion=function(){
		return REGION_NAMES.indexOf(me.currents[0]);
	}
	me.background_color='rgb(0,120,255)';
	me.rgbColorString='rgb(255,255,255)';
	me.setRGBColorString=function(val){me.rgbColorString=val;}
	me.getRGBColorString=function(){return me.rgbColorString;}
	me.set_background=function(val){//called by map.on('click') & loadStateCB
		if(!val)
			me.background_color=me.getRGBColorString();
		else
			me.background_color=val;
		document.getElementById("cmw_bg").style.backgroundColor=me.background_color;
	}
	me.getRunning=function(){return me.RUNNING};
	me.BASE_SOURCES={
		'OpenStreetMap2':new ol.source.OSM(),
	};
	me.CATEGORIES={
		'keys':[],
		'Base Layers':{
			'keys':['OpenStreetMap2'],
			'OpenStreetMap2':{
				'type':'tile',
				'api':'ol.layer.Tile',
				'layer':new ol.layer.Tile({preload:14,opacity:1.0,title:'OpenStreetMap2',source:me.BASE_SOURCES['OpenStreetMap2']}),
				'source':me.BASE_SOURCES['OpenStreetMap2'],
				'feature_names':[],
				'style':null,
				'colors':{},
				'toggle':false,
			},
		},
	};
	me.resize=function(){
		print("resize");
		var W=window.innerWidth;
		var H=window.innerHeight;
		var res=util.computeResolution(me.collective_bbox,false,W,H);
		window.map.getView().setResolution(res);
	}
	me.get_enabled_candidates=function(){
		print("get_enabled_candidates");
		var category='';
		var layer_name='';
		var candidates=[];
		var keys=me.CATEGORIES['keys'];
		for(var kidx=0;kidx<keys.length;kidx++){
			var category=keys[kidx];
			if(true)print("checking "+category);
			var layer_names=me.CATEGORIES[category]['keys'];
			if(true)print("layer_names="+layer_names+" "+typeof(layer_names));
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				if(true)print("checking "+category+"."+layer_name);
			}
		}//length=1 but using loop to set values
		var candidate_names=[];
		for(var fidx=0;fidx<me.CATEGORIES[category][layer_name]['feature_names'].length;fidx++){
			if(me.CATEGORIES[category][layer_name]['features'][me.CATEGORIES[category][layer_name]['feature_names'][fidx]]['candidate']){
				candidate_names.push(me.CATEGORIES[category][layer_name]['feature_names'][fidx]);
			}
		}
		if(candidate_names.length>0){
		var fidx=parseInt(Math.random()*candidate_names.length);
		f=me.CATEGORIES[category][layer_name]['features'][candidate_names[fidx]];
		return [{'category':category,'layer_key':layer_name,'feature_name':candidate_names[fidx]}]
		}
		else return [];
	}
	me.reinit_candidates=function(){
		print("reinit_candidates");
		var keys=me.CATEGORIES['keys'];
		for(var kidx=0;kidx<keys.length;kidx++){
			var category=keys[kidx];
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				if(me.CATEGORIES[category][layer_name]['toggle']){
					var feature_names=me.CATEGORIES[category][layer_name]['feature_names'];
					for(var fidx=0;fidx<feature_names.length;fidx++){
						var feature_name=feature_names[fidx];
						me.CATEGORIES[category][layer_name]['features'][feature_name]['candidate'] = true;
					}
				}
			}
		}
	}
	me.change_areaCB=function(add,region){

		print("change_areaCB");

		if(region=="OpenStreetMap2" && add==true){
			window.map.getLayers().insertAt(0, me.CATEGORIES["Base Layers"]['OpenStreetMap2']['layer']);
			return;
		}
		else if(region=="OpenStreetMap2" && add==false){
			window.map.removeLayer(me.CATEGORIES["Base Layers"]['OpenStreetMap2']['layer']);
			return;
		}
		if(me.RUNNING==true)
			me.toggleRunning();
		me.currents=[region];//just blow-away the list and replace with new region

		print("me.currents="+me.currents);

//Wipe-em all out here (keeping) ... rebuild (multiple) below
		for(var cidx=0;cidx<me.CATEGORIES['keys'].length;cidx++){
			category=me.CATEGORIES['keys'][cidx];
			for(var lidx=0;lidx<me.CATEGORIES[category]['keys'].length;lidx++){
				var layer_name=me.CATEGORIES[category]['keys'][lidx];
				print("removing layer: "+layer_name);
				window.map.removeLayer(me.CATEGORIES[category][layer_name]['layer']);
				delete(me.CATEGORIES[category][layer_name]);
				print("removing "+category+" BOUNDARY");
				window.map.removeLayer(me.CATEGORIES[category]['BOUNDARY']['layer']);
				delete(me.CATEGORIES[category]['BOUNDARY']['layer']);
			}
			delete(me.CATEGORIES[category]);
		}
		me.CATEGORIES['keys']=[];

		try{
			for(var cidx=0;cidx<me.currents.length;cidx++){
			print("Removing layer: BOUNDARY");
			window.map.removeLayer(me.CATEGORIES[me.currents[cidx]]['BOUNDARY']['layer']);
			delete(me.CATEGORIES[me.currents[cidx]]['BOUNDARY']);
			}
		}
		catch(e){/*if(true)print(e);*/}

		//Refill layers structure
		var rval=me.prepare_layers();

		print("Adding BOUNDARY layers");
		for(var cidx=0;cidx<me.currents.length;cidx++){
			window.map.addLayer(me.CATEGORIES[me.currents[cidx]]['BOUNDARY']['layer']);
		}

		var keys=me.CATEGORIES['keys'];
		for(var kidx=0;kidx<keys.length;kidx++){
			var category=keys[kidx];
			if(true)print('Adding '+me.CATEGORIES[category]['keys'].length);
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				print("Adding layer: "+layer_name);
				window.map.addLayer(me.CATEGORIES[category][layer_name]['layer']);
			}
		}
		//NEED:compute new center from extrema of currents bboxes:
		var xmin=200;
		var ymin=200;
		var xmax=-200;
		var ymax=-200;
		for(var cidx=0;cidx<me.currents.length;cidx++){
			var bbox=INSTALLED[me.currents[cidx]]["bbox"];
			if(bbox[0]<xmin)xmin=bbox[0];
			if(bbox[1]<ymin)ymin=bbox[1];
			if(bbox[2]>xmax)xmax=bbox[2];
			if(bbox[3]>ymax)ymax=bbox[3];
		}
		var collective_center=[(xmin+xmax)/2.,(ymin+ymax)/2.];
		me.collective_bbox=[xmin,ymin,xmax,ymax];
		window.map.getView().setCenter(ol.proj.transform(collective_center, 'EPSG:4326', 'EPSG:3857'));

		//resize (calls set res)
		me.resize();

		if(me.currents[0]=="World"){
			print("setting timeout to 2000");//both cases equal since recursive now
			window.setTimeout(me.fill_all_features,2000,false);
		}
		else{
			print("setting timeout to 2000")
			window.setTimeout(me.fill_all_features,2000,false);
		}
	}//me.change_areaCB

	me.fill_all_features=function(){
		print("fill_all_features");
		var categories=me.CATEGORIES['keys'];
		for(var cidx=0;cidx<categories.length;cidx++){
			var category=categories[cidx];
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				var features=me.CATEGORIES[category][layer_name]['source'].getFeatures();
				if(true)print("features.length="+features.length);
				if(features.length==0){
					print("calling self recursively by timeout");
					window.setTimeout(me.fill_all_features,2000,false);
					return;
				}
				for(var fidx=0;fidx<features.length;fidx++){
					var feature_name=null;
					feature_name=features[fidx].get("Name");
					if(!feature_name)feature_name=features[fidx].get("NAME");
					if(!feature_name)feature_name=features[fidx].get("name");
					if(true)print(feature_name);
					me.CATEGORIES[category][layer_name]['features'][feature_name]={
						'feature':features[fidx],
						'candidate':true,
						'color':'rgb(0,0,0)',
					}
					me.CATEGORIES[category][layer_name]['feature_names'].push(feature_name);
				}
			}
		}
//		window.control_panel.rebuild();
	}

	me.prepare_layers=function(){
		print("me.prepare_layers: "+me.currents);

		me.LAYERS={'keys':[],}
		for(var cidx=0;cidx<me.currents.length;cidx++){
		for(var pidx=0; pidx<INSTALLED[me.currents[cidx]]["polygon_sources"].length;pidx++){
			var src_url=INSTALLED[me.currents[cidx]]["path"] + INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["filename"];

			//Non-serializable object #1:
			var polygon_source=new ol.source.Vector({
				url: src_url,
				format: new ol.format.GeoJSON()
			});
			//Non-serializable object #2:
			var polygon_layer= new ol.layer.Vector({
				updateWhileAnimating:true,//true=performance impact!
				source: polygon_source,
				style:new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["color"],
						width: INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["width"]
					}),
					fill: new ol.style.Fill({
						color: INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["fill"],
					})
				}),
			});
			polygon_layer.set("type","Polygon");


			var category=INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["category"];
			var layer_name=INSTALLED[me.currents[cidx]]["polygon_sources"][pidx]["layer_name"];
			polygon_layer.set("layer_name",layer_name);

			if(me.CATEGORIES['keys'].indexOf(category)<0){
				if(true)print("new category: "+category);
				me.CATEGORIES['keys'].push(category);
				me.CATEGORIES[category]={'keys':[],};
			}
			me.CATEGORIES[category]['keys'].push(layer_name);
			me.CATEGORIES[category][layer_name]={
				'layer':polygon_layer,'source':polygon_source,feature_names:[],'features_off':[],
				features:polygon_source.getFeatures(),'style':null,'colors':{},'toggle':true,'type':'Polygon'
			};
		}//pidx
		}//cidx

//BOUNDARY LAYERS
		for(var cidx=0;cidx<me.currents.length;cidx++){
		var boundary_source=new ol.source.Vector({
			url: INSTALLED [me.currents[cidx]]["path"] + 'boundary.geojson',
			format: new ol.format.GeoJSON()
		});
		var boundary_layer = new ol.layer.Vector({
			source: boundary_source,
			style:new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: INSTALLED[me.currents[cidx]]["color"],
					width: INSTALLED[me.currents[cidx]]["width"]
				}),
				fill: new ol.style.Fill({
					color: INSTALLED[me.currents[cidx]]["fill"],
				}),
			}),
		});

		me.CATEGORIES[me.currents[cidx]]['BOUNDARY']={
			'api':'ol.layer.Vector',
			'layer':boundary_layer,
			'source':boundary_source,
			'feature_names':[],
			'features_off':[],
			'features':{},
			'style':null,
			'colors':{},
			'toggle':true,
			'type':'Polygon',
		};
		}

		if(true)print("prepare_layers done");
		return 1;

	}//END:me.prepare_layers

//GAME ORCHESTRATION:
	me.setRunning=function(val){
		me.RUNNING=val;
	}
	me.toggleRunning=function(){
		if (me.mode==COLORING) {
			me.setMode(TOUR);
			document.getElementById("modelabel").innerHTML=document.webL10n.get(MODE_NAMES[me.mode]);
		}
		if(me.RUNNING==true){
			print("stopMove");
			me.setRunning(false);
			$("#run-button").toggleClass("running");
			$("#run-button").title="Play";
		}
		else{
			print("startMove");
			me.setRunning(true);
			me.startMove();
			$("#run-button").toggleClass("running");
			$("#run-button").title="Pause";
		}
	}
	me.startMove=function(feature){

		if(me.RUNNING==false)return;

		if(true)print("startMove");

		try{window.clearTimeout(me.last_timeout);}
		catch(e){if(true)print(e);}

		if(!feature){

			var candidates=me.get_enabled_candidates();

			if(candidates.length==0){
				print("returning me.end_game()");
				return me.end_game();
			}

			if(true)print("me.startMove no feature passed so selecting");

			var ridx=parseInt(Math.random()*candidates.length);
			if(true)print("cycling ridx="+ridx.toString()+"/"+candidates.length);

			var candidate_names=[];
			for(var cidx=0;cidx<candidates.length;cidx++)
				candidate_names.push(candidates[cidx]['feature_name']);
			print("candidates="+candidate_names);

			for(var dummy=0;dummy<ridx;dummy++){
				//if(true)print(dummy+"/"+ridx);
				candidates.push(candidates.shift());
			}
			if(true)print("shifting me.current_feature");
			me.current_feature=candidates.shift();//should check if getting what was intended

		}
		else{
			if(true)print("me.startMove with feature passed");
		}

		var target_name=null;
		target_name=me.current_feature['feature_name'];

		var target_layer_name=document.webL10n.get(me.current_feature['layer_key']);

		var xhtml="<center><h3>Next:</h3><h1>"+document.webL10n.get(target_name.replace(/ /g,'_')).replace(/_/g,' ')+"</h1><h3>"+target_layer_name+"</h3></center>";
		if(me.mode==TOUR){
			xhtml="<center><h3>"+util.descore(document.webL10n.get(util.enscore('Next')))+":</h3><h1>"+util.descore(document.webL10n.get(util.enscore(target_name)))+"</h1><h3>"+target_layer_name+"</h3></center>";
		} else if (me.mode==INTERACTIVE) {
			xhtml="<center><h3>"+util.descore(document.webL10n.get(util.enscore('Find')))+":</h3><h1>"+util.descore(document.webL10n.get(util.enscore(target_name)))+"</h1><h3>"+target_layer_name+"</h3></center>";
		}
		if(true)print("me.startMove:"+target_name+" "+target_layer_name);
		me.showPopup(xhtml);
	}
	me.showPopup=function(xhtml){
		while(me.popup.childNodes.length>0){
			try{me.popup.removeChild(me.popup.childNodes[0]);}
			catch(e){if(true)print(e);}
		}
		me.popup.innerHTML="";

		var info_div=document.createElement("div");
		info_div.classname="info_div";
		info_div.innerHTML=xhtml;

		me.popup.appendChild(info_div);
		if(me.current_feature){
		target_name=me.current_feature['feature_name'];
		print("ADD IMAGE HERE:"+target_name);
		var country_img=new Image();
		country_img.src="country_img/"+target_name+".png";
//
		country_img.onload=function(){
		var iW=country_img.width;
		var iH=country_img.height;
		print("iW="+iW);
		print("iH="+iH);
		if(iW>iH){
			print("iW>iH");
			country_img.style.width=270+"px";
			country_img.style.height=parseInt(270*iH/iW)+"px";
		}
		else{
			print("iW<iH");
			country_img.style.height=270+"px";
			country_img.style.width=parseInt(270*iW/iH)+"px";
		}
		me.popup.appendChild(country_img);

		//these need to go into ggmc.css
		me.popup.style.left=(window.innerWidth/2-300/2)+"px";
		me.popup.style.top=(window.innerHeight/2-200)+"px";
		me.popup.style.width=(300)+"px";
		//me.popup.style.height=(200)+"px";
		me.popup.style.opacity=0.0;
		document.body.appendChild(me.popup);
		$("#popup").animate(
			{opacity:1.0},
			me.DELAY,
			function(){
				me.last_timeout=window.setTimeout(me.popdown,1*me.DELAY);
			}
		);
		}//
		}//if(!me.current_feature)
		else{
			//these need to go into ggmc.css
			me.popup.style.left=(window.innerWidth/2-300/2)+"px";
			me.popup.style.top=(window.innerHeight/2-200)+"px";
			me.popup.style.width=(300)+"px";
			//me.popup.style.height=(200)+"px";
			me.popup.style.opacity=0.0;
			document.body.appendChild(me.popup);
			$("#popup").animate(
				{opacity:1.0},
				me.DELAY,
				function(){
					me.last_timeout=window.setTimeout(me.popdown,1*me.DELAY);
				}
			);
		}
	}
	me.popdown=function(e){

		if(true)print("popdown");
		try{window.clearTimeout(me.last_timeout);}
		catch(e){}

		$("#popup").animate(
			{opacity:0.0},
			me.DELAY,
			function(){

				try{document.body.removeChild(me.popup);}
				catch(e){;}

				if(me.mode==TOUR && me.current_feature!=null){

					var f=me.current_feature;
					var category=f['category'];
					var layer_name=f['layer_key'];
					var feature_name=f['feature_name'];

					var bbox=me.CATEGORIES[category][layer_name]['features'][feature_name]['feature'].getGeometry().getExtent();

					var center_of_feature=[(bbox[0]+bbox[2])/2.,(bbox[1]+bbox[3])/2.];
					me.pan_zoom(center_of_feature);
				}
				if(me.mode==TOUR && me.current_feature==null){
					me.toggleRunning();
				}
			}
		);
	}

	me.end_game=function(){
		try{document.body.removeChild(me.popup);}
		catch(e){if(true)print("me.end_game");}

		var xhtml='<center><h1>Congratulations!<br>You Finished!</h1></center>';
		if(document.webL10n.getLanguage()!='en-us'){
			xhtml='<center><h1>'+util.descore(document.webL10n.get('Congratulations'))+'!<br>';
			xhtml+=util.descore(document.webL10n.get('You_Finished'))+'!</h1></center>';
		}
		print(xhtml);
		me.toggleRunning();
		me.setMode(COLORING);
		me.reinit_candidates();
		document.getElementById("modelabel").innerHTML=document.webL10n.get(MODE_NAMES[me.mode]);
		me.showPopup(xhtml);
		//NEED:game stats
//		document.getElementById("playB").innerHTML='<img src="./static/ggmc/img/flaticon/play.png" class="icon"/>';
	}

	me.random_styles=[];
	for(var dummy=0;dummy<NUM_COLORS;dummy++){
		var random_style=new ol.style.Style({
			fill: new ol.style.Fill({
				color: me.mkBrightRGBA()
			}),
			stroke:new ol.style.Stroke({color: DEFAULT_STROKE,width: 1}),
		});
		me.random_styles.push(random_style);
	}

	me.check_feature = function(pixel) {
		if(!me.current_feature){
			print("check_feature: No Current Feature ... returning")
			return;
		}
		print("check_feature:"+me.current_feature['feature_name']);

		if(true)print("me.check_feature clearing last_timeout");
		window.clearTimeout(me.last_timeout);

		var feature;
		var features=[];
		var found=false;

		if(!pixel && me.mode==TOUR){

			var category=me.current_feature['category'];
			var layer_name=me.current_feature['layer_key'];
			var feature_name=me.current_feature['feature_name'];

			features.push(me.CATEGORIES[category][layer_name]['features'][feature_name]['feature']);
		}
		else{

			dummy=window.map.forEachFeatureAtPixel(pixel,function(feature,layer){
				var target_name=null;
				target_name=feature.get("NAME");
				if(!target_name)target_name=feature.get("Name");
				if(!target_name)target_name=feature.get("name");
				if(true)print("returning: "+target_name);
				features.push(feature);
			});
		}
		print("features.length="+features.length);
		if(features.length>0 && !found){

			for(var fidx=0;fidx<features.length;fidx++){

				feature=features[fidx];
				var category=me.current_feature['category'];
				var target_name=null;
				target_name=me.current_feature['feature_name'];
				target_layer=me.current_feature['layer_key'];
				if(true)print(fidx.toString()+" "+target_layer+"."+target_name);
				target_feature=me.CATEGORIES[category][target_layer]['features'][target_name]['feature'];
				if(feature==target_feature){

					if(true)print("***** Correct! *****");

					if(me.CATEGORIES[category][target_layer]['type']=="Point"){
						feature.setStyle(util.point_correct_style);
					}
					else{
						var ridx=parseInt(Math.random()*me.random_styles.length);
						feature.setStyle(me.random_styles[ridx]);
					}

					found=true;

					//toggle as candidate
					me.CATEGORIES[category][me.current_feature['layer_key']]['features'][target_name]['candidate']=false;

					//delete(me.current_feature);
					me.current_feature=null;

					if(me.mode==TOUR){
						if(true)print("check_feature setting timeout for pan_zoom_home");
						me.last_timeout=window.setTimeout(me.pan_zoom_home,2*me.DELAY);
					}
					else{
						window.setTimeout(me.startMove,2*me.DELAY);
					}
					return;
				}
				else{
					var feature_name=null;
					feature_name=feature.get("NAME");
					if(!feature_name)feature_name=feature.get("Name");
					if(!feature_name)feature_name=feature.get("name");
					if(true)print(feature_name+" != "+target_feature.toString());
				}

			}

			if(true)print("starting move passing feature: "+target_name);
			me.startMove(feature);
		}
		else{
			if(true)print("game over");
		}
	}
	me.flyTo=function(location,res, done) {
		var view=window.map.getView();
		var duration = me.DELAY;//2000;
		var zoom = view.getZoom();
		var resolution=view.getResolution();
		var parts = 2;
		var called = false;
		function callback(complete) {
			--parts;
			if (called) {
				return;
			}
			if (parts === 0 || !complete) {
				called = true;
				done(complete);
			}
		}
		view.animate({
			center: location,
			duration: duration
		}, callback);
		if(resolution>res){
		view.animate({
			//zoom:zoom-1,
			resolution:resolution*1.05,
			duration: duration*.25
		}, {
			//zoom: zoom,
			resolution:res,
			duration: duration*.75
		}, callback);
		}
		else{
			view.animate({
				resolution:res*1.05,
				duration: duration*.75
			},{
				resolution:res,
				duration:duration*.25
			}, callback);
		}
	}//flyTo

	me.pan_zoom=function(location){

			if(true)print("pan_zoom: "+location);
			var this_delay=2*me.DELAY;
			var f=me.current_feature;
			var category=f['category'];
			var layer_name=f['layer_key'];
			var feature_name=f['feature_name'];

			var bbox=me.CATEGORIES[category][layer_name]['features'][feature_name]['feature'].getGeometry().getExtent();
			var res=util.computeResolution(bbox,true,window.innerWidth,window.innerHeight);
			res*=1.2;
			if(res==0)res=100;

			me.flyTo(location,res,function(){});

			if(me.current_feature != null){
				try{window.clearTimeout(me.last_timeout);}//avoid chrome crash?
				catch(e){if(true)print(e);}
				if(true)print("pan_zoom setting timeout for check_feature");
				me.last_timeout=window.setTimeout(me.check_feature,this_delay);
			}
			else{
				try{window.clearTimeout(me.last_timeout);}//avoid chrome crash?
				catch(e){if(true)print(e);}
				if(true)print("pan_zoom calling start_move directly");
				me.start_move(null);
			}
		}
	me.pan_zoom_home=function(){
		if(true)print("bounce_home");

		var this_delay=2*me.DELAY;
		var W=window.innerWidth;
		var H=window.innerHeight;
		var bbox=me.collective_bbox;
		var res=util.computeResolution(bbox,false,W,H);
		var location=ol.proj.transform([(bbox[0]+bbox[2])/2.,(bbox[1]+bbox[3])/2.],"EPSG:4326","EPSG:3857");

		me.flyTo(location,res,function(){});

		try{window.clearTimeout(me.last_timeout);}//avoid chrome crash?
		catch(e){if(true)print(e);}
		if(true)print('pan_zoom_home setting timeout for start_move');
		me.last_timeout=window.setTimeout(me.startMove,me.delay);
	}
	window.colormyworld=me;
	return me;
});
