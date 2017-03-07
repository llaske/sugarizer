/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Spot=function(B,S,ridx,cidx){
	
	var me={};
	me.B=B;
//	me.S=S;
	me.m=ridx;
	me.n=cidx;
	//log("Spot: "+me.m+" "+me.n);
	me.occupied=false;
	me.locked=false;
	me.guest=null;
	
	surf=document.createElement("div");
	surf.className="spot";
	if(window.BORDER==1)surf.className="spot1px";
	
	surf.draggable=false;
//	surf.style.background="black";
//	surf.style.border="2px solid";
//	surf.style.borderColor="lightblue";//"#4075AA";
	pyld={"board_num":B,"type":"SPOT","ridx":ridx,"cidx":cidx};
	surf.id=JSON.stringify(pyld);//me.B+"_SPOT_"+ridx+"_"+cidx;
	//surf.title=JSON.stringify(pyld);
	surf.style.width=(window.S+2*window.BORDER)+"px";
	surf.style.height=(window.S+2*window.BORDER)+"px";
	
	me.surf=surf;
	
	me.rescale=function(){
		if(me.guest){
			me.guest.style.width=(window.S)+"px";
			me.guest.style.height=(window.S)+"px";
			me.guest.firstChild.style.width=(window.S)+"px";
			me.guest.firstChild.style.height=(window.S)+"px";
			//me.guest.style.top=parseInt(2.)+"px";
			//me.guest.style.left=parseInt(2.)+"px";
	
			try{
				me.guest.firstChild.style.fontSize=window.tile_fontsize;
				me.guest.firstChild.nextSibling.style.fontSize=window.subscript_fontsize;
			}
			catch(e){console.log(e);}
		}
		me.surf.style.width=(window.S+2*window.BORDER)+"px";
		me.surf.style.height=(window.S+2*window.BORDER)+"px";
		
	}
	me.identify=function(){
		msg="IDENTIFY: SPOT "+me.m+" "+me.n;
		log(msg);
	}
	me.lock=function(){
		me.locked=true;
		//if(me.guest)me.guest.style.color="red";
		//me.surf.style.border="2px solid";
		//me.surf.style.borderColor="red";
	}
	me.take_guest=function(t){
		me.occupied=true;
		me.guest=t;
		var w=t.clientWidth;
		var h=t.clientHeight;
		if(!window.TOUCH_FLAG){
		//	t.style.top=(me.surf.getBoundingClientRect().top)+"px";
		//	t.style.left=(me.surf.getBoundingClientRect().left)+"px";
		}
		else{
			
			//t.style.top=(me.surf.getBoundingClientRect().top - window.lastX)+"px";
			//t.style.left=(me.surf.getBoundingClientRect().left - window.lastY)+"px";
			//alert("guest taken");
		}
		me.surf.appendChild(t);
	}
	me.untake_guest=function(){
		
		me.occupied=false;
		me.locked=false;
		me.guest=null;
		
		try{
			var guest=me.surf.removeChild(me.surf.firstChild);
			return guest;
		}
		catch(err){
			//console.log(err);
			return null;
		}
		
		//if tile dragged-away then me.surf already childless
		
		//me.surf.style.border="1px solid";
		//me.surf.style.borderColor="white";
		
		
	}
	me.contains=function(x,y){
		var bcr=me.surf.getBoundingClientRect();
		if(bcr.left<=x && x<=(bcr.left+bcr.width)){
			if(bcr.top<=y && y<=(bcr.top+bcr.height)){
				if(window.CL)log("contained by spot: "+me.surf.id);
				return true;
			}
		}
		return false;
	}
	me.render=function(){
		return;
		var c="purple";
		if(me.guest!=null)c="green";
		else if(me.occupied)c="orange";
		else if(me.locked)c="red";
		me.surf.style.borderColor=c;
		if(me.occupied==false){
			me.surf.parentNode.addEventListener("drop",window.THE_TMS_INSTANCE.drop);
			me.surf.parentNode.addEventListener("dragover",window.THE_TMS_INSTANCE.allow_drop);
		}
	}
	return me;
}
