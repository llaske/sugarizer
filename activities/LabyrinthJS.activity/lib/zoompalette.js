/* Zoom palette */


define([
  'sugar-web/graphics/palette',
  'mustache'
], function(palette, mustache) {

  var zoompalette = {};

  /* We setup the palette with zoom icons */
  zoompalette.zoomPalette = function(invoker, primaryText) {
    palette.Palette.call(this, invoker, primaryText);
    this.getPalette().id = "zoompalette";
    this.zoomEvent = document.createEvent('CustomEvent');
    this.zoomEvent.initCustomEvent('zoom', true, true, {
	  'zoom': 3
    });
    this.popEvent = document.createEvent('CustomEvent');
    this.popEvent.initCustomEvent('pop', true, true, {});
    this.template = '{{#rows}}' + '{{#.}}' + '<button class="toolbutton zoombuttons" style="height:55px; width:55px; background-image: url({{ icon }}); "></button>' + '</td>' + '{{/.}}' + '{{/rows}}';
    var rows = [
      [{
        icon: 'icons/zoom-out.svg'
      }, {
        icon: 'icons/zoom-in.svg'
      }, {
        icon: 'icons/zoom-to-width.svg'
      }, {
        icon: 'icons/zoom-original.svg'
      }]
    ];
    var zoomElem = document.createElement('div');
    zoomElem.innerHTML = mustache.render(this.template, {
      rows: rows
    });
    this.setContent([zoomElem]);
    var buttons = zoomElem.querySelectorAll('button');
    var that = this;
    invoker.addEventListener('click', function(e) {
		that.getPalette().dispatchEvent(that.popEvent);
	});

    function popDownOnButtonClick(event) {
      that.popDown();
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
	    for (var j = 0 ; j < buttons.length ; j++)
			if (this == buttons[j]) break;
        that.zoomEvent.detail.zoom = j;
        that.getPalette().dispatchEvent(that.zoomEvent);
		that.popDown();
	  });
    }
    popDownOnButtonClick({
      target: buttons[0]
    });
  };
	
  var addEventListener = function(type, listener, useCapture) {
    return this.getPalette().addEventListener(type, listener, useCapture);
  };

  zoompalette.zoomPalette.prototype = Object.create(palette.Palette.prototype, {
    addEventListener: {
      value: addEventListener,
      enumerable: true,
      configurable: true,
      writable: true
    }
  });
  return zoompalette;
});
