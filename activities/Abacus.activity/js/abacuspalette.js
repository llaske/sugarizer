define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var abacuspalette = {};

    abacuspalette.AbacusPalette = function (game, invoker, primaryText, menuData) {
        console.log(game);
        console.log(invoker);
        palette.Palette.call(this, invoker, primaryText);

		var div = document.createElement('div');

		var decimalbutton = document.createElement('button');
		decimalbutton.className = 'toolbutton';
		decimalbutton.setAttribute('id','decimal-button');
		decimalbutton.setAttribute('title','Decimal');
		decimalbutton.onclick = function() {
			that.setAbacus(0);
		}
		var sorobanbutton = document.createElement('button');
		sorobanbutton.className = 'toolbutton';
		sorobanbutton.setAttribute('id','soroban-button');
		sorobanbutton.setAttribute('title','Soroban');
		sorobanbutton.onclick = function() {
			that.setAbacus(1);
		}
		var suanpanbutton = document.createElement('button');
		suanpanbutton.className = 'toolbutton';
		suanpanbutton.setAttribute('id','suanpan-button');
		suanpanbutton.setAttribute('title','Suanpan');
		suanpanbutton.onclick = function() {
			that.setAbacus(2);
		}
		var nepobutton = document.createElement('button');
		nepobutton.className = 'toolbutton';
		nepobutton.setAttribute('id','nepo-button');
		nepobutton.setAttribute('title','Nepohualtzintzin');
		nepobutton.onclick = function() {
			that.setAbacus(3);
		}
		var hexbutton = document.createElement('button');
		hexbutton.className = 'toolbutton';
		hexbutton.setAttribute('id','hex-button');
		hexbutton.setAttribute('title','Hexadecimal');
		hexbutton.onclick = function() {
			that.setAbacus(4);
		}
		var binarybutton = document.createElement('button');
		binarybutton.className = 'toolbutton';
		binarybutton.setAttribute('id','binary-button');
		binarybutton.setAttribute('title','Binary');
		binarybutton.onclick = function() {
			that.setAbacus(5);
		}
		var schetybutton = document.createElement('button');
		schetybutton.className = 'toolbutton';
		schetybutton.setAttribute('id','schety-button');
		schetybutton.setAttribute('title','Schety');
		schetybutton.onclick = function() {
			that.setAbacus(6);
		}
		var fractionsbutton = document.createElement('button');
		fractionsbutton.className = 'toolbutton';
		fractionsbutton.setAttribute('id','fractions-button');
		fractionsbutton.setAttribute('title','Fractions');
		fractionsbutton.onclick = function() {
			that.setAbacus(7);
		}
		var caacupebutton = document.createElement('button');
		caacupebutton.className = 'toolbutton';
		caacupebutton.setAttribute('id','caacupe-button');
		caacupebutton.setAttribute('title','Caacupé');
		caacupebutton.onclick = function() {
			that.setAbacus(8);
		}
		var rodsbutton = document.createElement('button');
		rodsbutton.className = 'toolbutton';
		rodsbutton.setAttribute('id','rods-button');
		rodsbutton.setAttribute('title','Rods');
		rodsbutton.onclick = function() {
			that.setAbacus(9);
		}
		var custombutton = document.createElement('button');
		custombutton.className = 'toolbutton';
		custombutton.setAttribute('id','custom-button');
		custombutton.setAttribute('title','Custom');
		custombutton.onclick = function() {
			that.setAbacus(10);
		}

		this.setAbacus = function(state) {
			that.popDown();
			g.initAbacus(state);
			that.setUsed();
		}
		this.resetBackgroundCols = function(){
			decimalbutton.style.backgroundColor = "#C0C0C0";
			sorobanbutton.style.backgroundColor = "#C0C0C0";
			suanpanbutton.style.backgroundColor = "#C0C0C0";
			nepobutton.style.backgroundColor = "#C0C0C0";
			hexbutton.style.backgroundColor = "#C0C0C0";
			binarybutton.style.backgroundColor = "#C0C0C0";
			schetybutton.style.backgroundColor = "#C0C0C0";
			fractionsbutton.style.backgroundColor = "#C0C0C0";
			caacupebutton.style.backgroundColor = "#C0C0C0";
			rodsbutton.style.backgroundColor = "#C0C0C0";
			custombutton.style.backgroundColor = "#C0C0C0";
		}
		this.setUsed = function(){
			this.resetBackgroundCols();
			switch(game.abacustype) {
				case 0:
					decimalbutton.style.backgroundColor = "#808080";
					break;
				case 1:
					sorobanbutton.style.backgroundColor = "#808080";
					break;
				case 2:
					suanpanbutton.style.backgroundColor = "#808080";
					break;
				case 3:
					nepobutton.style.backgroundColor = "#808080";
					break;
				case 4:
					hexbutton.style.backgroundColor = "#808080";
					break;
				case 5:
					binarybutton.style.backgroundColor = "#808080";
					break;
				case 6:
					schetybutton.style.backgroundColor = "#808080";
					break;
				case 7:
					fractionsbutton.style.backgroundColor = "#808080";
					break;
				case 8:
					caacupebutton.style.backgroundColor = "#808080";
					break;
				case 9:
					rodsbutton.style.backgroundColor = "#808080";
					break;
				case 10:
					custombutton.style.backgroundColor = "#808080";
					break;
			}
		}
		
		div.appendChild(decimalbutton);
		div.appendChild(sorobanbutton);
		div.appendChild(suanpanbutton);
		div.appendChild(nepobutton);
		div.appendChild(hexbutton);
		div.appendChild(binarybutton);
		div.appendChild(schetybutton);
		div.appendChild(fractionsbutton);
		div.appendChild(caacupebutton);
		div.appendChild(rodsbutton);
		div.appendChild(custombutton);
		
		this.setContent([div]);
		var that = this;
		var g = game;
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    abacuspalette.AbacusPalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
	abacuspalette.AbacusPalette.prototype.setShared = function(state) {
		this.setShared(state);
	}

    return abacuspalette;
});
