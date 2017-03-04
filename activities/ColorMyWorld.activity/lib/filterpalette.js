define(["sugar-web/graphics/palette"], function (palette) {

	'use strict';

	var filterpalette = {};

	filterpalette.FilterPalette = function (invoker, primaryText, menuData) {
		palette.Palette.call(this, invoker, primaryText);

		this.filterEvent = document.createEvent("CustomEvent");
		this.filterEvent.initCustomEvent('filter', true, true, {});
		this.remoteEvent = document.createEvent("CustomEvent");
		this.remoteEvent.initCustomEvent('remote', true, true, {});
		this.getPalette().className += " filterpalette";

		var div = document.createElement('div');

		var that = this;

		var worldbutton = document.createElement('button');
		worldbutton.className = 'toolbutton palette-button palette-button-selected';
		worldbutton.setAttribute('id','world-button');
		worldbutton.setAttribute('title','World');
		worldbutton.onclick = function() {
			that.setFilter('world');
		}
		var northamericabutton = document.createElement('button');
		northamericabutton.className = 'toolbutton palette-button palette-button-notselected';
		northamericabutton.setAttribute('id','northamerica-button');
		northamericabutton.setAttribute('title','North America');
		northamericabutton.onclick = function() {
			that.setFilter('northamerica');
		}
		var southamericabutton = document.createElement('button');
		southamericabutton.className = 'toolbutton palette-button palette-button-notselected';
		southamericabutton.setAttribute('id','southamerica-button');
		southamericabutton.setAttribute('title','South America');
		southamericabutton.onclick = function() {
			that.setFilter('southamerica');
		}
		var europebutton = document.createElement('button');
		europebutton.className = 'toolbutton palette-button palette-button-notselected';
		europebutton.setAttribute('id','europe-button');
		europebutton.setAttribute('title','Europe');
		europebutton.onclick = function() {
			that.setFilter('europe');
		}
		var africabutton = document.createElement('button');
		africabutton.className = 'toolbutton palette-button palette-button-notselected';
		africabutton.setAttribute('id','africa-button');
		africabutton.setAttribute('title','Africa');
		africabutton.onclick = function() {
			that.setFilter('africa');
		}
		var asiabutton = document.createElement('button');
		asiabutton.className = 'toolbutton palette-button palette-button-notselected';
		asiabutton.setAttribute('id','asia-button');
		asiabutton.setAttribute('title','Asia');
		asiabutton.onclick = function() {
			that.setFilter('asia');
		}
		var australiabutton = document.createElement('button');
		australiabutton.className = 'toolbutton palette-button palette-button-notselected';
		australiabutton.setAttribute('id','australia-button');
		australiabutton.setAttribute('title','Australia Region');
		australiabutton.onclick = function() {
			that.setFilter('australia');
		}
		this.setFilter = function(lang) {
			var noFilter = (this.getFilter() == lang);
			worldbutton.className = 'toolbutton palette-button palette-button-notselected';
			northamericabutton.className = 'toolbutton palette-button palette-button-notselected';
			southamericabutton.className = 'toolbutton palette-button palette-button-notselected';
			europebutton.className = 'toolbutton palette-button palette-button-notselected';
			africabutton.className = 'toolbutton palette-button palette-button-notselected';
			asiabutton.className = 'toolbutton palette-button palette-button-notselected';
			australiabutton.className = 'toolbutton palette-button palette-button-notselected';
			if (noFilter) {
				this.getPalette().dispatchEvent(this.filterEvent);
				return;
			}
			if (lang == 'northamerica') {
				northamericabutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'southamerica') {
				southamericabutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'europe') {
				europebutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'africa') {
				africabutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'asia') {
				asiabutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'australia') {
				australiabutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			} else if (lang == 'world') {
				worldbutton.className = 'toolbutton palette-button palette-button-selected';
				that.getPalette().dispatchEvent(that.filterEvent);
			}
		}

		div.appendChild(worldbutton);
		div.appendChild(northamericabutton);
		div.appendChild(southamericabutton);
		div.appendChild(europebutton);
		div.appendChild(africabutton);
		div.appendChild(asiabutton);
		div.appendChild(australiabutton);

		this.setContent([div]);

		// Pop-down the palette when a item in the menu is clicked.

		this.buttons = div.querySelectorAll('button');
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
	filterpalette.FilterPalette.prototype.setFilter = function(lang) {
		this.setFilter(lang);
	}
	filterpalette.FilterPalette.prototype.getFilter = function() {
		if (document.getElementById("world-button").className == 'toolbutton palette-button palette-button-selected')
			return "World";
		else if (document.getElementById("northamerica-button").className == 'toolbutton palette-button palette-button-selected')
			return "North America";
		else if (document.getElementById("southamerica-button").className == 'toolbutton palette-button palette-button-selected')
			return "South America";
		else if (document.getElementById("europe-button").className == 'toolbutton palette-button palette-button-selected')
			return "Europe";
		else if (document.getElementById("africa-button").className == 'toolbutton palette-button palette-button-selected')
			return "Africa";
		else if (document.getElementById("asia-button").className == 'toolbutton palette-button palette-button-selected')
			return "Asia";
		else if (document.getElementById("australia-button").className == 'toolbutton palette-button palette-button-selected')
			return "Australia Region";
		else
			return "";
	}
	return filterpalette;
});
