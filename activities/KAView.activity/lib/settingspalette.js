define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var settingspalette = {};

    settingspalette.SettingsPalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

		this.languageEvent = document.createEvent("CustomEvent");
		this.languageEvent.initCustomEvent('language', true, true, {});
		this.remoteEvent = document.createEvent("CustomEvent");
		this.remoteEvent.initCustomEvent('remote', true, true, {});
		
		var div = document.createElement('div');
		
		var enbutton = document.createElement('button');
		enbutton.className = 'toolbutton palette-button palette-button-selected';
		enbutton.setAttribute('id','en-button');
		enbutton.onclick = function() {
			that.setLanguage('en');
		}
		var esbutton = document.createElement('button');
		esbutton.className = 'toolbutton palette-button palette-button-notselected';
		esbutton.setAttribute('id','es-button');
		esbutton.onclick = function() {
			that.setLanguage('es');
		}
		var frbutton = document.createElement('button');
		frbutton.className = 'toolbutton palette-button palette-button-notselected';
		frbutton.setAttribute('id','fr-button');
		frbutton.onclick = function() {
			that.setLanguage('fr');
		}
		this.setLanguage = function(lang) {
			if (lang == 'en') {
				enbutton.className = 'toolbutton palette-button palette-button-selected';
				esbutton.className = 'toolbutton palette-button palette-button-notselected';
				frbutton.className = 'toolbutton palette-button palette-button-notselected';
				that.getPalette().dispatchEvent(that.languageEvent);
			} else if (lang == 'es') {
				enbutton.className = 'toolbutton palette-button palette-button-notselected';
				esbutton.className = 'toolbutton palette-button palette-button-selected';
				frbutton.className = 'toolbutton palette-button palette-button-notselected';
				that.getPalette().dispatchEvent(that.languageEvent);			
			} else {
				enbutton.className = 'toolbutton palette-button palette-button-notselected';
				esbutton.className = 'toolbutton palette-button palette-button-notselected';
				frbutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.languageEvent);
			}
		}
	
		var hr = document.createElement('hr');
		
		var remotebutton = document.createElement('button');
		remotebutton.className = 'toolbutton palette-button palette-button-notselected';
		remotebutton.setAttribute('id','remote-button');
		remotebutton.onclick = function() {
			that.getPalette().dispatchEvent(that.remoteEvent);
		}
		
		div.appendChild(enbutton);
		div.appendChild(esbutton);
		div.appendChild(frbutton);
		
		div.appendChild(hr);
		
		div.appendChild(remotebutton);
		
		this.setContent([div]);

        // Pop-down the palette when a item in the menu is clicked.

        this.buttons = div.querySelectorAll('button');
        var that = this;

        function popDownOnButtonClick(event) {
            that.popDown();
        }

        for (var i = 0; i < this.buttons.length; i++) {
			if (this.buttons[i].id == "settings-button")
				this.buttons[i].addEventListener('language', popDownOnButtonClick);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    settingspalette.SettingsPalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
	settingspalette.SettingsPalette.prototype.setLanguage = function(lang) {
		this.setLanguage(lang);
	}
	settingspalette.SettingsPalette.prototype.getLanguage = function() {
		if (document.getElementById("en-button").className == 'toolbutton palette-button palette-button-selected')
			return "en";
		else if (document.getElementById("es-button").className == 'toolbutton palette-button palette-button-selected')
			return "es";
		else
			return "fr";
	}
    return settingspalette;
});
