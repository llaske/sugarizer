define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var listpalette = {};

    listpalette.Listpalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

        this.listEvent = document.createEvent("CustomEvent");
        this.listEvent.initCustomEvent('list', true, true, {});
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
                    that.setList(this.id);
                }
                this.buttons.push(newbutton);
                div.appendChild(newbutton);
            }
            this.setContent([div]);
        }

        this.setList = function(newlist) {
            var currentList = this.getList();
            var noList = (currentList.length != 0 && currentList == newlist);
            var listIndex = -1;
            for (var i = 0 ; i < this.categories.length ; i++) {
                if (this.categories[i].id == newlist) {
                    listIndex = i;
                    break;
                }
            }
            if (listIndex == -1) {
                return;
            }
            for (var i = 0 ; i < this.buttons.length ; i++) {
                this.buttons[i].className = 'toolbutton palette-button palette-button-notselected';
            }
            if (noList) {
                this.getPalette().dispatchEvent(this.listEvent);
                return;
            }
            this.buttons[listIndex].className = 'toolbutton palette-button palette-button-selected';
            that.getPalette().dispatchEvent(that.listEvent);
        }
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    listpalette.Listpalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
    listpalette.Listpalette.prototype.setCategories = function(newcategories) {
        this.setCategories(newcategories);
    }
    listpalette.Listpalette.prototype.setList = function(newlist) {
        this.setList(newlist);
    }
    listpalette.Listpalette.prototype.getList = function() {
        for (var i = 0 ; i < this.buttons.length ; i++) {
            if (this.buttons[i].className == 'toolbutton palette-button palette-button-selected')
                return this.categories[i].id;
        }
        return "";
    }
    return listpalette;
});
