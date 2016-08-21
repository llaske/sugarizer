define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var mustache = require("mustache");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

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

        function Stopwatch() {
            this.elem = document.createElement('li');
            var stopwatchList = document.getElementById('stopwatch-list');
            stopwatchList.appendChild(this.elem);

            this.template =
                '<p class="counter">00:00:00</p>' +
                '<div class="buttons-group">' +
                '<button class="start-stop-button start"></button>' +
                '<button class="reset-button"></button>' +
                '<button class="mark-button"></button>' +
                '<button class="clear-marks-button"></button>' +
                '</div>' +
                '<p class="marks"></p>' +
                '<button class="remove"></button>';

            this.elem.innerHTML = mustache.render(this.template, {});

            this.counterElem = this.elem.querySelector('.counter');
            this.marksElem = this.elem.querySelector('.marks');
            this.running = false;
            this.previousTime = Date.now();
            this.tenthsOfSecond = 0;
            this.seconds = 0;
            this.minutes = 0;
            this.marks = [];

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

            this.clearButton = this.elem.querySelector('.clear-marks-button');
            this.clearButton.onclick = function () {
                that.onClearMarksClicked();
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
            }
            else {
                this.running = false;
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
        };

        Stopwatch.prototype.onMarkClicked = function () {
            this.marks.push(pad(this.minutes) + ':' + pad(this.seconds) + '.' +
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
                pad(this.seconds) + '.' + pad(this.tenthsOfSecond);
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

        // Start with five stopwatches.
        for (var i = 0; i < 5; i++) {
            new Stopwatch();
        }

        // Button to add more stopwatches.
        var addButton = document.getElementById('add-stopwatch');
        addButton.onclick = function () {
            new Stopwatch();
        };
    });

});
