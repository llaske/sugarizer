//CONSTANTS
var correct_style = new ol.style.Style({
  fill: new ol.style.Fill({
    color: "rgba(255,255,0,0.25)"
  }),
  stroke: new ol.style.Stroke({
    color: "gold",
    width: 2
  }),
});
var point_correct_style=new ol.style.Style({
	image:new ol.style.Circle({
		radius:10,
		stroke: new ol.style.Stroke({
			color: "rgba(255,0,0,1)",
			width: 5
		}),				
		fill: new ol.style.Fill({
			color: "rgba(255,255,0,1)",
		}),
	})
});

var popup=function(xhtml){
	while(window.app.popup.childNodes.length>0){
		try{window.app.popup.removeChild(window.app.popup.childNodes[0]);}
		catch(e){if(DEBUG)console.log(e);}
	}
	window.app.popup.innerHTML="";
			
	var info_div=document.createElement("div");
	info_div.classname="info_div";
	info_div.innerHTML=xhtml;
	
	window.app.popup.appendChild(info_div);
	
	//these need to go into ggmc.css
	window.app.popup.style.left=(window.innerWidth/2-300/2)+"px";
	window.app.popup.style.top=(window.innerHeight/2-200/2)+"px";
	window.app.popup.style.width=(300)+"px";
	window.app.popup.style.height=(200)+"px";
	window.app.popup.style.opacity=0.0;
	document.body.appendChild(window.app.popup);
	$("#popup").animate(
		{opacity:1.0},
		window.app.DELAY,
		function(){
			window.app.last_timeout=window.setTimeout(popdown,1*window.app.DELAY);
		}
	);
}
var popdown=function(e){
	
	if(DEBUG)console.log("popdown");
	try{window.clearTimeout(window.app.last_timeout);}
	catch(e){}
	
	$("#popup").animate(
		{opacity:0.0},
		window.app.DELAY,
		function(){
			
			try{document.body.removeChild(window.app.popup);}
			catch(e){;}
			
			if(window.app.tour && window.app.current_feature!=null){
				
				var f=window.app.current_feature;
				var category=f['category'];
				var layer_name=f['layer_key'];
				var feature_name=f['feature_name'];
				
				var bbox=window.app.CATEGORIES[category][layer_name]['features'][feature_name]['feature'].getGeometry().getExtent();
				
				var center_of_feature=[(bbox[0]+bbox[2])/2.,(bbox[1]+bbox[3])/2.];
				pan_zoom(center_of_feature);
			}
		}
	);
}

var splash_screen=function(){
//	alert(':)  Welcome To Our Tour Guide Of Our Uniquely Majestic Towns And Rivers  :)');
	var splash_div=document.createElement('div');
	splash_div.className = "splash_div";
	
	splash_div.id = "splash_div";
	splash_div.innerHTML=':)  Welcome To Our Tour Guide Of Our Uniquely Majestic Towns And Rivers  :)';
	splash_div.style.left=(window.innerWidth/2-300/2)+"px";
	splash_div.style.top=(window.innerHeight/2-200/2)+"px";
	splash_div.style.width=(300)+"px";
	splash_div.style.height=(200)+"px";
	splash_div.style.opacity=0.0;
	if(DEBUG)console.log("hi canica was here");
	document.body.appendChild(splash_div);
	
	$("#splash_div").animate(
		{opacity:1.0},
		2*window.app.DELAY,
		function(){
			
			try{document.body.removeChild(splash_div);}
			catch(e){;}
		}
	)
}

