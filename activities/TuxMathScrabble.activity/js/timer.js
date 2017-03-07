/**********************************************************

    Organization    :Asymptopia Software | Software@theLimit

    Website         :www.asymptopia.org

    Author          :Charles B. Cosse

    Email           :ccosse@asymptopia.org

    Copyright       :(C) 2006-2014 Asymptopia Software

    License         :All Rights Reserved

***********************************************************/
var Timer=function(){
	var me={};
	
	me.t0=new Date().getTime();
	
	me.reset=function(){
		me.t0=new Date().getTime();
	}
	
	me.elapsed=function(){
		return (new Date().getTime()-me.t0)/1000.;
	}
	
	me.time=function(){
		return new Date().getTime();
	}
	
	return me;
}
