define(["sugar-web/graphics/palette"], function (palette) {

    'use strict';

    var filterpalette = {};

    filterpalette.FilterPalette = function (invoker, primaryText, menuData) {
        palette.Palette.call(this, invoker, primaryText);

		this.filterEvent = document.createEvent("CustomEvent");
		this.filterEvent.initCustomEvent('filter', true, true, {});
		this.remoteEvent = document.createEvent("CustomEvent");
		this.remoteEvent.initCustomEvent('remote', true, true, {});

		var that = this;
		that.categories = [];
		that.buttons = [];

		this.setCategories = function(newcategories) {
			this.categories = newcategories;
			this.buttons = [];
			var div = document.createElement('div');

			for (var i = 0 ; i < newcategories.length ; i++) {
				var newbutton = document.createElement('button');
				newbutton.className = 'toolbutton palette-button palette-button-notselected filter-item';
				newbutton.setAttribute('id', newcategories[i].id);
				newbutton.setAttribute('title', newcategories[i].title);
				newbutton.innerHTML = newcategories[i].title;
				var newid = newcategories[i].id;
				newbutton.onclick = function() {
					that.setFilter(this.id);
				}
				this.buttons.push(newbutton);
				div.appendChild(newbutton);
			}
			this.setContent([div]);
		}

		this.setFilter = function(newfilter) {
			var currentFilter = this.getFilter();
			var noFilter = (currentFilter.length != 0 && currentFilter == newfilter);
			var filterIndex = -1;
			for (var i = 0 ; i < this.categories.length ; i++) {
				if (this.categories[i].id == newfilter) {
					filterIndex = i;
					break;
				}
			}
			if (filterIndex == -1) {
				return;
			}
			for (var i = 0 ; i < this.buttons.length ; i++) {
				this.buttons[i].className = 'toolbutton palette-button palette-button-notselected filter-item';
			}
			if (noFilter) {
				this.getPalette().dispatchEvent(this.filterEvent);
				return;
			}
			this.buttons[filterIndex].className = 'toolbutton palette-button palette-button-selected filter-item';
			that.getPalette().dispatchEvent(that.filterEvent);
		}
    };

    var addEventListener = function (type, listener, useCapture) {
        return this.getPalette().addEventListener(type, listener, useCapture);
    };

    filterpalette.FilterPalette.prototype =
        Object.create(palette.Palette.prototype, {
            addEventListener: {
                value: addEventListener,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });
	filterpalette.FilterPalette.prototype.setCategories = function(newcategories) {
		this.setCategories(newcategories);
	}
	filterpalette.FilterPalette.prototype.setFilter = function(newfilter) {
		this.setFilter(newfilter);
	}
	filterpalette.FilterPalette.prototype.getFilter = function() {
		for (var i = 0 ; i < this.buttons.length ; i++) {
			if (this.buttons[i].className == 'toolbutton palette-button palette-button-selected filter-item')
				return this.categories[i].id;
		}
		return "";
	}
    return filterpalette;
});
