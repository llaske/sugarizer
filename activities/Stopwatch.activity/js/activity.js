define(["sugar-web/activity/activity","mustache", "sugar-web/env"], function (activity,mustache,env) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

        // Utility to fill a string number with zeros.
        function pad(n, width, z) {
            z = z || '0';
            width = width || 2;
            n = n + '';
            if (n.length >= width) {
                return n;
            }
            else {
                return new Array(width - n.length + 1).join(z) + n;
            }
        }

        function Stopwatch(counter, marks) {
            this.elem = document.createElement('li');
            var stopwatchList = document.getElementById('stopwatch-list');
            stopwatchList.appendChild(this.elem);

            this.template =
                '<div class="panel-body"></div>' +
                    '<div class="row">' +
                      '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2">' +
                        '<div class="counter">00:00:00</div>' +
                      '</div>' +
                      '<div class="col-xs-5 col-sm-5 col-md-4 col-lg-3">' +
                        '<div class="buttons-group">' +
                            '<button class="start-stop-button start" id="start-button" title="Start"></button>' +
                            '<button class="reset-button" id="reset-button" title="Reset"></button>' +
                            '<button class="mark-button" id="mark-button" title="Mark"></button>' +
                            
                        '</div>' +
                      '</div>' +
                      '<div class="col-xs-4 col-sm-4 col-md-6 col-lg-7">' +
                        '<div class="marks"></div>' +
                        '<button class="remove" id="remove-button" title="Remove"></button>' +
                      '</div>' +
                    '</div>' +
                '</div>';

            this.elem.innerHTML = mustache.render(this.template, {});

            this.counterElem = this.elem.querySelector('.counter');
            this.marksElem = this.elem.querySelector('.marks');
            this.running = false;
            this.previousTime = Date.now();
            this.tenthsOfSecond = 0;
            this.seconds = 0;
            this.minutes = 0;
            if(marks) {
                this.marks = marks;
                this.updateMarks();
            }
            else {
                this.marks = [];
            }
            if(counter) {
                this.minutes = parseInt(counter.split(":")[0]);
                this.seconds = parseInt(counter.split(":")[1]);
                this.tenthsOfSecond = parseInt(counter.split(":")[2]);
                this.updateView();
            }

            var that = this;

            this.startStopButton = this.elem.querySelector('.start-stop-button');
            this.startStopButton.onclick = function () {
                that.onStartStopClicked();
            };

            this.resetButton = this.elem.querySelector('.reset-button');
            this.resetButton.onclick = function () {
                that.onResetClicked();
            };

            this.markButton = this.elem.querySelector('.mark-button');
            this.markButton.onclick = function () {
                that.onMarkClicked();
            };

            this.removeButton = this.elem.querySelector('.remove');
            this.removeButton.onclick = function () {
                that.onRemoveClicked();
            };
        }

        Stopwatch.prototype.onStartStopClicked = function () {
            if (!this.running) {
                this.running = true;
                this.tick();
                this.startStopButton = this.elem.querySelector('.start-stop-button');
                this.startStopButton.title="Stop";
                this.resetButton = this.elem.querySelector('.reset-button');
                this.resetButton.disabled = true;
            }
            else {
                this.running = false;
                this.startStopButton.title="Start";
                this.resetButton = this.elem.querySelector('.reset-button');
                this.resetButton.disabled = false;
            }
            this.updateButtons();
        };

        Stopwatch.prototype.onResetClicked = function () {
            this.tenthsOfSecond = 0;
            this.seconds = 0;
            this.minutes = 0;
            if(this.running){
                this.onStartStopClicked();
            }
            else{
                this.running = false;
            }
            this.updateView();
            this.onClearMarksClicked();
        };

        Stopwatch.prototype.onMarkClicked = function () {
            if (this.marks.length >= 10) {
                this.marks.shift();
            }
            this.marks.push(pad(this.minutes) + ':' + pad(this.seconds) + ':' +
                            pad(this.tenthsOfSecond));
            this.updateMarks();
        };

        Stopwatch.prototype.onClearMarksClicked = function () {
            this.marks = [];
            this.updateMarks();
        };

        Stopwatch.prototype.onRemoveClicked = function () {
            var stopwatchList = document.getElementById('stopwatch-list');
            stopwatchList.removeChild(this.elem);
        };

        Stopwatch.prototype.tick = function () {
            if (!this.running) {
                return;
            }

            var currentTime = Date.now();

            if ((currentTime - this.previousTime) > 100) {
                this.previousTime = currentTime;
                this.update();
                this.updateView();
            }

            requestAnimationFrame(this.tick.bind(this));
        };

        Stopwatch.prototype.update = function () {
            this.tenthsOfSecond += 1;
            if (this.tenthsOfSecond == 10) {
                this.tenthsOfSecond = 0;
                this.seconds += 1;
            }
            if (this.seconds == 60) {
                this.seconds = 0;
                this.minutes += 1;
            }
        };

        Stopwatch.prototype.updateView = function () {
            this.counterElem.innerHTML = pad(this.minutes) + ':' +
                pad(this.seconds) + ':' + pad(this.tenthsOfSecond);
        };

        Stopwatch.prototype.updateMarks = function () {
            this.marksElem.innerHTML = '';
            for (var i = 0; i < this.marks.length; i++) {
                this.marksElem.innerHTML += this.marks[i];
                if (i !== (this.marks.length -1)) {
                    this.marksElem.innerHTML += ' - ';
                }
            }
        };

        Stopwatch.prototype.updateButtons = function () {
            if (this.running) {
                this.startStopButton.classList.add("stop");
                this.startStopButton.classList.remove("start");
            }
            else {
                this.startStopButton.classList.add("start");
                this.startStopButton.classList.remove("stop");
            }
        };

        // Button to add more stopwatches.
        var addButton = document.getElementById('add-stopwatch');
        addButton.onclick = function () {
            new Stopwatch();
        };

        
        env.getEnvironment(function(err, environment) {
            currentenv = environment;
            if (!environment.objectId) {
                 // Start with five stopwatches.
                for (var i = 0; i < 5; i++) {
                    new Stopwatch();
                }
            } else {
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        stopwatchData = JSON.parse(data);
                        var i;
                        for (i = 0; i < Object.keys(stopwatchData).length; i++) { 
                            // Generate saved stopwatches
                            counter = stopwatchData[i]["counter"];
                            marks = stopwatchData[i]["marks"];
                            new Stopwatch(counter, marks);
                        }
                    }
                });
            }
        });
    });
    // Saving stopwatch data on stop.
    document.getElementById("stop-button").addEventListener('click', function (event) {
        var stopwatchData = document.getElementById("stopwatch-list").getElementsByTagName("li");
        stopwatchDict = {};
        var i;
        for (i = 0; i < stopwatchData.length; i++) { 
            stopwatchDict[i] = {};
            (stopwatchDict[i])["counter"] = stopwatchData[i].getElementsByClassName("counter")[0].innerHTML;
            (stopwatchDict[i])["marks"] = stopwatchData[i].getElementsByClassName("marks")[0].innerHTML.split(" - ");
        }
        stopwatchJSON = JSON.stringify(stopwatchDict);
        activity.getDatastoreObject().setDataAsText(stopwatchJSON);
        activity.getDatastoreObject().save();

    });
    
    // Switch to full screen when the full screen button is pressed
    document.getElementById("fullscreen-button").addEventListener('click', function() {
        document.getElementById("main-toolbar").style.display = "none";
        document.getElementById("canvas").style.top = "0px";
        document.getElementById("unfullscreen-button").style.visibility = "visible";
    });
    

    //Return to normal size
    document.getElementById("unfullscreen-button").addEventListener('click', function() {
        document.getElementById("main-toolbar").style.display = "block";
        document.getElementById("canvas").style.top = "55px";
        document.getElementById("unfullscreen-button").style.visibility = "hidden";

    });

});
