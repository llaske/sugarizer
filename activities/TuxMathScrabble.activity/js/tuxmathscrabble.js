var TuxMathScrabble=function(){
	me={};
	var submission=new Array();
	var trays=new Array();
	var players=new Array();
	var actor_names=["Tux2D","LittleTux2D"];
	var actor_x0s=window.ACTOR_X0S;
	var actor_y0s=window.ACTOR_Y0S;

	for(var idx=0;idx<2;idx++){

		trays.push(new Board(idx+1,null,1,window.NN+window.NO+window.NE));

		var robot=false;
		var player_name="robot";

		if(idx==0){
			if(window.PLAYER1=="robot")robot=true;
			else player_name=window.PLAYER1;
		}
		else if(idx==1){
			if(window.PLAYER2=="robot")robot=true;
			else player_name=window.PLAYER2;
		}

		players.push(new Player(1,actor_x0s[idx],actor_y0s[idx],actor_names[idx],trays[idx],robot,player_name));

	}

	me.board=new Board(0,null,window.NR,window.NC);

	var content=document.getElementById("content_div");
	var vspc=document.createElement("div");//this is simple method am using for vertical layout and centering, since re-calculating everything on resize anyway
	vspc.id="vspc";
	vspc.style.width="10px";
//	vspc.style.background="red";

	content.appendChild(vspc);
	content.appendChild(trays[0].container_table);
	content.appendChild(me.board.container_table);
	content.appendChild(trays[1].container_table);

	me.queue=[];
	me.qid=0;
	me.trays=trays;
	me.players=players;
	window.PLAYERS=players;
	me.submission=submission;

	//me.soundEfx=new Audio("/static/tms/secosmic_lo.wav");
	//me.soundEfx.play();

	me.solver=new TMSSolver(me.board);

	me.validator=new Validator(me.board);

	me.init=function(){
//////FROM HTML:
	for(var idx=0;idx<2;idx++){
		me.trays[idx].allocate_spots(idx+1);
	}
	me.board.allocate_spots(0);

	me.resetCB();



	$('#background_div').trigger('create');

	document.getElementById("background_div").addEventListener("touchstart",function(event){
		var touch=event.targetTouches[0];

		window.debug_pyld_obj['tap']="("+touch.pageX+","+touch.pageY+")";

		var spots=me.board.spots;
		spots=spots.concat(me.trays[0].spots);
		spots=spots.concat(me.trays[1].spots);

		for(var sidx=0;sidx<spots.length;sidx++){
			if(spots[sidx].contains(touch.pageX,touch.pageY)){
				window.debug_pyld_obj['spot']="("+spots[sidx].m+", "+spots[sidx].n+")";
				var r=spots[sidx].surf.getBoundingClientRect();
				window.debug_pyld_obj['spot']+=" ("+parseInt(r.left+window.S/2.)+","+parseInt(r.top+window.S/2.)+")";
				window.debug_pyld_obj['spot']+=" ("+ spots[sidx].surf.id +")";
				event.preventDefault();
				window.touch_report();
			}
		}
		for(var tidx=0;tidx<window.TILES.length;tidx++){
			var r=window.TILES[tidx].getBoundingClientRect();
			var x=touch.pageX;
			var y=touch.pageY;
			if(r.left<=x && x<= (r.left+r.width) ){
				if(r.top<=y && y<= (r.top+r.height) ){
					tr=window.TILES[tids].getBoundingClientRect();
					window.debug_pyld_obj['tile']="("+parseInt(tr.left+tr.width/2)+","+parseInt(tr.top+tr.height/2.)+")";
				}
			}
		}

	});


//////////END:FromHTML
	}






	me.resetCB=function(e){
		me.board.reset();
		me.exchangeCB(null);

	}
	me.exchangeCB=function(e){
		for(var idx=0;idx<2;idx++){
			me.trays[idx].dump_tiles();
		}
		me.drawCB(null);
	}
	me.drawCB=function(e){
		for(var idx=0;idx<2;idx++){
			me.trays[idx].draw_tiles(idx+1);
		}
	}
	me.exchange=function(){

		me.throwCB(null);
		me.trays[window.PLAYER_IDX].dump_tiles();
		me.drawCB(null);

		if(window.ANIMATIONS)
			me.add_anim("GoStageR");

		me.increment_player_idx();
		me.set_indicator();
	}
	me.increment_player_idx=function(){
		window.PLAYER_IDX+=1;
		if(window.PLAYER_IDX>1)window.PLAYER_IDX=0;
		me.set_indicator();
	}
	me.set_indicator=function(){
		if(window.CL)console.log(window.PLAYER1+", "+window.PLAYER2);
		ids=[
			['_b10','_b11','_b12'],
			['_b20','_b21','_b22',]
		];

		var viz="hidden";
		for(var idx=0;idx<2;idx++){//set the indicator
			var rid="br"+(idx+1);
			//if(window.CL)console.log("setting ROW"+rid+" to "+viz);
			document.getElementById(rid).style.visibility=viz;

			for(var cidx=0;cidx<ids[idx].length;cidx++){
				bid=ids[idx][cidx];
				//if(window.CL)console.log("setting BUTTON"+bid+" to "+viz);
				document.getElementById(bid).style.visibility=viz;
			}
		}

		viz="visible";
		var rid="br"+(window.PLAYER_IDX+1);
		//if(window.CL)console.log("setting ROW "+rid+" to "+viz);
		document.getElementById(rid).style.visibility=viz;

		for(var idx=0;idx<2;idx++){//set the indicator

			if(window.PLAYER_IDX!=idx)continue;

			if(window.CL)console.log("toggling row for PLAYER_IDX="+window.PLAYER_IDX);
			var rid="br"+(idx+1);
			//if(window.CL)console.log("setting ROW"+rid+" to "+viz);
			document.getElementById(rid).style.visibility=viz;

			bid=ids[idx][0]
			//if(window.CL)console.log("setting 0th "+bid+" to "+viz);
			document.getElementById(bid).style.visibility=viz;

			try{document.getElementById(bid).removeEventListener("click",me.commitCB);}
			catch(e){if(window.CL)console.log("exception removing commitCB");}

			try{document.getElementById(bid).removeEventListener("click",me.moveCB);}
			catch(e){if(window.CL)console.log("exception removing moveCB");}

			//if(window.MODE==0){
			if(false){
				if(window.CL)console.log("not adding any callback ... changed");
			}
			else if(window.PLAYER_IDX==0){
				if(window.PLAYER1=="robot"){
					if(window.CL)console.log("adding moveCB");
					document.getElementById(bid).firstChild.firstChild.src="./activity/make_move_button.png";
					document.getElementById(bid).addEventListener("click",me.moveCB);
				}
				else{
					if(window.CL)console.log("adding commitCB");
					document.getElementById(bid).firstChild.firstChild.src="./activity/check_move_button.png";
					document.getElementById(bid).addEventListener("click",me.commitCB);
				}
			}
			else if(window.PLAYER_IDX==1){
				if(window.PLAYER2=="robot"){
					if(window.CL)console.log("adding moveCB");
					document.getElementById(bid).addEventListener("click",me.moveCB);
					document.getElementById(bid).firstChild.firstChild.src="./activity/make_move_button.png";
				}
				else{
					if(window.CL)console.log("adding commitCB");
					document.getElementById(bid).addEventListener("click",me.commitCB);
					document.getElementById(bid).firstChild.firstChild.src="./activity/check_move_button.png";
				}
			}

			if(window.CL)console.log("toggling individual buttons for PLAYER_IDX="+window.PLAYER_IDX);
			for(var cidx=1;cidx<ids[idx].length;cidx++){
				bid=ids[idx][cidx];
				if(window.CL)console.log("setting BUTTON"+bid+" to "+viz);
				if(false){;}
				else if(idx==0 && window.PLAYER1!="robot")document.getElementById(bid).style.visibility=viz;
				else if(idx==1 && window.PLAYER2!="robot")document.getElementById(bid).style.visibility=viz;
			}
		}
	}


	me.mouse_down=function(ev){
		var tile=null;
		var last_spot=null;
		try{
			//verify that target was tile and not ptval div:
			tile=ev.target;
			last_spot=ev.target.parentNode;
			pyld=JSON.parse(tile.id);
			if(window.CL)console.log(pyld['uchar']);
		}
		catch(err){
			if(window.CL)console.log(err);
			tile=ev.target.parentNode;
			last_spot=ev.target.parentNode.parentNode;
		}

		if(window.CL)console.log("tile.id="+tile.id);
		if(window.CL)console.log("last_spot.id="+last_spot.id);


		var found=false;
		for(var idx=0;idx<me.submission.length;idx++)
			if(me.submission[idx]['surf_id']==tile.id)
				found=true;

		log("mouse_down sec1 found="+found);

		if(!found){
			pyld={};
			try{
				window.LAST_SPOT_ID=last_spot.id;
				if(window.CL)console.log("sec1 window.LAST_SPOT_ID="+window.LAST_SPOT_ID);

				pyld=JSON.parse(tile.id);
				if(window.CL)console.log("mouse_down parse=okay");

				pyld['last_spot_id']=last_spot.id;

				pyld['surf_id']=tile.id;
				pyld['spot_id']='blank';
				pyld['uchar']=tile.innerHTML;
				pyld['class']=tile.className;
				me.submission.push(pyld);
				if(window.CL)console.log("mouse_down submission added. "+me.submission.length);
			}
			catch(err){
				if(window.CL)console.log("ERROR mouse_down sec2 "+err);
				id="player_"+(window.PLAYER_IDX+1)+"_indicator";
				document.getElementById(id).style.background="red";
			}
		}
	}

	me.drag=function(e){
		if(window.CL)console.log("drag");
		e.dataTransfer.setData("Text",e.target.id);
	}

	me.allow_drop=function(ev){
		if(window.CL)console.log("allow_drop");
		//if(e.target.occupied)return;
		//log(e.target.id);
		ev.preventDefault();
	}
	me.drop=function(ev){
		if(window.CL)console.log("drop");
		ev.preventDefault();
		var data=ev.dataTransfer.getData("Text");//this is not actually text anymore .. it's a div element, suitably transformed.
		ev.target.appendChild(document.getElementById(data));

		msg="appending data of "+JSON.parse(data)['ukey']+" to spot "+JSON.parse(ev.target.id)['ridx']+", "+JSON.parse(ev.target.id)['cidx'];
		if(window.CL)console.log(msg);
		if(window.CL)console.log(ev.target);
		if(window.CL)console.log(document.getElementById(data));//data is the id ... that means tile, but retrieved from document.

		found=false;
		for(var idx=0;idx<me.submission.length;idx++){
			if(me.submission[idx]['surf_id']==data){
				if(window.CL)console.log("drop updating submission[spot_id]");
				me.submission[idx]['spot_id']=ev.target.id;
				if(window.CL)log("<br><br>setting spot_id:"+ev.target.id+"<br><br>");
				found=true;
				break;
			}
		}

		//if submission not found (typically mouse error at mouse_down) then can still add it here:
		if(!found){
			try{
				pyld=JSON.parse(data);
				pyld['last_spot_id']=window.LAST_SPOT_ID;//check hos this gets set/where
				log("drop: 2nd setting lsid="+window.LAST_SPOT_ID+" "+me.submission.length);
				pyld['surf_id']=data;
				pyld['spot_id']=ev.target.id;
				pyld['uchar']=pyld['uchar'];
				pyld['class']=pyld['class'];

				if(ev.target.B==0){
					me.submission.push(pyld);
					if(window.CL)console.log(pyld);
				}
			}
			catch(err){
				log("drop post-add: "+err);
				//me.throwCB(e);
			}
		}
	}

	me.rescale_interface=function(){

		if(window.CL)console.log("rescale_interface");

		var bg=document.getElementById("background_div");
		var remake=false;
		for(var idx=0;idx<4;idx++){
			try{
				slide_panel=bg.removeChild(window.slide_panels[idx]);
			}
			catch(e){
				if(window.CL)console.log("failed to remove slide_panel "+idx);
				remake=true;
			}
		}

		var content=document.getElementById("content_div");
		var W=content.clientWidth;
		var H=content.clientHeight-window.NAVBAR_HEIGHT;
		var XC=parseInt(W/2.);
		var YC=parseInt(H/2.);

		if(H<W){
			if(window.BORDER==2)window.S=parseInt(1.0*(H-(window.NR+2)*12)/(window.NR+2.));
			else window.S=parseInt(1.0*(H-(window.NR+2)*6)/(window.NR+2.));
		}
		else{
			if(window.BORDER==2)window.S=parseInt(1.0*(W-window.NC*12)/(window.NC));
			else window.S=parseInt(1.0*(W-window.NC*6)/(window.NC));
		}

		if(window.BORDER==2)window.tile_fontsize=parseInt(window.S*.7)+"px";
		else window.tile_fontsize=parseInt(window.S*.8)+"px";

		window.subscript_fontsize=parseInt(window.S*.2)+"px";

		me.board.rescale();
		for(var idx=0;idx<2;idx++){
			me.trays[idx].rescale();
		}

		var vsum=0;
		vsum+=me.trays[0].container_table.clientHeight;
		vsum+=me.board.container_table.clientHeight;
		vsum+=me.trays[1].container_table.clientHeight;

		document.getElementById("vspc").style.height=((window.innerHeight-window.NAVBAR_HEIGHT-vsum)/2)+"px";


		me.initialize_settings_system();//this calls make_player_buttons to get spacing;subsequent mgmt via set_indicator!!

		//Basically, do this here (vs tms.html-level) since re-making 4x slide_panels every
		//time rescale_interface() called.  Previously was saving panels if already existed, just
		//detatching and re-parenting ... that was more complex ... turns out okay to just destroy/remake, like here.
		me.render_status();
		me.set_indicator();

	}//END:me.rescale_interface


////
	me.initialize_settings_system=function(){

		//rebuilding around 4x identical slide-out menus @4 corners0,1,2,3 = tlc,trc,lrc,llc
		var slide_panels=new Array();
		var icons=["carat-r","carat-l","carat-l"];
		var button_ids=["hideB0_OFF","hideB1","hideB2"];
		var div_ids=["buttons_div0","buttons_div1","buttons_div2"];
		var sub_table_ids=["sub_table0","sub_table1","sub_table2","sub_table3"];
		var W_DUMMY=100;
		var b_width=40;//changing window.L_IFACE_BUTTON scaled dynamically
		for(var idx=0;idx<3;idx++){

			var slide_panel=document.createElement("div");
			slide_panel.style.position="absolute";
			slide_panel.id="slide_panel"+idx;
			var tb,tc0,tc1,hideB,buttons_div;

			tb=document.createElement("table");
			//tb.style.background="#333333";
			tr=tb.insertRow(-1);

			tc0=tr.insertCell(-1);
			tc1=tr.insertCell(-1);

			hideB=document.createElement("input");
			hideB.type="button";
			hideB.id=button_ids[idx];
			hideB.title="Display menu";
			hideB.className="ui-btn ui-btn-inline ui-corner-all";//ui-mini
			hideB.setAttribute("data-icon",icons[idx]);
		//	hideB.setAttribute("data-mini","true");
			hideB.setAttribute("data-iconpos","notext");

			buttons_div=document.createElement("div");
			buttons_div.id=div_ids[idx]
		//	buttons_div.style.width=W_DUMMY+"px";

			var sub_table=document.createElement("table");
			sub_table.id=sub_table_ids[idx];
		//	sub_table.cellPadding="10px";

			br=sub_table.insertRow(-1);//str=sub table row
			br.id="br"+idx;
			buttons_div.appendChild(sub_table);

			if(idx==0 || idx==3){
				tc0.appendChild(buttons_div);
				tc1.appendChild(hideB);
			}
			else{
				tc0.appendChild(hideB);
				tc1.appendChild(buttons_div);
			}
			slide_panel.appendChild(tb);
			slide_panels.push(slide_panel);

		}


		var bg=document.getElementById("background_div");

		bg.appendChild(slide_panels[1]);
		slide_panels[1].style.top="0px";
		slide_panels[1].style.left=parseInt(window.innerWidth-b_width)+"px";
		slide_panels[1].style.zIndex=10;
		slide_panels[1].style.background="#333333";
		slide_panels[1].className="ui-corner-all";



		bg.appendChild(slide_panels[2]);
		slide_panels[2].style.left=parseInt(window.innerWidth-b_width)+"px";
		slide_panels[2].style.zIndex=10;
		slide_panels[2].style.background="#333333";
		slide_panels[2].className="ui-corner-all";

		//call make_player_buttons -> fill br1,br2, then get new widths and scoot left!!
		me.make_player_buttons();

		window.slide_panels=slide_panels;

		me.make_slide_panel0();//here we set window.L_IFACE_BUTTON
		window.slide_panels[1].style.left=(window.innerWidth-window.slide_panels[1].clientWidth)+"px";
		window.slide_panels[2].style.top=parseInt(window.innerHeight-slide_panels[2].clientHeight-window.NAVBAR_HEIGHT)+"px";
		window.slide_panels[2].style.left=(window.innerWidth-window.slide_panels[2].clientWidth)+"px";

		window.SP1_EXPANDED=true;//1)anchored at spbw; 2) make_player_buttons caused expansion to right (offscreen) ~ false
		$("#hideB1").click(function(){
			var dx;
			if(window.SP1_EXPANDED==true){
				dx="+="+(window.slide_panels[1].clientWidth-b_width)+"px";
				window.SP1_EXPANDED=false;
			}
			else{
				dx="-="+(window.slide_panels[1].clientWidth-b_width)+"px";
				window.SP1_EXPANDED=true;
			}
			$("#slide_panel1").animate({
				left:dx
			},400,function(){});
		});

		window.SP2_EXPANDED=true;
		$("#hideB2").click(function(){
			var dx;
			if(window.SP2_EXPANDED==true){
				dx="+="+(window.slide_panels[2].clientWidth-b_width)+"px";
				window.SP2_EXPANDED=false;
			}
			else{
				dx="-="+(window.slide_panels[2].clientWidth-b_width)+"px";
				window.SP2_EXPANDED=true;
			}
			$("#slide_panel2").animate({
				left:dx
			},400,function(){});
		});

		$("#background_div").trigger("create");
	}
	me.random_color=function(){
		var rval="#";
		var chars=["0","1","5","6","A","B","C","D","E","F"];
		for(var dummy=0;dummy<6;dummy++){
			var cidx=parseInt(Math.random()*chars.length);
			try{rval+=chars[cidx];}
			catch(e){rval+="F";}
		}
		return rval;
	}
	me.make_slide_panel0=function(){
		var status_panel=document.createElement("div");
		status_panel.id="status_panel";

		var tms_buttons_panel=document.createElement("div");
		tms_buttons_panel.id="tms_buttons_panel";

		var debug_panel_tlc;
		try{
			debug_panel_tlc=document.getElementById("debug_panel_tlc");
			dummy=bg.removeChild(debug_panel_tlc);}
		catch(e){
			debug_panel_tlc=document.createElement("div");
			debug_panel_tlc.className="ui-btn ui-btn-inline  ui-corner-all";
			debug_panel_tlc.id="debug_panel_tlc";
			debug_panel_tlc.style.visibility="hidden";
			debug_panel_tlc.style.width="0px";
			window.debug_pyld_obj=window.template_debug_pyld_obj;
			window.debug_pyld_obj["S"]=window.S;
		}

				var st=document.createElement("table");
		st.id="status_buttons_table";
		st.style.position="absolute";
		var str=st.insertRow(-1);

		stc0=str.insertCell(-1);//cell for sub-table

		/////sub-status-button-table
		var sst=document.createElement("table");
		stc0.appendChild(sst);
		sstr0=sst.insertRow(-1);
		sstc0=sstr0.insertCell(-1);
		sstc0.appendChild(status_panel);//this gets rewritten every call to render_status()

		sstr1=sst.insertRow(-1);
		sstc1=sstr1.insertCell(-1);
		sstc1.appendChild(tms_buttons_panel);//don't want to remake these every update so keep in separate cell/div

		sstr2=sst.insertRow(-1);
		sstc2=sstr2.insertCell(-1);
		sstc2.appendChild(debug_panel_tlc);

		stc1=str.insertCell(-1);
		var hide_statusB=document.createElement("input");
		hide_statusB.type="button";
		hide_statusB.id="hide_statusB";
		hide_statusB.title="Status Panel";
		hide_statusB.className="ui-btn ui-btn-inline ui-corner-all";//ui-mini
		hide_statusB.setAttribute("data-icon","carat-r");
		hide_statusB.setAttribute("data-mini","true");
		hide_statusB.setAttribute("data-iconpos","notext");
		stc1.appendChild(hide_statusB);

		var bg=document.getElementById("background_div");
		bg.appendChild(st);
		window.slide_panels[0]=st;
		st.style.top="0px";
		st.style.left="0px";
		st.style.zIndex=10;

		//once appended to doc and status info rendered can get clientW,H info for button layout:
		me.render_status();
		status_panel=document.getElementById("status_panel");
		tms_buttons_panel=document.getElementById("tms_buttons_panel");


		var w_tbp=status_panel.clientWidth;
		var tbt=document.createElement("table");
		tbt.id="tms_buttons_table";
		tbtr=tbt.insertRow(-1);
		var bnames=["start_demo","set_mode","play_game","tux_factor_button", "skill_level_button","grid_size","line_size","change_background","help_button","about_button","algorithm_button","home_button"];
		var img_ids=["start_demo_img","set_mode_img","play_game_img","line_size_img","grid_size_img","change_background_img","help_button_img","about_button_img","algorithm_button_img","home_button_img"];
		var bcolors=["yellow","#00CCFF","#00FF42","#FF00FF","#00FF42","#0042FF","red","#FF00FF","#00FF42","#00CCFF","yellow","orange"];

		var tbt_ncol=3;
		var col_count=0;

		window.L_IFACE_BUTTON=w_tbp/tbt_ncol;

		for(var bidx=0;bidx<bnames.length;bidx++){

			var img=new Image();
			img.src="./activity/"+bnames[bidx]+".png";
			var bg_tile=document.createElement("div");
			bg_tile.style.width=parseInt(window.L_IFACE_BUTTON)+"px";
			bg_tile.style.height=parseInt(window.L_IFACE_BUTTON)+"px";
			img.style.width=parseInt(window.L_IFACE_BUTTON)+"px";
			img.style.height=parseInt(window.L_IFACE_BUTTON)+"px";
			img.className="ui-corner-all";

			img.id=img_ids[bidx];

			img.title=bnames[bidx];
			bg_tile.appendChild(img);
			bg_tile.style.background=bcolors[bidx];//me.random_color();
			bg_tile.className="ui-corner-all interface_button";
			bg_tile.id=bnames[bidx];
			bg_tile.title=bnames[bidx];

			if(col_count>tbt_ncol-1){tbtr=tbt.insertRow(-1);col_count=0;}
			tbtc=tbtr.insertCell(-1);
			col_count+=1;
			tbtc.appendChild(bg_tile);

		}

		tms_buttons_panel.appendChild(tbt);

		$("#start_demo").click(function(){
			if(window.RUNNING==true){
				document.getElementById("start_demo_img").src="./activity/start_demo.png";
				me.stop();
				window.STATUS="Stopped"
				window.RUNNING=false;
				me.render_status();
				return;
			}
			else{
				document.getElementById("start_demo_img").src="./activity/stop_demo.png";
				me.stop();
				me.resetCB();
			}

			window.MODE=0;
			window.PLAYER1="robot";
			window.PLAYER2="robot";
			me.players[0].robot=true;
			me.players[1].robot=true;
			me.players[0].player_name="robot";
			me.players[1].player_name="robot";
			me.PLAYER_IDX=1;

			window.RUNNING=true;
			me.start();
			window.STATUS="Demo"
			me.render_status();
		});
		$("#play_game").click(function(){

			me.stop();
			me.resetCB();

			window.MODE=1;
			window.PLAYER1="robot";
			window.PLAYER2="guest";
			me.players[0].robot=true;
			me.players[1].robot=false;
			me.players[0].player_name="robot";
			me.players[1].player_name="guest";
			me.PLAYER_IDX=1;
			me.resetCB();
			me.moveCB();
			window.STATUS="Playing";
			me.render_status();

		});

		$("#hide_statusB").click(function(){
			$("#status_panel").animate({
				width:'toggle'
			},400,function(){});
			$("#tms_buttons_panel").animate({
				width:'toggle'
			},400,function(){});
		});

		$("#set_mode").click(function(){

			me.stop();//only sets window.RUNNING=false

			window.MODE+=1;
			if(window.MODE>3)window.MODE=0;

			if(false){;}
			else if(window.MODE==0){
				window.PLAYER1="robot";
				window.PLAYER2="robot";
				me.players[0].robot=true;
				me.players[1].robot=true;
				me.players[0].player_name="robot";
				me.players[1].player_name="robot";
//				me.start();
			}
			else if(window.MODE==1){
				window.PLAYER1="robot";
				window.PLAYER2="guest";
				me.players[0].robot=true;
				me.players[1].robot=false;
				me.players[0].player_name="robot";
				me.players[1].player_name="guest";
			}
			else if(window.MODE==2){
				window.PLAYER1="guest";
				window.PLAYER2="robot";
				me.players[0].robot=false;
				me.players[1].robot=true;
				me.players[0].player_name="guest";
				me.players[1].player_name="robot";
			}
			else if(window.MODE==3){
				window.PLAYER1="guest";
				window.PLAYER2="guest";
				me.players[0].robot=false;
				me.players[1].robot=false;
				me.players[0].player_name="guest";
				me.players[1].player_name="guest";
			}
			me.resetCB(null);
			me.render_status();
			me.set_indicator();

		});//END:modeB.on("click" ...
		$("#line_size").click(function(){
			me.stop();
			if(window.BORDER==2){window.BORDER=1;}
			else{window.BORDER=2;}
			window.remake_tms();
		});

		$("#change_background").click(function(){

			bg_idx=window.bg_imgs.indexOf(window.bg_img_name);
			bg_idx+=1;
			if(bg_idx>=bg_imgs.length){
				bg_idx=0;
				bg_img=window.bg_imgs[bg_idx];
			}
			window.bg_img_name=window.bg_imgs[bg_idx];

			var bg_div=document.getElementById("background_div");
			bg_div.style.backgroundImage="url("+window.bg_img_name+")";

		});

		$("#grid_size").click(function(){
			me.stop();
			if(window.NR==9){
				window.NR=13;
				window.NC=17;
			}
			else{
				window.NR=9;
				window.NC=12;
			}
			window.remake_tms();
		});

		$("#help_button").click(function(){
			helpCB();
		});
		$("#about_button").click(function(){
			aboutCB();
		});
		$("#algorithm_button").click(function(){
			debug_solverCB();
		});
		$("#tux_factor_button").click(function(){
			me.stop();
			window.TUXFACTOR=window.TUXFACTOR+1;
			if(window.TUXFACTOR>4)window.TUXFACTOR=1;
			me.resetCB();
			me.render_status();
		});
		$("#skill_level_button").click(function(){
			me.stop();
			window.LEVEL=window.LEVEL+1;
			if(window.LEVEL>4)window.LEVEL=1;
			me.resetCB();
			me.render_status();
		});
		$("#home_button").click(function(){
			document.location="/";
		});
	}
	me.make_player_buttons=function(){
		//This gets called 1x at beginning, subsequent mgmt handled by TMS.set_indicator()
		var tooltips=[
			['Move','Throw back','Draw new tiles and skip turn',],
			['Move','Throw back','Draw new tiles and skip turn',]
		];
//		var icons=[
//			['check','delete','recycle'],
//			['check','delete','recycle'],
//		]

		var bnames=["make_move_button","throw_back_button","skip_move_button"];

		var ids=[
			['_b10','_b11','_b12'],
			['_b20','_b21','_b22',]
		];

		var player1_CBs=[me.commitCB,me.throwCB,me.exchange];
		var player1_viz=['visible','visible','visible',];

		var player2_CBs=[me.commitCB,me.throwCB,me.exchange];
		var player2_viz=['visible','visible','visible',];

		CBs=[
			player1_CBs,
			player2_CBs
		];

		viz=[
			player1_viz,
			player2_viz,
		];
		var bcolors=[
			["#00ccff","#00ccff","#00ccff"],
			["#00FF42","#00FF42","#00FF42"]
		];

		for(var pidx=1;pidx<3;pidx++){

			if(window.CL)console.log("pidx="+pidx);

			br=document.getElementById("br"+pidx);
			//while(br.hasChildNodes())
			//	delete br.lastChild;

			c=br.insertCell(-1);
			d=document.createElement("div");
			tt=document.createElement("table");
			rr=tt.insertRow(-1);

			for(var bidx=0;bidx<bnames.length;bidx++){
				if(window.CL)console.log("bidx="+bidx);

				cc=rr.insertCell(-1);
				cc.id=ids[pidx-1][bidx];

				var img=new Image();
				img.src="./activity/"+bnames[bidx]+".png";
				var bg_tile=document.createElement("div");
				bg_tile.style.width=parseInt(window.L_IFACE_BUTTON)+"px";
				bg_tile.style.height=parseInt(window.L_IFACE_BUTTON)+"px";
				img.style.width=parseInt(window.L_IFACE_BUTTON)+"px";
				img.style.height=parseInt(window.L_IFACE_BUTTON)+"px";
				img.className="ui-corner-all";

				img.id=bnames[bidx]+""+pidx;

				img.title=bnames[bidx]+""+pidx;

				bg_tile.appendChild(img);
				bg_tile.style.background=bcolors[pidx-1][bidx];//me.random_color();
				bg_tile.className="ui-corner-all interface_button";
				bg_tile.id=bnames[bidx]+"_b"+pidx;

				cc.appendChild(bg_tile);

				if(bidx==1)bg_tile.addEventListener("click",me.throwCB);
				if(bidx==2)bg_tile.addEventListener("click",me.exchange);

			}
			d.appendChild(tt);
			c.appendChild(d);
		}
	}
	me.throwCB=function(e){

		log("throwing back submission of length: "+me.submission.length);

		for(var idx=0;idx<me.submission.length;idx++){
			try{

				s=me.submission[idx];

				log("1 throw back: "+s['surf_id']);
				log("2 throw back: "+JSON.parse(s['surf_id'])['ukey']);
				document.getElementById(s['last_spot_id']).appendChild(document.getElementById(s['surf_id']));

				board_num=JSON.parse(s['last_spot_id'])['board_num'];//window.PLAYER_IDX+1;//NEED:lock elsewhere during opponnent's turn
				me.trays[board_num-1].set_occupied(s['last_spot_id']);


			}
			catch(e){log("throwCB: "+e);}
		}

		if(window.PLAYER_IDX==0)
			me.trays[0].set_all_occupied();
		else if(window.PLAYER_IDX==1)
			me.trays[1].set_all_occupied();

		me.submission=new Array();
	}
	me.commitCB=function(ev){
		//alert("commitCB");
		//log_reset();
		var rval=null;
		try{
			log("calling validate with len="+me.submission.length);
			log(me.submission);
			rval=me.validator.validate_submission(me.submission);
		}
		catch(err){log("validation error: "+err);me.throwCB();}

		if(!rval){
			log("validator says NO");
			me.throwCB(null);
			return;
		}
		else{

			///////////////////////////////
			////POST-MOVE ANIMATION
			///////////////////////////////
			if(window.CL)console.log("@POST-MOVE-ANIMATION ADDING GoStageR");

			if(window.ANIMATIONS){
				//me.add_anim("Celebrate");
				me.add_anim("GoStageR");
				me.add_anim("Default");
				//me.add_anim("Taunt");
			}

			me.players[window.PLAYER_IDX].score+=me.validator.score;
			var last_spot_ids=me.board.commit_submission(me.submission);
			for(var idx=0;idx<last_spot_ids.length;idx++){

				//log("last_spot_ids="+JSON.stringify(last_spot_ids));
				try{
					plyridx=parseInt(JSON.parse(last_spot_ids[idx])['board_num']-1);
					me.trays[plyridx].untake(last_spot_ids[idx]);

				}//this would allow p1,p2 to submit using ea others' tiles;alteernative=window.PLAYER_IDX ... then need catch
				catch(err){log("untake error: "+err);}
			}
			me.submission=new Array();//prevent resubmit!

			me.render_status();
			me.board.increment_num_commited();

			//me.drawCB();
			if(window.PLAYER_IDX==1)
				me.trays[0].draw_tiles(1);
			else
				me.trays[1].draw_tiles(2);

			me.increment_player_idx();

		}
		me.set_indicator();
	}
	me.render_status=function(){

		d=document.getElementById("status_panel")
		d.innerHTML="";
		d.className="ui-btn ui-btn-inline  ui-corner-all";//ui-mini


////////PLAYERS

		d1=document.createElement("div");
		//d1.style.background="blue";
		var modes=["Robot-Robot","Robot-Human","Human-Robot","Human-Human"];
		d1.innerHTML="";
		d1.innerHTML+="<span>MODE:  "+window.MODE+"<br>"+modes[window.MODE]+"</span>";
		d1.innerHTML+="<br><span>"+me.players[0].player_name+" 1:  "+me.players[0].score+"</span>";
		d1.innerHTML+="<br><span>"+me.players[1].player_name+" 2:  "+me.players[1].score+"</span>";
		d1.innerHTML+="<hline>";
		d.appendChild(d1);


////////SETTINGS
		d1=document.createElement("div");
		d1.innerHTML="<span>Level:  "+window.LEVEL+"</span>";
		d.appendChild(d1);

		d1=document.createElement("div");
		d1.innerHTML="<span>Goal:  "+window.THRESHOLD+"</span>";
		d.appendChild(d1);

		d1=document.createElement("div");
		d1.innerHTML="<span>TuxFactor:  "+window.TUXFACTOR+"</span>";
		d.appendChild(d1);

//////////Window W,H:
		//if(window.CL){
			d1=document.createElement("div");
			d1.id="WidthHeightInfo";
			d1.innerHTML="<span>W,H:  "+window.innerWidth+", "+window.innerHeight+"</span>";
			d.appendChild(d1);
		//}

		d1=document.createElement("div");
		d1.id="StatusInfoDiv";
		d1.innerHTML="<span>Status: "+window.STATUS+"</span>";
		d.appendChild(d1);

		if(window.MODE>-1){
			finishB=document.createElement("input");
			finishB.type="button";
			finishB.id='finishB';
			finishB.value=window.CREDITS;
			finishB.text=window.CREDITS;
			finishB.className="ui-btn ui-btn-inline  ui-corner-all";//ui-mini
			finishB.setAttribute("data-icon","star");
//			finishB.setAttribute("data-mini","true");

/*
			d=window.collect_button_div;
			d.innerHTML="";
			d.className="ui-btn ui-btn-inline  ui-corner-all";//ui-mini
			d.tooltip="Congratulations! Click to collect credits";
			d.style.background="gold";
			d.style.opacity=1.0;
			d.style.visibility="hidden";
			d.disabled=true;

			if(me.players[window.PLAYER_IDX].score >= window.THRESHOLD){
				window.slide_panels[0].appendChild(d);
				d.style.opacity=1.;
				d.disabled=false;
				d.style.visibility="visible";
				if(me.players[window.PLAYER_IDX].player_name != "guest"){
					finishB.addEventListener("click",me.finish,false);
				}
				else{
					finishB.addEventListener("click",me.autoteach_feature,false);

				}

			}
			d.appendChild(finishB);
*/
		}

		$('#background_div').trigger('create');
	}

	me.moveCB=function(e){
		if(window.MODE==0 && window.RUNNING==false){return;}

//		alert("moveCB");
		if(window.CL)console.log("@moveCB");
		if(window.CL && e!=null)console.log(e);

//		log_reset();
		me.render_status();

		if(window.AMSTUCK==0){
			if(window.CL)console.log("@moveCB ADDING GoStageL");
			if(window.ANIMATIONS)me.add_anim("GoStageL");

			if(window.CL)console.log("@moveCB ADDING Default with CB=me.moveCB2");
			if(window.ANIMATIONS)
				me.add_anim("Default","me.moveCB2()");
			else
				me.moveCB2();
		}
		else{
			if(window.CL)console.log("AMSTUCK="+window.AMSTUCK+" so calling moveCB2 direct");
			me.moveCB2();
		}
	}
	me.stop=function(){
		window.RUNNING=false;
	}
	me.moveCB2=function(e){
		if(window.MODE==0 && window.RUNNING==false){return;}
		if(window.CL)console.log("@moveCB2");

		me.take_turn();
		me.board.show_occupied();

		me.render_status();
		me.set_indicator();

		if(window.AMSTUCK>2){
			if(window.CL)console.log("restarting");
			me.stop();
			me.resetCB();
//			me.start();
			window.RUNNING=true;
			window.AMSTUCK=0;
			me.moveCB();
		}
		else if(window.MODE==0 && window.RUNNING==true){
		  if(window.CL)console.log("Timeout will call moveCB in t=8.5s");
		  window.setTimeout(me.moveCB,8500);
		}
		me.board.show_occupied();
	}
	me.take_turn=function(){
		if(window.MODE==0 && window.RUNNING==false){return;}
		if(window.CL)console.log("@take_turn");

		timer=window.TIMER;
		timer.reset();

		me.submission=new Array();

		if(me.players[window.PLAYER_IDX].robot){

			var rlist=me.solver.get_rlist(me.trays[window.PLAYER_IDX]);

			if(window.CL)console.log("tms rlist: "+JSON.stringify(rlist));

			var tmp_spots=new Array();
			var tmp_tiles=new Array();
			var dtmp_tiles=new Array();

			var num_animations_complete=0;
			var num_animations_total=0;

			if(rlist){

				for(var ridx=0;ridx<rlist.length;ridx++){

					if(window.MODE==0 && window.RUNNING==false){return;}

					num_animations_total++;

					var ukey=rlist[ridx][0];
					var tm=rlist[ridx][1];
					var tn=rlist[ridx][2];

					var txy0 = me.trays[window.PLAYER_IDX].get_position(ukey);
					var tx0 = txy0.left;
					var ty0 = txy0.top;
					if(window.CL)log("txy0: "+tx0+", "+ty0);
					var s=me.board.get_spot(tm,tn);
					tmp_spots.push(s);

					var t=me.trays[window.PLAYER_IDX].get_tile(ukey);
					tmp_tiles.push(t);
					t.style.visibility="hidden";
					s.take_guest(t);

					var txy1=t.getBoundingClientRect();
					var tx1=txy1.left;
					var ty1=txy1.top;
					if(window.CL)log("txy1: "+tx1+", "+ty1);

					var dx=tx1-tx0;
					var dy=ty1-ty0;

					var dxstr="+="+Math.abs(dx)+"px";
					if(dx<0)dxstr="-="+Math.abs(dx)+"px";
					var dystr="+="+Math.abs(dy)+"px";
					if(dy<0)dystr="-="+Math.abs(dy)+"px";
					if(window.PLAYER_IDX==1){
						dy=ty0-ty1;
						dystr="-="+Math.abs(dy)+"px";
					}

					t.draggable=false;
					s.occupied.true;
					s.lock();
					s.surf.parentNode.removeEventListener("drop",me.drop);
					s.surf.parentNode.removeEventListener("dragover",me.allow_drop);
					me.board.increment_num_commited();

					var dtmp=document.createElement("div");
					dtmp.className="player"+(window.PLAYER_IDX+1);
					dtmp.innerHTML=t.innerHTML;//Nice!does complete clone of multiple programatically-added children ... i'm surprised.

					dtmp.style.left=tx0+"px";
					dtmp.style.top=ty0-window.NAVBAR_HEIGHT+"px";

					dtmp.style.width=t.style.width;
					dtmp.style.height=t.style.height;
					dtmp.style.opacity=0.3;
					if(false){
						dtmp.style.color="red";
						dtmp.style.background="#1d1d1d";
					}
					dtmp_tiles.push(dtmp);

					document.getElementById("content_div").appendChild(dtmp_tiles[ridx]);
					dtmp.style.position="absolute";
					dtmp.style.left=tx0;
					dtmp.style.top=ty0;

					$(dtmp).animate({opacity:0.8,top:dystr,left:dxstr},(ridx+1)*600,function(){

						num_animations_complete++;

						if(num_animations_complete==num_animations_total){
							if(window.CL)console.log("reparenting ...");
							for(var sidx=0;sidx<tmp_tiles.length;sidx++){
								tmp_tiles[sidx].style.visibility="visible";
								//tmp_tiles[sidx].parentNode.style.opacity=1.0;
								dtmp_tiles[sidx].style.visibility="hidden";

							}
							if(window.CL)console.log("calling take_turnCB 1");
							me.take_turnCB();
						}
						else{
							if(window.CL)console.log("not ready: "+num_animations_complete);
						}
					});
				}
				me.players[window.PLAYER_IDX].score+=me.solver.score;
				//NOTE:take_turnCB called after tile anim done, above (would fall-through w/o wait if here)
			}
			else{
				//this player exchange all tiles
				me.exchange(window.PLAYER_IDX);
				window.AMSTUCK+=1;
				if(window.CL)console.log("calling take_turnCB 2");
				me.take_turnCB();
			}
		}
		else{
			if(window.CL)console.log("calling take_turnCB 3");
			me.take_turnCB();
		}
		//just don't call me.take_turnCB() from here else short-circuits wait-for-player-to-finish
	}


	me.take_turnCB=function(){

		if(window.CL)console.log("@take_turnCB");

		if(window.ANIMATIONS){
			me.add_anim("GoStageR");
			me.add_anim("Default");
			me.add_anim("Taunt");
		}

		if(window.PLAYER_IDX==1)
			me.trays[0].draw_tiles(1);
		else
			me.trays[1].draw_tiles(2);

		///////////////////////////////
		////INCREMENT PLAYER INDEX
		///////////////////////////////
		me.increment_player_idx();
		if(window.CL)console.log("player idx incremented:"+window.PLAYER_IDX);
		///////////////////////////////
		////PRE-MOVE ANIMATION
		///////////////////////////////
		if(window.PLAYERS[window.PLAYER_IDX].robot==false && window.AMSTUCK==0){//if next=human -> GoStageLeft
			if(window.CL)console.log("@PRE-MOVE-ANIMATION ADDING GoStageL player_idx="+window.PLAYER_IDX);
			if(window.ANIMATIONS){
				me.add_anim("GoStageL");
				me.add_anim("Default");
			}
		}
	}
	me.start=function(){

		me.board.fade_off();

		//show demo aviso primero
		var xc=window.innerWidth/2;
		var yc=window.innerHeight/2;
		var msg=['T','u','x','M','a','t','h','S','c','r','a','b','b','l','e'];

		var surfs=new Array();
		var clones=new Array();
		window.CLONES=clones;
		var container_surf=document.createElement("div");
		container_surf.style.align="center";
		container_surf.style.visibility="visible";
		window.CONTAINER_SURF=container_surf;

		var clone_container_surf=document.createElement("div");
		clone_container_surf.style.align="center";
		clone_container_surf.style.visibility="visible";

		var surfs_table=document.createElement("table");
		sr=surfs_table.insertRow(-1);

		var w_total=0;
		for(var midx=0;midx<msg.length;midx++){
			var surf=document.createElement("div");
			//surf.style.background="green";
			surf.style.opacity=0.;
			var fsize=parseInt(.6*window.innerWidth/(msg.length));

			surf.innerHTML="<span style='text-shadow:none;font-family:Mickey;font-size:"+fsize+"pt;color:#00FF42;'>"+msg[midx]+"</span>";

			sr.insertCell(-1).appendChild(surf);
			w_total+=fsize;

			clone=document.createElement("div");
			clone.innerHTML=surf.innerHTML;
			clone.style.opacity=0.0;

			clones.push(clone);
			surfs.push(surf);

		}
		container_surf.appendChild(surfs_table);
		container_surf.id="container_surf";

		w_cs=container_surf.getBoundingClientRect().width;
		h_cs=container_surf.getBoundingClientRect().height;

		container_surf.style.position="absolute";
		//container_surf.style.background="red";
		container_surf.style.left=parseInt(xc-w_total/2.)+"px";
		container_surf.style.top=parseInt(yc-1.5*fsize)+"px";
		document.getElementById("content_div").appendChild(container_surf);

		xxr=surfs_table.insertRow(-1);
		xxc=xxr.insertCell(-1);
		xxc.colSpan="100";
		//xxc.align="center";
		xxc.style.textShadow="none";
		xxc.style.color="yellow";
		xxc.align="center";
		var xd=document.createElement("div");
		xd.style.opacity=0.0;

		var logo=window.logo_img;
		var w2h=270./100.;
		var logo_width=parseInt(0.25*window.innerWidth);
		logo.style.width=logo_width+"px";
		logo.style.height=parseInt(logo_width/w2h)+"px";
//		xxc.appendChild(logo);

		var num_animations_complete=0;
		var num_animations_total=clones.length;

		$(xd).animate({opacity:1.0},1700,function(){});

		for(var cidx=0;cidx<clones.length;cidx++){

			document.getElementById("content_div").appendChild(window.CLONES[cidx]);
			window.CLONES[cidx].style.position="absolute";
			window.CLONES[cidx].style.left=surfs[cidx].getBoundingClientRect().left+"px";
			window.CLONES[cidx].style.top=surfs[cidx].getBoundingClientRect().top-window.NAVBAR_HEIGHT+"px";

			$(window.CLONES[cidx]).animate({opacity:1.0},1700,function(){
				num_animations_complete++;
				if(num_animations_complete==num_animations_total){
					if(window.CL)console.log("reparenting ...");
					if(window.RUNNING==true)window.setTimeout(me.start2,2000);
				}
				else{
					if(window.CL)console.log("not ready: "+num_animations_complete);
				}
			});
		}
	}
	me.start2=function(){
		var xc=window.innerWidth/2.;
		var yc=window.innerHeight/2.;
		var num_animations_complete=0;
		var num_animations_total=window.CLONES.length;
		for(var cidx=0;cidx<window.CLONES.length;cidx++){

			var xdest=(1.-2.*Math.random())*xc;
			xdest_str="+="+xdest+"px";
			if(xdest<0)xdest_str="-="+Math.abs(xdest)+"px";
			if(window.CL)console.log(xdest_str);

			var ydest=(1.-2.*Math.random())*yc;
			ydest_str="+="+ydest+"px";
			if(ydest<0)ydest_str="-="+Math.abs(ydest)+"px";
			if(window.CL)console.log(ydest_str);

			$(window.CONTAINER_SURF).animate({opacity:0.0},3000);

			$(window.CLONES[cidx]).animate({top:"-=250px",opacity:0.0},3000,function(){
				num_animations_complete++;
				if(num_animations_complete==num_animations_total){
					if(window.CL)console.log("reparenting ...");
					document.getElementById("content_div").removeChild(document.getElementById("container_surf"));

					if(window.RUNNING==true)me.start3();

				}
				else{
					if(window.CL)console.log("not ready: "+num_animations_complete);
				}
			});

		}
	}
	me.start3=function(){

		for(var cidx=0;cidx<window.CLONES.length;cidx++)
			document.getElementById("content_div").removeChild(window.CLONES[cidx]);

		me.board.show_occupied();

		me.board.fade_on();

		if(window.RUNNING==true)
			window.setTimeout(me.moveCB,2000);

	}
	return me;
}
