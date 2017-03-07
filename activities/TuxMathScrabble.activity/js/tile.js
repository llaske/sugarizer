/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :GPLv3

***********************************************************/
var mkTile=function(dtype,plyridx){
	
	uchar="";
	ukey="";
	which="";
	pts="";
	
	var tile_base=document.createElement("div");
	var surf=document.createElement("div");
	
	if(plyridx==1){
		surf.className="player1";
		tile_base.className="tilebase1";
		if(window.BORDER==1)tile_base.className="tilebase11px";
	}
	else if(plyridx==2){
		surf.className="player2";
		tile_base.className="tilebase2";
		if(window.BORDER==1)tile_base.className="tilebase21px";
	}	
	tile_base.draggable=true;
	surf.style.width=parseInt(window.S)+"px";
	surf.style.height=parseInt(window.S)+"px";
	//surf.style.background="maroon";
	//surf.style.color="yellow";	
	//var dSdf=0.99;
	//var dS=window.S-35;
	//var df=dS/dSdf;
	//window.S+=parseInt(dS);
	surf.style.fontSize=window.tile_fontsize;
	
	if(dtype=="NUMBER"){
		var nidx=Math.floor(Math.random()*window.MAX_NUMS[window.LEVEL-1]);
		uchar=window.NUMBERS[nidx]["uchar"];
		ukey=window.NUMBERS[nidx]["ukey"];
		which=window.NUMBERS[nidx]["name"];
		pts=window.NUMBERS[nidx]["pts"];
		
		surf.innerHTML=uchar;
//		firstChild.nextSibling;
		
	}
	else if(dtype=="OPERATOR"){
		var oidx=Math.floor((Math.random()*window.OPERATORS[window.LEVEL-1].length));
		uchar=window.OPERATORS[window.LEVEL-1][oidx]["uchar"];
		ukey=window.OPERATORS[window.LEVEL-1][oidx]["ukey"];
		which=window.OPERATORS[window.LEVEL-1][oidx]["name"];
		pts=window.OPERATORS[window.LEVEL-1][oidx]["pts"];
		
		surf.innerHTML=uchar;
	}
	else{
		uchar=window.EQUAL;
		ukey="=";
		which="equal";
		pts=window.EQUAL_PTS;
		
		surf.innerHTML=uchar;
	}
	rand=Math.random();
	pyld={'plyridx':plyridx,'dtype':dtype,'which':which,'name':which,'uchar':uchar,'ukey':ukey,'pts':pts,'random':rand};
	tile_base.id=JSON.stringify(pyld);

	var subscript=document.createElement("div");
	subscript.className="subscript";
	subscript.style.fontSize=window.subscript_fontsize;
	subscript.innerHTML=pts;
	
	tile_base.appendChild(surf);
	tile_base.appendChild(subscript);
	
	//DRAG LISTENER
	if(navigator.appName=="Microsoft Internet Explorer")
		tile_base.attachEvent("dragstart",window.THE_TMS_INSTANCE.drag);
	else
		tile_base.addEventListener("dragstart",window.THE_TMS_INSTANCE.drag,false);
	
	//GRAB LISTENER
	if(navigator.appName=="Microsoft Internet Explorer")
		tile_base.attachEvent("mousedown",window.THE_TMS_INSTANCE.mouse_down);
	else{
		
		tile_base.addEventListener("mousedown",window.THE_TMS_INSTANCE.mouse_down,false);
		
		tile_base.addEventListener('touchmove',function(event){
			
			
			window.touch_report();
			var touch=event.targetTouches[0];
			if(!window.TOUCH_FLAG){
				last_spot=tile_base.parentNode;
				
				window.TOUCH_FLAG=true;
				
				var r=tile_base.getBoundingClientRect();
				window.debug_pyld_obj["tile"]="("+parseInt(r.left+window.S/2.)+", "+parseInt(r.top+window.S/2.)+")";
			
				window.debug_pyld_obj["xy0"]="("+touch.pageX+", "+touch.pageY+")";
				window.debug_pyld_obj["x0"]=touch.pageX;
				window.debug_pyld_obj["y0"]=touch.pageY;
				
				submission=window.THE_TMS_INSTANCE.submission;
				var found=false;
				for(var idx=0;idx<submission.length;idx++)
					if(submission[idx]['surf_id']==tile_base.id)
						found=true;
				
				if(!found){
					var spyld={};
					spyld=JSON.parse(tile_base.id);
					
					spyld['last_spot_id']=tile_base.parentNode.id;
					window.LAST_SPOT_ID=last_spot.id;
					
					spyld['surf_id']=tile_base.id;
					spyld['spot_id']='blank';
					spyld['uchar']=tile_base.firstChild.innerHtml;
					spyld['class']=tile_base.className;
					window.THE_TMS_INSTANCE.submission.push(spyld);
					window.debug_pyld_obj["pyld"]=window.THE_TMS_INSTANCE.submission.length;
				}
			}
			
			var tx=parseInt(touch.pageX-window.debug_pyld_obj["x0"])+"px";//-window.S/2
			var ty=parseInt(touch.pageY-window.debug_pyld_obj["y0"])+"px";//-window.S/2
			tile_base.style.left=tx;
			tile_base.style.top=ty;
			window.debug_pyld_obj['tileXY']="("+tx+", "+ty+")";
			
			var px=touch.pageX;
			var py=touch.pageY;
			window.lastX=px;
			window.lastY=py;
			window.debug_pyld_obj['lastXY']="("+px+", "+py+")";
			
			window.touch_report();
			
			event.preventDefault();
		},false);
		
		tile_base.addEventListener('touchend',function(event){
			if(window.CL)log("DROP");
			window.touch_report();
			var touch=event.changedTouches[0];
			spots=window.THE_TMS_INSTANCE.board.spots;
			
			var r_tile=tile_base.getBoundingClientRect();
			var xc_tile=parseInt(r_tile.left+window.S/2.);
			var yc_tile=parseInt(r_tile.top+window.S/2.);
			
			for(var sidx=0;sidx<spots.length;sidx++){
				//if(spots[sidx].contains(touch.pageX,touch.pageY)){
				if(spots[sidx].contains(xc_tile,yc_tile)){
					
					if(window.CL)log("HIT");
					window.debug_pyld_obj['spot']=spots[sidx].m+", "+spots[sidx].n;
					var r=spots[sidx].surf.getBoundingClientRect();
					window.debug_pyld_obj['spot']+=" ("+parseInt(r.left+window.S/2.)+", "+parseInt(r.top+window.S/2.)+")";
					window.debug_pyld_obj['spot']+=" ("+ spots[sidx].surf.id +")";
					
					//returned_tile_base=tile_base.parentNode.removeChild(tile_base);
					tile_base.style.left=null;
					tile_base.style.top=null;
					
					//spots[sidx].take_guest(tile_base);
					spots[sidx].surf.appendChild(document.getElementById(tile_base.id));
					if(window.CL)log("tile taken by:"+spots[sidx].surf.id);
					
					var submission=window.THE_TMS_INSTANCE.submission;
					var found=false;
					for(var idx=0;idx<submission.length;idx++){
						if(window.CL)log("checking submission for tile");
						if(submission[idx]['surf_id']==tile_base.id){
							if(window.CL){
								log("bingo");
								log("setting:"+submission[idx]['spot_id']);
								log("to:"+spots[sidx].surf.id);
							}
							submission[idx]['spot_id']=spots[sidx].surf.id;//easy.
							found=true;
							window.debug_pyld_obj["pyld"]="+"+submission.length;
							break;
						}
					}
					if(!found){
						tile_base.style.background="red";
						if(window.CL)log("We did not find id="+tile_base.id);
					}
					window.TOUCH_FLAG=false;
					event.preventDefault();
					
				}
			}
			
			//alert(touch.pageX+", "+touch.pageY);
			event.preventDefault();
			window.touch_report();
		},false);
	}
	window.TILES.push(tile_base);
	return tile_base;
}
