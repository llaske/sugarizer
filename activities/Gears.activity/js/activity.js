define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var radioButtonsGroup = require("sugar-web/graphics/radiobuttonsgroup");
    require("gearsketch_main");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        var gearSketch;

        // Initialize the activity.
        activity.setup();

        activity.write = function (callback) {
            console.log("writing...");
            var jsonData = JSON.stringify(gearSketch.board);
            this.getDatastoreObject().setDataAsText(jsonData);
            this.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                }
                else {
                    console.log("write failed.");
                }
                callback(error);
            });
        };

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
            radioButtons.setActive(buttonNames[buttonName]);
            return this.selectedButton = buttonName;
        }

        // Gear button.
        gearButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            gearSketch.selectButton("gearButton");
        });

        // Chain button.
        chainButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            gearSketch.selectButton("chainButton");
        });

        // Momentum button.
        momentumButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            gearSketch.selectButton("momentumButton");
        });

        // Play button.
        playButton.addEventListener('click', function (event) {
            if (gearSketch.isDemoPlaying) {
                gearSketch.stopDemo();
            }
            gearSketch.selectButton("playButton");
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

    });

});
