var RollUpDiv=function(opts){
	var me={};
	
	var CB=opts['checkboxCB'];
	var callCB=function(e){
		try{
			if(DEBUG)console.log("callCB");
			if(DEBUG)console.log(opts['checkboxCB']);
			CB(e);
		}
		catch(e){
			if(DEBUG)console.log("Failed to call checkboxCB");
			if(DEBUG)console.log(e);
		}
	}

	
	var solid_id=opts['category'];//handles up to 10 spaces!
	for(var dummy=0;dummy<10;dummy++)
		solid_id=solid_id.replace(" ","ZZZ");//can't be _ b/c splitting on _ already

	me.head=document.createElement("div");
	me.head.className='roll_up_div';
	me.head.id=solid_id;
	
	var t=document.createElement("table");
	t.style.width="100%";
	var tr=t.insertRow(-1);
	var td;
	td=tr.insertCell(-1);
	td.className="roll_up_icon_cell";//unused dummy for symmetry
	
	td=tr.insertCell(-1);
	td.align="center";
	me.label=document.createElement("div");
	me.label.className="roll_up_label";
	me.label.innerHTML=opts['roll_up_name'];
	td.appendChild(me.label);
/*	
	if(opts['checkboxCB']){//BASE_LAYERS are laid out differently
		td=tr.insertCell(-1);
		td.className="roll_up_icon_cell";
		var roll_up_icon=new Image();
		roll_up_icon.id=me.head.id+"_checkbox";
		roll_up_icon.className="roll_up_icon";
		roll_up_icon.src=opts['checkboxSRC'];
		roll_up_icon.addEventListener("click",callCB,false);
		td.appendChild(roll_up_icon);
	}
	else{if(DEBUG)console.log("no checkboxCB");}
*/	
	td=tr.insertCell(-1);
	td.className="roll_up_icon_cell";
	var roll_up_icon=new Image();
	roll_up_icon.id=me.head.id+"_icon";
	roll_up_icon.className="roll_up_icon";
	if(opts["roll_up_icon_src"]!=null){
		roll_up_icon.src=opts["roll_up_icon_src"];
		td.appendChild(roll_up_icon);
	}
	
	me.head.appendChild(t);
	$("#"+opts['parent_id']).append(me.head);
	
	me.rollup=document.createElement("div");
	me.rollup.id=me.head.id+"_rollup";
	//me.rollup.className=opts['roll_up_class'];
	//$("#"+opts['parent_id']).append(me.rollup);
	me.head.appendChild(me.rollup);
	
	$("#"+roll_up_icon.id).click(function(e){
		$(e.target).toggleClass("up");
		$("#"+e.target.id.split("_")[0]+"_rollup").animate({height:'toggle'},300,function(){});
	});
	
	me.set_name=function(val){
		me.label.innerHTML=val;
	}
	
	return me;
}


