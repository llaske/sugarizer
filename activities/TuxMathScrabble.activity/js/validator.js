/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Validator=function(board){
	var me={};
	me.board=board;
	me.score=0;
	
	me.is_operator=function(c){
		if(false){;}
		else if(c=="+")return true;
		else if(c=="-")return true;
		else if(c=="*")return true;
		else if(c=="/")return true;
		return false;
	}
	me.is_equal=function(c){
		if(c=="=")return true;
		return false;
	}

	me.validate_submission=function(submission){
		me.score=0;
		if(submission.length<2)return null;//else can't easily determin row/column submission up-front
		
		if(window.CL)log(JSON.stringify(submission));
		
		//establish true endpoints
		s_items=new Array();
		rmin=window.NR;
		cmin=window.NC;
		cmax=0;
		rmax=0;
		for(var sidx=0;sidx<submission.length;sidx++){
			ukey=submission[sidx]['ukey'];
			spot_id=JSON.parse(submission[sidx]['spot_id']);
			ridx=parseInt(spot_id['ridx']);
			cidx=parseInt(spot_id['cidx']);
			if(ridx<rmin)rmin=ridx;
			if(ridx>rmax)rmax=ridx;
			if(cidx<cmin)cmin=cidx;
			if(cidx>cmax)cmax=cidx;
			s_item=[ukey,ridx,cidx];
			s_items.push(s_item);
		}
		
		log_array("s_items 0",[s_items]);
		
		var v_type=1;//row
		if(s_items[0][2]==s_items[1][2])v_type=2;//column
		for(var sidx=1;sidx<s_items.length;sidx++)
			if(s_items[sidx][v_type]!=s_items[sidx-1][v_type])
				return null;//not same row/col
		
		sort_idx=1;
		if(v_type==1)sort_idx=2;
		s_items=array2_sort(s_items,sort_idx);//v_type=1,2 then sort on 2,1
		log_array("s_items 1",[s_items]);
		
		rmap=me.board.get_rmap();
		cmap=me.board.get_cmap();
		maps={'rmap':rmap,'cmap':cmap};
		map=maps['rmap'];
		
		if(v_type==2){
			log("using cmap");
			map=maps['cmap']
			for(var sidx=0;sidx<s_items.length;sidx++){
				m=s_items[sidx][1];
				n=s_items[sidx][2];
				mp=me.board.N-1-n;
				np=m;
				s_items[sidx][1]=mp;
				s_items[sidx][2]=np;
			}
		}
		else log("using rmap");
		
		log_array("s_items 2 transformed",[s_items]);
		log_array("rmap",rmap);
		log_array("cmap",cmap);
		
		log(cmap);
		
		//now we have a sorted row (suitaably transformed, if was necessary) and a map, so establish validity in this context:
		n0=s_items[0][2];
		nf=s_items[s_items.length-1][2];
		
		rstr="";
		rlist=new Array();
		var midx=s_items[0][1];
		
		if(n0>0){//and if not then it'll soon fail @eval ...
			map_str=map[midx][n0-1];
			log("LHS map_str midx="+midx+" nidx="+(n0-1));
			if(me.is_operator(s_items[0][0])){
				rstr+=map_str;
				log(map_str);
				rlist.push(map_str);
			}
			else if(s_items[0][0]=="="){
				rstr+=map_str;
				log(map_str);
				rlist.push(map_str);
			}
		}
		
		var sidx=0;
		for(var nidx=n0;nidx<nf+1;nidx++){
			if(s_items[sidx][2]==nidx){
				if(s_items[sidx][0]=="="){rstr+="==";rlist.push("=");}
				else{rstr+=s_items[sidx][0];rlist.push(s_items[sidx][0]);}
				sidx++;
			}
			else{
				map_str=map[midx][nidx];
				if(map_str=="=")map_str="==";
				log("INTERIOR map_str="+map_str+" midx="+midx+" nidx="+nidx);
				log_array("INTERIOR",map);
				rstr+=map_str;
				rlist.push(map_str);
			}
		}
		
		if(nf<map[0].length-1){
			map_str=map[midx][nf+1];
			log("RHS map_str midx="+midx+" nidx="+(nf+1));
			if(me.is_operator(s_items[s_items.length-1][0])){rstr+=map_str;log(map_str);rlist.push(map_str);}
			else if(s_items[s_items.length-1][0]=="="){rstr+=map_str;log(map_str);rlist.push(map_str);}
		}
				
		
		log("rstr: "+rstr);
		try{
			if(eval(rstr)==true){
				log("passed eval test");
			}
			else{
				log("failed eval");
				return null;
			}
		}catch(e){
			log("exception during eval: "+e);
			return null;
		}
		
		log("rlist="+rlist);
		for(var ridx=0;ridx<rlist.length;ridx++){
			me.score+=get_points(rlist[ridx]);
		}
		log("validator calculated score as: "+me.score);
		
		//
		var neighborhood=new Array();
		neighborhood.length=s_items.length;
		for(var i=0;i<neighborhood.length;i++)neighborhood[i]=0;
		
		//left
		if(n0>0 && me.is_operator(s_items[0][0])==false && me.is_equal(s_items[0][0])==false)
			if(map[midx][n0-1]!=null)
				neighborhood[0]=1;
		//right
		if(nf+1<map[midx].length-1 && me.is_operator(s_items[s_items.length-1][0])==false && me.is_equal(s_items[s_items.length-1][0])==false)//there's a space and my s_item[0] is not an operator
			if(map[midx][nf+1]!=null)//but the space is occupied (and it shouldh't be b/c s_item not an operator ...)
				neighborhood[neighborhood.length-1]=1;//bad neighborhood ... 
		//above
		if(midx>0){
			for(var j=0;j<s_items.length;j++){
				if(map[midx-1][s_items[j][2]]!=null)
					neighborhood[j]+=2;
			}
		}
		//below
		if(midx<map.length-1){
			for(var j=0;j<s_items.length;j++){
				if(map[midx+1][s_items[j][2]]!=null)
					neighborhood[j]+=4;
			}
		}
				
		var nsum=0;
		for(var j=0;j<neighborhood.length;j++)nsum+=neighborhood[j];
		if(nsum>0){
			s_items=null;
			log("neighborhood: "+neighborhood);
		}
			
		if(s_items){
			if(v_type==2){
				for(var ridx=0;ridx<s_items.length;ridx++){
					log("validator performing non-linear tensor transformation in imaginary Hilbert space ...");
					mp=s_items[ridx][1];
					np=s_items[ridx][2];
					m=np;
					n=me.board.N-1-mp;
					s_items[ridx][1]=m;
					s_items[ridx][2]=n;
				}
			}
			
			log("validator returning s_items");
			return s_items;
		
		}
		//establish neighborhood, WCs, (spacing)
		//verify equality
		//return rlist or score ...
		
		return null;
	}

	return me;
}
