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
				if(!target_name)target_name=target_feature.get("name");
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

			var highlightStyleCache = {};
			me.featureOverlay = new ol.layer.Vector({
				source: new ol.source.Vector(),
				map: window.map,
				style: function(feature, resolution) {
					var text = resolution < 5000 ? '' : '';//feature.get('name')
					if (!highlightStyleCache[text]) {
						highlightStyleCache[text] = new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ff0',
								width: 1
							}),
							fill: new ol.style.Fill({
								color: 'rgba(0,200,0,0.2)'
							}),
							text: new ol.style.Text({
								font: '12px Calibri,sans-serif',
								text: text,
								fill: new ol.style.Fill({
									color: '#000'
								}),
								stroke: new ol.style.Stroke({
									color: '#ff0',
									width: 3
								})
							})
						});
					}
					return highlightStyleCache[text];
				}
			});

			var highlight;
			var displayFeatureInfo = function(pixel) {
				var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
					return feature;
				});
				var msg=null;
				if (feature) {
					msg = feature.get('name');
					if(!msg)msg = feature.get('Name');
					if(!msg)msg = feature.get('NAME');
				}
				if(REGION_NAMES.indexOf(msg)>-1){//don't hilight deh boundary layer
					return;
				}
				if(colormyworld.mode==TOUR){//don't hilight during tour
					return;
				}
				if (feature !== highlight) {
					if (highlight) {
						me.featureOverlay.getSource().removeFeature(highlight);
					}
					if (feature) {
						me.featureOverlay.getSource().addFeature(feature);
					}
					highlight = feature;
				}
			};

		window.map.on('pointermove',function(evt){
			if (evt.dragging) {
				return;
			}
			var pixel = window.map.getEventPixel(evt.originalEvent);
			displayFeatureInfo(pixel);
		});

	}
	return me;
});
