define(["activity/ol","print","util","colormyworld","humane"],
	function(ol,print,util,colormyworld,humane){
	var me={};
	me.map=null;
	me.featureOverlay=null;
	me.HILIGHTS=[];
	me.tooltipDisplay=null;

	me.test=function(){return INSTALLED['keys'];}

	me.setup_map=function(){
		window.map = new ol.Map({
			layers:[],
			target: "cmw_bg",
			view: new ol.View({
				center:ol.proj.transform(INSTALLED["Africa"]["center"], 'EPSG:4326', 'EPSG:3857'),
				zoom: 2
			}),
		});

		window.map.on('click',function(evt){
			if(colormyworld.mode==COLORING){
				var FOUND=false;
				dummmy=window.map.forEachFeatureAtPixel(evt.pixel,function(target_feature,layer){
				var target_name=target_feature.get("NAME");
				if(!target_name)target_name=target_feature.get("Name");
				if(colormyworld.currents.indexOf(target_name)<0){
					if (!me.tooltipDisplay || target_name!=me.tooltipDisplay) {
						me.tooltipDisplay=target_name;
						humane.timeout=1000;
						humane.log(document.webL10n.get(target_name.replace(/ /g,'_')).replace(/_/g,' '));
						setTimeout(function() {
							me.tooltipDisplay=null;
						}, humane.timeout);
					}
					var rgbColorString=colormyworld.getRGBColorString();
					print(rgbColorString);
					var nouveau_style=new ol.style.Style({
						fill: new ol.style.Fill({color: colormyworld.getRGBColorString()}),
						stroke:new ol.style.Stroke({color: DEFAULT_STROKE,width: 1}),
					});
					target_feature.setStyle(nouveau_style);
					FOUND=true;
				}});
				if(!FOUND){
					colormyworld.set_background(null);
				}
			}
			else colormyworld.check_feature(evt.pixel);
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

				if(colormyworld.currents.indexOf(target_name)<0){
					//print("pointermove: "+target_name);
					me.featureOverlay.addFeature(target_feature);
					me.HILIGHTS.push(target_feature);
				}
/*
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
*/
			});
		});

		me.featureOverlay = new ol.FeatureOverlay({
		  map: window.map,
		  style: new ol.style.Style({
		  	stroke: new ol.style.Stroke({
		    	color: OUTLINE_COLOR,
		    	width: OUTLINE_WIDTH
		    }),
		  }),
		});

	}
	return me;
});
