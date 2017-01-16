var is_base_by_name=function(layer_name){
	var is_base=false;
	for(var kidx=0;kidx<window.app.CATEGORIES['Base Layers']['keys'].length;kidx++){
		var key=window.app.CATEGORIES['Base Layers']['keys'][kidx];
		if(key==layer_name){is_base=true;}
	}
	if(DEBUG)console.log(layer_name+" is_base= "+is_base);
	return is_base;
}
var make_hr=function(idn){
	var hr=document.createElement("hr");
	hr.className="hr";
	if(idn!=null)hr.id=idn;
	return hr;
}
var make_vspace10=function(){
	var vspace10=document.createElement("div");
	vspace10.className="vspace10";
	return vspace10;
}
var make_hspace10=function(){
	var hspace10=document.createElement("div");
	hspace10.className="hspace10";
	return hspace10;
}
var get_selected=function(select_id){
	
	var selection=null;
	var select_control=document.getElementById(select_id);
	
	for(var oidx=0;oidx<select_control.length;oidx++){
		if(select_control.options[oidx].selected==true)
			return select_control.options[oidx].value;
	}
	return selection;
}

get_basename=function(path){
	return path.split('/').reverse()[0];
}
var make_random_color=function(){
	var rval="#";
	var chars=["0","1","5","6","A","B","C","D","E","F"];
	for(var dummy=0;dummy<6;dummy++){
		var cidx=parseInt(Math.random()*chars.length);
		try{rval+=chars[cidx];}
		catch(e){rval+="F";}
	}
	return rval;
}
		

var compute_resolution=function(bbox,is3857,W,H){
	
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
	
	if(DEBUG)console.log(p1+", "+p2);
	
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
	if(DEBUG)console.log("res="+res);
	return res;
}
