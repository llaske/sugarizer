/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :GPLv3

***********************************************************/
function b_listener(w,CB){
	if(navigator.appName=="Microsoft Internet Explorer")
		w.attachEvent("onclick",CB);
	else
		w.addEventListener("click",CB,false);
}
function log(txt){
//	targ=document.getElementById("left_sidebar");
//	targ.innerHTML+="<br>"+txt;
//	window.DEBUG+="<br>"+txt;
////	try{
////	window.debug_pyld_obj['more']+="<br>"+txt;
////	window.touch_report();
///	}catch(e){}//not created yet;created at menu setup

}
function log_array(arname,ar){
	var val=arname+"<br><table>";
	//var val="<table>";
	for(var midx=0;midx<ar.length;midx++){
		val+="<tr>";
		for(var nidx=0;nidx<ar[midx].length;nidx++){
			val+="<td style='text-align:center;width:30px;color:#FFAA00;border:1px solid;'>";
			if(ar[midx][nidx]!=null)val+=ar[midx][nidx];
			else val+=".";
			val+="</td>";
		}
		val+="</tr>";
	}
	val+="</table><br>";
	window.DEBUG_SOLVER+=val;

}
function log_reset(){

	window.DEBUG="";
	window.DEBUG_SOLVER="";
	try{
		glasspane=document.getElementById("glasspane");
		glasspane.innerHTML="<img src='./activity/application-exit.png' onclick='dismiss_glasspaneCB()'></img><br>";
	}catch(err){}
}
var vspace=function(vpx){
	d=document.createElement("div");
	d.style.height=vpx;
	return d;
}
var get_count=function(s,a){
	var rval=0;
	for(var didx=0;didx<a.length;didx++){
		if(a[didx]==s)rval+=1;
	}
	return rval;
}
var dismiss_glasspaneCB=function(e){
	try{document.body.removeChild(document.getElementById("glasspane"));}catch(e){;}
}
var debugCB=function(e){
	try{
		x=document.getElementById("glasspane");
		if(x){
			dismiss_glasspaneCB(null);
			return;
		}
	}catch(e){}
	dismiss_glasspaneCB(null);//ensure single copy
	glasspane=document.createElement("div");
	glasspane.id="glasspane";
	glasspane.className="glasspane";
	glasspane.innerHTML="<img src='./activity/application-exit.png' onclick='dismiss_glasspaneCB()'></img><br>"+window.DEBUG;

	var winwidth = window.document.width || window.document.body.clientWidth;
	glasspane.style.left=(winwidth-800)/2.;
	document.body.appendChild(glasspane);
}
var debug_solverCB=function(e){
	d=document.getElementById("debug_overlay");
	d.innerHTML=window.DEBUG_SOLVER;
	window.location="#debug_overlay";
}
function init(){
}
var make_settings=function(){

	nsd=document.getElementById("new_settings_div");
	t=document.createElement("table");
	t.style.align="center";

	opts=[
		['I','II','III','IV'],
		['25','50','100','150','200','250','300'],
		['1','2','3','4'],
		['900','1800','2700','3600','7200'],
	];

	ids=['levelB','thresholdB','tuxfactorB','creditsB'];
	labels=['Level','Goal','TuxFactor','Credits'];
	tips=[
		'Levels 1-4 offer different tiles',
		'Threshold at which credits unlocked',
		'TuxFactor controls length of Tux moves',
		'Credits to be released once threshold reached',
	];

	for(var sidx=0;sidx<ids.length;sidx++){

		r=t.insertRow(-1);
		c=r.insertCell(-1);

		jQuery('<div/>',{
			html:"<b>"+labels[sidx]+"</b>",
		}).appendTo(c);

		w=document.createElement("select");
		w.name=ids[sidx];
		w.id=ids[sidx];
		w.title=tips[sidx];
		w.setAttribute("data-native-menu","false");
		w.setAttribute("data-mini","true");

		as=opts[sidx];

		for(var aidx=0;aidx<as.length;aidx++){
			opt=document.createElement("option");
			opt.text=as[aidx];
			opt.value=as[aidx];
			opt.selected=0;

			if(sidx==0){
				if(aidx==0 && window.LEVEL==1)opt.selected=1;
				if(aidx==1 && window.LEVEL==2)opt.selected=1;
				if(aidx==2 && window.LEVEL==31)opt.selected=1;
				if(aidx==3 && window.LEVEL==4)opt.selected=1;
			}
			if(sidx==1 && as[aidx]==window.THRESHOLD)opt.selected=1;
			if(sidx==2 && as[aidx]==window.TUXFACTOR)opt.selected=1;
			if(sidx==3 && as[aidx]==window.CREDITS)opt.selected=1;

			w.add(opt,w.options[w.options.length]);
		}
		w_div=document.createElement("div");
		w_div.setAttribute("data-role","ui-contain");
		w_div.appendChild(w);

		c=r.insertCell(-1);
		c.appendChild(w_div);
	}

	nsd.appendChild(t);

	r=t.insertRow(-1);
	c=r.insertCell(-1);
	c.colSpan="2";

	jQuery('<input/>',{
		type:"button",
		value:"Apply",
		id:"applyB",
		"class":"ui-btn ui-btn-inline ui-mini ui-corner-all",
	}).appendTo(c);
	$("#applyB").click(function(){

		window.LEVEL=window.LEVELS[document.getElementById("levelB").value];
		window.THRESHOLD=document.getElementById("thresholdB").value;
		window.TUXFACTOR=document.getElementById("tuxfactorB").value;
		window.CREDITS=document.getElementById("creditsB").value;

		window.THE_TMS_INSTANCE.resetCB(null);
		$("#main").trigger('create');

	});


}
var backCB=function(e){
	window.location="/";
}
var helpCB=function(e){
        window.location="#instructions_overlay";
}
var settingsCB=function(e){
	window.location="#settings_overlay";
}
var aboutCB=function(e){
	window.location="#about_overlay";
}
var array2_sort=function(ar,jdx){
	for(var i=1;i<ar.length;i++){
		for(var j=0;j<ar.length-1;j++){

			log(ar[i][jdx]+"  ,  "+ar[j][jdx]);

			if(ar[i][jdx]<ar[j][jdx]){
				//swap these two
				log("swapping");
				tmp=ar[j];
				ar[j]=ar[i];
				ar[i]=tmp;
			}
		}
	}
	return ar;
}
