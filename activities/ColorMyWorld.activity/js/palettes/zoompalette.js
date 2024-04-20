define([
	'sugar-web/graphics/palette',
	'text!activity/palettes/zoompalette.html',
  ], function (palette, template) {
	var zoompalette = {}
	zoompalette.ZoomPalette = function (invoker, primaryText) {
	  palette.Palette.call(this, invoker, primaryText)
	  this.getPalette().id = 'zoom-palette'
  
	  var containerElem = document.createElement('div')
	  containerElem.innerHTML = template
  
	  this.setContent([containerElem])

	  var zoomIn = document.getElementById('zoom-in-button')
	  var zoomOut = document.getElementById('zoom-out-button')
	  var zoomOriginal = document.getElementById('zoom-original-button')
  
	  zoomIn.addEventListener('click', function () {
		  var view=window.map.getView();
		  var zoom = view.getZoom();
		  view.animate({zoom:zoom+1})
	  })
  
	  zoomOut.addEventListener('click', function () {
		  var view=window.map.getView();
		  var zoom = view.getZoom();
		  view.animate({zoom:zoom-1})
	  })
  
	  zoomOriginal.addEventListener('click', function () {
		  var view=window.map.getView();
		  view.animate({zoom:2.3299654139527806})
	  })
  
	}
  
	var addEventListener = function (type, listener, useCapture) {
	  return this.getPalette().addEventListener(type, listener, useCapture)
	}
  
	zoompalette.ZoomPalette.prototype = Object.create(
	  palette.Palette.prototype,
	  {
		addEventListener: {
		  value: addEventListener,
		  enumerable: true,
		  configurable: true,
		  writable: true,
		},
	  },
	)
  
	return zoompalette
  })
  