define(["sugar-web/activity/activity","sugar-web/datastore","sugar-web/env","textpalette","sugar-web/graphics/menupalette","sugar-web/graphics/journalchooser","lzstring","webL10n","toon","tutorial"], function (activity, datastore, env, textpalette, menupalette, journalchooser, lzstring, l10n, toon, tutorial) {


    // initialize canvas size
    var sugarCellSize = 75;
    var sugarSubCellSize = 15;
    var language;

	env.getEnvironment(function(err, environment) {
		var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
        	language = environment.user ? environment.user.language : defaultLanguage;
		l10n.language.code = language;
		console.log('LANG ' + language);
	});

    function _(text) {
        // this function add a fallback for the case of translation not found
        // can be removed when we find how to read the localization.ini
        // file in the case of local html file opened in the browser
        translation = l10n.get(text);
        if (translation == '') {
            translation = text;
        };
        return translation;
    };

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        // HERE GO YOUR CODE

        var initialData =  {"version": "1", "boxs": [{'globes':[]}]};

        var mainCanvas = document.getElementById("mainCanvas");
        var sortCanvas = document.getElementById("sortCanvas");
        // remove 5 more to be sure no scrollbars are visible
        mainCanvas.height = window.innerHeight - sugarCellSize - 5;
        mainCanvas.width = mainCanvas.height * 4 / 3;
        mainCanvas.style.left = ((window.innerWidth - mainCanvas.width) / 2) + "px";

        var previousButton = document.getElementById("previous-button");
		previousButton.title = _("Previous");
        previousButton.addEventListener('click', function (e) {
            toonModel.showPreviousBox();
        });

        var nextButton = document.getElementById("next-button");
		nextButton.title = _("Next");
        nextButton.addEventListener('click', function (e) {
            toonModel.showNextBox();
        });

        var textButton = document.getElementById("text-button");
		textButton.title = _('EditText');
        var tp = new textpalette.TextPalette(textButton, toonModel,
                                             _('SetGlobeText'));

       // page counter
        var pageCounter = document.getElementById("page-counter");


        var toonModel = new toon.Model(initialData, mainCanvas, tp);
        toonModel.init();
        toonModel.attachPageCounterViewer(pageCounter);
        toonModel.attachPrevNextButtons(previousButton, nextButton);

        var editMode = true;

        var addGlobeButton = document.getElementById("add-globe");
		addGlobeButton.title = _('AddAglobe');
        var menuData = [{'icon': true, 'id': toon.TYPE_GLOBE,
                         'label': _('Globe')},
                        {'icon': true, 'id': toon.TYPE_EXCLAMATION,
                         'label': _('Exclamation')},
                        {'icon': true, 'id': toon.TYPE_WHISPER,
                         'label': _('Whisper')},
                        {'icon': true, 'id': toon.TYPE_CLOUD,
                         'label': _('Think')},
                        {'icon': true, 'id': toon.TYPE_RECTANGLE,
                         'label': _('Box')},];
        var mp = new menupalette.MenuPalette(addGlobeButton,
            _("AddAglobe"), menuData);

        for (var i = 0; i < mp.buttons.length; i++) {
            mp.buttons[i].addEventListener('click', function(e) {
                toonModel.addGlobe(this.id);
            });
        };

        var addButton = document.getElementById("add-button");
		addButton.title = _("Add");
        addButton.addEventListener('click', function (e) {
			journalchooser.show(function (entry) {
				// No selection
				if (!entry) {
					return;
				}
				// Get object content
				var dataentry = new datastore.DatastoreObject(entry.objectId);
				dataentry.loadAsText(function (err, metadata, text) {
					//We load the drawing inside an image element
					var element = document.createElement('img');
					if (entry.metadata.activity ==  'org.olpcfrance.PaintActivity') {
						element.src = lzstring.decompressFromUTF16(JSON.parse(text).src);
					} else {
						element.src = text;
					}
					element.onload = function () {
						toonModel.addImage(element.src);
					};
				});
			}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' }, { activity: 'org.olpcfrance.PaintActivity'});
        });

        	// Load from datatore
		env.getEnvironment(function(err, environment) {
			if (environment.objectId) {
				activity.getDatastoreObject().loadAsText(function(error, metadata, JSONdata) {
					if (error==null && JSONdata!=null) {
						var data = JSON.parse(JSONdata);
						var dataWithoutImages = data.dataWithoutImages;
						var images = data.dataImages;
						dataWithoutImages.images = {};
						for(var key in images) {
			                 var imageName = key;
							 dataWithoutImages.images[imageName] = LZString.decompressFromUTF16(images[imageName]);
						}
						toonModel.setData(dataWithoutImages);
			            if (!editMode) {
			                toonModel.changeToEditMode();
			                editMode = true;
			            };
					}
				});
			}
		});

		var stopButton = document.getElementById("stop-button");
		stopButton.addEventListener('click', function (event) {
			console.log("writing...");
			toonModel.showWait();

            if (!editMode) {
                toonModel.finishSort();
                toonModel.init();
                editMode = true;
            };

            // clone the data to remove the images
            var dataWithoutImages = {}
            dataWithoutImages['version'] = toonModel.getData()['version'];
            dataWithoutImages['boxs'] = toonModel.getData()['boxs'];

            dataImages = {};
            for(var key in toonModel.getData()['images']) {
                var imageName = key;
                console.log('saving image ' + imageName);
				dataImages[imageName] = LZString.compressToUTF16(toonModel.getData()['images'][imageName]);
            };

			var fullData = {
				dataWithoutImages: dataWithoutImages,
				dataImages: dataImages
			};
            toonModel.hideWait();
			var jsonData = JSON.stringify(fullData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

        var saveImageButton = document.getElementById("image-save");
		saveImageButton.title = _("SaveAsImage");
        var saveImageMenuData = [{'id': '0', 'label': _('OneRow')},
                                 {'id': '1', 'label': _('OneColumn')},
                                 {'id': '2', 'label': _('TwoColumns')}];
        var simp = new menupalette.MenuPalette(saveImageButton,
            _("SaveAsImage"), saveImageMenuData);

        for (var i = 0; i < simp.buttons.length; i++) {
            simp.buttons[i].addEventListener('click', function(e) {
                toonModel.saveAsImage(this.id);
            });
        };

        var sortButton = document.getElementById("sort-button");
		sortButton.title = _('Sort');
        toonModel.attachSortButton(sortButton);

        sortButton.addEventListener('click', function (e) {
            // verify if there are at least 3 boxes
            // the first box is the title and can't be moved
            // then only have sense sort with more than 2 boxes
            if (toonModel.getData()['boxs'].length < 3) {
                return;
            };
            toonModel.showWait();
            if (editMode) {
                toonModel.initPreviews();
                // resize the canvas
                sortCanvas.width = window.innerWidth - sugarCellSize * 2;
                var boxWidth = sortCanvas.width / toonModel.getData()['boxs'].length;
                sortCanvas.height = boxWidth * 3 / 4;
                sortCanvas.style.left = ((window.innerWidth - sortCanvas.width) / 2) + "px";
                sortCanvas.style.top = ((window.innerHeight - sortCanvas.height) / 2) + "px";
                toonModel.initSort(sortCanvas);
            } else {
                toonModel.finishSort();
                toonModel.init();
            };
            toonModel.hideWait();
            // switch editMode
            editMode = ! editMode;

        });

        var cleanAllButton = document.getElementById("clean-all-button");
		cleanAllButton.title = _("Clean");

        cleanAllButton.addEventListener('click', function (e) {
  
            toonModel.setData(initialData);
            if (!editMode) {
                toonModel.changeToEditMode();
                editMode = true;
            };
        });

        window.addEventListener('resize', function(e) {
            var resizeTimeout;            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function(){      
            mainCanvas.height = window.innerHeight - sugarCellSize - 5;
            mainCanvas.width = mainCanvas.height * 4 / 3;
            mainCanvas.style.left = ((window.innerWidth - mainCanvas.width) / 2) + "px";
            var toonModel = new toon.Model(initialData, mainCanvas, tp);
            toonModel.init();
        }, 5);
        });

        // Launch tutorial
	    document.getElementById("help-button").addEventListener('click', function(e) {
            l10n.language.code=language;
            var once=1;
            window.addEventListener("localized", function() {
                if (once) {
                    once=0;
                    tutorial.start(language);
                }
            });
	    });

    });

});
