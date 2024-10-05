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
