ControlPanel=function(){
	var me={};

	me.make_persistent_content=function(){
		var opts={
			'category':'Configuration',
			'parent_id':'control_panel',
			'id':'Configuration',
			'className':'roll_up_div',
			'roll_up_class':'rollup',
			'roll_up_name':'Configuration',
			'arrow_img':'activity/img/arrow.png',
			'roll_up_icon_src':null,
		};
		var rollup=new RollUpDiv(opts);
/*
		var area_select=document.createElement("select");
		area_select.id="area_select";
		area_select.className="styled-select blue semi-square";
		for(var sidx=0;sidx<INSTALLED["keys"].length;sidx++){
			var opt=document.createElement("option");
			opt.text=INSTALLED["keys"][sidx];
			opt.selected=false;
			if(sidx==0)opt.selected=true;
			area_select.appendChild(opt);
		}
		area_select.addEventListener("change",window.app.change_areaCB,false);
*/
		var opts={'id':'area_select','arrow_img':'activity/img/arrow.png'};
		window.area_select=new SelectionWidget(opts,INSTALLED["keys"]);

		// notify me when a new item is selected
		window.area_select.subscribe(function(active){
			if(DEBUG)console.log('new item selected');
			window.app.change_areaCB();
		});

		//document.body.appendChild(selection_widget.render());


		//
		var tourB=document.createElement("input");
		tourB.type="checkbox";
		tourB.id="tourB";
		tourB.className="switchB";
		var tour_div=document.createElement("div");
		tour_div.className="switch_div";
		tour_div.appendChild(tourB);

		var baseB=document.createElement("input");
		baseB.type="checkbox";
		baseB.id="baseB";
		baseB.className="switchB";
		var base_div=document.createElement("div");
		base_div.className="switch_div";
		base_div.appendChild(baseB);

		var switchT=document.createElement("table");
		switchT.align="center";
		var r=switchT.insertRow(-1);
		var tour_cell=r.insertCell(-1);
		tour_cell.appendChild(tour_div);
		var hspace_cell=r.insertCell(-1);
		hspace_cell.appendChild(make_hspace10());
		var base_cell=r.insertCell(-1);
		base_cell.appendChild(base_div);

		var switch_container=document.createElement("div");
		switch_container.className="centered w100";
		switch_container.appendChild(switchT);

		rollup.rollup.appendChild(window.area_select.render());
		rollup.rollup.appendChild(make_vspace10());
		rollup.rollup.appendChild(switch_container);
		rollup.rollup.appendChild(make_vspace10());

		rollup.head.appendChild(make_hr("hr0"));
		$("#control_panel").append(rollup);

		var bcr_rollup=rollup.head.getBoundingClientRect();
		$(".base_cover_panel").css({"top":bcr_rollup.height-60+"px"});

		me.category_block("Base Layers");

		$.fn.bootstrapSwitch.defaults.labelWidth="50px";

		$("#tourB").bootstrapSwitch();
		$("#tourB").bootstrapSwitch("state",window.app.tour);
		$("#tourB").bootstrapSwitch("size","mini");
		$("#tourB").bootstrapSwitch("onColor","info");//'primary', 'info', 'success', 'warning', 'danger', 'default'
		$("#tourB").bootstrapSwitch("offColor","success");//'primary', 'info', 'success', 'warning', 'danger', 'default'
		$("#tourB").bootstrapSwitch("onText","<img class='switch_icon' src='activity/img/globe.png'/>");//http://www.bootstrap-switch.org/options.html
		$("#tourB").bootstrapSwitch("offText","<img class='switch_icon' src='activity/img/flaticon/search.png'/>");
		$("#tourB").bootstrapSwitch("labelText","<b> Tour </b> ");
		$("#tourB").on('switchChange.bootstrapSwitch', function(event, state) {
			if(DEBUG)console.log(this); // DOM element
			if(DEBUG)console.log(event); // jQuery event
			if(DEBUG)console.log(state); // true | false
			window.app.tour=state;
		});

		$("#baseB").bootstrapSwitch();
		$("#baseB").bootstrapSwitch("state",true);
		$("#baseB").bootstrapSwitch("size","mini");
		$("#baseB").bootstrapSwitch("offColor","success");//'primary', 'info', 'success', 'warning', 'danger', 'default'
		$("#baseB").bootstrapSwitch("onColor","danger");//'primary', 'info', 'success', 'warning', 'danger', 'default'
		$("#baseB").bootstrapSwitch("onText","<img class='switch_icon' src='activity/img/layers.png'/>");//http://www.bootstrap-switch.org/options.html
		$("#baseB").bootstrapSwitch("offText","<img class='switch_icon' src='activity/img/layers.png'/>");
		$("#baseB").bootstrapSwitch("labelText","<b> Base </b> ");
		$("#baseB").on('switchChange.bootstrapSwitch', function(event, state) {
			if(DEBUG)console.log(this); // DOM element
			if(DEBUG)console.log(event); // jQuery event
			if(DEBUG)console.log(state); // true | false

			var hr0_bcr=document.getElementById("hr0").getBoundingClientRect();
			var hr3_bcr=document.getElementById("hr3").getBoundingClientRect();
			var h=hr3_bcr.top-hr0_bcr.bottom;
			if(DEBUG)console.log("h="+h);
			$(".base_cover_panel").css({"height":h,"top":hr0_bcr.bottom-60});
			$(".base_cover_panel").toggleClass("show");

			if(window.app.BASE_ENABLED)window.app.BASE_ENABLED=false;
			else window.app.BASE_ENABLED=true;

			//inspect checkbox states and reload if set
			//otherwise loading takes place in checkboxCB
			var keys=window.app.CATEGORIES["Base Layers"]['keys'];
			if(!state){
				for(var kidx=0;kidx<keys.length;kidx++){
					var key=keys[kidx];
					if(window.app.CATEGORIES["Base Layers"][key]['toggle']==1){
						if(DEBUG)console.log("adding "+key);
						window.map.getLayers().insertAt(0, window.app.CATEGORIES["Base Layers"][key]['layer']);
					}
				}
			}
			else{
				for(var kidx=0;kidx<keys.length;kidx++){
					var key=keys[kidx];
					if(window.app.CATEGORIES["Base Layers"][key]['toggle']==1){
						if(DEBUG)console.log("removing "+key);
						window.map.removeLayer(window.app.CATEGORIES["Base Layers"][key]['layer']);
					}
				}
			}

		});

	}

	me.make_layer_row=function(category,layer_name){
		if(DEBUG)console.log("make_layer_row: "+category+"."+layer_name);
		var rdiv=document.createElement("div");
		var rtab=document.createElement("table");
		rtab.className="layer_table";
		var rrtab=rtab.insertRow(-1);
		var crtab=rrtab.insertCell(-1);

		var layer_label=document.createElement("div");
		layer_label.innerHTML=layer_name;
		layer_label.className="layer_label";
		var id=layer_name+parseInt(1E9*Math.random()).toString();
		layer_label.id=id;
		crtab.className="layer_cell";
		crtab.appendChild(layer_label);

		var crtab=rrtab.insertCell(-1);
		crtab.className="icon_cell";
		var idn=category.replace("_"," ")+"_"+layer_name+"_"+parseInt(1E9*Math.random());
		if(DEBUG)console.log("idn="+idn);
		var img=new Image();
		img.id=idn;
		img.className="icon";

		var toggle=false;
		toggle=window.app.CATEGORIES[category][layer_name]['toggle'];
		if(toggle)
			img.src="activity/img/checkbox-1.png";
		else
			img.src="activity/img/checkbox-0.png";

		crtab.appendChild(img);
		img.addEventListener("click",me.layer_checkboxCB,false);

		var crtab=rrtab.insertCell(-1);
		crtab.className="icon_cell";
		var idn=category+"_"+layer_name+"_hamburger_"+parseInt(1E9*Math.random());
		var img=new Image();
		img.id=idn;
		img.className="icon";
		img.src="activity/img/flaticon/interface-1.png";
		crtab.appendChild(img);
		img.addEventListener("click",me.popoutCB,false);


		rdiv.appendChild(rtab);
		return rdiv;
	}
	me.category_block=function(category){
		if(DEBUG)console.log("category_block: "+category);
		var opts={
			'category':category,
			'parent_id':'control_panel',
			'id':category.replace("_"," "),
			'className':'roll_up_div',
			'roll_up_class':'rollup',
			'roll_up_name':category.replace("_"," "),
			'arrow_img':'activity/img/arrow.png',
			'roll_up_icon_src':'activity/img/arrow.png',
		};
		var rollup=new RollUpDiv(opts);

		var lt=document.createElement("table");//lt=LayersTable
		lt.className="layer_table";
		var layer_names=window.app.CATEGORIES[category]['keys'];
		for(var lidx=0;lidx<layer_names.length;lidx++){
			var layer_name=layer_names[lidx];
			var r=lt.insertRow(-1);
			var c=r.insertCell(-1);
			c.appendChild(me.make_layer_row(category,layer_name));
		}

		rollup.rollup.appendChild(lt);
		if(category=="Base Layers")
			$("#control_panel").append(make_hr("hr3"));
		else
			$("#control_panel").append(make_hr());
	}

	me.make_category_blocks=function(){
		if(DEBUG)console.log("make_category_blocks");
		var keys=window.app.CATEGORIES['keys'];//keys doesn't contain BASE or BOUNDARY
		for(var kidx=0;kidx<keys.length;kidx++){
			key=keys[kidx];
			me.category_block(key);
		}
	}

	me.rebuild=function(){
		var control_panel=document.getElementById("control_panel");
		var children=control_panel.childNodes;
		for(var cidx=children.length-1;cidx>5;cidx--){//NEED:improve on this "9"
			if(DEBUG)console.log("removing: "+children[cidx].id);
			control_panel.removeChild(children[cidx]);
		}
		me.make_category_blocks();
	}

	me.layer_checkboxCB=function(e){

		if(DEBUG)console.log(e.target.id);

		var img=e.target;
		var category=e.target.id.split("_")[0];
		category=category.replace("ZZZ"," ");
		var layer_name=e.target.id.split("_")[1];
		layer_name=layer_name.replace("ZZZ"," ");

		if(get_basename(img.src)=="checkbox-0.png"){
			img.src="activity/img/checkbox-1.png";
			if(category=="Base Layers"){
				window.map.getLayers().insertAt(0, window.app.CATEGORIES[category][layer_name]['layer']);
				window.app.CATEGORIES[category][layer_name]['toggle']=true;
			}
			else{
				window.map.addLayer(window.app.CATEGORIES[category][layer_name]['layer']);
				window.app.CATEGORIES[category][layer_name]['toggle']=true;
			}
		}
		else{
			img.src="activity/img/checkbox-0.png";
			window.map.removeLayer(window.app.CATEGORIES[category][layer_name]['layer']);
			window.app.CATEGORIES[category][layer_name]['toggle']=false;
		}
	}
	me.rangeCB=function(e){
		if(DEBUG)console.log("rangeCB: "+e.target.id);

		var split_id=e.target.id.split("_");
		var category=split_id[0].replace("ZZZ"," ");
		var layer_name=split_id[1].replace("ZZZ"," ");
		var attribute_name=split_id[2];

		if(DEBUG)console.log(category+"."+layer_name+"."+attribute_name+" "+e.target.value);

		range=document.getElementById(e.target.id);

			if(DEBUG)console.log(window.app.CATEGORIES[category][layer_name]['layer'].getKeys());
			if(DEBUG)console.log("setting "+attribute_name+" to "+parseFloat(range.value)/100.);
			window.app.CATEGORIES[category][layer_name]['layer'].set(attribute_name,parseFloat(range.value)/100.);
			cmd="window.app.CATEGORIES['"+category+"']['"+layer_name+"']['layer'].set"+attribute_name+"("+parseFloat(range.value)/100.+")";
			if(DEBUG)console.log(cmd);
			var dummy=eval(cmd);

	}
	me.popoutCB = function(e) {

		if(DEBUG)console.log(e.target.id);

		var category=e.target.id.split("_")[0];//.replace(" ","ZZZ");
		var layer_name=e.target.id.split("_")[1];
		if(DEBUG)console.log(category+"."+layer_name);

		$(".popout_panel").css({"top":(e.clientY-100)+"px"});
		$(".popout_panel").html("");
		$(".popout_panel").html(layer_name);

		var t=document.createElement("table");
		t.align="center";

		var attribute_names=['Opacity'];//,'Brightness','Saturation','Contrast','Hue'
		for(var aidx=0;aidx<attribute_names.length;aidx++){
			var r=t.insertRow(-1);
			var c=r.insertCell(-1);
			var label=document.createElement("div");
			label.style.color="white";
			label.innerHTML=attribute_names[aidx];
			label.className="popout_label";
			c.appendChild(label);

			var w=document.createElement("input");
			w.type="range";
			w.id=category+"_"+layer_name+"_"+attribute_names[aidx];
			w.setAttribute("min",0);
			w.setAttribute("max",100);

			var val=window.app.CATEGORIES[category][layer_name]['layer'].getOpacity()*100;
			if(DEBUG)console.log(val);
			w.setAttribute("value",val);

			w.style.width="100px";
			c=r.insertCell(-1);
			c.appendChild(w);
			w.addEventListener("change",me.rangeCB,false);
		}
		$("#popout_panel").append(t);
		$(".popout_panel").toggleClass("show");
	};

	me.make_persistent_content();

	var hr0_bcr=document.getElementById("hr0").getBoundingClientRect();
	var hr3_bcr=document.getElementById("hr3").getBoundingClientRect();
	var h=hr3_bcr.top-hr0_bcr.bottom;
	if(DEBUG)console.log("h="+h);
	$(".base_cover_panel").css({"height":h,"top":hr0_bcr.bottom-60});

	return me;
}
