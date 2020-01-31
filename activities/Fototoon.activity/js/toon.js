define(["easel","sugar-web/datastore","sugar-web/env","webL10n","humane"], function (easel, datastore, env, l10n, humane) {


	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
		var language = environment.user ? environment.user.language : defaultLanguage;
		l10n.language.code = language;
		console.log('LANG ' + language);
	});

	function _(text) {
        // copied from activity.js
        translation = l10n.get(text);
        if (translation == '') {
            translation = text;
        };
        return translation;
    };

    var onAndroid = /Android/i.test(navigator.userAgent);

    var smallScreen = (window.innerWidth < 700) || (window.innerHeight < 600);
    var font = smallScreen ? "16px Arial" : "24px Arial";

    var LINE_WIDTH = 3;
    var BLACK = "#000000";
    var WHITE = "#ffffff";

    // Spanish names for historic reasons
    var DIR_DOWN = "abajo";
    var DIR_UP = "arriba";
    var DIR_LEFT = "izq";
    var DIR_RIGHT = "der";

    var MODE_NORMAL = 'normal';
    var MODE_WHISPER = 'despacio';

    var SIZE_RESIZE_AREA = 40; // TODO style.GRID_CELL_SIZE / 2

    var TYPE_GLOBE = 'GLOBE';
    var TYPE_CLOUD = 'CLOUD';
    var TYPE_EXCLAMATION = 'EXCLAMATION';
    var TYPE_RECTANGLE = 'RECTANGLE';

    // TYPE_WHISPER is saved as TYPE_GLOBE and mode MODE_WHISPER
    var TYPE_WHISPER = 'WHISPER';

    var DEFAULT_FONT_SIZE = 14;

    toon = {};

    function createAsyncBitmap(box, url, callback) {
        // Async creation of bitmap from SVG data
        // Works with Chrome, Safari, Firefox (untested on IE)
        var img = new Image();
        img.onload = function () {
            bitmap = new createjs.Bitmap(img);
            bitmap.setBounds(0, 0, img.width, img.height);
            bitmap.mouseEnabled = false;
            callback(box, bitmap);
        };
        img.onerror = function (errorMsg, url, lineNumber) {
            callback(box, null);
        };
        img.src = url;
    };

    function createAsyncBitmapButton(globe, url, callback) {
        // creates a square black button with a image inside
        // is used for the corner controls in the globe
        var img = new Image();
        img.cont = null;
        img.globe = globe;

        img.onload = function () {
            var bitmap = new createjs.Bitmap(img);
            bitmap.setBounds(0, 0, img.width, img.height);
            bounds = bitmap.getBounds();
            var scale = SIZE_RESIZE_AREA / bounds.height;
            bitmap.scaleX = scale;
            bitmap.scaleY = scale;

            if (this.cont == null) {
                this.cont = new createjs.Container();
                this.cont.name = 'button';
                var hitArea = new createjs.Shape();
                hitArea.graphics.beginFill("#000").drawRect(0, 0,
                    SIZE_RESIZE_AREA, SIZE_RESIZE_AREA);
                this.cont.width = SIZE_RESIZE_AREA;
                this.cont.height = SIZE_RESIZE_AREA;
                this.cont.hitArea = hitArea;
                this.cont.addChild(hitArea);
                this.cont.addChild(bitmap);
                callback(this.globe, this.cont);
            };
        };
        img.src = url;
        return img;
    };

    function Model(data, canvas, textpalette) {

        this._data = data;
        // this._data have the following fields:
        // 'version':'1' (don't change, for compatibility with python version)
        // 'boxs': [] array with the boxes information
        //      every item have the background properties and a array of globes
        //
        //  The next properites are temporary and are not saved:
        // 'images': are loaded async, then have no garatie of be present.
        //           we use the fact that the first box do not have a background
        //           image, and expect that when the user change to the next box
        //           the images will be charged.
        // 'previews': loaded from the canvas, will be displayed on the sorting
        //             mode.

        this._canvas = canvas;
        this._textpalette = textpalette;
        this.comicBox = null;
        this._imageCounter = 0;
        this._pageCounterDisplay = null;
        this._prevButton = null;
        this._nextButton = null;
        this._boxSorter = null;
        this._sortButton = null;
        this._data['previews'] = [];

        // wait dialog
        this._waitMsg = document.getElementById("wait");

        this.comicBox = new ComicBox(this._canvas, this);

        this.init = function() {
            this.activeBox = 0;
            var comic_box_data = this._data['boxs'][this.activeBox];
            this._imageCounter = this._data['boxs'].length;

            if (this._data['boxs'].length == 1) {
                if (comic_box_data['globes'].length == 0) {
                    console.log('EMPTY TOON');
                    // add a globe for the title
                    var titleGlobe = {
                        "direction": null, "text_font_description": "Sans 30",
                        "globe_type": "RECTANGLE", "height": this._canvas.height/10, "width": this._canvas.width/5,
                        "text_color": [0, 0, 0], "radio": 15, "text_width": 76,
                        "y": this._canvas.height / 2,
                        "x": this._canvas.width / 2,
                        "text_height": 8, "title_globe": true,
                        "text_text": _('Title')};
                    comic_box_data['globes'].push(titleGlobe);
                };
            };

            this.comicBox.init(comic_box_data, this._data['images']);
            this.comicBox.attachTextEditionPalette(this._textpalette);
            this._updatePageCounter();
        };

        this.setData = function(data) {
            this._data = data;
            this._data['previews'] = [];
            this.init();
        };

        this.showWait = function () {
            this._waitMsg.style.display = 'block';
        };

        this.hideWait = function () {
            this._waitMsg.style.display = 'none';
        };

        this.getTitle = function() {
            var firstBoxData = this._data['boxs'][0];
            for (var i = 0; i < firstBoxData['globes'].length; i ++) {
                var globeData = firstBoxData['globes'][i];
                if (globeData['title_globe']) {
                    return globeData['text_text'];
                }
            };
            return '';
        };

        this.initSort = function(sortCanvas) {
            this._canvas.style.display = 'none';

            this._boxSorter = new BoxSorter(sortCanvas, this._data);
            this._boxSorter.init();
            if (this._pageCounterDisplay != null) {
                // hide the page counter
                this._pageCounterDisplay.parentNode.style.display = "none";
            };
        };

        this.finishSort = function() {
            var sortedBoxes = [];
            // get a rray with the new order for the boxes, like [0, 3, 2, 1]
            var newOrders = this._boxSorter.getSortOrder();
            this.changeToEditMode();
            for (var i = 0; i < newOrders.length; i++) {
                sortedBoxes.push(this._data['boxs'][newOrders[i]]);
            };
            this._data['boxs'] = sortedBoxes;
        };

        this.changeToEditMode = function() {
            this._boxSorter.hide();
            this._canvas.style.display = 'block';
            if (this._pageCounterDisplay != null) {
                // hide the page counter
                this._pageCounterDisplay.parentNode.style.display = "block";
            };

        };

        this.changeBox = function(newOrder) {
            if (newOrder >= 0 && newOrder < this._data['boxs'].length) {
                this.updateData();

                // load the new data
                this.activeBox = newOrder;
                this.comicBox.init(this._data['boxs'][this.activeBox],
                                   this._data['images'], (this.activeBox > 0));

                this._updatePageCounter();
            };
        };

        this.removeBox = function() {
            // remove the actual box */
            this._data['boxs'].splice(this.activeBox, 1);
            this._data['previews'] = [];
            if (this.activeBox > this._data['boxs'].length - 1) {
                this.activeBox --;
            }
            this.init();
            this.comicBox.init(this._data['boxs'][this.activeBox],
                               this._data['images'], (this.activeBox > 0));

            this._updatePageCounter();
        };

        this.updateData = function() {
            this._data['boxs'][this.activeBox] = this.comicBox.getJson();
        };

        this.initPreviews = function() {
            // store the initial preview images
            for (var i = 0; i < this._data['boxs'].length; i++) {
                this.storePreview(i);
            };
        };

        this.storePreview = function(boxOrder) {
            var previewCanvas = document.createElement('canvas');
            previewCanvas.width = this._canvas.width;
            previewCanvas.height = this._canvas.height;
            var previewComicBox = new ComicBox(previewCanvas);
			var that = this;
            previewComicBox.init(this._data['boxs'][boxOrder],
                                 this._data['images'], false, {canvas: previewCanvas, order: boxOrder}, function(context) {
            	that._data['previews'][context.order] =
                	context.canvas.toDataURL("image/png");
			});
        };

        this._updatePageCounter = function() {
            if (this._pageCounterDisplay != null) {
                this._pageCounterDisplay.innerHTML = (this.activeBox + 1) +
                    ' ' + _('of') + ' ' + this._data['boxs'].length;
            };
            if (this._prevButton != null) {
                this._prevButton.disabled = (this.activeBox == 0);
            };
            if (this._nextButton != null) {
                this._nextButton.disabled = (this.activeBox ==
                                             (this._data['boxs'].length - 1));
            };
            if (this._sortButton != null) {
                this._sortButton.disabled = this._data['boxs'].length < 3;
            }
        };

        this.addGlobe = function(globeType) {
            this.comicBox.addGlobe(globeType);
        };

        this.showPreviousBox = function() {
            var prevBox = this.activeBox - 1;
            this.changeBox(prevBox);
        };

        this.showNextBox = function() {
            var nextBox = this.activeBox + 1;
            this.changeBox(nextBox);
        };

        this.addImage = function(url) {
            if (this._data['images'] == undefined) {
                this._data['images'] = {};
            };

            this._imageCounter = this._imageCounter + 1;
            var imageName = 'bAcKgRoUnD_' + this._imageCounter;
            // verify if the name already exists
            while (this._data['images'][imageName] != undefined) {
                this._imageCounter = this._imageCounter + 1;
                imageName = 'bAcKgRoUnD_' + this._imageCounter;
            };

            var emptyData = {'image_name': imageName, 'globes':[]};
            this._data['boxs'].push(emptyData);
            this._data['images'][imageName] = url;
            this.changeBox(this._data['boxs'].length - 1);
        };

        this.getData = function() {
            this.updateData();
            return this._data;
        };

        this.attachPageCounterViewer = function(div) {
            this._pageCounterDisplay = div.children[0];
            this._updatePageCounter();
        };

        this.attachPrevNextButtons = function(prevButton, nextButton) {
            this._prevButton = prevButton;
            this._nextButton = nextButton;
            this._updatePageCounter();
        };

        this.attachSortButton = function(sortButton) {
            this._sortButton = sortButton;
            this._updatePageCounter();
        };

        this.saveAsImage = function(columns) {
            /* columns can be '0', '1', or '2'
               if '0' means show the images in a single row */
            this.showWait();
            var cantBoxes = this._data['boxs'].length;
            var MARGIN = 20;
            if (columns == '0') {
                var width = (this._canvas.width + MARGIN) * cantBoxes + MARGIN;
                var height = this._canvas.height + MARGIN * 2;
            } else if (columns == '1') {
                var width = this._canvas.width + MARGIN * 2;
                var height = (this._canvas.height + MARGIN) * cantBoxes + MARGIN;
            } else if (columns == '2') {
                var width = this._canvas.width * 2 + MARGIN * 3;
                var height = (this._canvas.height + MARGIN) *
                    Math.ceil(cantBoxes / 2) + MARGIN;
            };
            // create the canvas where will draw all
            var imageCanvas = document.createElement('canvas');
            imageCanvas.width = width;
            imageCanvas.height = height;
			var ctx = imageCanvas.getContext("2d");

            // add a white background
			ctx.fillStyle="#FFFFFF";
			ctx.fillRect(0, 0, width, height);

			var currentbox = 0;
            for (var i = 0; i < cantBoxes; i++) {
                // load the bix image in a temp canvas
				var that = this;
                var tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = this._canvas.width;
                tmpCanvas.height = this._canvas.height;
                var tmpComicBox = new ComicBox(tmpCanvas);
                tmpComicBox.init(this._data['boxs'][i],
                                 this._data['images'], false, tmpCanvas, function(mycanvas) {

					// add to the image canvas
	                var img = new Image();
					img.src = mycanvas.toDataURL("image/png");
	 				img.addEventListener("load", function() {
	 	                // calculate coordinates
	 	                if (columns == '0') {
	 	                    var x = MARGIN + (that._canvas.width + MARGIN) * currentbox;
	 	                    var y = MARGIN;
	 	                } else if (columns == '1') {
	 	                    var x = MARGIN;
	 	                    var y = MARGIN + (that._canvas.height + MARGIN) * currentbox;
	 	                } else if (columns == '2') {
	 	                    var x = MARGIN + (currentbox % 2) * (that._canvas.width + MARGIN);
	 	                    var y = MARGIN + Math.floor(currentbox / 2) * (that._canvas.height + MARGIN);
	 	                };

	 	                // draw image
						ctx.drawImage(this, x, y);

	 					if (currentbox++ >= cantBoxes-1) {
	 						// save in datastore
							var imgAsDataURL = imageCanvas.toDataURL("image/png");
	 						var metadata = {
	 							mimetype: "image/png",
	 							title: "Image FotoToon",
	 							activity: "org.olpcfrance.MediaViewerActivity",
	 							timestamp: new Date().getTime(),
	 							creation_time: new Date().getTime(),
	 							file_size: 0
	 						};
	 						datastore.create(metadata, function(err) {
								if (err) {
									console.log("error saving image in journal");
									humane.log(_("SavingError"));
								} else {
	 								console.log("image saved in journal.");
									humane.log(_("ImageSaved"));
								}
	 							that.hideWait();
	 						}, imgAsDataURL);
	 					}
	 				});
				});
            };
        };

    };

    function ComicBox(canvas, model) {
        /* model is only used to call the removeBox method,
           the data is set in the init() method */

        this.canvas = canvas;
        this._model = model;
        this._width = canvas.width - LINE_WIDTH * 2;
        this._height = canvas.height - LINE_WIDTH * 2;

        this.stage = new createjs.Stage(canvas);
        // Enable touch interactions if supported on the current device
        createjs.Touch.enable(this.stage);

        this.globes = [];
        this._globeSelected = null;

        // reference to the text palette used to edit the text in the globes
        this._textpalette = null;

        this.init = function (data, imagesData, canRemove, context, callback) {
            this._data = data;
            this.imagesData = imagesData
            this.canRemove = canRemove;
            this.globes = [];
            this.stage.removeAllChildren();
            this._backContainer = new createjs.Container();
            var background = new createjs.Shape();
            background.graphics.setStrokeStyle(LINE_WIDTH, "round");
            background.graphics.beginStroke(
                BLACK).drawRect(LINE_WIDTH, LINE_WIDTH,
                                this._width, this._height);
            this.stage.addChild(this._backContainer);
            this._backContainer.addChild(background);
            this._backContainer.cache(0, 0, this.canvas.width, this.canvas.height);

            if (this._data != null) {
                if (this._data['image_name'] != '' &&
                    this._data['image_name'] != undefined) {
                    this._image_x = this._data['img_x'];
                    this._image_y = this._data['img_y'];
                    this._image_width = this._data['img_w'];
                    this._image_height = this._data['img_h'];
                    this._image_name = this._data['image_name'];
                    this._slideshow_duration = this._data['slideshow_duration'];

                    if (this.imagesData != null) {
                        this._setBackgroundImageDataUrl(
                            this.imagesData[this._image_name], context, callback);
                    };
                } else {
                    this._image_x = 0;
                    this._image_y = 0;
                    this._image_width = canvas.width;
                    this._image_height = canvas.height;
                    this._image_name = '';
                    this._slideshow_duration = 10;
                    this.createGlobes();
					if (callback) callback(context);
                };
            };
            this.stage.update();
        };

        this._setBackgroundImageDataUrl = function(imageUrl, context, callback) {
            this._image_x = 0;
            this._image_y = 0;
            this._image_width = this._width;
            this._image_height = this._height;
            var img = new Image();
			var that = this;
			img.addEventListener("load", function() {
				bitmap = new createjs.Bitmap(img);
	            bitmap.setBounds(0, 0, img.width, img.height);
	            // calculate scale
	            var scale_x = that._width / img.width;
	            var scale_y = that._height / img.height;
	            var scale = Math.min(scale_x, scale_y);

	            bitmap.mouseEnabled = false;
	            bitmap.x = LINE_WIDTH;
	            bitmap.y = LINE_WIDTH;
	            bitmap.scaleX = scale;
	            bitmap.scaleY = scale;
	            that._backContainer.addChildAt(bitmap, 0);

	            // add a trash button
	            if (that.canRemove) {
	                createAsyncBitmapButton(that, './icons/remove.svg',
	                    function(comicBox, button) {
	                        button.x = 0;
	                        button.y = comicBox._height - button.height;
	                        button.visible = true;
	                        comicBox._removeButton = button;
	                        comicBox._backContainer.addChildAt(button, 1);
	                        comicBox._backContainer.updateCache();

	                        button.on('click', function(event) {
	                            comicBox.remove();
	                        });

	                        comicBox.createGlobes();
	                    });
	            } else {
	                that._backContainer.updateCache();
	                that.createGlobes();
	            };
				if (callback) {
					callback(context);
				}
			});
            img.src = imageUrl;
        };

        this.remove  = function() {
            console.log('remove');
            this._model.removeBox();
        };

        this.attachTextEditionPalette = function(textpalette) {
            this._textpalette = textpalette;
            var box = this;
            // NOTE: this not work on IE see here for more info:
            // http://stackoverflow.com/questions/2823733/textarea-onchange-detection
            this._textpalette.editorElem.addEventListener('input', function() {
                if (box.getSelectedGlobe() != null) {
                    box.getSelectedGlobe().getTextViewer().setText(this.value);
                };
            }, false);;

            var editor = this._textpalette.editorElem;

            var colorButtons = this._textpalette.colorButtons;
            for (var i = 0; i < colorButtons.length; i++) {
                colorButtons[i].addEventListener('click', function(e) {
                    editor.style.color =
                        box.getSelectedGlobe().getTextViewer().setColor(this.value);
                });
            };

            this._textpalette.incTextBtn.addEventListener('click', function(e) {
                editor.style.fontSize =
                    box.getSelectedGlobe().getTextViewer().incSize() + "px";
            });

            this._textpalette.decTextBtn.addEventListener('click', function(e) {
                editor.style.fontSize =
                    box.getSelectedGlobe().getTextViewer().decSize() + "px";
            });

            this._textpalette.boldTextBtn.addEventListener('click', function(e) {
                var bold = box.getSelectedGlobe().getTextViewer().toggleBold();
                if (bold) {
                    editor.style.fontWeight = 'bold';
                } else {
                    editor.style.fontWeight = 'normal';
                };
            });

            this._textpalette.italicTextBtn.addEventListener('click', function(e) {
                var italic = box.getSelectedGlobe().getTextViewer().toggleItalic();
                if (italic) {
                    editor.style.fontStyle = 'italic';
                } else {
                    editor.style.fontStyle = 'normal';
                };
            });

        };

        this.popupTextEditionPalette = function() {
            if (this._textpalette != null) {
                this._textpalette.popUp();
                this._textpalette.editorElem.focus();
            };
        };

        this.getSelectedGlobe = function() {
            return this._globeSelected;
        };

        this.isGlobeSelected = function(globe) {
            return this._globeSelected == globe;
        };

        this.selectGlobe = function(globe) {
            this._globeSelected = globe;
            var textpalette = this._textpalette;
            this.globes.forEach(
                function (element, index, array) {
                    if (element != globe) {
                        element.setSelected(false);
                    } else {
                        if (textpalette != null) {
                            textpalette.setText(
                                element.getTextViewer().getText());
                            element.getTextViewer().applyTextProperties(
                                textpalette.editorElem);
                        };
                    };
            });
        };

        this.addGlobe = function (globeType) {
            var width = 100;
            var height = 50;
            globeData = {'globe_type': globeType, 'x': 100, 'y': 100,
                         'width': width, 'height': height,
                         'point_0': width / 2, 'point_1': height / 2,
                         'radio': 100, 'direction': DIR_DOWN,
                         'mode': MODE_NORMAL};

            if (globeType == TYPE_WHISPER) {
                globeData['globe_type'] = TYPE_GLOBE;
                globeData['mode'] = MODE_WHISPER;
            };

            var globe = new Globe(this, globeData);
            this.globes.push(globe);
            this.stage.update();
        };

        this.getJson = function() {
            jsonData = {};
            jsonData['img_x'] = this._image_x;
            jsonData['img_y'] = this._image_y;
            jsonData['img_w'] = this._image_width;
            jsonData['img_h'] = this._image_height;
            jsonData['image_name'] = this._image_name;
            jsonData['slideshow_duration'] = this._slideshow_duration;

            jsonData['globes'] = [];
            for (var n = 0; n < this.globes.length; n++) {
                globe = this.globes[n];
                globeData = {};

                globeData['globe_type'] = globe._type;
                globeData['x'] = globe._x;
                globeData['y'] = globe._y;
                globeData['width'] = globe._width;
                globeData['height'] = globe._height;

                if (globe._type != TYPE_RECTANGLE) {
                    globeData['point_0'] = globe._point[0];
                    globeData['point_1'] = globe._point[1];
                };
                if (globe._type == TYPE_GLOBE) {
                    globeData['mode'] = globe._mode;
                };
                globeData['radio'] = globe._radio;
                globeData['direction'] = globe._direction;
                globeData['title_globe'] = globe._isTitleGlobe;
                // text properties
                globeData['text_text'] = globe._textViewer.getText();
                globeData['text_font_description'] =
                     globe._textViewer.getCairoFontFormat();
                globeData['text_color'] =
                     globe._textViewer.HtmlToGdkColor(
                    globe._textViewer._color);
                globeData['text_width'] = globe._textViewer._width;
                globeData['text_height'] = globe._textViewer._height;
                jsonData['globes'].push(globeData);
            };

            return jsonData;
        };

        this.createGlobes = function() {
            var globes = this._data['globes'];
            for (var n = 0; n < globes.length; n++) {
                var globe = new Globe(this, globes[n]);
                this.globes.push(globe);
            };
            this.stage.update();
        };

    };

    function TextViewer(globe, globeData) {

        this._globe = globe;
        this._globeData = globeData;

        this.init = function() {

            this._text = '';
            this._color = BLACK;
            this._width = globe._width - 20;
            this._height = SIZE_RESIZE_AREA / 2;
            this._size = DEFAULT_FONT_SIZE;
            this._bold = false;
            this._italic = false;
            if (this._globeData != null) {
                /* example of the text data in the json globe data stored
                {"text_font_description": "Sans 10",
                 "text_text": "Hmm, esto parece estar funcionando",
                 "text_color": [0, 0, 0],
                 "text_width": 78, "text_height": 22}

                NOTE: color components are in the range 0-65535
                https://developer.gnome.org/pygtk/stable/class-gdkcolor.html#constructor-gdkcolor
                */
                if (this._globeData['text_text'] != undefined) {
                    this._text = this._globeData['text_text'];
                };
                if (this._globeData['text_font_description'] != undefined) {
                    this.ReadHtmlFontFormat(
                        this._globeData['text_font_description']);
                };
                if (this._globeData['text_color'] != undefined) {
                    this._color = this.GdkToHtmlColor(
                        this._globeData['text_color']);
                };
                if (this._globeData['text_width'] != undefined) {
                    this._width = this._globeData['text_width'];
                };
                if (this._globeData['text_height'] != undefined) {
                    this._height = this._globeData['text_height'];
                };
                this._textView = null;
            };
        };

        this.GdkToHtmlColor = function(color) {
            // int array [r, g, b] are int in the range 0-65535
            // returns a str with the format "#rrggbb"
            rh = (color[0] / 65535 * 255).toString(16);
            gh = (color[1] / 65535 * 255).toString(16);
            bh = (color[2] / 65535 * 255).toString(16);
            // Number.toString() can return a single char.
            if (rh.length < 2) { rh = '0' + rh};
            if (gh.length < 2) { gh = '0' + gh};
            if (bh.length < 2) { bh = '0' + bh};
            return "#" + rh + gh + bh;
        };

        this.HtmlToGdkColor = function(rgb) {
            // rgb is a str with the format "#rrggbb"
            // return a array [r, g, b] with int in the range 0-65535
            rh = rgb.substr(1, 2);
            gh = rgb.substr(3, 2);
            bh = rgb.substr(5, 2);
            r = parseInt(rh, 16) / 255 * 65535;
            g = parseInt(gh, 16) / 255 * 65535;
            b = parseInt(bh, 16) / 255 * 65535;
            return [r, g, b];
        };

        this.ReadHtmlFontFormat = function(cairoFormat) {
            // get a str with format "Sans 10" or "Sans bold 10"
            // return a str with format "10px Sans" or "bold 10px Sans"
            var parts = cairoFormat.split(' ');
            var family = parts[0];
            if (parts.length == 2) {
                size = parts[1];
                style = '';
            } else {
                style = parts[1] + ' ';
                size = parts[2];
            };
            this._size = Number(size);
            this._family = family;
            this._bold = style.toLowerCase().indexOf('bold') > -1;
            this._italic = style.toLowerCase().indexOf('italic') > -1;
        };

        this.getCairoFontFormat = function() {
            // return a str with format "Sans 10" or "Sans bold 10"
            var cairoFormat = this._family;
            if (this._bold) {
                cairoFormat = cairoFormat + ' ' + 'bold';
            };
            if (this._italic) {
                cairoFormat = cairoFormat + ' ' + 'italic';
            };
            return cairoFormat + ' ' + this._size;

        };

        this.getFontDescription = function() {
            // return a str with format "10px Sans" or "bold 10px Sans"
            var cairoFormat = '';
            if (this._bold) {
                cairoFormat = cairoFormat + ' ' + 'bold';
            };
            if (this._italic) {
                cairoFormat = cairoFormat + ' ' + 'italic';
            };
            return cairoFormat + ' ' + this._size + 'px ' + this._family;

        };

        this.update = function() {
            if (this._textView != null) {
                this._globe._stage.removeChild(this._textView);
            };
            this._textView = new createjs.Text(this._text,
                                               this.getFontDescription(),
                                               this._color);
            this._textView.textAlign = 'center';
            this._textView.lineWidth = this._globe._width * 2;
            this._textView.x = this._globe._x;
            this._textView.y = this._globe._y -
                this._textView.getMeasuredHeight() / 2;
            this._globe._stage.addChild(this._textView);
            this._globe._stage.update();
        };

        this.getText = function() {
            return this._text;
        };

        this.setText = function(text) {
            this._text = text;
            this.update();
        };

        this.setColor = function(color) {
            this._color = color;
            this.update();
            return this._color;
        };

        this.incSize = function() {
            if (this._size < 60) {
                this._size = this._size + Math.round(this._size / 4);
                this.update();
            };
            return this._size;
        };

        this.decSize = function() {
            if (this._size > 10) {
                this._size = this._size - Math.round(this._size / 4);
                this.update();
            };
            return this._size;
        };

        this.toggleBold = function() {
            this._bold = ! this._bold;
            this.update();
            return this._bold;
        };

        this.toggleItalic = function() {
            this._italic = ! this._italic;
            this.update();
            return this._italic;
        };

        this.applyTextProperties = function(editor) {
            // apply the viewer text properties to the editor
            // (used when a globe is selected)
            editor.style.fontSize = this._size + 'px';
            editor.style.color = this._color;
            if (this._italic) {
                editor.style.fontStyle = 'italic';
            } else {
                editor.style.fontStyle = 'normal';
            };
            if (this._bold) {
                editor.style.fontWeight = 'bold';
            } else {
                editor.style.fontWeight = 'normal';
            };
        };

        this.remove = function() {
            this._globe._stage.removeChild(this._textView);
        };

        this.init();
        return this;
    };


    function Globe(box, globeData) {
        this._box = box;
        this._stage = box.stage;
        this._shapeControls = null;
        this._pointerControl = null;
        this._resizeButton = null;
        this._editButton = null;
        this._rotateButton = null;
        this._removeButton = null;

        this._shapeChanged = true;
        this._pointerChanged = true;

        this.init = function() {
            if (globeData == null) {
                this._type = TYPE_GLOBE;
                this._x = 100;
                this._y = 100;
                this._width = 100;
                this._height = 50;
                this._point = [this._width / 2,
                               this._height / 2];
                this._radio = 100;
                this._direction = DIR_DOWN;
                this._textViewer = new TextViewer(this, null);
                this._mode = MODE_NORMAL;
                // title_globe can't be deleted
                this._isTitleGlobe = false;
            } else {
                /* example of the json data stored

                {"direction": "abajo", "text_font_description": "Sans 10",
                     "globe_type": "GLOBE",
                    "text_text": "Hmm, esto parece estar funcionando",
                    "height": 36.66666666666667, "width": 130.0,
                    "text_color": [0, 0, 0], "radio": 30, "mode": "normal",
                    "text_width": 78, "y": 63.0, "x": 202.0,
                    "text_height": 22, "title_globe": false, "point_0": 40.5,
                    "point_1": 54}
                */
                this._type = globeData['globe_type'];
                this._x = globeData['x'];
                this._y = globeData['y'];
                this._width = globeData['width'];
                this._height = globeData['height'];
                if (this._type != TYPE_RECTANGLE) {
                    this._point = [globeData['point_0'],
                                   globeData['point_1']];
                } else {
                    this._point = [0, 0];
                };
                if (this._type == TYPE_GLOBE) {
                    this._mode = globeData['mode'];
                } else {
                    this._mode = MODE_NORMAL;
                };
                this._radio = globeData['radio'];
                this._direction = globeData['direction'];
                this._textViewer = new TextViewer(this, globeData);
                this._isTitleGlobe = globeData['title_globe'];
            };

            this._shape = null;
        };

        this.createShape = function() {
            if (this._shape != null) {
                this._stage.removeChild(this._shape);
                if (this._type == TYPE_CLOUD) {
                    this._stage.removeChild(this._shapeCircles);
                };
            };

            var scale_x = this._width /this._radio;
            var scale_y = this._height /this._radio;

            var scaled_x = this._x / scale_x;
            var scaled_y = this._y / scale_y;

            if (this._type == TYPE_CLOUD) {
                this.createShapeCloud(scaled_x, scaled_y, scale_x, scale_y);
            } else if (this._type == TYPE_EXCLAMATION) {
                this.createShapeExclamation(scaled_x, scaled_y, scale_x, scale_y);
            } else if (this._type == TYPE_RECTANGLE) {
                this.createShapeRectangle();
            } else {
                this.createShapeGlobe(scaled_x, scaled_y, scale_x, scale_y);
            };

            this._shape.on('click', function(event) {
                this.setSelected(true);
            }, this);

            this._shape.on("pressmove",function(event) {
                this._x = event.stageX;
                this._y = event.stageY;
                this.setSelected(true);
                this.update();
            }, this);

        };

        this.getSelected = function() {
            return this._box.isGlobeSelected(this);
        };

        this.setSelected = function(selected) {
            if (selected) {
                this._box.selectGlobe(this);
                this._shapeControls.visible = true;
                if (this._type != TYPE_RECTANGLE) {
                    this._pointerControl.visible = true;
                    this._rotateButton.visible = true;
                };
                this._resizeButton.visible = true;
                this._editButton.visible = true;
                if (!this._isTitleGlobe) {
                    this._removeButton.visible = true;
                };

            } else {
                this._shapeControls.visible = false;
                if (this._type != TYPE_RECTANGLE) {
                    this._pointerControl.visible = false;
                    this._rotateButton.visible = false;
                };
                this._resizeButton.visible = false;
                this._editButton.visible = false;
                if (!this._isTitleGlobe) {
                    this._removeButton.visible = false;
                };
            };
            this._stage.update();
        };

        this.getTextViewer = function() {
            return this._textViewer;
        };

        this.createShapeGlobe = function(x, y, scale_x, scale_y) {
            switch (this._direction) {
                case DIR_DOWN:
                    var begin = 100;
                    var end = 80;
                    break;
                case DIR_RIGHT:
                    var begin = 10;
                    var end = 350;
                    break;
                case DIR_LEFT:
                    var begin = 190;
                    var end = 170;
                    break;
                case DIR_UP:
                    var begin = 280;
                    var end = 260;
            };

            this._shape = new createjs.Shape();
            this._shape.name = 'globe';
            this._stage.addChild(this._shape);
            this._shape.graphics.setStrokeStyle(LINE_WIDTH, "round",
                                                null, null, true);
            this._shape.graphics.beginStroke(BLACK);
            this._shape.graphics.beginFill(WHITE);
            if (this._mode == MODE_WHISPER) {
                this._shape.graphics.setStrokeDash([3]);
            };
            this._shape.graphics.arc(x, y, this._radio,
                                     begin / (180.0) * Math.PI,
                                     end / (180.0) * Math.PI)

            point_pos = this.getPointPosition(true);
            this._shape.graphics.lineTo(point_pos[0], point_pos[1]);
            this._shape.graphics.closePath();
            this._shape.graphics.endStroke();
            this._shape.setTransform(0, 0, scale_x, scale_y);
        };

        this.createShapeRectangle = function() {
            var x = this._x;
            var y = this._y;
            var w = this._width;
            var h = this._height;

            this._shape = new createjs.Shape();
            this._shape.name = 'rect';
            this._stage.addChild(this._shape);
            this._shape.graphics.setStrokeStyle(LINE_WIDTH, "round",
                                                null, null, true);
            this._shape.graphics.beginStroke(BLACK);
            this._shape.graphics.beginFill(WHITE);

            this._shape.graphics.rect(x - w , y - h, w * 2, h * 2);
            this._shape.graphics.endStroke();
        };

        this.createShapeCloud = function(x, y, scale_x, scale_y) {
            this._shape = new createjs.Shape();
            this._shape.name = 'cloud';
            this._stage.addChild(this._shape);
            this._shape.graphics.setStrokeStyle(LINE_WIDTH, "round",
                                                null, null, true);
            this._shape.graphics.beginStroke(BLACK);
            this._shape.graphics.beginFill(WHITE);

            var w = this._width / scale_x;
            var h = this._height / scale_y;

            var steps = 36;
            var state = 0;

            for (var i = 0; i < steps; i++) {
                var alpha = 2.0 * i * (Math.PI / steps);
                var sinalpha = Math.sin(alpha);
                var cosalpha = Math.cos(alpha);

                if (state == 0) {
                    var x1 = x + w * cosalpha;
                    var y1 = y + h * sinalpha;
                } else if (state == 1) {
                    var x2 = x + w * cosalpha;
                    var y2 = y + h * sinalpha;
                } else if (state == 2) {
                    var x3 = x + 0.8 * w * cosalpha;
                    var y3 = y + 0.8 * h * sinalpha;
                };
                if (state == 2) {
                    this._shape.graphics.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                };

                state += 1;
                if (state == 3) {
                    state = 0;
                };

                if (i == 0) {
                    this._shape.graphics.moveTo(x1, y1);
                };
            };

            x1 = x + w * cosalpha;
            y1 = y + h * sinalpha;
            x2 = x + w;
            y2 = y;
            x3 = x + w;
            y3 = y;
            this._shape.graphics.bezierCurveTo(x1, y1, x2, y2, x3, y3);

            this._shape.graphics.closePath();
            this._shape.graphics.endStroke();

            firstCirclePos = this.getCloudPointPosition();

            this._shapeCircles = new createjs.Shape();
            this._shapeCircles.name = 'cloud circles';
            this._stage.addChild(this._shapeCircles);
            this._shapeCircles.graphics.setStrokeStyle(LINE_WIDTH, "round");
            this._shapeCircles.graphics.beginStroke(BLACK);
            this._shapeCircles.graphics.beginFill(WHITE);

            this._shapeCircles.graphics.arc(
                firstCirclePos[0], firstCirclePos[1], 7,
                0, 2 * Math.PI);
            this._shapeCircles.graphics.endStroke();

            secondCirclePos = this.getPointPosition(false);

            this._shapeCircles.graphics.beginStroke(BLACK);
            this._shapeCircles.graphics.beginFill(WHITE);
            this._shapeCircles.graphics.arc(
                secondCirclePos[0], secondCirclePos[1], 5,
                0, 2 * Math.PI);
            this._shapeCircles.graphics.endStroke();

            this._shape.setTransform(0, 0, scale_x, scale_y);

        };

        this.getCloudPointPosition = function() {
            var x = this._x;
            var y = this._y;
            var w = this._width;
            var h = this._height;

            switch (this._direction) {
                case DIR_DOWN:
                    return [x + this._point[0] / 2,
                        y + h + this._point[1] / 2];
                case DIR_RIGHT:
                    return [x + w + this._point[0] / 2,
                        y + this._point[1] / 2];
                case DIR_LEFT:
                    return [x - w - this._point[0] / 2,
                        y + this._point[1] / 2];
                case DIR_UP:
                    return [x + this._point[0] / 2,
                        y - h - this._point[1] / 2];
            };
        };

        this.createShapeExclamation = function(x, y, scale_x, scale_y) {
            this._shape = new createjs.Shape();
            this._shape.name = 'exclamation';
            this._stage.addChild(this._shape);
            this._shape.graphics.setStrokeStyle(LINE_WIDTH, "round",
                                                null, null, true);
            this._shape.graphics.beginStroke(BLACK);
            this._shape.graphics.beginFill(WHITE);

            var w = this._width / scale_x;
            var h = this._height / scale_y;

            var steps = 24;

            for (var i = 0; i < steps; i++) {
                var alpha = 2.0 * i * (Math.PI / steps);
                var sinalpha = Math.sin(alpha);
                var cosalpha = Math.cos(alpha);

                if (i % 2 > 0) {
                    xi = x + 0.8 * w * cosalpha;
                    yi = y + 0.8 * h * sinalpha;
                } else {
                    xi = x + w * cosalpha;
                    yi = y + h * sinalpha;
                };

                if ((this._direction == DIR_DOWN && i == 6) ||
                   (this._direction == DIR_RIGHT && i == 0) ||
                   (this._direction == DIR_LEFT && i == 12) ||
                   (this._direction == DIR_UP && i == 18)) {

                    pos = this.getPointPosition(true);
                    xi = pos[0];
                    yi = pos[1];
                };

                if (i == 0) {
                    this._shape.graphics.moveTo(xi, yi);
                } else {
                    this._shape.graphics.lineTo(xi, yi);
                };
            }

            this._shape.graphics.closePath();
            this._shape.graphics.endStroke();

            this._shape.setTransform(0, 0, scale_x, scale_y);

        };

        this.createControls = function() {
            var x = this._x;
            var y = this._y;
            var w = this._width;
            var h = this._height;

            if (this._shapeControls != null && this._shapeChanged) {
                this._stage.removeChild(this._shapeControls);
                this._shapeControls = null;
            };

            if (this._shapeControls == null) {
                this._shapeControls = new createjs.Shape();
                this._shapeControls.name = 'control_rect';

                // draw dotted rectangle around the globe
                this._shapeControls.graphics.setStrokeStyle(1, "round");
                this._shapeControls.graphics.beginStroke(WHITE);
                this._shapeControls.x = x;
                this._shapeControls.y = y;
                this._shapeControls.graphics.rect(- w ,- h, w * 2, h * 2);
                this._shapeControls.graphics.setStrokeDash([2]);
                this._shapeControls.graphics.beginFill("rgba(0, 0, 0, 0)");
                this._shapeControls.graphics.beginStroke(BLACK);
                this._shapeControls.graphics.rect(- w ,- h, w * 2, h * 2);
                this._shapeControls.graphics.endStroke();

                this._shapeControls.visible = this.getSelected();
                this._stage.addChild(this._shapeControls);
            } else {
                this._shapeControls.visible = this.getSelected();
                this._shapeControls.x = x;
                this._shapeControls.y = y;
            };

            // point position
            if (this._type != TYPE_RECTANGLE) {

                if (this._pointerControl != null &&
                    (this._pointerChanged || this._shapeChanged)) {
                    this._stage.removeChild(this._pointerControl);
                    this._pointerControl = null;
                };

                if (this._pointerControl == null) {
                    this._pointerControl = new createjs.Shape();
                    this._pointerControl.x = x;
                    this._pointerControl.y = y;
                    point_pos = this.getPointPositionRelative();
                    this._pointerControl.graphics.beginStroke(BLACK);
                    this._pointerControl.graphics.arc(point_pos[0], point_pos[1],
                                                     SIZE_RESIZE_AREA / 2,
                                                     0, 2 * Math.PI);
                    this._pointerControl.graphics.endStroke();

                    var hitArea = new createjs.Shape();
                    hitArea.graphics.beginFill("#000").arc(
                        point_pos[0], point_pos[1], SIZE_RESIZE_AREA / 2,
                        0, 2 * Math.PI);
                    this._pointerControl.hitArea = hitArea;

                    this._pointerControl.visible = this.getSelected();

                    this._stage.addChild(this._pointerControl);

                    this._pointerControl.on("pressmove",function(event) {
                        this.setPointPosition(event.stageX, event.stageY);
                        this._box.selectGlobe(this);
                        this._pointerChanged = true;
                        this.update();
                    }, this);
                } else {
                    this._pointerControl.x = x;
                    this._pointerControl.y = y;
                    this._pointerControl.visible = this.getSelected();
                };

            };

            if (this._resizeButton == null) {
                createAsyncBitmapButton(this, './icons/resize.svg',
                    function(globe, button) {
                        button.x = globe._x - globe._width - button.width / 2;
                        button.y = globe._y - globe._height - button.height / 2;
                        button.visible = globe.getSelected();
                        globe._resizeButton = button;
                        globe._stage.addChild(button);
                        globe._stage.update();

                        button.on('pressmove', function(event) {
                            this._width = Math.max(globe._x - event.stageX,
                                                    SIZE_RESIZE_AREA / 2);
                            this._height = Math.max(globe._y - event.stageY,
                                                     SIZE_RESIZE_AREA / 2);
                            this._shapeChanged = true;
                            this.update();
                        }, globe);

                    });
            } else {
                this._resizeButton.x = this._x - this._width - this._resizeButton.width / 2;
                this._resizeButton.y = this._y - this._height - this._resizeButton.height / 2;
                this._resizeButton.visible = this.getSelected();
            };

            if (this._editButton == null) {
                createAsyncBitmapButton(this, './icons/edit.svg',
                    function(globe, button) {
                        button.x = globe._x + globe._width - button.width / 2;
                        button.y = globe._y - globe._height - button.height / 2;
                        button.visible = globe.getSelected();
                        globe._editButton = button;
                        globe._stage.addChild(button);
                        globe._stage.update();

                        button.on('click', function(event) {
                            globe._box.popupTextEditionPalette();
                        });
                    });
            } else {
                this._editButton.x = this._x + this._width - this._editButton.width / 2;
                this._editButton.y = this._y - this._height - this._editButton.height / 2;
                this._editButton.visible = this.getSelected();
            };

            if (this._type != TYPE_RECTANGLE) {

                if (this._rotateButton == null) {
                    createAsyncBitmapButton(this, './icons/object_rotate_right.svg',
                        function(globe, button) {
                            button.x = globe._x + globe._width - button.width / 2;
                            button.y = globe._y + globe._height - button.height / 2;
                            button.visible = globe.getSelected();
                            globe._rotateButton = button;
                            globe._stage.addChild(button);
                            globe._stage.update();

                            button.on('click', function(event) {
                                globe.rotate();
                            });
                        });
                } else {
                    this._rotateButton.x = this._x + this._width - this._rotateButton.width / 2;
                    this._rotateButton.y = this._y + this._height - this._rotateButton.height / 2;
                    this._rotateButton.visible = this.getSelected();
                };
            };

            if (! this._isTitleGlobe) {
                if (this._removeButton == null) {
                    createAsyncBitmapButton(this, './icons/remove.svg',
                        function(globe, button) {
                            button.x = globe._x - globe._width - button.width / 2;
                            button.y = globe._y + globe._height - button.height / 2;
                            button.visible = globe.getSelected();
                            globe._removeButton = button;
                            globe._stage.addChild(button);
                            globe._stage.update();

                            button.on('click', function(event) {
                                globe.remove();
                            });
                        });
                } else {
                    this._removeButton.x = this._x - this._width - this._removeButton.width / 2;
                    this._removeButton.y = this._y + this._height - this._removeButton.height / 2;
                    this._removeButton.visible = this.getSelected();
                };
            };

            this._shapeChanged = false;
            this._pointerChanged = false;
        };

        this.rotate = function () {
            switch (this._direction) {
                case DIR_DOWN:
                    this._direction = DIR_LEFT;
                    break;
                case DIR_RIGHT:
                    this._direction = DIR_DOWN;
                    break;
                case DIR_LEFT:
                    this._direction = DIR_UP;
                    break;
                case DIR_UP:
                    this._direction = DIR_RIGHT;
                    break;
            };
            var i = this._point[0];
            this._point[0] = this._point[1]; this._point[1] = i;
            this._pointerChanged = true;
            this.update();
        };

        this.remove = function() {
            var globeIndex = this._box.globes.indexOf(this);
            if (globeIndex != -1) {
                this._box.globes.splice(globeIndex, 1);
                this._stage.removeChild(this._shape);
                this._stage.removeChild(this._shapeControls);
                if (this._type != TYPE_RECTANGLE) {
                    this._stage.removeChild(this._pointerControl);
                    this._stage.removeChild(this._rotateButton);
                };
                if (this._type == TYPE_CLOUD) {
                    this._stage.removeChild(this._shapeCircles);
                };
                this._stage.removeChild(this._resizeButton);
                this._stage.removeChild(this._editButton);
                this._stage.removeChild(this._removeButton);
                this._textViewer.remove();
                this._stage.update();
            };
        };

        this.update = function() {
            this.createShape();
            this._textViewer.update();
            this.createControls();
            this._stage.update();
        }

        this.getPointPosition = function (scaled) {
            var scale_x = 1;
            var scale_y = 1;
            if (scaled) {
                scale_x = this._width / this._radio;
                scale_y = this._height / this._radio;
            };

            var x = this._x / scale_x;
            var y = this._y /scale_y;
            var w = this._width / scale_x;
            var h = this._height /scale_y;

            switch (this._direction) {
                case DIR_DOWN:
                    return [x + this._point[0] / scale_x,
                        y + h + this._point[1] / scale_y];
                case DIR_RIGHT:
                    return [x + w + this._point[0] / scale_x,
                        y + this._point[1] / scale_y];
                case DIR_LEFT:
                    return [x - w - this._point[0] / scale_x,
                        y + this._point[1] / scale_y];
                case DIR_UP:
                    return [x + this._point[0] / scale_x,
                        y - h - this._point[1] / scale_y];
            };
        };

        this.getPointPositionRelative = function () {
            var w = this._width;
            var h = this._height;

            switch (this._direction) {
                case DIR_DOWN:
                    return [this._point[0], h + this._point[1]];
                case DIR_RIGHT:
                    return [w + this._point[0], this._point[1]];
                case DIR_LEFT:
                    return [- w - this._point[0], this._point[1]];
                case DIR_UP:
                    return [this._point[0], - h - this._point[1]];
            };
        };

        this.setPointPosition = function (new_x, new_y) {
            switch (this._direction) {
                case DIR_DOWN:
                    this._point[0] = new_x - this._x;
                    this._point[1] = new_y - this._y - this._height;
                    break;
                case DIR_RIGHT:
                    this._point[0] = new_x - this._x - this._width;
                    this._point[1] = new_y - this._y;
                    break;
                case DIR_LEFT:
                    this._point[0] = - new_x + this._x - this._width;
                    this._point[1] = new_y - this._y;
                    break;
                case DIR_UP:
                    this._point[0] = new_x - this._x;
                    this._point[1] = - new_y + this._y - this._height;
            };
        };

        this.init();
        this.update();
    };


    function BoxSorter(canvas, data) {
        this.canvas = canvas;
        this._data = data;
        this._width = canvas.width - LINE_WIDTH * 2;
        this._height = canvas.height - LINE_WIDTH * 2;
        this._previewWidth = this._height * 4 / 3;
        this._previewBitmaps = [];
        this._deltaX = null;

        this.stage = new createjs.Stage(canvas);
        // Enable touch interactions if supported on the current device
        createjs.Touch.enable(this.stage);

        this.init = function () {
            this.canvas.style.display = 'block';
            this._backContainer = new createjs.Container();
            var background = new createjs.Shape();
            background.graphics.setStrokeStyle(LINE_WIDTH, "round");
            background.graphics.beginStroke(
                BLACK).drawRect(LINE_WIDTH, LINE_WIDTH,
                                this._width, this._height);
            this.stage.addChild(this._backContainer);
            this._backContainer.addChild(background);
            this._backContainer.cache(0, 0, this.canvas.width, this.canvas.height);

            this.loadPreviews();
            this.stage.update();
        };

        this.hide = function() {
            this.canvas.style.display = 'none';
        };

        this.loadPreviews = function () {
            // create bitmaps for every box preview (if not avilable,
            // use the background
            for (var i = 0;i < this._data['boxs'].length; i++) {
                var imageData = this._data['previews'][i];
                if (imageData == undefined) {
                    var imageName = this._data['boxs'][i]['image_name'];
                    // if the preview was not loaded use the background
                    if (imageName != '' && imageName != undefined) {
                        imageData = this._data['images'][imageName];
                    };
                };
                if (imageData != undefined) {
                    this._createPreview(imageData, i);
                };


            };

        };

        this.getSortOrder = function() {
            var newOrder = [0];
            for (var i = 0; i < this._previewBitmaps.length; i++) {
                newOrder.push(this._previewBitmaps[i]._order);
            };
            return newOrder;
        };

        this._createPreview = function(imageUrl, order) {
            var img = new Image();
			var that = this;
			img.addEventListener("load", function() {
	            bitmap = new createjs.Bitmap(this);
	            bitmap.setBounds(0, 0, this.width, this.height);
	            bitmap._order = order;
	            // calculate scale
	            var scale_x = that._previewWidth / this.width;
	            var scale_y = that._height / this.height;
	            var scale = Math.min(scale_x, scale_y);

	            bitmap.x = that._previewWidth * order;
	            bitmap.y = LINE_WIDTH;
	            bitmap.scaleX = scale;
	            bitmap.scaleY = scale;

	            var hitArea = new createjs.Shape();
	            hitArea.graphics.beginFill("#000").drawRect(
	                0, 0, this.width, this.height);
	            bitmap.hitArea = hitArea;

	            // don't move first box
	            if (order > 0) {
	                that._previewBitmaps.push(bitmap);

	                bitmap.on('pressmove', function(event) {
	                    console.log('TOON pressmove');
	                    if (that._deltaX == null) {
	                        that._deltaX = event.stageX - event.target.x;
	                        // move the bitmap to the top
	                        var thisBitmap = event.target;
	                        that.stage.sortChildren(function (bitmapA, bitmapB) {
	                            if (bitmapA == thisBitmap) {
	                                return 1;
	                            } else {
	                                return 0;
	                            };});
	                    };

	                    new_x = event.stageX - that._deltaX;
	                    if (new_x > this._previewWidth / 2) {
	                        event.target.x = new_x;
	                        that.stage.update();
	                    };
	                }, that);

	                bitmap.on('pressup', function(event) {
	                    console.log('TOON pressup');
	                    that._deltaX = null;
	                    // sort the preview bitmaps
	                    that._previewBitmaps.sort(function (bitmapA, bitmapB) {
	                        return bitmapA.x - bitmapB.x;});
	                    // adjust the positions
	                    for (var i = 0; i < that._previewBitmaps.length; i++) {
	                        that._previewBitmaps[i].x = that._previewWidth * (i + 1);
	                    };
	                    that.stage.update();
	                }, that);

	            };

	            that.stage.addChildAt(bitmap, 0);
				that.stage.update();

        	});
			img.src = imageUrl;
		}

    };

    toon.Model = Model;

    toon.TYPE_GLOBE = TYPE_GLOBE;
    toon.TYPE_CLOUD = TYPE_CLOUD;
    toon.TYPE_EXCLAMATION = TYPE_EXCLAMATION;
    toon.TYPE_RECTANGLE = TYPE_RECTANGLE;
    toon.TYPE_WHISPER = TYPE_WHISPER;

    return toon;
});
