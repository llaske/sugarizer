// Insert image button display
define(['sugar-web/graphics/journalchooser','sugar-web/datastore'], function(chooser, datastore) {

    function initGui() {
        var insertImageButton = document.getElementById('insertimage-button');
        PaintApp.elements.insertImageButton = insertImageButton;
        insertImageButton.addEventListener('click', onInsertImageClick);
    }
    var printImage = false;
    var resizeImage = false;

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
                    resizeImage = false;
                    //We draw the drawing to the canvas
                    var ctx = PaintApp.elements.canvas.getContext('2d');
                    var imagedata = ctx.getImageData(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
                    var xds= true;
                    var width;
                    var height;
                    var x;
                    var y;
                    var imageWoRectangle;
                    var touchScreen = ("ontouchstart" in document.documentElement);

                    ctx.putImageData(imagedata, 0, 0);
                    x = 65;
                    y = 130;
                    width = element.width;
                    height = element.height;
                    ctx.drawImage(element, x - 60, y - 125, width + 60, height + 70);
                    imageWoRectangle = ctx.getImageData(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
                    ctx.stroke();
                    PaintApp.saveCanvas();
                    ctx.beginPath();
                    ctx.setLineDash([1, 10]);
                    ctx.strokeStyle = '#101010';
                    ctx.rect(x - 65, y - 130, width + 70, height + 80);
                    ctx.stroke();

                    //Calculate the size and print the image
                    var imageMousemove = function(event) {
                        if (printImage || resizeImage) {
                            if(xds) ctx.putImageData(imagedata, 0, 0);
                            if (touchScreen) event = event.touches[0];
                            if (printImage) {
                                x = event.clientX - (width/2);
                                y = event.clientY - (height/2);
                            } else {
                                width = event.clientX - x;
                                height = event.clientY - y
                            }
                            ctx.drawImage(element, x - 60, y - 125, width + 60, height + 70);
                            imageWoRectangle = ctx.getImageData(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
                            ctx.beginPath();
                            ctx.setLineDash([1, 10]);
                            ctx.strokeStyle = '#101010';
                            ctx.rect(x - 65, y - 130, width + 70, height + 80);
                            ctx.stroke();
                        }
                    }
                    var imageMouseup = function(event) {
                        if (printImage) {
                            printImage = false;
                            resizeImage = true;
                        } else if (resizeImage) {
                            if (touchScreen) event = event.touches[0];
                            ctx.putImageData(imageWoRectangle, 0, 0);
                            ctx.setLineDash([1]);
                            imagedata = ctx.getImageData(0, 0, PaintApp.elements.canvas.width, PaintApp.elements.canvas.height);
                            PaintApp.saveCanvas();
                            ctx=0;
                            printImage = false;
                            resizeImage = false;
                            if (touchScreen) {
                                removeEventListener("touchmove", imageMousemove);
                                removeEventListener("touchend", imageMouseup);
                            } else {
                                removeEventListener("mousemove", imageMousemove);
                                removeEventListener("mouseup", imageMouseup);
                            }
                        }
                    }

                    if (touchScreen) {
                        addEventListener("touchmove", imageMousemove, false);
                        addEventListener("touchend", imageMouseup, false);
                    } else {
                        addEventListener("mousemove", imageMousemove);
                        addEventListener("mouseup", imageMouseup);
                    }

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
