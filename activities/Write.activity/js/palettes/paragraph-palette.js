define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var parapalette = {};

    parapalette.Parapalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

        this.paraEvent = document.createEvent("CustomEvent");
        this.paraEvent.initCustomEvent('para', true, true, {});
        this.remoteEvent = document.createEvent("CustomEvent");
        this.remoteEvent.initCustomEvent('remote', true, true, {});

        var that = this;
        that.categories = [];
        that.buttons = [];

        this.setCategories = function( newcategories) {
            this.categories = newcategories;

            this.buttons = [];
            var div = document.createElement('div');

            for (var i = 0 ; i < newcategories.length ; i++) {
                var newbutton = document.createElement('button');
                newbutton.className = 'toolbutton palette-button palette-button-notselected';
                newbutton.setAttribute('id', newcategories[i].id);
                newbutton.setAttribute('title', newcategories[i].title);
                var url = "url(icons/"+newcategories[i].cmd+".svg)";
                newbutton.style.backgroundImage = url;
                var newid = newcategories[i].id;
                newbutton.onclick = function() {
                    that.setPara(this.id);
                }
                this.buttons.push(newbutton);
                div.appendChild(newbutton);
            }
            this.setContent([div]);
        }

        this.setPara = function(newpara) {
            var paraIndex = -1;
            for (var i = 0 ; i < this.categories.length ; i++) {
                if (this.categories[i].id == newpara) {
                    paraIndex = i;
                    break;
                }
            }
            if (paraIndex == -1) {
                return;
            }
            for (var i = 0 ; i < this.buttons.length ; i++) {
                this.buttons[i].className = 'toolbutton palette-button palette-button-notselected';
            }

            this.buttons[paraIndex].className = 'toolbutton palette-button palette-button-selected';
            that.getPalette().dispatchEvent(that.paraEvent);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    parapalette.Parapalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
    parapalette.Parapalette.prototype.setCategories = function(newcategories) {
        this.setCategories(newcategories);
    }
    parapalette.Parapalette.prototype.setPara = function(newpara) {
        this.setPara(newpara);
    }
    parapalette.Parapalette.prototype.getPara = function() {
        for (var i = 0 ; i < this.buttons.length ; i++) {
            if (this.buttons[i].className == 'toolbutton palette-button palette-button-selected')
                return this.categories[i].id;
        }
        return "";
    }
    return parapalette;
});
