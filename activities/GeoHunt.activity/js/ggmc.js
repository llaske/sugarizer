var GGMC=function(div_id,control_panel_id){

	var me={};
	me.popup=document.createElement("div");
	me.popup.id="popup";
	me.popup.className="popup";

	me.div_id = div_id;
	me.control_panel_id=control_panel_id;
	me.tour=true;
	me.last_timeout=null;

	me.current = INSTALLED["keys"][0];

	me.BASE_ENABLED=false;
	BASE_SOURCES={
		'Satellite':new ol.source.MapQuest({layer:'sat'}),
		'OpenStreetMap':new ol.source.MapQuest({layer:'osm'}),
		'OpenStreetMap2':new ol.source.OSM(),
	};
	me.CATEGORIES={
		'keys':[],
		'Base Layers':{
			'keys':['OpenStreetMap2'],//'Satellite','OpenStreetMap',
			'Satellite':{
				'type':'tile',
				'api':'ol.layer.Tile',
				'layer':new ol.layer.Tile({minResolution:500,preload:14,opacity:1.0,title:'Satellite',source:BASE_SOURCES['Satellite']}),
				'source':BASE_SOURCES['Satellite'],
				'feature_names':[],
				'style':null,
				'colors':{},
				'toggle':true,
			},
			'OpenStreetMap':{
				'type':'tile',
				'api':'ol.layer.Tile',
				'layer':new ol.layer.Tile({preload:14,opacity:1.0,title:'OpenStreetMap',source:BASE_SOURCES['OpenStreetMap']}),
				'source':BASE_SOURCES['OpenStreetMap'],
				'feature_names':[],
				'style':null,
				'colors':{},
				'toggle':false,
			},
			'OpenStreetMap2':{
				'type':'tile',
				'api':'ol.layer.Tile',
				'layer':new ol.layer.Tile({preload:14,opacity:1.0,title:'OpenStreetMap2',source:BASE_SOURCES['OpenStreetMap2']}),
				'source':BASE_SOURCES['OpenStreetMap2'],
				'feature_names':[],
				'style':null,
				'colors':{},
				'toggle':false,
			},
		},

	};

	me.polygon_layers=null;
	me.point_layers=null;
	me.line_layers=null;
	me.current_target_layer=null;

	me.DELAY=1500.;
	me.RUNNING=false;

	me.resize=function(){
		var W=window.innerWidth;
		var H=window.innerHeight;
		var res=compute_resolution(INSTALLED[me.current]['bbox'],false,W,H);
		window.map.getView().setResolution(res);
	}

	me.get_enabled_candidates=function(){
		var candidates=[];
		var keys=me.CATEGORIES['keys'];
		for(var kidx=0;kidx<keys.length;kidx++){
			var category=keys[kidx];
			if(DEBUG)console.log("checking "+category);
			var layer_names=me.CATEGORIES[category]['keys'];
			if(DEBUG)console.log("layer_names="+layer_names+" "+typeof(layer_names));
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				if(DEBUG)console.log("checking "+category+"."+layer_name);
				if(me.CATEGORIES[category][layer_name]['toggle']){
					var feature_names=me.CATEGORIES[category][layer_name]['feature_names'];
					for(var fidx=0;fidx<feature_names.length;fidx++){
						var feature_name=feature_names[fidx];
						if(DEBUG)console.log("checking "+category+"."+layer_name+"."+feature_name);
						if(me.CATEGORIES[category][layer_name]['features'][feature_name]['candidate']){
							var pyld={
								'category':category,
								'layer_key':layer_name,
								'feature_name':feature_name,
							};
							if(DEBUG)console.log("adding candidate: "+feature_name);
							candidates.push(pyld);
						}
					}
				}
			}
		}

		return candidates;
	}

	me.change_areaCB=function(){
		if(DEBUG)console.log("change_areaCB");
		//Get new selected area

		try{if(DEBUG)console.log("me.CATEGORIES['BOUNDARY']="+me.CATEGORIES['BOUNDARY']['layer']);}
		catch(e){if(DEBUG)console.log(e);}

		var selection=window.area_select.get_selected("area_select");
		//var selection="guyana";

		if(selection!=null){
			me.current=selection;
			if(DEBUG)console.log("selection="+selection);
		}
		else{
			if(DEBUG)console.log("failed to obtain selection");
			return;
		}

		//Remove all layers from map, reclaim memory
		for(var cidx=0;cidx<me.CATEGORIES['keys'].length;cidx++){
			category=me.CATEGORIES['keys'][cidx];
			for(var lidx=0;lidx<me.CATEGORIES[category]['keys'].length;lidx++){
				var layer_name=me.CATEGORIES[category]['keys'][lidx];
				if(DEBUG)console.log("removing layer: "+layer_name);
				window.map.removeLayer(me.CATEGORIES[category][layer_name]['layer']);
				delete(me.CATEGORIES[category][layer_name]);
			}
			delete(me.CATEGORIES[category]);
		}
		me.CATEGORIES['keys']=[];

		try{
			if(DEBUG)console.log("Removing layer: BOUNDARY");
			window.map.removeLayer(me.CATEGORIES['BOUNDARY']['layer']);
			delete(me.CATEGORIES['BOUNDARY']);
		}
		catch(e){/*if(DEBUG)console.log(e);*/}

		//Refill layers structure
		var rval=me.prepare_layers();
/*
		//Re-add layers to map
		if(me.BASE_ENABLED){
			if(DEBUG)console.log("adding base layers");
			var keys=me.CATEGORIES['Base Layers']['keys'];
			for(var kidx=0;kidx<keys.length;kidx++){
				var key=keys[kidx];
				if(me.CATEGORIES['Base Layers'][key]['toggle']==1){
					if(DEBUG)console.log("adding "+key);
					window.map.getLayers().insertAt(0, me.CATEGORIES['Base Layers'][key]['layer']);
				}
			}
		}
*/
		if(DEBUG)console.log("Adding BOUNDARY layer");
		window.map.addLayer(me.CATEGORIES['BOUNDARY']['layer']);

		var keys=me.CATEGORIES['keys'];
		for(var kidx=0;kidx<keys.length;kidx++){
			var category=keys[kidx];
			if(DEBUG)console.log('Adding '+me.CATEGORIES[category]['keys'].length);
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				if(DEBUG)console.log("Adding layer: "+layer_name);
				window.map.addLayer(me.CATEGORIES[category][layer_name]['layer']);
			}
		}

		window.map.getView().setCenter(ol.proj.transform(INSTALLED[me.current]["center"], 'EPSG:4326', 'EPSG:3857'));

		//resize (calls set res)
		me.resize();

		window.setTimeout(me.fill_all_features,2000,false);
	}
	me.fill_all_features=function(){
		var categories=me.CATEGORIES['keys'];
		for(var cidx=0;cidx<categories.length;cidx++){
			var category=categories[cidx];
			var layer_names=me.CATEGORIES[category]['keys'];
			for(var lidx=0;lidx<layer_names.length;lidx++){
				var layer_name=layer_names[lidx];
				var features=me.CATEGORIES[category][layer_name]['source'].getFeatures();
				for(var fidx=0;fidx<features.length;fidx++){
					var feature_name=null;
					feature_name=features[fidx].get("Name");
					if(!feature_name)feature_name=features[fidx].get("NAME");
					//if(DEBUG)console.log(feature_name);
					me.CATEGORIES[category][layer_name]['features'][feature_name]={
						'feature':features[fidx],
						'candidate':true,
					}
					me.CATEGORIES[category][layer_name]['feature_names'].push(feature_name);
				}
			}
		}
		window.control_panel.rebuild();
	}

	me.prepare_layers=function(){

		if(DEBUG)console.log("me.prepare_layers: "+me.current);

		me.LAYERS={'keys':[],}

		for(var pidx=0; pidx<INSTALLED[me.current]["polygon_sources"].length;pidx++){
			var src_url=INSTALLED[me.current]["path"] + INSTALLED[me.current]["polygon_sources"][pidx]["filename"];
			var polygon_source=new ol.source.Vector({
				url: src_url,
				format: new ol.format.GeoJSON()
			});

			var polygon_layer= new ol.layer.Vector({
				source: polygon_source,
				style:new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: INSTALLED[me.current]["polygon_sources"][pidx]["color"],
						width: INSTALLED[me.current]["polygon_sources"][pidx]["width"]
					}),
					fill: new ol.style.Fill({
						color: INSTALLED[me.current]["polygon_sources"][pidx]["fill"],
					})
				}),
			});
			polygon_layer.set("type","Polygon");

			var category=INSTALLED[me.current]["polygon_sources"][pidx]["category"];
			var layer_name=INSTALLED[me.current]["polygon_sources"][pidx]["layer_name"];
			polygon_layer.set("layer_name",layer_name);

			if(me.CATEGORIES['keys'].indexOf(category)<0){
				if(DEBUG)console.log("new category: "+category);
				me.CATEGORIES['keys'].push(category);
				me.CATEGORIES[category]={'keys':[],};
			}
			me.CATEGORIES[category]['keys'].push(layer_name);
			me.CATEGORIES[category][layer_name]={
				'layer':polygon_layer,'source':polygon_source,feature_names:[],'features_off':[],
				features:{},'style':null,'colors':{},'toggle':true,'type':'Polygon'
			};

		}

		me.point_layers=[];
		for(var pidx=0;pidx<INSTALLED[me.current]["point_sources"].length;pidx++){

			var src_url=INSTALLED[me.current]["path"] + INSTALLED[me.current]["point_sources"][pidx]["filename"];
			var point_source=new ol.source.Vector({
				url: src_url,
				format: new ol.format.GeoJSON()
			});

			var point_layer= new ol.layer.Vector({
				source: point_source,
				style:new ol.style.Style({
					image:new ol.style.Circle({
						radius:INSTALLED[me.current]["point_sources"][pidx]["radius"],
						stroke: new ol.style.Stroke({
							color: INSTALLED[me.current]["point_sources"][pidx]["color"],
							width: INSTALLED[me.current]["point_sources"][pidx]["width"]
						}),
						fill: new ol.style.Fill({
							color: INSTALLED[me.current]["point_sources"][pidx]["fill"],
						}),
					})
				}),
			});
			point_layer.set("type","Point");

			var category=INSTALLED[me.current]["point_sources"][pidx]["category"];
			layer_name=INSTALLED[me.current]["point_sources"][pidx]["layer_name"];
			point_layer.set("layer_name",layer_name);

			if(me.CATEGORIES['keys'].indexOf(category)<0){
				if(DEBUG)console.log("new category: "+category);
				me.CATEGORIES['keys'].push(category);
				me.CATEGORIES[category]={'keys':[],};
			}
			me.CATEGORIES[category]['keys'].push(layer_name)
			me.CATEGORIES[category][layer_name]={
				'layer':point_layer,'source':point_source,feature_names:[],'features_off':[],
				features:{},'style':null,'colors':{},'toggle':true,'type':'Point'
			}
		}

		me.line_layers=[];
		for(var lidx=0;lidx<INSTALLED[me.current]["line_sources"].length;lidx++){
			var src_url=INSTALLED[me.current]["path"] + INSTALLED[me.current]["line_sources"][lidx]["filename"];
			var line_source=new ol.source.Vector({
				url: src_url,
				format: new ol.format.GeoJSON()
			});

			var line_layer= new ol.layer.Vector({
				source: line_source,
				style:new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: INSTALLED[me.current]["line_sources"][lidx]["color"],
						width: INSTALLED[me.current]["line_sources"][lidx]["width"]
					}),
				})
			});
			line_layer.set("type","Line");

			var category=INSTALLED[me.current]["line_sources"][lidx]["category"];
			layer_name=INSTALLED[me.current]["line_sources"][lidx]["layer_name"];
			line_layer.set("layer_name",layer_name);

			if(me.CATEGORIES['keys'].indexOf(category)<0){
				if(DEBUG)console.log("new category: "+category);
				me.CATEGORIES['keys'].push(category);
				me.CATEGORIES[category]={'keys':[],};
			}
			me.CATEGORIES[category]['keys'].push(layer_name)
			me.CATEGORIES[category][layer_name]={
				'layer':line_layer,'source':line_source,feature_names:[],'features_off':[],
				features:{},'style':null,'colors':{},'toggle':true,'type':'Line'
			}
		}


		me.gpx_layers=[];
		for(var lidx=0;lidx<INSTALLED[me.current]["gpx_sources"].length;lidx++){
			var src_url=INSTALLED[me.current]["path"] + INSTALLED[me.current]["gpx_sources"][lidx]["filename"];
			var gpx_source=new ol.source.Vector({
				url: src_url,
				format: new ol.format.GPX()
			});

			var gpx_layer= new ol.layer.Vector({
				source: gpx_source,
					style: new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: make_random_color(),
						width: 3
					})
				}),
			});
			gpx_layer.set("type","gpx");

			var category=INSTALLED[me.current]["gpx_sources"][lidx]["category"];
			layer_name=INSTALLED[me.current]["gpx_sources"][lidx]["layer_name"];
			gpx_layer.set("layer_name",layer_name);
			console.log("layer_name="+layer_name);

			if(me.CATEGORIES['keys'].indexOf(category)<0){
				if(DEBUG)console.log("new category: "+category);
				me.CATEGORIES['keys'].push(category);
				me.CATEGORIES[category]={'keys':[],};
			}
			me.CATEGORIES[category]['keys'].push(layer_name)
			me.CATEGORIES[category][layer_name]={
				'layer':gpx_layer,'source':gpx_source,feature_names:[],'features_off':[],
				features:{},'style':null,'colors':{},'toggle':true,'type':'gpx'
			}
		}

		var boundary_source=new ol.source.Vector({
			url: INSTALLED [me.current]["path"] + 'boundary.geojson',
			format: new ol.format.GeoJSON()
		});
		var boundary_layer = new ol.layer.Vector({
			source: boundary_source,
			style:new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: INSTALLED[me.current]["color"],
					width: INSTALLED[me.current]["width"]
				}),
				fill: new ol.style.Fill({
					color: INSTALLED[me.current]["fill"],
				}),
			}),
		});

		me.CATEGORIES['BOUNDARY']={
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

		if(DEBUG)console.log("prepare_layers done");
		return 1;

	}//END:me.prepare_layers

	//GAME ORCHESTRATION:
	me.start_move=function(feature){

		if(me.RUNNING==false)return;

		if(DEBUG)console.log("start_move");

		try{window.clearTimeout(me.last_timeout);}
		catch(e){if(DEBUG)console.log(e);}

		if(!feature){

			var candidates=me.get_enabled_candidates();

			if(candidates.length==0){
				if(DEBUG)console.log("returning me.end_game()");
				return me.end_game();
			}

			if(DEBUG)console.log("me.start_move no feature passed so selecting");

			var ridx=parseInt(Math.random()*candidates.length);
			if(DEBUG)console.log("cycling ridx="+ridx.toString()+"/"+candidates.length);

			for(var dummy=0;dummy<ridx;dummy++){
				//if(DEBUG)console.log(dummy+"/"+ridx);
				candidates.push(candidates.shift());
			}
			if(DEBUG)console.log("shifting me.current_feature");
			me.current_feature=candidates.shift();//should check if getting what was intended

		}
		else{
			if(DEBUG)console.log("me.start_move with feature passed");
		}

		var target_name=null;
		target_name=me.current_feature['feature_name'];

		var target_layer_name=me.current_feature['layer_key'];

		var xhtml="<center><h3>Next:</h3><h1>"+target_name+"</h1><h3>"+target_layer_name+"</h3></center>";
		if(DEBUG)console.log("me.start_move:"+target_name+" "+target_layer_name);
		popup(xhtml);
	}

	me.end_game=function(){
		try{document.body.removeChild(me.popup);}
		catch(e){if(DEBUG)console.log("me.end_game");}
		var xhtml='<center><h1>Congratulations!<br>You Finished!</h1></center>';
		if(DEBUG)console.log(xhtml);
		popup(xhtml);
		//NEED:game stats
		document.getElementById("playB").innerHTML='<img src="activity/img/flaticon/play.png" class="icon"/>';
	}

	me.check_feature = function(pixel) {

		if(!me.current_feature)return;

		if(DEBUG)console.log("me.check_feature clearing last_timeout");
		window.clearTimeout(me.last_timeout);

		var feature;
		var features=[];
		var found=false;

		if(!pixel && me.tour){

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
				if(DEBUG)console.log("returning: "+target_name);
				features.push(feature);
			});
		}

		if(features.length>0 && !found){

			for(var fidx=0;fidx<features.length;fidx++){

				feature=features[fidx];
				var category=me.current_feature['category'];
				var target_name=null;
				target_name=me.current_feature['feature_name'];
				target_layer=me.current_feature['layer_key'];
				if(DEBUG)console.log(fidx.toString()+" "+target_layer+"."+target_name);
				target_feature=me.CATEGORIES[category][target_layer]['features'][target_name]['feature'];
				if(feature==target_feature){

					if(DEBUG)console.log("***** Correct! *****");

					if(me.CATEGORIES[category][target_layer]['type']=="Point"){
						feature.setStyle(point_correct_style);
					}
					else{
						feature.setStyle(correct_style);
					}

					found=true;

					//toggle as candidate
					me.CATEGORIES[category][me.current_feature['layer_key']]['features'][target_name]['candidate']=false;

					//delete(me.current_feature);
					me.current_feature=null;

					if(me.tour){
						if(DEBUG)console.log("check_feature setting timeout for pan_zoom_home");
						me.last_timeout=window.setTimeout(pan_zoom_home,3*me.DELAY);
					}
					else{
						window.setTimeout(me.start_move,1*me.DELAY);
					}
					return;
				}
				else{
					var feature_name=null;
					feature_name=feature.get("NAME");
					if(!feature_name)feature_name=feature.get("Name");
					if(DEBUG)console.log(feature_name+" != "+target_feature.toString());
				}

			}

			if(DEBUG)console.log("starting move passing feature: "+target_name);
			me.start_move(feature);
		}
		else{
			if(DEBUG)console.log("game over");
		}
	}
	return me;
}
