/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Actor=function(name,x0,y0){

	var me={};
	me.name=name;

	me.imgs_dict={};
	me.imgs={};
	mnames=["Hello","Taunt","Default","Think","Celebrate","GoStageL","GoStageR","React"];
	for(var midx=0;midx<mnames.length;midx++){
		me.imgs_dict[mnames[midx]]={};
		keys_length=MANEUVERS[me.name][mnames[midx]]['keys'].length;
		for(var kidx=0;kidx<keys_length;kidx++){
			key=MANEUVERS[me.name][mnames[midx]]['keys'][kidx];
			me.imgs_dict[mnames[midx]][key]=[];

			for(var idx=0;idx<MANEUVERS[me.name][mnames[midx]][key].length;idx++){
				var fname=MANEUVERS[me.name][mnames[midx]][key][idx][0];
				src_url="Actors/"+me.name+"/"+fname;
				me.imgs_dict[mnames[midx]][key].push(new Image(src_url));
				me.imgs[fname]=new Image();
				me.imgs[fname].src=src_url;
			}

		}
	}




	me.x0=x0;//This defines StageRight!
	me.y0=y0;
	me.div=document.createElement("div");
	me.img=document.createElement("img");
	me.img.src="Actors/"+name+"/standF.gif";
	me.img.id=name+"_actor_img";

	me.div.appendChild(me.img);
	//me.div.style.background="#000000";
	me.div.style.position="absolute";
	me.div.id=name+"_actor_div";

	me.info_label=document.createElement("div");
	me.info_label.style.textShadow="none";
	me.info_label.style.color="#FF0000";
	me.info_label.style.fontSize="20px";
	me.div.appendChild(me.info_label);

	me.add_info=function(info){
		me.info_label.innerHTML=info;
	}

	me.reloc=function(){
		this.div.style.top=this.y0+"px";
		this.div.style.left=window.innerWidth/2+this.x0-this.img.width/2+"px";
		this.img.src="Actors/"+name+"/standF.gif";
	}

	me.reloc();

	return me;
}
