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

        // Initialize undo/redo functionality
        initHistory();

        // History Manager
        var MAX_HISTORY = 50;
        var undoStack = [];
        var redoStack = [];
        var transactionActive = false;
        var snapshotCapturedThisTx = false;
        var mutationHappenedThisTx = false;

        function serializeBoard() {
            try {
                return JSON.stringify(gearSketch.board);
            } catch (e) {
                return null;
            }
        }

        function deserializeBoard(str) {
            try {
                return window.gearsketch.model.Board.fromObject(JSON.parse(str));
            } catch (e) {
                return null;
            }
        }

        function updateUndoRedoButtons() {
            var undoBtn = document.getElementById('undo-button');
            var redoBtn = document.getElementById('redo-button');
            if (undoBtn) undoBtn.disabled = undoStack.length === 0;
            if (redoBtn) redoBtn.disabled = redoStack.length === 0;
        }

        function beginTransaction() {
            transactionActive = true;
            snapshotCapturedThisTx = false;
            mutationHappenedThisTx = false;
        }

        function endTransaction() {
            if (transactionActive && snapshotCapturedThisTx && !mutationHappenedThisTx && undoStack.length > 0) {
                undoStack.pop();
            }
            transactionActive = false;
            snapshotCapturedThisTx = false;
            mutationHappenedThisTx = false;
            updateUndoRedoButtons();
        }

        function ensurePrechangeSnapshot() {
            if (transactionActive && !snapshotCapturedThisTx) {
                var snap = serializeBoard();
                if (snap) {
                    redoStack = [];
                    undoStack.push(snap);
                    if (undoStack.length > MAX_HISTORY) undoStack.shift();
                    snapshotCapturedThisTx = true;
                    updateUndoRedoButtons();
                }
            }
        }

        function applyState(serialized) {
            var newBoard = deserializeBoard(serialized);
            if (!newBoard) return;
            gearSketch.board = newBoard;
            installBoardHooks();
            gearSketch.selectedGear = null;
            gearSketch.goalLocationGear = null;
        }

        function undo() {
            if (undoStack.length === 0) return;
            var current = serializeBoard();
            var prev = undoStack.pop();
            if (current) redoStack.push(current);
            applyState(prev);
            updateUndoRedoButtons();
        }

        function redo() {
            if (redoStack.length === 0) return;
            var current = serializeBoard();
            var next = redoStack.pop();
            if (current) undoStack.push(current);
            applyState(next);
            updateUndoRedoButtons();
        }

        function installBoardHooks() {
            var board = gearSketch.board;

            if (!board.__historyWrapped) {
                var originalPlaceGear = board.placeGear.bind(board);
                board.placeGear = function(gear, location) {
                    ensurePrechangeSnapshot();
                    var result = originalPlaceGear(gear, location);
                    if (result) { mutationHappenedThisTx = true; }
                    return result;
                };

                var originalAddGear = board.addGear.bind(board);
                board.addGear = function(gear) {
                    ensurePrechangeSnapshot();
                    var result = originalAddGear(gear);
                    if (result) { mutationHappenedThisTx = true; }
                    return result;
                };

                var originalRemoveGear = board.removeGear.bind(board);
                board.removeGear = function(gear) {
                    ensurePrechangeSnapshot();
                    mutationHappenedThisTx = true;
                    return originalRemoveGear(gear);
                };

                var originalAddChain = board.addChain.bind(board);
                board.addChain = function(chain) {
                    ensurePrechangeSnapshot();
                    var result = originalAddChain(chain);
                    if (result) { mutationHappenedThisTx = true; }
                    return result;
                };

                var originalRemoveChain = board.removeChain.bind(board);
                board.removeChain = function(chain) {
                    ensurePrechangeSnapshot();
                    mutationHappenedThisTx = true;
                    return originalRemoveChain(chain);
                };

                var originalClear = board.clear.bind(board);
                board.clear = function() {
                    ensurePrechangeSnapshot();
                    mutationHappenedThisTx = true;
                    return originalClear();
                };

                board.__historyWrapped = true;
            }
        }

        function installInteractionHooks() {
            if (gearSketch.__interactionWrapped) { return; }
            gearSketch.__interactionWrapped = true;
            var originalHandlePenDown = gearSketch.handlePenDown.bind(gearSketch);
            gearSketch.handlePenDown = function(x, y) {
                if (!this.getButtonAt(x, y)) {
                    beginTransaction();
                    if (this.selectedButton === 'momentumButton') {
                        ensurePrechangeSnapshot();
                    }
                }
                return originalHandlePenDown(x, y);
            };

            var originalHandlePenUp = gearSketch.handlePenUp.bind(gearSketch);
            gearSketch.handlePenUp = function() {
                var wasMomentumGesture = (this.selectedButton === 'momentumButton') && (this.selectedGear != null);
                var r = originalHandlePenUp();
                if (wasMomentumGesture) { mutationHappenedThisTx = true; }
                endTransaction();
                return r;
            };
        }

        function initHistory() {
            undoStack = [];
            redoStack = [];
            transactionActive = false;
            snapshotCapturedThisTx = false;
            mutationHappenedThisTx = false;
            installBoardHooks();
            installInteractionHooks();
            updateUndoRedoButtons();
        }

        // Read from the datastore
        var datastoreObject = activity.getDatastoreObject();
        function onLoaded(error, metadata, jsonData) {
            if (error === null) {
                gearSketch.board = window.gearsketch.model.Board.
                    fromObject(JSON.parse(jsonData));
                installBoardHooks();
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
            beginTransaction();
            gearSketch.board.clear();
            endTransaction();
        });

        // Undo/Redo buttons
        var undoButton = document.getElementById('undo-button');
        if (undoButton) {
            undoButton.addEventListener('click', function (e) {
                e.preventDefault();
                undo();
            });
        }
        var redoButton = document.getElementById('redo-button');
        if (redoButton) {
            redoButton.addEventListener('click', function (e) {
                e.preventDefault();
                redo();
            });
        }

        // Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Y (redo)
        window.addEventListener('keydown', function(e) {
            var mod = e.metaKey || e.ctrlKey;
            if (!mod) return;
            var key = e.key ? e.key.toLowerCase() : '';
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (key === 'y' && !e.shiftKey) {
                e.preventDefault();
                redo();
            }
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
