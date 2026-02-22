define(["activity/ol","print","util","colormyworld","humane","flag","l10n"],
	function(ol,print,util,colormyworld,humane,flag,l10n){
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

		window.map.on('click', function(evt) {
			if (colormyworld.mode == COLORING) {
				var FOUND = false;
				var clickedFeature = null;

				window.map.forEachFeatureAtPixel(evt.pixel, function(target_feature, layer) {
					if (layer === me.featureOverlay) return;

					var name = target_feature.get("NAME") || 
							target_feature.get("Name") || 
							target_feature.get("name") || "";
					if (!name || name.trim() === "") return;

					if (colormyworld.currents.indexOf(name) >= 0) return;

					var geom = target_feature.getGeometry();
					if (!geom || (geom.getType() !== 'Polygon' && geom.getType() !== 'MultiPolygon')) {
						return;
					}

					if (!clickedFeature) {
						clickedFeature = target_feature;
					}

					if (!me.tooltipDisplay || me.tooltipDisplay != name) {
						me.tooltipDisplay = name;
						humane.timeout = 1000;
						humane.log(
							"<img src='./flags/" + (flag[name.replace(/ /g, '_')] || 'world') + ".svg' " +
							"style='width:auto;height:1.4em;vertical-align:middle;margin-right:8px;'>" +
							l10n.get(name.replace(/ /g, '_')).replace(/_/g, ' ')
						);
						setTimeout(function() { me.tooltipDisplay = null; }, 1000);
					}

					FOUND = true;
					return false;

				}, {
					hitTolerance: 4
				});

				if (clickedFeature) {
					var selectedColor = colormyworld.getRGBColorString();
					var style = clickedFeature.getStyle();

					var currentFill = null;
					if (style && style.getFill()) {
						currentFill = style.getFill().getColor();
					}

					if (currentFill && currentFill === selectedColor) {
						clickedFeature.setStyle(null);
					} 
					else {
						var strokeColor = (typeof DEFAULT_STROKE !== 'undefined') ? DEFAULT_STROKE : '#333333';

						var newStyle = new ol.style.Style({
							fill: new ol.style.Fill({ color: selectedColor }),
							stroke: new ol.style.Stroke({ color: strokeColor, width: 1.5 })
						});
						clickedFeature.setStyle(newStyle);
					}
				}

				if (!FOUND) {
					var selectedColor = colormyworld.getRGBColorString();
					var currentBg = colormyworld.background_color;

					if (currentBg === selectedColor) {
						colormyworld.set_background('rgb(0,120,255)');
					} 
					else {
						colormyworld.set_background(selectedColor);
					}
				}
			} else {
				colormyworld.check_feature(evt.pixel);
			}
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
