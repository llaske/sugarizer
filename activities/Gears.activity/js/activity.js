define(["sugar-web/activity/activity","sugar-web/graphics/radiobuttonsgroup","gearsketch_main"], function (activity,radioButtonsGroup) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        var gearSketch;

        // Initialize the activity.
        activity.setup();
        
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (event) {
            console.log("writing...");
            var jsonData = JSON.stringify(gearSketch.board);
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                }
                else {
                    console.log("write failed.");
                }
            });
        });

        gearSketch = new window.gearsketch.GearSketch(false);

        // Read from the datastore
        var datastoreObject = activity.getDatastoreObject();
        function onLoaded(error, metadata, jsonData) {
            if (error === null) {
                gearSketch.board = window.gearsketch.model.Board.
                    fromObject(JSON.parse(jsonData));
                console.log("read done.");
            }
            else {
                console.log("read failed.");
            }
        }
        datastoreObject.loadAsText(onLoaded);

        // Create a redo array associated with history object of global scope  
        window.history = {};
        window.$h = window.history;
        history.undo = [];
        history.redo = [];

        document.getElementById('undo-button').addEventListener('click', function(){
            if ($h.undo.length > 0 && gearSketch.selectedButton !== "playButton") {
                var obj = $h.undo.pop();
                if(obj.method === "delete"){
                    $h.redo.push(obj);
                    gearSketch.board[obj.type][obj.item.id] = obj.item;
                } else if(obj.method === "add") {
                    // Search for the item with the id and delete it
                    $h.redo.push(obj);
                    for (var type in gearSketch.board) {
                        if (gearSketch.board.hasOwnProperty(type)) {
                            var items = gearSketch.board[type];
                            for (var itemId in items) {
                                if (items.hasOwnProperty(itemId) && itemId === obj.item.id) {
                                    delete gearSketch.board[type][itemId];
                                }
                            }
                        }
                    }
                } else if(obj.method === "locationchange") {
                    for (var type in gearSketch.board) {
                        if (gearSketch.board.hasOwnProperty(type)) {
                            var items = gearSketch.board[type];
                            for (var itemId in items) {
                                if (items.hasOwnProperty(itemId) && itemId === obj.item) {
                                    var earlierLocation = gearSketch.board[type][itemId].location;
                                    gearSketch.board[type][itemId].location = obj.location;
                                    obj.location = earlierLocation;
                                    $h.redo.push(obj);
                                }
                            }
                        }
                    }
                } 
                document.getElementById("redo-button").style.opacity = 1;
            }
            if($h.undo.length === 0) document.getElementById("undo-button").style.opacity = 0.4;
            else document.getElementById("undo-button").style.opacity = 1;
        })

        document.getElementById('redo-button').addEventListener('click', function(){
            if ($h.redo.length > 0 && gearSketch.selectedButton !== "playButton") {
                var obj = $h.redo.pop();
                if(obj.method === "delete"){
                    $h.undo.push(obj);
                    // Search for the item with the id and delete it
                    for (var type in gearSketch.board) {
                        if (gearSketch.board.hasOwnProperty(type)) {
                            var items = gearSketch.board[type];
                            for (var itemId in items) {
                                if (items.hasOwnProperty(itemId) && itemId === obj.item.id) {
                                    delete gearSketch.board[type][itemId];
                                }
                            }
                        }
                    }
                } else if(obj.method === "add"){
                    $h.undo.push(obj);
                    gearSketch.board[obj.type][obj.item.id] = obj.item;
                } else if(obj.method === "locationchange") {
                    for (var type in gearSketch.board) {
                        if (gearSketch.board.hasOwnProperty(type)) {
                            var items = gearSketch.board[type];
                            for (var itemId in items) {
                                if (items.hasOwnProperty(itemId) && itemId === obj.item) {
                                    var earlierLocation = gearSketch.board[type][itemId].location;
                                    gearSketch.board[type][itemId].location = obj.location;
                                    obj.location = earlierLocation;
                                    $h.undo.push(obj);
                                }
                            }
                        }
                    }
                }
                document.getElementById("undo-button").style.opacity = 1;
            }
            if($h.redo.length === 0) document.getElementById("redo-button").style.opacity = 0.4;
            else document.getElementById("redo-button").style.opacity = 1;
        })

        var radioButtons;
        var gearButton = document.getElementById("gear-button");
        var chainButton = document.getElementById("chain-button");
        var momentumButton = document.getElementById("momentum-button");
        var playButton = document.getElementById("play-button");

        var buttonNames = {
            "gearButton": gearButton,
            "chainButton": chainButton,
            "momentumButton": momentumButton,
            "playButton": playButton
        };

        gearSketch.selectButton = function (buttonName) {
            return this.selectedButton = buttonName;
        }
        function UISwitch(before, after){
            playButton.classList.remove(before);
            playButton.classList.add(after);
        }
        // Gear button.
        gearButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            UISwitch('pause', 'play');
            gearSketch.selectButton("gearButton");
        });

        // Chain button.
        chainButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            UISwitch('pause', 'play');
            gearSketch.selectButton("chainButton");
        });

        // Momentum button.
        momentumButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            UISwitch('pause', 'play');
            gearSketch.selectButton("momentumButton");
        });

        // Play button.
        playButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            if(gearSketch.selectedButton == "playButton"){
                gearSketch.selectButton(null);
                UISwitch('pause', 'play');
            }
            else{
                gearSketch.selectButton("playButton");
                UISwitch('play', 'pause');
            }
        });

        radioButtons = new radioButtonsGroup.RadioButtonsGroup(
        [gearButton, chainButton, momentumButton, playButton]);

        // Clear button.
        var clearButton = document.getElementById("clear-button");
        clearButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.showButtons = false;
                gearSketch.stopDemo();
                return;
            }
            UISwitch('pause', 'play');
            gearSketch.board.clear();
        });

        // Help button.
        var helpButton = document.getElementById("help-button");
        helpButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
                return;
            }
            gearSketch.playDemo();
        });

        // Full screen.
        document.getElementById("fullscreen-button").addEventListener('click', function() {
            document.getElementById("main-toolbar").style.opacity = 0;
            document.getElementById("canvas").style.top = "0px";
            gearSketch.canvasOffsetY = gearSketch.canvas.getBoundingClientRect().top;
            gearSketch.updateCanvasSize();
            document.getElementById("unfullscreen-button").style.visibility = "visible";
        });
        document.getElementById("unfullscreen-button").addEventListener('click', function() {
            document.getElementById("main-toolbar").style.opacity = 1;
            document.getElementById("canvas").style.top = "55px";
            gearSketch.canvasOffsetY = gearSketch.canvas.getBoundingClientRect().top;
            gearSketch.updateCanvasSize();
            document.getElementById("unfullscreen-button").style.visibility = "hidden";
        });

    });

});
