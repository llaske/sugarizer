define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var custompalette = {};

    custompalette.CustomPalette = function (game, invoker, primaryText, menuData) {
        console.log(game);
        console.log(invoker);
        var g = game;
        palette.Palette.call(this, invoker, primaryText);

		var div = document.createElement('div');

		var lrods = document.createElement("label");
		lrods.innerHTML = "Rods:";
		lrods.setAttribute("for","rods");
		var rods = document.createElement("INPUT");
		rods.setAttribute("type", "number");
		rods.setAttribute("min","1");
		rods.setAttribute("style","width:40px;margin:5px;");
		rods.setAttribute("id","rods");
		rods.value=g.customarr[0];

		var ltop = document.createElement("label");
		ltop.innerHTML = "Top:";
		ltop.setAttribute("for","top");
		var top = document.createElement("INPUT");
		top.setAttribute("type", "number");
		top.setAttribute("min","1");
		top.setAttribute("style","width:40px;margin:5px;");
		top.setAttribute("id","top");
		top.value=g.customarr[1];

		var lbottom = document.createElement("label");
		lbottom.innerHTML = "Bottom:";
		lbottom.setAttribute("for","bottom");
		var bottom = document.createElement("INPUT");
		bottom.setAttribute("type", "number");
		bottom.setAttribute("min","1");
		bottom.setAttribute("style","width:40px;margin:5px;");
		bottom.setAttribute("id","bottom");
		bottom.value=g.customarr[2];

		var lfactor = document.createElement("label");
		lfactor.innerHTML = "Factor:";
		lfactor.setAttribute("for","factor");
		var factor = document.createElement("INPUT");
		factor.setAttribute("type", "number");
		factor.setAttribute("min","1");
		factor.setAttribute("style","width:40px;margin:5px;");
		factor.setAttribute("id","factor");
		factor.value=g.customarr[3];

		var lbase = document.createElement("label");
		lbase.innerHTML = "Base:";
		lbase.setAttribute("for","base");
		var base = document.createElement("INPUT");
		base.setAttribute("type", "number");
		base.setAttribute("min","1");
		base.setAttribute("style","width:40px;margin:5px;");
		base.setAttribute("id","base");
		base.value=g.customarr[4];

		var submit = document.createElement('button');
		submit.className = 'toolbutton';
		submit.setAttribute('id','new-button');
		submit.setAttribute('title','Create');
		submit.onclick = function() {
			that.setAbacus();
		}

		function isNormalInteger(str) {
		    var n = Math.floor(Number(str));
		    return String(n) === str && n > 0;
		}

		this.setAbacus = function() {
			if(isNormalInteger(rods.value)){
				that.popDown();
				g.updateCustom(parseInt(rods.value),parseInt(top.value),parseInt(bottom.value),parseInt(factor.value),parseInt(base.value));
				g.initAbacus(10);
			}
		}
		
		div.appendChild(lrods);
		div.appendChild(rods);
		div.appendChild(ltop);
		div.appendChild(top);
		div.appendChild(lbottom);
		div.appendChild(bottom);
		div.appendChild(lfactor);
		div.appendChild(factor);
		div.appendChild(lbase);
		div.appendChild(base);
		div.appendChild(submit);
		
		this.setContent([div]);
		var that = this;
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    custompalette.CustomPalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
	custompalette.CustomPalette.prototype.setShared = function(state) {
		this.setShared(state);
	}

    return custompalette;
});
