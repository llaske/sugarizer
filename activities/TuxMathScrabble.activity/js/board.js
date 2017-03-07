/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Board=function(board_number,S,M,N){
	
	var me={};
	me.board_number=board_number;
//	me.S=S;
	me.M=M;
	me.N=N;
	me.counts=null;
	me.num_commited=0;
	
	var spots=new Array();
	me.spots=spots;
	
	me.container_table=document.createElement("table");
	me.container_table.className="container_table";
	me.container_row=me.container_table.insertRow(-1);
	me.c0=me.container_row.insertCell(-1);
	me.c1=me.container_row.insertCell(-1);
	me.c2=me.container_row.insertCell(-1);
	
	me.c0.style.width="0px";
	me.c1.align="center";
	me.c2.style.width="0px";
	
	
	var bt=document.createElement("table");//button table @rhs of tray
	me.bt=bt;
	me.c2.appendChild(me.bt);
	
	var t=document.createElement("table");//tray table
	me.table=t;
	me.table.align="center";
	me.table.style.textAlign="center";
	me.c1.appendChild(me.table);
	
	me.rescale=function(){
		for(var sidx=0;sidx<me.spots.length;sidx++){
			me.spots[sidx].rescale();
		}
	}
	me.fade_off=function(){
		for(var sidx=0;sidx<me.spots.length;sidx++){
			$(me.spots[sidx].surf).animate({opacity:0.0},2000);
			//me.spots[sidx].surf.style.opacity=0.5;
		}
	}
	me.fade_on=function(){
		for(var sidx=0;sidx<me.spots.length;sidx++){
			$(me.spots[sidx].surf).animate({opacity:1.0},2000);
			//me.spots[sidx].surf.style.visibility="visible";
		}
	}
	
	me.increment_num_commited=function(){
		me.num_commited+=1;
	}
	me.set_all_occupied=function(){
		for(var sidx=0;sidx<me.spots.length;sidx++){
			me.spots[sidx].occupied=true;
			try{me.spots[sidx].guest=me.spots[sidx].surf.firstChild;}
			catch(e){log(e);}
		}
	}
	me.set_occupied=function(surf_id){
		
		
		log("tray "+me.board_number+" set_occupied by "+surf_id);//['ukey']
		
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(me.spots[sidx].surf.id==surf_id){
				me.spots[sidx].occupied=true;
				me.spots[sidx].guest=me.spots[sidx].surf.firstChild;
			}
		}
	}
	me.get_tile=function(uk){
		//log("finding ..."+uk);
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(me.spots[sidx].occupied){
				//log(me.spots[sidx].guest.id);
				if(JSON.parse(me.spots[sidx].guest.id)['ukey']==uk){
					var tt=me.spots[sidx].guest;
					me.spots[sidx].untake_guest();
					//log("found ukey");
					return tt;
				}
				if(JSON.parse(me.spots[sidx].guest.id)['uchar']==uk){
					var tt=me.spots[sidx].guest;
					me.spots[sidx].untake_guest();
					//log("found uchar");
					return tt;
				}
			}
		}
		return null;
	}
	me.get_position=function(uk){
		if(window.CL)log("finding ..."+uk);
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(me.spots[sidx].occupied){
				//log(me.spots[sidx].guest.id);
				if(JSON.parse(me.spots[sidx].guest.id)['ukey']==uk){
					var t=me.spots[sidx].guest;
					//me.spots[sidx].untake_guest();
					if(window.CL)log("found ukey");
					
					//return t.getBoundingClientRect();
					return me.spots[sidx].surf.getBoundingClientRect();
				
				}
				if(JSON.parse(me.spots[sidx].guest.id)['uchar']==uk){
					var t=me.spots[sidx].guest;
					//me.spots[sidx].untake_guest();
					if(window.CL)log("found uchar");
					
					//return t.getBoundingClientRect();
					return me.spots[sidx].surf.getBoundingClientRect();
					
				}
			}
		}
		return null;
	}
	me.get_contents=function(){
		//Returns tray contents as list of pyld objects
		contents=new Array();
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(me.spots[sidx].occupied){
				var guest=me.spots[sidx].guest;
				pyld=JSON.parse(guest.id);
				pyld['class']=guest.className;
				pyld['surf_id']=guest.id;
				contents.push(pyld);
				//log(JSON.stringify(pyld));
			}
		}
		return contents;
	}
	me.get_spot=function(m,n){
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(me.spots[sidx].m==m)
				if(me.spots[sidx].n==n)
					return me.spots[sidx];
		}
		return null;
	}
	me.fill_array=function(mr,nc,fc){
		rval=new Array();
		for(var midx=0;midx<mr;midx++){
			var  r=new Array();
			for(var nidx=0;nidx<nc;nidx++){
				r.push(fc);
			}
			rval.push(r);
		}
		return rval;
	}
	me.get_cmap=function(){
		Mp=me.N;//p is for "Prime": m'
		Np=me.M;
		var cmap=me.fill_array(Mp,Np,null);
		for(var mp=0;mp<Mp;mp++){
			for(var np=0;np<Np;np++){
				midx=np;
				nidx=me.N-1-mp;
				s=me.get_spot(midx,nidx);
				if(s && s.occupied){
					
					ukey=JSON.parse(s.guest.id)['ukey'];
					if(cmap[mp][np]=="X"){;}//set from above
					else cmap[mp][np]=ukey;
					
					//false means unoccupied
					left=false;
					right=false;
					up=false;
					down=false;
					
					if(np>0){//check left
						midx=np-1;
						nidx=me.N-1-mp;
						if(me.get_spot(midx,nidx).occupied){
							cmap[mp][np]="X";
							left=true;
						}
					}
					else left=true;
					
					if(np<Np-1){//check right
						midx=np+1;
						nidx=me.N-1-mp;;
						if(me.get_spot(midx,nidx).occupied){
							cmap[mp][np]="X";
							right=true;
						}
					}
					else right=true;
					
					if(mp>0){//check up
						midx=np;
						nidx=me.N-1-mp+1;
						if(me.get_spot(midx,nidx).occupied){
							up=true;
							if(left && right)cmap[mp-1][np]="X";
						}
					}
					else up=true;
					
					if(mp<Mp-1){
						midx=np;
						nidx=me.N-1-mp-1;
						if(me.get_spot(midx,nidx).occupied){
							down=true;
							if(left && right)cmap[mp+1][np]="X";
						}
					}
					else down=true;
				}
			}
		}
		return cmap;
	}

	me.get_rmap=function(){
		var rmap=me.fill_array(me.M,me.N,null);
		for(var midx=0;midx<me.M;midx++){
			for(var nidx=0;nidx<me.N;nidx++){
				s=me.get_spot(midx,nidx);
				if(s && s.occupied){
					
					ukey=JSON.parse(s.guest.id)['ukey'];
					if(rmap[midx][nidx]=="X"){;}//set from above ... it's correct, leave it.
					else rmap[midx][nidx]=ukey;
					
					//false means unoccupied
					left=false;
					right=false;
					up=false;
					down=false;
					
					if(nidx>0){//check left
						if(me.get_spot(midx,nidx-1).occupied){
							rmap[midx][nidx]="X";
							left=true;
						}
					}
					else left=true;
					
					if(nidx<me.N-1){//check right
						if(me.get_spot(midx,nidx+1).occupied){
							rmap[midx][nidx]="X";
							right=true;
						}
					}
					else right=true;
					
					if(midx>0){//check up
						if(me.get_spot(midx-1,nidx).occupied){
							up=true;
							if(left && right)rmap[midx-1][nidx]="X";
						}
					}
					else up=true;
					
					if(midx<me.M-1){//check down
						if(me.get_spot(midx+1,nidx).occupied){
							down=true;
							if(left && right)rmap[midx+1][nidx]="X";
						}
					}
					else down=true;
				}
			}
		}
		return rmap;
	}
	me.get_map=function(){
		counts={
			'+':{'count':0,'mn':new Array()},
			'-':{'count':0,'mn':new Array()},
			'*':{'count':0,'mn':new Array()},
			'/':{'count':0,'mn':new Array()},
			'=':{'count':0,'mn':new Array()},
		};
		//log(window.MAX_NUMS[window.LEVEL-1]);
		for(var idx=0;idx<window.MAX_NUMS[window.LEVEL-1];idx++){
			counts[window.NUMBERS[idx]['ukey']]={'count':0,'mn':new Array()};
		}
		
		var map=new Array();
		for(var midx=0;midx<me.M;midx++){
			var  r=new Array();
			for(var nidx=0;nidx<me.N;nidx++){
				try{
					s=me.get_spot(midx,nidx);
					if(s && s.occupied){
						ukey=JSON.parse(me.get_spot(midx,nidx).guest.id)['ukey'];
						r.push(ukey);
						try{
							counts[ukey]['count']+=1;
							counts[ukey]['mn'].push([midx,nidx]);
						}
						catch(e){
							counts[ukey]['count']=1;
							counts[ukey]['mn']=new Array();
							counts[ukey].push([midx,nidx]);
						}
					}
					else{
						r.push(null);
					}
				}
				catch(e){;}
			}
			map.push(r);
		}
		me.counts=counts;
		return map;
	}
	me.untake=function(sid){
		if(window.CL)console.log("untake:"+sid);
		for(var sidx=0;sidx<me.spots.length;sidx++){
			if(window.CL)console.log(me.spots[sidx].surf.id);
			if(me.spots[sidx].surf.id==sid){
				me.spots[sidx].untake_guest();
				if(window.CL)console.log("untake success");
			}
		}
	}
	me.commit_submission=function(sval){//only called by commit; take_turn() (i.e. for robot player) does it all differently
		
		//log("commit_submission: "+JSON.stringify(sval));
		
		var last_spot_ids=new Array();
		var char_string="";
		for(var sidx=0;sidx<sval.length;sidx++){
			char_string+=sval[sidx]['uchar'];
			spot_id=sval[sidx]['spot_id'];
			surf_id=sval[sidx]['surf_id'];
			
			lsid=sval[sidx]['last_spot_id'];
			if(window.CL)console.log("pushing lsid: "+lsid);
			last_spot_ids.push(lsid);
			
			for(var spidx=0;spidx<me.spots.length;spidx++){
				if(me.spots[spidx].surf.id==spot_id){
					
					//Lock spot
					me.spots[spidx].lock();
					
					//Make this tile not draggable
					try{me.spots[spidx].surf.firstChild.draggable=false;}
					catch(e){if(window.CL)console.log("e0"+e);}
					
					//Make this tile spot's guest
					try{me.spots[spidx].guest=me.spots[spidx].surf.firstChild;me.spots[spidx].occupied=true;}
					catch(e){if(window.CL)console.log("e1"+e);}
					
					
					//Make this spot NOT droppable
					//me.spots[spidx].surf.parentNode.style.background="red";
					me.spots[spidx].surf.parentNode.removeEventListener("drop",window.THE_TMS_INSTANCE.drop);
					me.spots[spidx].surf.parentNode.removeEventListener("dragover",window.THE_TMS_INSTANCE.allow_drop);
					msg="removed drop listener:"+me.spots[spidx].m+", "+me.spots[spidx].n;
				}
			}
		}
		//log("commit: "+char_string);
		me.submission=new Array();
		return last_spot_ids;
	}
	me.allocate_spots=function(board_number){
		for(var ridx=0;ridx<me.M;ridx++){
			r=me.table.insertRow(-1);
			for(var cidx=0;cidx<me.N;cidx++){
				var spot=new Spot(board_number,me.S,ridx,cidx);
				me.spots.push(spot);
				c=r.insertCell(-1);
				if(board_number==0){
					c.addEventListener("drop",window.THE_TMS_INSTANCE.drop,false);
					c.addEventListener("dragover",window.THE_TMS_INSTANCE.allow_drop,false);
				}
				c.appendChild(spot.surf);
			}
/*			
			//turn indicator table at end of each tray
			if(board_number>0){
				br=me.bt.insertRow(-1);
				br.id="br"+board_number;
			}
*/
		}
	}
	me.reset=function(){
		me.dump_tiles();
		me.num_commited=0;
		me.counts=null;
		for(var sidx=0;sidx<me.spots.length;sidx++){
			me.spots[sidx].surf.parentNode.removeEventListener("drop",window.THE_TMS_INSTANCE.drop);
			me.spots[sidx].surf.parentNode.removeEventListener("dragover",window.THE_TMS_INSTANCE.allow_drop);
		}
		for(var sidx=0;sidx<me.spots.length;sidx++){
			me.spots[sidx].surf.parentNode.addEventListener("drop",window.THE_TMS_INSTANCE.drop);
			me.spots[sidx].surf.parentNode.addEventListener("dragover",window.THE_TMS_INSTANCE.allow_drop);
		}
		
	}
	me.dump_tiles=function(){
		for(var spot_idx=0;spot_idx<me.spots.length;spot_idx++){
			me.spots[spot_idx].untake_guest();
		}
	}
	me.show_occupied=function(){
		for(var spot_idx=0;spot_idx<me.spots.length;spot_idx++){
			me.spots[spot_idx].render();
		}
	}
	me.draw_tiles=function(plyridx){
		for(var spot_idx=0;spot_idx<window.NN;spot_idx++){
			if(!me.spots[spot_idx].occupied && me.spots[spot_idx].surf.children.length==0){
				tile=mkTile("NUMBER",plyridx);
				tile_pyld=JSON.parse(tile.id);
			me.spots[spot_idx].take_guest(tile);
			log(me.board_number+" spot_idx:"+spot_idx+" takes "+tile_pyld['uchar'])
			}
			else if(window.CL)console.log(me.board_number+" "+spot_idx+" occupied");
		}
		for(var spot_idx=window.NN;spot_idx<window.NN+window.NO;spot_idx++){
			if(!me.spots[spot_idx].occupied && me.spots[spot_idx].surf.children.length==0){
				tile=mkTile("OPERATOR",plyridx);
				tile_pyld=JSON.parse(tile.id);
				me.spots[spot_idx].take_guest(tile);
				//if(window.CL)console.log(me.board_number+" spot_idx:"+spot_idx+" takes "+tile_pyld['uchar'])
			}
			else{
				//if(window.CL)console.log(me.board_number+" "+spot_idx+" occupied");
			}
		}
		spot_idx=window.NN+window.NO;
		if(!me.spots[spot_idx].occupied && me.spots[spot_idx].surf.children.length==0){
			tile=mkTile("EQUAL",plyridx);
			tile_pyld=JSON.parse(tile.id);
			me.spots[spot_idx].take_guest(tile);
			if(window.CL)console.log(me.board_number+" spot_idx:"+spot_idx+" takes "+tile_pyld['uchar'])
		}
		else if(window.CL)console.log(me.board_number+" "+spot_idx+" occupied");
	}

	return me;
}

