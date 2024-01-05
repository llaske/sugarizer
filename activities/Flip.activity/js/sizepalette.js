define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var sizepalette = {};

    sizepalette.SizePalette = function (game, invoker, primaryText, menuData) {
        console.log(game);
        console.log(invoker);
        palette.Palette.call(this, invoker, primaryText);

		var div = document.createElement('div');

		var fourbutton = document.createElement('button');
		fourbutton.className = 'toolbutton';
		fourbutton.setAttribute('id','four-button');
		fourbutton.setAttribute('data-l10n-id','four-button');
		fourbutton.setAttribute('title','4x4 grid');
		fourbutton.onclick = function() {
			that.setSize(4);
		}

		var fivebutton = document.createElement('button');
		fivebutton.className = 'toolbutton';
		fivebutton.setAttribute('id','five-button');
		fivebutton.setAttribute('data-l10n-id','five-button');
		fivebutton.setAttribute('title','5x5 grid');
		fivebutton.onclick = function() {
			that.setSize(5);
		}

		var sixbutton = document.createElement('button');
		sixbutton.className = 'toolbutton';
		sixbutton.setAttribute('id','six-button');
		sixbutton.setAttribute('data-l10n-id','six-button');
		sixbutton.setAttribute('title','6x6 grid');
		sixbutton.onclick = function() {
			that.setSize(6);
		}

		var sevenbutton = document.createElement('button');
		sevenbutton.className = 'toolbutton';
		sevenbutton.setAttribute('id','seven-button');
		sevenbutton.setAttribute('data-l10n-id','seven-button');
		sevenbutton.setAttribute('title','7x7 grid');
		sevenbutton.onclick = function() {
			that.setSize(7);
		}

		this.setSize = function(state) {
			that.popDown();
			g.setSize(state);
			that.setUsed();
		}
		this.resetBackgroundCols = function(){
			fourbutton.style.backgroundColor = "#C0C0C0";
			fivebutton.style.backgroundColor = "#C0C0C0";
			sixbutton.style.backgroundColor = "#C0C0C0";
			sevenbutton.style.backgroundColor = "#C0C0C0";
		}
		this.setUsed = function(){
			this.resetBackgroundCols();
			var sizebutton = document.getElementById("size-button");
			//TODO: This is a hack - more palettes will break it.
			var sizepalettebutton = document.getElementsByClassName("palette-invoker")[1];
			switch(game.startgridwidth) {
				case 4:
					sizebutton.style.backgroundImage = "url(icons/4x4.svg)";
					sizepalettebutton.style.backgroundImage = "url(icons/4x4.svg)";
					fourbutton.style.backgroundColor = "#808080";
					break;
				case 5:
					sizebutton.style.backgroundImage = "url(icons/5x5.svg)";
					sizepalettebutton.style.backgroundImage = "url(icons/5x5.svg)";
					fivebutton.style.backgroundColor = "#808080";
					break;
				case 6:
					sizebutton.style.backgroundImage = "url(icons/6x6.svg)";
					sizepalettebutton.style.backgroundImage = "url(icons/6x6.svg)";
					sixbutton.style.backgroundColor = "#808080";
					break;
				case 7:
					sizebutton.style.backgroundImage = "url(icons/7x7.svg)";
					sizepalettebutton.style.backgroundImage = "url(icons/7x7.svg)";
					sevenbutton.style.backgroundColor = "#808080";
					break;
			}
		}
		
		div.appendChild(fourbutton);
		div.appendChild(fivebutton);
		div.appendChild(sixbutton);
		div.appendChild(sevenbutton);

		this.setContent([div]);
		var that = this;
		var g = game;
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    sizepalette.SizePalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
	sizepalette.SizePalette.prototype.setShared = function(state) {
		this.setShared(state);
	}

    return sizepalette;
});
