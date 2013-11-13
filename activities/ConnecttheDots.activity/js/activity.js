define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var icon = require("sugar-web/graphics/icon");
    require("easel");
    require("handlebars")
    var shapes = require("activity/shapes")

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        // Colorize the activity icon.
        var activityButton = document.getElementById("activity-button");
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
        });

        var newButton = document.getElementById("new-button");
        newButton.onclick = function () {
            new_positions();
        }

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

	// A handlebars template for generating the dot labels
        var labelSource =
            "<div>" +
	    "{{#each labels}}" +
	    "<h2 id=\"n{{this}}\" style=\"position:absolute;-webkit-user-select: none;-moz-user-select: -moz-none;\">{{this}}</h2>" +
	    "{{/each}}" +
	    "</div>"

	// Create label elements for each of our dots
        template = Handlebars.compile(labelSource);
        var arrLabels = [];
        for (i = 0; i < 21; i++) {
            arrLabels[i] = i;
        }
        var labelElem = document.getElementById("labelDiv");
        var html = template({labels:arrLabels});
        labelElem.innerHTML = html;

	// Then create a list of the label elements
        nlabels = [];
        for (i = 0; i < arrLabels.length; i++) {
	    nlabels[i] = document.getElementById("n" + i.toString());
        }

	// Stage is an Easel construct
        var canvas, stage;

        // The display object currently under the mouse, or being dragged
        var mouseTarget;
        // Indicates whether we are currently in a drag operation
        var dragStarted;
        var offset;
        var update = true;
        var drawingCanvas;
        var oldPt;
        var midPt;
        var oldMidPt;
        var color;
        var stroke;
        var colors;
        var index;

        var imagepos = new Array();
        var myimages = new Array();
        var bitmaps = new Array();
        var pen_bitmap;

        var Star = "images/star.svg";
        var Dot = "images/dot.svg";
        var Pen = "images/pen.svg";

        var shape = -1;

	// Get things started
	init();

        function init() {
            if (window.top != window) {
                document.getElementById("header").style.display = "none";
            }
            document.getElementById("loader").className = "loader";
            // Create the stage and point it to the canvas:
            canvas = document.getElementById("myCanvas");

            index = 0;
            colors = ["#828b20", "#b0ac31", "#cbc53d", "#fad779", "#f9e4ad",
                  "#faf2db", "#563512", "#9b4a0b", "#d36600", "#fe8a00",
                  "#f9a71f"];
            oldPt = new createjs.Point(400, 300);
            midPt = oldPt;
            oldMidPt = oldPt;

            // Check to see if we are running in a browser with touch support
            stage = new createjs.Stage(canvas);

            // Enable touch interactions if supported on the current device:
            createjs.Touch.enable(stage);

            // Keep tracking the mouse even when it leaves the canvas
            stage.mouseMoveOutside = true;

            // Enabled mouse over and mouse out events
            stage.enableMouseOver(10);

            // Load the source images: a dot, a star and a turtle
            for (i = 0; i < nlabels.length; i++) {
                imagepos[i] = [-100, -100];
            }
            for (i = 0; i < nlabels.length; i++) {
                myimages[i] = new Image();
                if (i == 0) {
                    myimages[i].src = Star;
                } else {
                    myimages[i].src = Dot;
                }
                myimages[i].onload = handleImageLoad;
            }

            pen = new Image();
            pen.src = Pen;
            pen.onload = handlePenLoad;

            // Create a drawing canvas
            drawingCanvas = new createjs.Shape();
            stage.addChild(drawingCanvas);
            new_positions();
            stage.update();
        }

        function stop() {
            createjs.Ticker.removeEventListener("tick", tick);
        }

        function handleImageLoad(event) {
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // Create a shape that represents the center of the icon:
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-11, -14, 24, 18);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            i = myimages.indexOf(image)
            // Create and populate the screen with number icons.
            bitmap = new createjs.Bitmap(image);
            bitmaps[i] = bitmap // Save now so we can reposition later.
            container.addChild(bitmap);
            bitmap.x = imagepos[i][0]
            bitmap.y = imagepos[i][1]
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
	    if (i == 0) {
	        bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.5
            } else {
	        bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1.5
            }
            bitmap.name = "bmp_" + i;

            bitmap.cursor = "pointer";

            // Eventually, we can check this to make sure the number
            // has been touched.
            bitmap.hitArea = hitArea;

            (function (target) {})(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

        function handlePenLoad(event) {
            var image = event.target;
            var imgW = image.width;
            var imgH = image.height;
            var bitmap;
            var container = new createjs.Container();
            stage.addChild(container);

            // Create a shape that represents the center of the icon
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill("#FFF").drawEllipse(-22, -28, 48, 36);
            // Position hitArea relative to the internal coordinate system
            // of the target (bitmap instances):
            hitArea.x = imgW / 2;
            hitArea.y = imgH / 2;

            // Create a pen
            bitmap = new createjs.Bitmap(image);
	    pen_bitmap = bitmap
            container.addChild(bitmap);
            bitmap.x = imagepos[0][0]
            bitmap.y = imagepos[0][1]
            bitmap.regX = imgW / 2 | 0;
            bitmap.regY = imgH / 2 | 0;
            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 1
            bitmap.name = "bmp_pen";

            bitmap.cursor = "pointer";

            // Assign the hitArea to bitmap to use it for hit tests:
            bitmap.hitArea = hitArea;

            // Wrapper function to provide scope for the event handlers:
            (function (target) {
                bitmap.onPress = function (evt) {
                    // Bump the target in front of its siblings:
                    container.addChild(target);
                    var offset = {
                        x: target.x - evt.stageX,
                        y: target.y - evt.stageY
                    };

                    evt.onMouseMove = function (ev) {
                        target.x = ev.stageX + offset.x;
                        target.y = ev.stageY + offset.y;
                        // Indicate that the stage should be updated
                        // on the next tick:
                        update = true;
                        var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1,
                            oldPt.y + stage.mouseY >> 1);

                        drawingCanvas.graphics.setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

                        oldPt.x = stage.mouseX;
                        oldPt.y = stage.mouseY;

                        oldMidPt.x = midPt.x;
                        oldMidPt.y = midPt.y;
                    }
                }
                bitmap.onMouseOver = function () {
                    target.scaleX = target.scaleY = target.scale * 1.2;
                    update = true;
                    color = colors[(index++) % colors.length];
                    stroke = Math.random() * 30 + 10 | 0;
                    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
                    oldMidPt = oldPt;
                }
                bitmap.onMouseOut = function () {
                    target.scaleX = target.scaleY = target.scale;
                    update = true;
                }
            })(bitmap);

            document.getElementById("loader").className = "";
            createjs.Ticker.addEventListener("tick", tick);
        }

        function tick(event) {
            // This set makes it so the stage only re-renders when
            // an event handler indicates a change has happened.
            if (update) {
                update = false; // Only update once
                stage.update(event);
            }
        }

        function new_positions() {
	    if( shape == -1 ) {
                shape = 0
                return
            }

            for (i = 0; i < bitmaps.length; i++) {
                if (shape < shapes.length) {
                    if (i < shapes[shape].length) {
                        bitmaps[i].x = shapes[shape][i][0];
                        bitmaps[i].y = shapes[shape][i][1];
                    } else {
                        bitmaps[i].x = -100;
                        bitmaps[i].y = -100;
                    }
                } else {
                    bitmaps[i].x = canvas.width * Math.random() | 0;
                    bitmaps[i].y = canvas.height * Math.random() | 0;
                }
            }
            for (i = 0; i < bitmaps.length; i++) {
                // Put the label in the dot 
                if (i < 10) {
                    nlabels[i].style.left = Math.round(bitmaps[i].x + canvas.offsetLeft - 5) + "px";
                } else {
                    nlabels[i].style.left = Math.round(bitmaps[i].x + canvas.offsetLeft - 11) + "px";
                }
                nlabels[i].style.top = Math.round(bitmaps[i].y + canvas.offsetTop - 30) + "px";
            }

            pen_bitmap.x = bitmaps[0].x;
            pen_bitmap.y = bitmaps[0].y;

            drawingCanvas.graphics.clear();

            update = true;
            shape = shape + 1;
        }

    });

});
