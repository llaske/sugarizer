var Map=function(div_id){
	var me={};
	me.div_id=div_id;
	me.featureOverlay=null;
	me.HILIGHTS=[];

	//MAP
	me.playCB = function() {
			if(DEBUG)console.log("mapB.CB");
			//$(".control_panel").toggleClass("show");

			if(window.app.get_enabled_candidates().length==0){
				if(DEBUG)console.log("resetting game from CB");
				window.app.change_areaCB();
				document.getElementById("playB").innerHTML='<img src="activity/img/flaticon/pause.png" class="icon"/>';
				window.app.RUNNING=true;
				window.setTimeout(window.app.start_move,4*window.app.DELAY);//necessary!
			}
			else if(window.app.RUNNING==true){
				window.app.RUNNING=false;
				document.getElementById("playB").innerHTML='<img src="activity/img/flaticon/play.png" class="icon"/>';
			}
			else{
				window.app.RUNNING=true;
				window.app.start_move(null);
				document.getElementById("playB").innerHTML='<img src="activity/img/flaticon/pause.png" class="icon"/>';
			}
			if(DEBUG)console.log("mapB.CB done");
		};

	me.controlsCB = function() {
		if(document.getElementById("control_panel").className.indexOf("show") > -1)
		if(document.getElementById("popout_panel").className.indexOf("show") > -1)
			$(".popout_panel").toggleClass("show");

		$(".control_panel").toggleClass("show");
		if(DEBUG)console.log("controlCB show off");


	};

	me.setup_map=function(){

		var play_opts={"CB":me.playCB,"title":"Start","innerHTML":'<img src="activity/img/flaticon/play.png" class="icon"/>','id':'playB','className':'playB map_button'};
		var gear_opts={"CB":me.controlsCB,"title":"Configuration","innerHTML":'<img src="activity/img/flaticon/gear.png" class="icon"/>','id':'gearB','className':'gearB map_button'};
		var playB=new MapButton(play_opts);
		var gearB=new MapButton(gear_opts);

		window.map = new ol.Map({
			layers:[],
			target: me.div_id,
			view: new ol.View({
				center:ol.proj.transform(INSTALLED[window.app.current]["center"], 'EPSG:4326', 'EPSG:3857'),
				zoom: 7
			}),
//			interactions:[],
			controls: ol.control.defaults({
				attributionOptions:  ({
					collapsible: false
				})
			}).extend([
				gearB,playB,
			])
		});

		window.map.on('click',function(evt){
			dummmy=window.map.forEachFeatureAtPixel(evt.pixel,function(target_feature,layer){
				var target_name=target_feature.get("NAME");
				if(!target_name)target_name=target_feature.get("Name");
				if(String.toLowerCase(target_name)==window.app.current){;}
				if(DEBUG)console.log(target_name);
				window.app.check_feature(evt.pixel);
			});
		});

		window.map.on('pointermove',function(evt){
			if (evt.dragging) {
				return;
			}

			for(var hidx=0;hidx<me.HILIGHTS.length;hidx++){
				me.featureOverlay.removeFeature(me.HILIGHTS[hidx]);
			}

			dummmy=window.map.forEachFeatureAtPixel(evt.pixel,function(target_feature,layer){
				var target_name=target_feature.get("NAME");
				if(!target_name)target_name=target_feature.get("Name");

				if(String.toLowerCase(target_name)==window.app.current){
					//this skips printing boundary to if(DEBUG)console.log
				}
				else if(target_name==window.app.current){
					//this skips printing boundary to if(DEBUG)console.log
				}
				else if(target_feature){
					me.featureOverlay.addFeature(target_feature);
					me.HILIGHTS.push(target_feature);
					//if(DEBUG)console.log(target_name);
				}
			});
		});

		me.featureOverlay = new ol.FeatureOverlay({
		  map: window.map,
		  style: new ol.style.Style({
		  	stroke: new ol.style.Stroke({
		    	color: 'orange',
		    	width: 2
		    }),
		  }),
		});

	}//END:me.setup_map
	return me;

}
