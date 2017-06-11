// Insert image button display
define(['sugar-web/graphics/journalchooser','sugar-web/datastore'], function(chooser, datastore) {

	function initGui() {
		var insertImageButton = document.getElementById('insertimage-button');
		PaintApp.elements.insertImageButton = insertImageButton;
		insertImageButton.addEventListener('click', onInsertImageClick);
	}

	// onClick display dialog with journal content
	function onInsertImageClick() {
		// Display journal dialog popup
		chooser.show(function(entry) {
			// No selection
			if (!entry) {
				return;
			}

			// Get object content
			var dataentry = new datastore.DatastoreObject(entry.objectId);
			dataentry.loadAsText(function(err, metadata, text) {
				//We load the drawing inside an image element
				var element = document.createElement('img');
				element.src = text;
				element.onload = function() {
					//We draw the drawing to the canvas
					var ctx = PaintApp.elements.canvas.getContext('2d');
					var imgWidth = element.width;
					var imgHeight = element.height;
					var maxWidth = PaintApp.elements.canvas.getBoundingClientRect().width;
					var maxHeight = PaintApp.elements.canvas.getBoundingClientRect().height;
					var ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
					var newWidth = ratio * imgWidth;
					var newHeight = ratio * imgHeight;
					ctx.clearRect(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
					ctx.drawImage(element, 0, 0, newWidth, newHeight);

					PaintApp.saveCanvas();

					/* If the activity is shared we send the element to everyone */
					if (PaintApp.data.isShared) {
						try {
							PaintApp.collaboration.sendMessage({
								action: 'toDataURL',
								data: {
									width: PaintApp.elements.canvas.width / window.devicePixelRatio,
									height: PaintApp.elements.canvas.height / window.devicePixelRatio,
									src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
								}
							});
						} catch (e) {}
			 		}
				}
			});
		}, {mimetype: 'image/png'});
	}

	var insertImageButton = {
		initGui: initGui
	};

	return insertImageButton;
});
