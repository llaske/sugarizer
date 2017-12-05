// Insert image button display
define(['sugar-web/graphics/journalchooser','sugar-web/datastore'], function(chooser, datastore) {

  function initGui() {
    var insertImageButton = document.getElementById('insertimage-button');
    PaintApp.elements.insertImageButton = insertImageButton;
    insertImageButton.addEventListener('click', onInsertImageClick);
  }
  var printImage = false;
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
          printImage = true;
          //We draw the drawing to the canvas
          var ctx = PaintApp.elements.canvas.getContext('2d');
          var width;
          var height;
          var x;
          var y;
          var imagedata;
          //Set the start position of the image
          addEventListener("mousedown", function(event){
            if(printImage){
            width = event.clientX;
            height = event.clientY;
            x = width;
            y = height;
            imagedata = ctx.getImageData(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
            ctx.drawImage(element, x - 60 , y - 125, 60, 70);
          }
          });

          //Calculate the size and print the image
          addEventListener("mousemove", function(event){
            if(printImage){
            ctx.putImageData(imagedata, 0, 0);
            width = event.clientX - x;
            height = event.clientY - y;
            ctx.drawImage(element, x - 60 , y - 125, width + 60, height + 70);
          }
          });
          addEventListener("mouseup", function(event){
            printImage = false;
          });




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
    }, {mimetype: 'image/png'}, {mimetype: 'image/jpeg'});
  }

  var insertImageButton = {
    initGui: initGui
  };

  return insertImageButton;
});
