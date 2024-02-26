define(["sugar-web/graphics/palette","util","colormyworld","print"], function (palette,util,colormyworld,print) {

	'use strict';

	var me = {};

	me.ModePalette = function (invoker, primaryText, menuData) {
		palette.Palette.call(this, invoker, primaryText);
		this.modeEvent = document.createEvent("CustomEvent");
		this.modeEvent.initCustomEvent('mode', true, true, {});
		this.remoteEvent = document.createEvent("CustomEvent");
		this.remoteEvent.initCustomEvent('remote', true, true, {});
		var that = this;

//COLORING,TOUR,INTERACTIVE:
		me.setMode= function(modeNum){
			if(modeNum<0)modeNum=MODE_NAMES.length-1;
			else if(modeNum>MODE_NAMES.length-1)modeNum=0;
			colormyworld.setMode(modeNum);
			document.getElementById("modelabel").innerHTML=document.webL10n.get(MODE_NAMES[modeNum]);
		}

		var modeDiv = document.createElement('div');

		var modebuttonprev = document.createElement('button');
		modebuttonprev.className = 'toolbutton palette-button palette-button-selected';
		modebuttonprev.setAttribute('id','mode-button-prev');
		modebuttonprev.setAttribute('title','Previous Mode');
		modebuttonprev.onclick=function(){me.setMode(colormyworld.getMode()+1)};

		var modebuttonnext = document.createElement('button');
		modebuttonnext.className = 'toolbutton palette-button palette-button-selected';
		modebuttonnext.setAttribute('id','mode-button-next');
		modebuttonnext.setAttribute('title','Next Mode');
		modebuttonnext.onclick=function(){me.setMode(colormyworld.getMode()-1)};

		var modeLabel=document.createElement("div");
		modeLabel.className="modelabel";
		modeLabel.id="modelabel";
		modeLabel.innerHTML=document.webL10n.get(MODE_NAMES[0]);

		var modeTable=document.createElement("table");
		var r=modeTable.insertRow(-1);
		r.insertCell(-1).appendChild(modebuttonprev);
		r.insertCell(-1).appendChild(modeLabel);
		r.insertCell(-1).appendChild(modebuttonnext);

//REGIONS:
		me.setRegion= function(regionNum){
			if(regionNum<0)regionNum=REGION_NAMES.length-1;
			else if(regionNum>REGION_NAMES.length-1)regionNum=0;
			colormyworld.change_areaCB(1,REGION_NAMES[regionNum]);
			document.getElementById("regionlabel").src=REGION_ICONS[regionNum];
		}

		var regionbuttonprev = document.createElement('button');
		regionbuttonprev.className = 'toolbutton palette-button palette-button-selected';
		regionbuttonprev.setAttribute('id','region-button-prev');
		regionbuttonprev.setAttribute('title','Previous Region');
		regionbuttonprev.onclick=function(){me.setRegion(colormyworld.getRegion()+1)};

		var regionbuttonnext = document.createElement('button');
		regionbuttonnext.className = 'toolbutton palette-button palette-button-selected';
		regionbuttonnext.setAttribute('id','region-button-next');
		regionbuttonnext.setAttribute('title','Next Region');
		regionbuttonnext.onclick=function(){me.setRegion(colormyworld.getRegion()-1)};

		var regionLabel=new Image();
		regionLabel.className="regionlabel";
		regionLabel.id="regionlabel";
		regionLabel.title=REGION_NAMES[0];
		regionLabel.src=REGION_ICONS[0];

		var regionTable=document.createElement("table");
		var r=regionTable.insertRow(-1);
		r.insertCell(-1).appendChild(regionbuttonprev);
		r.insertCell(-1).appendChild(regionLabel);
		r.insertCell(-1).appendChild(regionbuttonnext);

		modeDiv.appendChild(modeTable);
		modeDiv.appendChild(regionTable);
		this.setContent([modeDiv]);

	};

	var addEventListener = function (type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};
	me.ModePalette.prototype =
		Object.create(palette.Palette.prototype, {
			addEventListener: {
				value: addEventListener,
				enumerable: true,
				configurable: true,
				writable: true
			}
		});

	return me;
});
