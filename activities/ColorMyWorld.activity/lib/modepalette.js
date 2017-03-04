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

//LANGUAGES:
		me.setLanguage= function(inc){
			var current_language=document.webL10n.getLanguage();
			print(current_language);
			var languageNum=LANGUAGE_NAMES["keys"].indexOf(current_language)+inc;
			print(languageNum);
			if(languageNum<0)languageNum=LANGUAGE_NAMES["keys"].length-1;
			else if(languageNum>LANGUAGE_NAMES["keys"].length-1)languageNum=0;
			document.webL10n.setLanguage(LANGUAGE_NAMES["keys"][languageNum]);
			document.getElementById("languagelabel").innerHTML=LANGUAGE_NAMES[LANGUAGE_NAMES["keys"][languageNum]];
			window.setTimeout(window.onresize,500);
		}

		var languagebuttonprev = document.createElement('button');
		languagebuttonprev.className = 'toolbutton palette-button palette-button-selected';
		languagebuttonprev.setAttribute('id','language-button-prev');
		languagebuttonprev.setAttribute('title','Previous Language');
		languagebuttonprev.onclick=function(){me.setLanguage(-1)};

		var languagebuttonnext = document.createElement('button');
		languagebuttonnext.className = 'toolbutton palette-button palette-button-selected';
		languagebuttonnext.setAttribute('id','language-button-next');
		languagebuttonnext.setAttribute('title','Next Language');
		languagebuttonnext.onclick=function(){me.setLanguage(+1)};

		var languageLabel=document.createElement("div");
		languageLabel.className="languagelabel";
		languageLabel.id="languagelabel";
		languageLabel.title=LANGUAGE_NAMES[0];
		var languageNum=LANGUAGE_NAMES["keys"].indexOf(document.webL10n.getLanguage());
		languageLabel.innerHTML=(languageNum != -1 ? LANGUAGE_NAMES[LANGUAGE_NAMES["keys"][languageNum]]:"English");

		var languageTable=document.createElement("table");
		var r=languageTable.insertRow(-1);
		r.insertCell(-1).appendChild(languagebuttonprev);
		r.insertCell(-1).appendChild(languageLabel);
		r.insertCell(-1).appendChild(languagebuttonnext);


		modeDiv.appendChild(modeTable);
		modeDiv.appendChild(regionTable);
		modeDiv.appendChild(languageTable);
		this.setContent([modeDiv]);

		//		this.buttons = modeDiv.querySelectorAll('button');

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
