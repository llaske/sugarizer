define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var formatpalette = {};

    formatpalette.Formatpalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

        this.formatEvent = document.createEvent("CustomEvent");
        this.formatEvent.initCustomEvent('format', true, true, {});
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
                    that.setFormat(this.id);
                }
                this.buttons.push(newbutton);
                div.appendChild(newbutton);
            }
            this.setContent([div]);
        }

        this.setFormat = function(newformat) {
            var currentFormat = this.getFormat();
            var formatIndex = -1;
            for (var i = 0 ; i < this.categories.length ; i++) {
                if (this.categories[i].id == newformat) {
                    formatIndex = i;
                    break;
                }
            }
            if (formatIndex == -1) {
                return;
            }
            // Removed highlighting of format buttons to avoid confusion for user
            // console.log(this.buttons[formatIndex].className);
            // if(this.buttons[formatIndex].className == 'toolbutton palette-button palette-button-notselected'){
            //     this.buttons[formatIndex].className = 'toolbutton palette-button palette-button-selected';
            // } else {
            //     this.buttons[formatIndex].className = 'toolbutton palette-button palette-button-notselected';
            // }
        
            that.getPalette().dispatchEvent(that.formatEvent);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    formatpalette.Formatpalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
    formatpalette.Formatpalette.prototype.setCategories = function(newcategories) {
        this.setCategories(newcategories);
    }
    formatpalette.Formatpalette.prototype.setFormat = function(newformat) {
        this.setFormat(newformat);
    }
    formatpalette.Formatpalette.prototype.getFormat = function() {
        for (var i = 0 ; i < this.buttons.length ; i++) {
            if (this.buttons[i].className == 'toolbutton palette-button palette-button-selected')
                return this.categories[i].id;
        }
        return "";
    }
    return formatpalette;
});
