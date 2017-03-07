/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Player=function(player_idx,x0,y0,name,tray,robot,player_name){

	var me={};

	me.x0=x0;
	me.y0=y0;
	me.name=name;
	me.tray=tray;
	me.player_idx=player_idx;
	me.robot=robot;
	me.score=0;
	me.player_name=player_name;

	me.actor=new Actor(name,x0,y0);

	me.anim_step=function(e){
		//log("anim_step");
		imgs={
			"Tux2D":["headTiltL.gif","headTiltR.gif","icon.gif","lookAtBoardL.gif","lookAtBoardR.gif","mathLover_01.gif","mathLover_02.gif","neckSquashF.gif","neckSquashL.gif","neckSquashR.gif","neckSquash_01.gif","scratch01.gif","scratch02.gif","standBL.gif","standBL_tilt.gif","standBR.gif","standBR_tilt.gif","standF.gif","standL.gif","standLF.gif","standR.gif","standRF.gif","walkL.gif","walkL_02.gif","walkR.gif","walkR_02.gif",],
			"LittleTux2D":["cmon01.gif","cmon02.gif","cmon03.gif","cmon04.gif","jump01.gif","nodL_01.gif","nodL_02.gif","nodR_01.gif","nodR_02.gif","norR_02.gif","shakeHeadL_01.gif","standBL.gif","standBR.gif","standF.gif","standFL.gif","standFR.gif","standFR_waveR_01.gif","standFR_waveR_02.gif","standFR_waveR_03.gif","standFR_waveR_04.gif","standF_lookBL_01.gif","standF_lookBL_02.gif","standF_lookBL_03.gif","standF_lookBR_01.gif","standF_lookBR_02.gif","standF_lookBR_03.gif","standL.gif","standLF.gif","standR.gif","standRF.gif","walkL_01.gif","walkR_01.gif",]
		}

		imgidx=Math.floor(Math.random()*imgs[this.name].length+1);
		//log(imgs[this.name][imgidx]);
		this.actor.img.src="Actors/"+this.name+"/"+imgs[this.name][imgidx];

	}
	return me;
}
