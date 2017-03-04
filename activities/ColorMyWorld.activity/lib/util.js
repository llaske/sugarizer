define(["activity/ol","print"],function (ol,print) {
    return {

correct_style:new ol.style.Style({
  fill: new ol.style.Fill({
    color: "rgba(255,255,0,0.25)"
  }),
  stroke: new ol.style.Stroke({
    color: "gold",
    width: 2
  }),
}),

point_correct_style:new ol.style.Style({
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
}),
enscore:function(str){
	for(var dummy=0;dummy<str.split(" ").length+1;dummy++)
		str=str.replace(" ","_");
	return str;
},
descore:function(str){
	for(var dummy=0;dummy<str.split("_").length+1;dummy++)
		str=str.replace("_"," ");
	return str;
},
get_basename:function(path){
	return path.split('/').reverse()[0];
},

make_hr:function(idn){
	var hr=document.createElement("hr");
	hr.className="hr";
	if(idn!=null)hr.id=idn;
	return hr;
},

resize:function(e){
	var AR=(1.0*window.innerWidth)/(1.0*window.innerHeight);
	$("#control_panel").addClass("landscape");
	$("#control_panel").addClass("wide");

	var mainToolBar=document.getElementById("main-toolbar");
	var ptd=document.getElementById("persistent_title_div");
	var max_font_size=32;
	if(mainToolBar.clientWidth<500)
		ptd.style.fontSize="0px";
	else if(mainToolBar.clientWidth<1000){
		var fs=(mainToolBar.clientWidth-500)/500*max_font_size;
		ptd.style.fontSize=fs+"px";
	}
	else{
		ptd.style.fontSize=max_font_size+"px";
	}
	ptd.style.left=(parseInt((mainToolBar.clientWidth)/2.-ptd.getBoundingClientRect().width/2))+"px";
},

mkRandomColor:function(){
	var rval="#";
	var chars=["0","1","5","6","A","B","C","D","E","F"];
	for(var dummy=0;dummy<6;dummy++){
		var cidx=parseInt(Math.random()*chars.length);
		try{rval+=chars[cidx];}
		catch(e){rval+="F";}
	}
	return rval;
},

computeResolution:function(bbox,is3857,W,H){

	var xmax=bbox[2];
	var xmin=bbox[0];
	var ymin=bbox[1];
	var ymax=bbox[3];

	var p1,p2;
	if(is3857){
		p2=[xmax,ymax];
		p1=[xmin,ymin];
	}
	else{
		p2=ol.proj.transform([xmax,ymax],"EPSG:4326","EPSG:3857");
		p1=ol.proj.transform([xmin,ymin],"EPSG:4326","EPSG:3857");
	}

	if(true)print(p1+", "+p2);

	var dx=p2[0]-p1[0];
	var dy=p2[1]-p1[1];


	var AR_win=W/H;
	var AR_shp=dx/dy;

	var res;
	if(AR_win>1){
		if(AR_shp<1){
			res=dy/H;
		}
		else if(AR_shp>AR_win){
			res=dx/W;
		}
		else{
			res=dy/H;
		}
	}
	else{//AR_win<1
		if(AR_shp>1){
			res=dx/W;
		}
		else if(AR_shp<AR_win){
			res=dy/H;
		}
		else{
			res=dx/W;
		}
	}
	if(true)print("res="+res);
	return res;
}
}});
