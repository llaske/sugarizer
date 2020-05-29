define(["sugar-web/graphics/palette","text!activity/palettes/mediapalette.html"], function(palette, template) {

	var mediapalette = {};

	mediapalette.MediaPalette = function(invoker, primaryText) {
		palette.Palette.call(this, invoker, primaryText);

		var containerElem = document.createElement('div');
		containerElem.innerHTML = template;
    this.setContent([containerElem]);
    
    this.uploadItemEvent = document.createEvent('CustomEvent');
    this.uploadItemEvent.initCustomEvent('upload-item', true, true, { mediaType: '' });
    
    let that = this;
    document.getElementById("image-upload").addEventListener('click', onClick);
    document.getElementById("audio-upload").addEventListener('click', onClick);
    document.getElementById("video-upload").addEventListener('click', onClick);
    
    function onClick(event) {
      that.uploadItemEvent.mediaType = event.currentTarget.getAttribute('media-type');
      that.getPalette().dispatchEvent(that.uploadItemEvent);
      that.popDown();
    }
	};

	var addEventListener = function(type, listener, useCapture) {
		return this.getPalette().addEventListener(type, listener, useCapture);
	};

	mediapalette.MediaPalette.prototype = Object.create(palette.Palette.prototype, {
		addEventListener: {
			value: addEventListener,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return mediapalette;
});
