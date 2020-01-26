define(["sugar-web/activity/activity","sugar-web/env","sugar-web/graphics/radiobuttonsgroup","mustache","moment-with-locales.min","webL10n", "tutorial"], function (activity,env,radioButtonsGroup,mustache,moment, webL10n, tutorial) {

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
        setTranslatedStrings();

        env.getEnvironment(function(err, environment) {
            currentenv = environment;

            // Set current language to Sugarizer
            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            webL10n.language.code = language;

            // Load from datastore
            if (!environment.objectId) {
                console.log("New instance");
            } else {
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        Clock.face=data.face;
                        console.log(data);
                        if(data.face=="simple"){
                            document.getElementById("simple-clock-button").classList.add("active");
                            document.getElementById("nice-clock-button").classList.remove("active");
                            clock.changeFace("simple");
                        }else{
                            document.getElementById("nice-clock-button").classList.add("active");
                            document.getElementById("simple-clock-button").classList.remove("active");
                            clock.changeFace("nice");
                        }
                        if(data.writeDate){
                            document.getElementById("write-date-button").classList.add("active");
                            clock.changeWriteDate(true);
                        }else{
                            document.getElementById("write-date-button").classList.remove("active");
                        }
                        if(data.isSetTimeGame){
                           clock.setTimeGame = true;

                           if(data.isSmiley){
                             clock.isSmiley = true;
                           }
                           clock.handAngles = data.handAngles;
                           clock.timeToBeDisplayed = data.timeToBeDisplayed;

                           document.getElementById("set-timeGame-button").classList.add("active");

                           document.getElementById("write-time-button").classList.add("active");
                           clock.writeTimeInSetTimeGame();
                        }
                        else{
                          if(data.isSetTime){
                            clock.setTime = true;
                            clock.writeDate = false;

                            clock.handAngles = data.handAngles;
                            clock.timeToBeDisplayed = data.timeToBeDisplayed;

                            document.getElementById("set-time-button").classList.add("active");
                            clock.writeTimeInSetTime();
                          }
                          if(data.writeTime){
                              document.getElementById("write-time-button").classList.add("active");
                              clock.changeWriteTime(true);
                          }else{
                              document.getElementById("write-time-button").classList.remove("active");
                          }
                        }

                    }
                });
            }
        });

        //Run tutorial when help button is clicked
        document.getElementById("help-button").addEventListener('click', function(e) {
           tutorial.start();
        });

        var niceImage = new Image();
        niceImage.src = './clock.svg';

        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

        function Clock() {
            this.face = "simple";

            this.handAngles = {
                'hours': 0,
                'minutes': 0,
                'seconds': 0
            };

            this.initialAngles = {
                'hours': undefined,
                'minutes': undefined,
                'seconds': undefined
            };

            this.colors = {
                'black': "#000000",
                'white': "#FFFFFF",
                'hours': "#005FE4",
                'minutes': "#00B20D",
                'seconds': "#E6000A",
                'yellow' : "#FFFF00"
            };

            this.writeTime = false;
            this.writeDate = false;
            this.setTime = false;
            this.setTimeGame = false;
            this.isDrag = false;
            this.isSmiley = false;
            this.initiateAngles = false;


            // These are calculated on each resize to fill the available space.
            this.size = undefined;
            this.margin = undefined;
            this.radius = undefined;
            this.centerX = undefined;
            this.centerY = undefined;
            this.lineWidthBase = undefined;
            this.handSizes = undefined;
            this.lineWidths = undefined;

            //usec to move clock's hands
            this.selectedHand = undefined;
            this.canvasX = undefined;
            this.canvasY = undefined;
            this.timeToBeDisplayed = {
              'hours': undefined,
              'minutes': undefined,
              'seconds': undefined
            };
            this.ctr = 0;
            this.ctr1 = 0;

            // DOM elements.
            this.textTimeElem = document.getElementById('text-time');
            this.textDateElem = document.getElementById('text-date');
            this.clockCanvasElem = document.getElementById("clock-canvas");
            this.clockContainerElem = this.clockCanvasElem.parentNode;

            this.bgCanvasElem = document.createElement('canvas');
            this.clockContainerElem.insertBefore(this.bgCanvasElem,
                                                 this.clockCanvasElem);

            var that = this;
            window.onresize = function (event) {
                that.updateSizes();
                that.drawBackground();
            };

            // Switch to full screen when the full screen button is pressed
            document.getElementById("fullscreen-button").addEventListener('click', function() {
                document.getElementById("main-toolbar").style.display = "none";
                document.getElementById("canvas").style.top = "0px";
                document.getElementById("unfullscreen-button").style.visibility = "visible";

                //update the size and draw the background
                that.updateSizes();
                that.drawBackground();
              });

            //Return to normal size
            document.getElementById("unfullscreen-button").addEventListener('click', function() {
                document.getElementById("main-toolbar").style.display = "block";
                document.getElementById("canvas").style.top = "55px";
                document.getElementById("unfullscreen-button").style.visibility = "hidden";

                that.updateSizes();
                that.drawBackground();
            });
        }

        function setTranslatedStrings() {
            document.getElementById("simple-clock-button").title = l10n_s.get("SimpleClock");
            document.getElementById("nice-clock-button").title = l10n_s.get("NiceClock");
            document.getElementById("write-time-button").title = l10n_s.get("WriteTime");
            document.getElementById("write-date-button").title = l10n_s.get("WriteDate");
            document.getElementById("set-time-button").title = l10n_s.get("SetTime");
            document.getElementById("set-timeGame-button").title = l10n_s.get("SetTimeGame");
            document.getElementById("text-time").innerHTML = l10n_s.get("WhatTime");
        }

        Clock.prototype.start = function (face) {
            this.updateSizes();
            this.drawBackground();
            this.update();
            if(this.setTime || this.setTimeGame){
              this.moveHandsInSetTime();
            }
            else{
              this.drawHands();
            }

            this.previousTime = Date.now();
            this.tick();
        }

        Clock.prototype.tick = function () {
            var currentTime = Date.now();

            //if set time mode not activated i.e. normal mode
            if(!this.setTime && !this.setTimeGame){
              // Update each second (1000 miliseconds).
              if ((currentTime - this.previousTime) > 1000) {
                  this.previousTime = currentTime;
                  this.update();
                  this.drawHands();
                  if (/Android/i.test(navigator.userAgent) && document.location.protocol.substr(0,4) != "http") {
                      // HACK: Force redraw on Android
                      this.clockCanvasElem.style.display='none';
                      this.clockCanvasElem.offsetHeight;
                      this.clockCanvasElem.style.display='block';
                  }
              }
            }
            else{
              this.moveHandsInSetTime();
            }
            requestAnimationFrame(this.tick.bind(this));
        }

        Clock.prototype.changeFace = function (face) {
            this.face = face;
            this.drawBackground();
        }


        Clock.prototype.changeWriteTime = function (writeTime) {
            this.writeTime = writeTime;

            if (writeTime) {
                this.textTimeElem.style.display = "block";
            } else {
                this.textTimeElem.style.display = "none";
            }

            if (this.setTime) {
              this.writeTimeInSetTime();
            }
            else {
              this.updateSizes();

              var date = new Date();
              var hours = date.getHours();
              var minutes = date.getMinutes();
              var seconds = date.getSeconds();
              this.displayTime(hours, minutes, seconds);

              this.drawBackground();
            }

        }

        Clock.prototype.changeWriteDate = function (writeDate) {
            this.writeDate = writeDate;

            if (writeDate) {
                this.textDateElem.style.display = "block";
            } else {
                this.textDateElem.style.display = "none";
            }

            this.updateSizes();
            var date = new Date();
            this.displayDate(date);
            this.drawBackground();
        }

        Clock.prototype.updateSizes = function () {
            var toolbarElem = document.getElementById("main-toolbar");
            var textContainerElem = document.getElementById("text-container");

            var height = window.innerHeight - (textContainerElem.offsetHeight +
                toolbarElem.offsetHeight) - 1;

            this.size = Math.min(window.innerWidth, height);

            this.clockCanvasElem.width = this.size;
            this.clockCanvasElem.height = this.size;

            this.bgCanvasElem.width = this.size;
            this.bgCanvasElem.height = this.size;

            this.clockContainerElem.style.width = this.size + "px";
            this.clockContainerElem.style.height = this.size + "px";

			this.clockCanvasElem.style.width = (this.size+4) + "px";

            this.margin = this.size * 0.02;
            this.radius = (this.size - (2 * this.margin)) / 2;

            this.centerX = this.radius + this.margin;
            this.centerY = this.radius + this.margin;
            this.lineWidthBase = this.radius / 150;

            this.handSizes = {
                'hours': this.radius * 0.5,
                'minutes': this.radius * 0.7,
                'seconds': this.radius * 0.8
            };

            this.lineWidths = {
                'hours': this.lineWidthBase * 9,
                'minutes': this.lineWidthBase * 6,
                'seconds': this.lineWidthBase * 4
            };
        }

        // Update text and hand angles using the current time.
        Clock.prototype.update = function () {
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();

            this.displayTime(hours, minutes, seconds);
            this.displayDate(date);

            this.handAngles.hours = Math.PI / 6 * (hours % 12) + Math.PI / 360 * minutes;

            this.handAngles.minutes = Math.PI / 30 * minutes + Math.PI / 1800 * seconds;
            this.handAngles.seconds = Math.PI / 30 * seconds;
        }

        Clock.prototype.displayTime = function (hours, minutes, seconds, txt = "") {
          var zeroFill = function (number) {
              return ('00' + number).substr(-2);
          };

          var template =
              '<span style="color: {{ colors.hours }}">{{ hours }}' +
              '</span>' +
              ':<span style="color: {{ colors.minutes }}">{{ minutes }}' +
              '</span>' +
              ':<span style="color: {{ colors.seconds }}">{{ seconds }}' +
              '</span>' +
              '<span style="color: {{ colors.yellow }}">' + txt +
              '</span>'
              ;

          if (this.writeTime) {
              var templateData = {'colors': this.colors,
                                  'hours': zeroFill(hours),
                                  'minutes': zeroFill(minutes),
                                  'seconds': zeroFill(seconds)
                                 }

              this.textTimeElem.innerHTML = mustache.render(template,
                                                            templateData);
          }

        }

        Clock.prototype.displayDate = function (date) {
          if (this.writeDate) {
              var momentDate = moment(date);
              this.textDateElem.innerHTML = momentDate.format('LLLL').replace(momentDate.format('LT'), '');
          }
        }

        Clock.prototype.drawBackground = function () {
            if (this.face == "simple") {
                this.drawSimpleBackground();
                this.drawNumbers();
            }
            else {
                this.drawNiceBackground();
            }
            if(this.setTimeGame || this.setTimeGame){
              this.moveHandsInSetTime();
            }
            else{
               this.drawHands();
            }
        }

        // Draw the background of the simple clock.
        //
        // The simple clock background is a white disk, with hours and
        // minutes ticks, and the hour numbers.
        Clock.prototype.drawSimpleBackground = function () {
            var ctx = this.bgCanvasElem.getContext('2d');

            ctx.clearRect(0, 0, this.size, this.size);

            // Simple clock background
            var lineWidthBackground = this.lineWidthBase * 4;
            ctx.lineCap = 'round';
            ctx.lineWidth = lineWidthBackground;
            ctx.strokeStyle = this.colors.black;
            ctx.fillStyle = this.colors.white;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY,
                    this.radius - lineWidthBackground, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Clock ticks
            for (var i = 0; i < 60; i++) {
                var inset;
                if (i % 15 === 0) {
                    inset = 0.15 * this.radius;
                    ctx.lineWidth = this.lineWidthBase * 7;
                }
                else if (i % 5 === 0) {
                    inset = 0.12 * this.radius;
                    ctx.lineWidth = this.lineWidthBase * 5;
                }
                else {
                    inset = 0.08 * this.radius;
                    ctx.lineWidth = this.lineWidthBase * 4;
                }

                ctx.lineCap = 'round';
                ctx.beginPath();

                var cos = Math.cos(i * Math.PI / 30);
                var sin = Math.sin(i * Math.PI / 30);
                ctx.save();
                ctx.translate(this.margin, this.margin);
                ctx.moveTo(
                    this.radius + (this.radius - inset) * cos,
                    this.radius + (this.radius - inset) * sin);
                ctx.lineTo(
                    this.radius + (this.radius - ctx.lineWidth) * cos,
                    this.radius + (this.radius - ctx.lineWidth) * sin);

                ctx.stroke();
                ctx.restore();
            }
        }

        Clock.prototype.drawNiceBackground = function () {
            var ctx = this.bgCanvasElem.getContext('2d');

            ctx.clearRect(this.margin, this.margin,
                              this.radius * 2, this.radius * 2);
            ctx.drawImage(niceImage, this.margin, this.margin,
                              this.radius * 2, this.radius * 2);
        }

        // Draw the numbers of the hours.
        Clock.prototype.drawNumbers = function () {
            var ctx = this.bgCanvasElem.getContext('2d');

            var fontSize = 30 * this.radius / 160;

            ctx.fillStyle = this.colors.hours;
            ctx.textBaseline = 'middle';
            ctx.font = "bold " + fontSize + "px sans-serif";

            for (var i = 0; i < 12; i++) {
                var cos = Math.cos((i - 2) * Math.PI / 6);
                var sin = Math.sin((i - 2) * Math.PI / 6);
                var text = i + 1;
                var textWidth = ctx.measureText(text).width;

                ctx.save();
                ctx.translate(this.centerX - textWidth / 2, this.centerY);
                ctx.translate(this.radius * 0.75 * cos,
                              this.radius * 0.75 * sin);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }
        }

        // Draw the hands of the analog clocks.
        Clock.prototype.drawHands = function () {
            var ctx = this.clockCanvasElem.getContext("2d");

            // Clear canvas first.
            ctx.clearRect(this.margin, this.margin, this.radius * 2,
                          this.radius * 2);

            var handNames = ['hours', 'minutes', 'seconds'];
            for (var i = 0; i < handNames.length; i++) {
                var name = handNames[i];
                ctx.lineCap = 'round';
                ctx.lineWidth = this.lineWidths[name];
                ctx.strokeStyle = this.colors[name];
                ctx.beginPath();
                ctx.arc(this.centerX, this.centerY, ctx.lineWidth * 0.6, 0,
                        2 * Math.PI);
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(
                    this.centerX + this.handSizes[name] *
                        Math.sin(this.handAngles[name]),
                    this.centerY - this.handSizes[name] *
                        Math.cos(this.handAngles[name]));
                ctx.stroke();
            }
        }

        // Draw the hands of the analog clocks in set time mode.
        Clock.prototype.drawHandsInSetTime = function () {
            var ctx = this.clockCanvasElem.getContext("2d");

            // Clear canvas first.
            ctx.clearRect(this.margin, this.margin, this.radius * 2,
                          this.radius * 2);
                          this.drawSmiley();
            var handNames = ['hours', 'minutes', 'seconds'];
            // tempPos is used to position circle on each hand in set time mode
            var tempPos = [0.400,0.607,0.8125];

            for (var i = 0; i < handNames.length; i++) {
                let name = handNames[i];
                ctx.lineCap = 'round';
                ctx.lineWidth = this.lineWidths[name];
                ctx.strokeStyle = this.colors[name];

                ctx.beginPath();
                ctx.arc(this.centerX, this.centerY, ctx.lineWidth * 0.6, 0,
                        2 * Math.PI);
                ctx.moveTo(this.centerX, this.centerY);
                let angle = this.handAngles[name];

                let tempRadius = this.radius * 0.08;
                let tempX = this.centerX + this.handSizes[name] * tempPos[i] * Math.sin(angle);
                let tempY = this.centerY - this.handSizes[name] * tempPos[i] * Math.cos(angle);

                ctx.lineTo(
                    this.centerX + ((this.handSizes[name] * tempPos[i]) - tempRadius) *
                        Math.sin(angle),
                    this.centerY - ((this.handSizes[name] * tempPos[i]) - tempRadius ) *
                        Math.cos(angle));

                ctx.stroke();
                ctx.beginPath();
                ctx.arc(tempX, tempY, tempRadius, 0, 2 * Math.PI);

                ctx.moveTo(
                    this.centerX + ((this.handSizes[name] * tempPos[i]) + tempRadius) *
                        Math.sin(angle),
                    this.centerY - ((this.handSizes[name] * tempPos[i]) + tempRadius) *
                        Math.cos(angle));

                ctx.lineTo(
                    this.centerX + this.handSizes[name] *
                        Math.sin(angle),
                    this.centerY - this.handSizes[name] *
                        Math.cos(angle));
                ctx.stroke();

            }
        }

        //to claculate angles for hands in set-time and set-time-game modes
        Clock.prototype.moveHandsInSetTime = function () {

          if(this.isDrag){
            let px = this.canvasX;
            let py = this.canvasY;
            let deltaY = Math.abs(py - this.centerY);
            let deltaX = Math.abs(px - this.centerX)
            let theta = Math.atan2(deltaY, deltaX);
            let newAngle = undefined;

            if(py <= this.centerY){
              if(px >= this.centerX){
                newAngle = Math.PI / 2 - theta;
              }
              else{
                newAngle = 3 * Math.PI / 2 + theta;
              }
            }
            else{
              if(px >= this.centerX){
                newAngle = Math.PI / 2 + theta;
              }
              else{
                newAngle = 3 * Math.PI / 2 - theta;
              }
            }

            if(this.initiateAngles){
              this.initialAngles = {...this.handAngles};
              this.initiateAngles = false;
            }

            //to make angles of one hands dependent on each other.
            if(this.selectedHand == 'hours'){
              this.handAngles['hours'] = Math.floor(newAngle / Math.PI * 6) * Math.PI/6 + Math.floor(this.handAngles['minutes'] / Math.PI * 30) * Math.PI / 360;
            }
            else if (this.selectedHand == 'minutes') {

              let prev = Math.floor(this.handAngles['minutes'] / Math.PI *30) ;
              this.handAngles['minutes'] = Math.floor(newAngle / Math.PI * 30) * Math.PI / 30 + Math.floor(this.handAngles['seconds'] / Math.PI *30) * Math.PI / 1800;
              let next = Math.floor(this.handAngles['minutes'] / Math.PI *30);

              if (45<prev && prev<=59 && 0<=next && next<15) {
                this.ctr++;
              }
              else if (15>prev && prev>=0 && 59<=next && next>=45) {
                this.ctr--;
              }

              let toset = (Math.floor(this.initialAngles['hours'] / Math.PI * 6) + this.ctr ) * Math.PI/6 + Math.floor(this.handAngles['minutes'] / Math.PI * 30) * Math.PI / 360;
              if (toset < 0) {
                this.handAngles['hours'] = 2*Math.PI + toset;
                this.initialAngles['hours'] = 2*Math.PI + toset;
                this.ctr = 0;
              }
              else {
                this.handAngles['hours'] = toset;
              }
            }
            else{

              let prev = Math.floor(this.handAngles['seconds'] / Math.PI *30);
              this.handAngles['seconds'] =  Math.floor(newAngle / Math.PI * 30) * Math.PI / 30;
              let next = Math.floor(this.handAngles['seconds'] / Math.PI *30);

              if (45<prev && prev<=59 && 0<=next && next<15) {
                this.ctr++;
              }
              else if (15>prev && prev>=0 && 59<=next && next>=45) {
                this.ctr--;
              }

              prev = Math.floor(this.handAngles['minutes'] / Math.PI *30) ;

              let tmp = Math.floor(this.handAngles['seconds'] / Math.PI *30) * Math.PI / 1800;
              if(tmp == 0){
                tmp = Math.PI / 1800;
              }
              let toset = (Math.floor(this.initialAngles['minutes'] / Math.PI * 30 + this.ctr) * Math.PI / 30 + tmp)%(2*Math.PI);
              if(toset < 0){
                this.handAngles['minutes'] = 2*Math.PI + toset;
                this.initialAngles['minutes'] = 2*Math.PI + toset;
                this.ctr = 0;
              }
              else {
                this.handAngles['minutes'] = toset;
              }
              next = Math.floor(this.handAngles['minutes'] / Math.PI *30);

              if (45<prev && prev<=59 && 0<=next && next<15) {
                this.ctr1++;
              }
              else if (15>prev && prev>=0 && 59<=next && next>=45) {
                this.ctr1--;
              }

              toset = (Math.floor(this.initialAngles['hours'] / Math.PI * 6 + this.ctr1) * Math.PI/6 + Math.floor((this.handAngles['minutes'] % (2*Math.PI)) / Math.PI * 30) * Math.PI / 360);
              if(toset < 0){
                this.handAngles['hours'] = 2*Math.PI + toset;
                this.initialAngles['hours'] = 2*Math.PI + toset;
                this.ctr1 = 0;
              }
              else {
                this.handAngles['hours'] = toset;
              }
            }
          }
          this.drawHandsInSetTime();
        }

        //to write time in set time mode
        Clock.prototype.writeTimeInSetTime = function () {
         let tmp;
         this.timeToBeDisplayed['seconds'] = Math.floor(Number.parseFloat(this.handAngles['seconds'] * 30 / Math.PI).toFixed(5)) ;
         this.timeToBeDisplayed['minutes'] = Math.floor(Number.parseFloat((this.handAngles['minutes'] % (2*Math.PI)) * 30 / Math.PI).toFixed(5))%60;
         tmp = Math.floor(Number.parseFloat((this.handAngles['hours'] % (2*Math.PI)) * 6 / Math.PI).toFixed(5));
         this.timeToBeDisplayed['hours'] = tmp != 0 ? tmp : 12;

          this.displayTime(this.timeToBeDisplayed['hours'], this.timeToBeDisplayed['minutes'], this.timeToBeDisplayed['seconds']);

          this.updateSizes();
          this.drawBackground();
        }

        //to write time in setTimeGame mode
        Clock.prototype.writeTimeInSetTimeGame = function () {
          this.writeTime = true;
          this.textTimeElem.style.display = "block";


          if(this.timeToBeDisplayed['hours']==undefined){
             this.timeToBeDisplayed['hours'] = Math.floor(Math.random() * 12) + 1;
             this.timeToBeDisplayed['minutes'] = Math.floor(Math.random() * 60);
             this.timeToBeDisplayed['seconds'] = Math.floor(Math.random() * 60);
           }
          let txt = "??";
          this.displayTime(this.timeToBeDisplayed['hours'], this.timeToBeDisplayed['minutes'], this.timeToBeDisplayed['seconds'], txt);

          this.updateSizes();
          this.drawBackground();
        }

        //to draw smiley on the clock
        Clock.prototype.drawSmiley = function () {
          if(this.isSmiley){
            var ctx = this.clockCanvasElem.getContext("2d");

            ctx.lineCap = 'round';
            ctx.lineWidth = this.lineWidthBase * 10;
            ctx.strokeStyle = this.colors['yellow'];
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, this.radius * 0.5, 0,  Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.centerX - this.radius * 0.3 , this.centerY - this.radius * 0.3, 25, 0,  2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.centerX + this.radius * 0.3 , this.centerY - this.radius * 0.3, 25, 0,  2 * Math.PI);
            ctx.stroke();
          }
        }


        // Create the clock.

        var clock = new Clock();
        clock.start();

        // UI controls.

        var simpleClockButton = document.getElementById("simple-clock-button");
        simpleClockButton.onclick = function () {
            clock.changeFace("simple");
        };

        var niceClockButton = document.getElementById("nice-clock-button");
        niceClockButton.onclick = function () {
            clock.changeFace("nice");
        };

        var simpleNiceRadio = new radioButtonsGroup.RadioButtonsGroup(
        [simpleClockButton, niceClockButton]);


        var writeTimeButton = document.getElementById("write-time-button");
        writeTimeButton.onclick = function () {
            if(!clock.setTimeGame){
              this.classList.toggle('active');
              var active = this.classList.contains('active');
              clock.changeWriteTime(active);
            }
        };

        var writeDateButton = document.getElementById("write-date-button");
        writeDateButton.onclick = function () {
              this.classList.toggle('active');
              var active = this.classList.contains('active');
              clock.changeWriteDate(active);
        };

        var setTimeButton = document.getElementById("set-time-button");
        setTimeButton.onclick = function () {

          if (clock.setTime) {
            clock.setTime = false;
            clock.isSmiley = false;
            document.getElementById("set-time-button").classList.remove("active");

          } else {
            clock.setTime = true;
            clock.isSmiley = false;

            clock.setTimeGame = false;
            document.getElementById("set-timeGame-button").classList.remove("active");
            document.getElementById("set-time-button").classList.add("active");

            clock.writeTimeInSetTime();
          }

        }

        var setTimeGameButton = document.getElementById("set-timeGame-button");
        setTimeGameButton.onclick = function () {
          if (clock.setTimeGame) {
            clock.setTimeGame = false;
            clock.isSmiley = false;
            clock.timeToBeDisplayed = {
              'hours': undefined,
              'minutes': undefined,
              'seconds': undefined
            };
            document.getElementById("set-timeGame-button").classList.remove("active");
            document.getElementById("write-time-button").classList.remove("active");
            clock.changeWriteTime(false);

          } else {
            clock.setTimeGame = true;
            clock.writeDate = false;
            clock.timeToBeDisplayed = {
              'hours': undefined,
              'minutes': undefined,
              'seconds': undefined
            };
            clock.isSmiley = false;

            clock.setTime = false;
            document.getElementById("set-time-button").classList.remove("active");
            document.getElementById("set-timeGame-button").classList.add("active");
            document.getElementById("write-time-button").classList.add("active");

            clock.handAngles['seconds'] = 0;
            clock.handAngles['minutes'] = 0;
            clock.handAngles['hours'] = 0;

            clock.writeTimeInSetTimeGame();

          }

        }

        var touchScreen = ("ontouchstart" in document.documentElement);
        if (touchScreen) {
          clock.clockCanvasElem.addEventListener('touchstart', handleOnMouseDown, false);
          clock.clockCanvasElem.addEventListener('touchend', handleOnMouseUp, false);
          clock.clockCanvasElem.addEventListener('touchmove', handleOnMouseMove, false);

        }
        else {
          clock.clockCanvasElem.onmousedown = handleOnMouseDown;
          clock.clockCanvasElem.onmouseup = handleOnMouseUp;
          clock.clockCanvasElem.onmousemove = handleOnMouseMove;
        }

        function handleOnMouseDown(e){
          var handNames = ['hours', 'minutes', 'seconds'];
          var tempPos = [0.400,0.607,0.8125];

          if (touchScreen) e = e.touches[0];

          for(var i=0;i<3;i++){
            var name = handNames[i];
            let tempRadius = clock.radius * 0.08;
            let tempX = clock.centerX + clock.handSizes[name] * tempPos[i] * Math.sin(clock.handAngles[name]);
            let tempY = clock.centerY - clock.handSizes[name] * tempPos[i] * Math.cos(clock.handAngles[name]);
            const rect = clock.clockCanvasElem.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            clock.canvasX = canvasX;
            clock.canvasY = canvasY;
            let dist = Math.sqrt(Math.pow(tempX - canvasX, 2) + Math.pow(tempY - canvasY, 2));

            if (dist <= tempRadius){
              clock.isDrag = true;
              clock.selectedHand = name;
              clock.initiateAngles = true;
              break;
            }
          }
        }

        function handleOnMouseUp(e) {
           clock.isDrag = false;
           clock.ctr = 0;
           clock.ctr1 = 0;
           this.initialAngles = {...this.handAngles};

        }

        function handleOnMouseMove(e) {
          if (touchScreen) e = e.touches[0];
          const rect = clock.clockCanvasElem.getBoundingClientRect();
          const canvasX = e.clientX - rect.left;
          const canvasY = e.clientY - rect.top;
          clock.canvasX = canvasX;
          clock.canvasY = canvasY;

          if(clock.setTimeGame){
            let handNames = ['hours', 'minutes', 'seconds'];
            let targetAngles = [];

            targetAngles.push (Math.PI / 6 * (clock.timeToBeDisplayed['hours']%12) + Math.PI / 360 * clock.timeToBeDisplayed['minutes']);
            targetAngles.push(Math.PI / 30 * clock.timeToBeDisplayed['minutes'] + Math.PI / 1800 * clock.timeToBeDisplayed['seconds']);
            targetAngles.push(Math.PI / 30 * clock.timeToBeDisplayed['seconds']);


            let ctr = 0;
            for(let i=0;i<3;i++){
              let name = handNames[i];
              let angle = clock.handAngles[name] % (2 * Math.PI);
              let target = targetAngles[i];

              let diff = Math.abs(angle - target);

              if (diff < 3*Math.PI/180) {
                ctr++;
              }
            }
            if(ctr==3){
              clock.isSmiley = true;
            }else{
              clock.isSmiley = false;
            }

          }
          if(clock.setTime){
            clock.writeTimeInSetTime();
          }

        }

        document.getElementById("stop-button").addEventListener('click', function (event) {
          let stateObj = {
              face : clock.face,
              writeTime : clock.writeTime,
              writeDate : clock.writeDate,
              isSetTime : clock.setTime,
              isSetTimeGame : clock.setTimeGame,
              isSmiley : clock.isSmiley,
              handAngles : clock.handAngles,
              timeToBeDisplayed : clock.timeToBeDisplayed
            }
            activity.getDatastoreObject().setDataAsText(stateObj);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.log("write failed.");
                }
            });
        });
    });
});
