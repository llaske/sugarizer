define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var sizepalette = {};

    sizepalette.Sizepalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

        this.sizeEvent = document.createEvent("CustomEvent");
        this.sizeEvent.initCustomEvent('size', true, true, {});
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
                newbutton.className = 'toolbutton palette-button-2 palette-button-notselected filter-item';
                newbutton.setAttribute('id', newcategories[i].id);
                newbutton.setAttribute('title', newcategories[i].title);
                newbutton.innerHTML = newcategories[i].cmd;
                var newid = newcategories[i].id;
                newbutton.onclick = function() {
                    that.setSize(this.id);
                }
                this.buttons.push(newbutton);
                div.appendChild(newbutton);
            }
            this.setContent([div]);
        }

        this.setSize = function(id) {            
            that.getPalette().dispatchEvent(that.sizeEvent);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    sizepalette.Sizepalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
    sizepalette.Sizepalette.prototype.setCategories = function(newcategories) {
        this.setCategories(newcategories);
    }
    sizepalette.Sizepalette.prototype.setSize = function(newsize) {
        this.setSize(newSize);
    }    
    return sizepalette;
});
