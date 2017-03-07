/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var TMSSolver=function(board){

	var me={};
	me.board=board;
	me.tray=null;
	me.score=0;
	
	me.get_wc_options=function(name,map){
		
		rval=new Array();
		wc_options=new Array();
		midx_options=new Array();
		
		for(var midx=0;midx<map.length;midx++){
			wc_count=0;
			for(var nidx=0;nidx<map[midx].length;nidx++){
				if(map[midx][nidx]!=null)
					if(map[midx][nidx]!="X")
						wc_count+=1;
			}
			
			midx_options.push(wc_count);
			wc_options.push(wc_count);//ordered by increasing midx
		}	
		
		wc_options.sort().reverse();
		
		for(var widx=0;widx<wc_options.length;widx++){
			idx=midx_options.indexOf(wc_options[widx]);
			midx_options[idx]=null;
			rval.push([wc_options[widx],name,idx]);
		}
		
		return rval;
	
	}
	me.get_from_tray=function(dtype,n){
		
		tray=me.tray;
		
		neqs=1;
		nops=4;
		nnum=me.tray.N-nops-neqs;//7
		
		x=tray.get_map()[0].slice(0);
		if(dtype=="NUMBER")
			x=x.slice(0,nnum);
		else x=x.slice(nnum,nnum+nops);
		x=me.shuffle(x);
		return x.slice(0,n);
			
	}
	me.shuffle=function(ar){
		for(var z=0;z<window.NUM_SHUFFLE;z++){//NOTE: CONFIG VALUE USED
			iidx=Math.floor(Math.random()*ar.length);
			e=ar.shift();
			for(dmy=0;dmy<iidx;dmy++){
				ar.push(ar.shift());
			}
			ar.push(e);
		}
		return ar;
	}
	me.fit=function(row,midx,num_wc){
		log_array("row",[me.tray.get_map()[0],row]);
		
		//first decide on overall equation length, then slide window along row, iterating at each stop
		LMAX=11;
		TF=window.TUXFACTOR;
		if(false){;}
		else if(TF==4)LMAX=11;
		else if(TF==3)LMAX=9;
		else if(TF==2)LMAX=7;
		else if(TF==1)LMAX=5;
		else{;}
		
		for(var L=LMAX;L>2;L-=2){
			//sw=sliding window
			
			//start n1 at random points throughout interval:
			n1=Math.floor(Math.random()*row.length-L+1);
			for(var nidx=n1;nidx<Math.max(0,row.length-L+1);nidx++){//slide rows LtoR; nidx is offset below
				try{
			
				sw=new Array();
				sw.length=row.length;
				for(var dmy=0;dmy<nidx;dmy++)sw[dmy]=null;
				num_equals=0;
				num_ops=0;
				num_nums=0;
				skip=false;
				
				for(var dmy=nidx;dmy<nidx+L;dmy++){
					if(row[dmy]!=null){
						if(false){;}
						else if(row[dmy]=='+')num_ops+=1;
						else if(row[dmy]=='-')num_ops+=1;
						else if(row[dmy]=='*')num_ops+=1;
						else if(row[dmy]=='/')num_ops+=1;
						else if(row[dmy]=="=")num_equals+=1;
						else if(row[dmy]=="X"){skip=true;break;}
						else num_nums+=1;
						sw[dmy]=row[dmy];//wildcards are fixed positions while window slides
					}
					else sw[dmy]="A";//for Available (actually W for Window better, but confuse with WC)
				}
				for(var dmy=nidx+L;dmy<sw.length;dmy++)sw[dmy]=null;
				if(num_nums+num_ops+num_equals==0 && me.board.num_commited>0)skip=true;//require some connection to existing
				if(skip){
					log("skip="+skip+" "+row);
					continue;
				}
				msg="equals:"+num_equals+" ops:"+num_ops+" nums:"+num_nums;
				log_array(msg,[sw]);//[sw] b/c has to be 2D array
				
				//trim to candidate window
				var target_animal=sw.slice(nidx,nidx+L);
				log_array("target_animal=trimmed:",[target_animal]);
				log("target_animal=trimmed: "+target_animal);
				//
				//now need to iterate over all sets of N*X pics from tray; if evaluate=true -> return rlist
				//little pre-logic to establish if 
				//1)spacing requirements (separations of WCs in this window) trigger skip
				//2)what's required where, and permutation options/algorithm*
				
				//if row has > 1x EXQUAL fixed then skip it
				if(num_equals>1)continue;
				
				//iterate over EQUAL sign position ... if WC= then loop limits constrain
				eidx_min=1;
				eidx_max=target_animal.length-1;
				if(num_equals==1){
					eidx_min=target_animal.indexOf("=");
					eidx_max=eidx_min+1;
				}
				
				}catch(e){log("top of fit: "+e);return null;}
				
				for(var eidx=eidx_min;eidx<eidx_max;eidx+=2){
					
					copy_animal=target_animal.slice(0);
					
					if(copy_animal[eidx]==("A"||"="))
						copy_animal[eidx]="=";
					else continue;
					
					//Given that L ~ odd and eidx_min ~ odd there's no need to check if odd
					
					//more spacing-filter logic
					//distances to ALL numbers/opps must be odd/even from = sign; check WCs ...
					spacing=0;
					for(var i=0;i<eidx;i+=2){//wc numbers to left of =
						if(copy_animal[i]!="A"){
							if(copy_animal[i].indexOf(".0")<0){
								//copy_animal[0]="$";
								spacing+=1;
							}
						}
					}
					for(var i=Math.min(eidx+1,copy_animal.length-1);i<copy_animal.length;i+=2){//wc numbers to right of =
						if(copy_animal[i]!="A"){
							if(copy_animal[i].indexOf(".0")<0){
								//copy_animal[copy_animal.length-1]="$$";
								spacing+=2;
							}
						}
					}
					
					for(var i=Math.min(1,eidx);i<eidx;i+=2){//wc ops to left of =
						if(copy_animal[i]!="A"){
							if(false){;}
							else if(copy_animal[i]=='+'){;}
							else if(copy_animal[i]=='-'){;}
							else if(copy_animal[i]=='*'){;}
							else if(copy_animal[i]=='/'){;}
							else{
								//copy_animal[0]="%";
								spacing+=4;
							}
						}
					}
					for(var i=eidx+2;i<copy_animal.length-1;i+=2){//wc ops to right of =
						if(copy_animal[i]!=("A"||"$$")){
							if(false){;}
							else if(copy_animal[i]=='+'){;}
							else if(copy_animal[i]=='-'){;}
							else if(copy_animal[i]=='*'){;}
							else if(copy_animal[i]=='/'){;}
							else{
								//copy_animal[0]="%%";
								spacing+=5;
							}
						}
					}
					
					if(spacing>0){
						log("spacing: "+spacing+" "+copy_animal);
						continue;
					}
					
					
					//Now what do we need from tray?
					//submission is L long, total
					//equal position already established
					//num_equals,num_ops,num_nums
					//total_nums=(L-1)/2+1
					//total_ops=(L-1)/2-1
					need_nums=(L-1)/2+1-num_nums;
					need_ops=(L-1)/2-1-num_ops;
					
					//Force greater percentage of operator replacement:
					if(num_ops==0 && me.board.num_commited>0)
						if(Math.random()<window.FORCE_OPERATORS)continue;//NOTE:CONFIG VALUE USED
					
					//
					for(var iter=0;iter<window.SAMPLE_THRESHOLD;iter++){//NOTE:CONFIG VALUE USED
					nset=me.get_from_tray("NUMBER",need_nums);
					oset=me.get_from_tray("OPERATOR",need_ops);
					//log("oset: "+oset+"num_ops: "+num_ops+" need_opts:"+need_ops+" oset.length:"+oset.length+" "+row);
					
					rlist=new Array();
					rlist.length=L;
					for(var i=0;i<L;i+=2){
						if(copy_animal[i]=="A")rlist[i]=nset.pop();
						else if(i==eidx)rlist[i]="=";
						else rlist[i]=copy_animal[i];
					}
					for(var j=1;j<L-1;j+=2){
						if(copy_animal[j]=="A")rlist[j]=oset.pop();
						else if(j==eidx)rlist[j]="=";
						else rlist[j]=copy_animal[j];
					}
					
					rstr="";
					for(var ridx=0;ridx<L;ridx++){
						if(ridx==eidx)rstr+="==";
						else rstr+=rlist[ridx];
					}
					
					try{
						if(eval(rstr)==true){
							msg="eidx="+eidx+" needN:"+need_nums+" needO:"+need_ops;
							//log_array(msg,[copy_animal]);
							log_array(JSON.stringify(rlist),[copy_animal]);
							
							me.score=0;
							log("me.score="+me.score);
							rval=new Array();
							
							//add score for all tiles
							for(var ridx=0;ridx<L;ridx++){
								if(row[nidx+ridx]==null){//but skip WCs in rval
									me.score+=get_points(rlist[ridx]);
									rval.push([rlist[ridx],midx,nidx+ridx]);
								}
								else{
									me.score+=get_points(row[nidx+ridx]);
								}
								
							}
							
							//window.PLAYERS[window.PLAYER_IDX].score+=score;
							log("me.score="+me.score);
							return rval;
						}
					}catch(e){log("fit eval(rstr): "+e);log(rstr);log(copy_animal);log(row);helpCB();return null;}
					}
					//
				}
			}
		}
		
		return null;
	}
	me.is_operator=function(c){
		if(c=="+")return  true;
		else if(c=="-")return true;
		else if(c=="*")return true;
		else if(c=="/")return true;
		return false;
	}
	me.is_equal=function(c){
		if(c=="=")return true;
		return false;
	}

	me.get_rlist=function(tray){
		try{
		me.tray=tray;
		rlist=null;
		
		rmap=me.board.get_rmap(),
		cmap=me.board.get_cmap()
		maps={'rmap':rmap,'cmap':cmap};
		
		log_array("rmap",rmap);
		log_array("cmap",cmap);
		
		//list of [#WC,midx] pairs ... so go down list in order while #WC>0
		rwc=me.get_wc_options("rmap",rmap);
		cwc=me.get_wc_options("cmap",cmap);
		
		//now create a new struct with interleaved targets from 2 maps
		rcwc_options=new Array();
		rcidx_options=new Array();
		for(var dummy=0;dummy<rwc.length;dummy++){
			rcwc_options.push(rwc[dummy][0]);
			rcidx_options.push(rwc[dummy]);
		}
		for(var dummy=0;dummy<cwc.length;dummy++){
			rcwc_options.push(cwc[dummy][0]);
			rcidx_options.push(cwc[dummy]);
		}
		rcwc_options.sort().reverse();
		
		rcwc=new Array();
		for(var dummy=0;dummy<rcwc_options.length;dummy++){
			//append struct picked/deleted from rcidx_options
			//can't use indexOf b/c struct w/ wc_count,map_name,midx of map row having wc_count opportunities ...
			for(var idx=0;idx<rcidx_options.length;idx++){
				if(rcidx_options[idx][0]==rcwc_options[dummy]){
					
					if(rcidx_options[idx][0]!=0 || me.board.num_commited==0)//skip emptry (wc_count=0) rows !!UNLESS first move!!
						rcwc.push(rcidx_options[idx]);
					
					rcidx_options[idx]=[0,0,0];
					break;
				}
			}
		}
		log_array("rcwc",rcwc);
		
		//loop over sorted options:
		for(var ridx=0;ridx<rcwc.length;ridx++){
			num_wc=rcwc[ridx][0];
			map_name=rcwc[ridx][1];
			map=maps[map_name];
			midx=rcwc[ridx][2];
			
			if(me.board.num_commited==0){//Deluxe feature
				if(Math.random()<0.5){
					map_name="cmap";
					midx=parseInt(me.board.N/2);
				}
				else{
					map_name="rmap";
					midx=parseInt(me.board.M/2);
				}
				map=maps[map_name];
			}
			
			////////////////////////////////////

			rlist=me.fit(map[midx],midx,num_wc);
			if(!rlist)continue;

			////////////////////////////////////
			
			n0=rlist[0][2];
			nf=rlist[rlist.length-1][2];
			log("n0="+n0+" nf="+nf);
			
			var neighborhood=new Array();
			neighborhood.length=rlist.length;
			for(var i=0;i<neighborhood.length;i++)neighborhood[i]=0;
			
			//left
			if(n0>0 && me.is_operator(rlist[0][0])==false && me.is_equal(rlist[0][0])==false)
				if(map[midx][n0-1]!=null)
					neighborhood[0]=1;
			//right
			if(nf+1<map[midx].length-1 && me.is_operator(rlist[rlist.length-1][0])==false && me.is_equal(rlist[rlist.length-1][0])==false)
				if(map[midx][nf+1]!=null)
					neighborhood[neighborhood.length-1]=1;
			//above
			if(midx>0){
				for(var j=0;j<rlist.length;j++){
					if(map[midx-1][rlist[j][2]]!=null)
						neighborhood[j]+=2;
				}
			}
			//below
			if(midx<map.length-1){
				for(var j=0;j<rlist.length;j++){
					if(map[midx+1][rlist[j][2]]!=null)
						neighborhood[j]+=4;
				}
			}
			
			var nsum=0;
			for(var j=0;j<neighborhood.length;j++)nsum+=neighborhood[j];
			if(nsum>0){
				rlist=null;
				//log("neighborhood: "+neighborhood);
			}
			
			if(rlist){
				if(map_name=="cmap"){
					for(var ridx=0;ridx<rlist.length;ridx++){
						mp=rlist[ridx][1];
						np=rlist[ridx][2];
						m=np;
						n=me.board.N-1-mp;
						rlist[ridx][1]=m;
						rlist[ridx][2]=n;
					}
				}
				return rlist;
			}
			//if(rlist)log("RLIST:"+JSON.stringify(rlist));
		}
		return null;
		}catch(e){log("get_rlist: "+e);}
	}	
	return me;
}
