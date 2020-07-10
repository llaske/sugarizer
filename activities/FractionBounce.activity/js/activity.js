// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
let app = new Vue({
	el: '#app',
	components: {
		'slope-template': SlopeTemplate
	},
	data: {
		currentenv: null,
		full: false,
		context: null,
		mode: 'fractions',
		img: null,
		interval: null,
		touchEvent: null,
		touchInterval: null,
		cx: 100,
		cy: 500,
		vx: 0,
		vy: -7,
		radius: 40,
		gravity: 0.05,
		damping: 0.1,
		traction: 0.1,
		paused: true,
		onSlope: true,

		frameInterval: 20,
		launchDelay: 1000,
		height: 100,
		parts: 4,
		answer: -1,
		correctAnswers: 0,
		bounceCount: 0,
		stopAfter: 10,
		log: {},
		userFractions: [],
		successSound: null,
		failSound: null,
		l10n: {
			stringFractionBounceActivity: '',
			stringTemplate: '',
			stringRestart: '',
			stringHelp: '',
			stringPlay: '',
			stringPause: '',
			stringSettings: '',
			stringBall: '',
			stringBg: '',
			stringFullscreen: '',
			stringFractions: '',
			stringSectors: '',
			stringPercents: '',
			stringHelpClickToStart: '',
			stringHelpBounceToPosition: '',
			stringHelpOfTheWay: '',
			stringHelpGameOver: '',
			stringPrevShort: '',
			stringNextShort: '',
			stringEndShort: '',
			stringTutoTitle: '',
			stringTutoContent: '',
			stringTutoBallTitle: '',
			stringTutoBallContent: '',
			stringTutoBallControlsTitle: '',
			stringTutoBallControlsContent: '',
			stringTutoSlopeTitle: '',
			stringTutoSlopeContent: '',
			stringTutoLogTitle: '',
			stringTutoLogContent: '',
			stringTutoPlayTitle: '',
			stringTutoPlayContent: '',
			stringTutoSettingsTitle: '',
			stringTutoSettingsContent: '',
			stringTutoBallSelectTitle: '',
			stringTutoBallSelectContent: '',
			stringTutoBgSelectTitle: '',
			stringTutoBgSelectContent: '',
			stringTutoFractionsModeTitle: '',
			stringTutoFractionsModeContent: '',
			stringTutoSectorsModeTitle: '',
			stringTutoSectorsModeContent: '',
			stringTutoPercentsModeTitle: '',
			stringTutoPercentsModeContent: '',
		}
	},

	computed: {
		helpText: function () {
			if (this.answer == -1) {
				return this.l10n.stringHelpClickToStart;
			} else if (this.paused && this.bounceCount == 0) {
				return this.l10n.stringHelpGameOver;
			} else if (this.mode == 'percents') {
				return this.l10n.stringHelpBounceToPosition + ' ' + Math.floor(this.answer / this.parts * 100) + '%' + ' ' + this.l10n.stringHelpOfTheWay;
			} else {
				return this.l10n.stringHelpBounceToPosition + ' ' + this.answer + "/" + this.parts + ' ' + this.l10n.stringHelpOfTheWay;
			}
		}
	},

	mounted: function () {
		var vm = this;

		// handle resize
		window.addEventListener('resize', function () {
			vm.init();
		});

		this.init();

		this.$refs.SugarDevice.watchAcceleration(2*this.frameInterval);
	},

	methods: {

		initialized: function () {
			// Initialize Sugarizer
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
		},

		localized: function () {
			this.$refs.SugarL10n.localize(this.l10n);
		},

		onJournalDataLoaded: function (data, metadata) {
			console.log("Existing instance");
			this.userFractions = data.userFractions;
		},

		onJournalLoadError: function (error) {
			console.log("Error loading from journal");
		},

		// Handle fullscreen mode
		fullscreen: function () {
			this.$refs.SugarToolbar.hide();
			this.full = true;
			this.init();
		},
		unfullscreen: function () {
			this.$refs.SugarToolbar.show();
			this.full = false;
			this.init();
		},

		init: function () {
			let vm = this;
			mainCanvas.width = window.innerWidth;
			if (this.full) {
				mainCanvas.height = window.innerHeight;
			} else {
				mainCanvas.height = window.innerHeight - 56;
			}
			// Initializing the slope
			this.$refs.slopecanvas.initSlope();

			this.context = mainCanvas.getContext('2d');
			// Loading the ball
			this.img = document.createElement('img');
			this.context.translate(-this.radius, -2 * this.radius);
			this.img.onload = function () {
				if (vm.img.getAttribute('src')[0] == 'd') {
					vm.context.translate(0, vm.radius);
					vm.context.drawImage(vm.img, vm.cx, vm.cy, 2 * vm.radius, 2 * vm.radius);
					vm.context.translate(0, -vm.radius);
					// Top Rectangle
					vm.createTopRectangle();
				} else {
					vm.context.drawImage(vm.img, vm.cx, vm.cy);
				}
			}
			this.img.src = 'images/soccerball.svg';
			this.img.width = this.radius; this.img.height = this.radius; this.img.style.width = this.radius; this.img.style.height = this.radius;
			this.cx = mainCanvas.width / 2;
			this.cy = this.calcY(mainCanvas.width / 2) - this.radius;

			if (this.successSound == null || this.failSound == null) {
				this.initSounds();
			}

			// start by clicking ball
			document.getElementById('slopeCanvas').addEventListener('click', this.startGame);
		},

		initSounds: function () {
			//Success
			this.successSound = document.createElement("audio");
			this.successSound.src = "./audio/success.mp3";
			this.successSound.setAttribute("preload", "auto");
			this.successSound.setAttribute("controls", "none");
			this.successSound.style.display = "none";
			document.body.appendChild(this.successSound);
			//Failure
			this.failSound = document.createElement("audio");
			this.failSound.src = "./audio/fail.mp3";
			this.failSound.setAttribute("preload", "auto");
			this.failSound.setAttribute("controls", "none");
			this.failSound.style.display = "none";
			document.body.appendChild(this.failSound);
		},

		startGame: function (event) {
			let x = event.pageX,
				y = event.pageY;
			if (x <= this.cx + this.radius && x >= this.cx - this.radius && y <= this.cy + 5 * this.radius / 2 && y >= this.cy + this.radius / 2) {
				this.changeGameState();
			}
		},

		changeGameState: function () {
			this.paused = !this.paused;
			if (!this.paused) {
				this.launch();
			}
			document.getElementById('slopeCanvas').removeEventListener('click', this.startGame);
		},

		launch: function () {
			if (this.bounceCount == this.stopAfter) {
				this.changeGameState();
				this.bounceCount = 0;
			} else if (this.onSlope) {
				// To restart the game after (this.stopAfter) attempts
				if (this.bounceCount == 0) {
					this.log = {};
					this.correctAnswers = 0;
				}

				this.vy = -1 * Math.sqrt(window.innerHeight) / 3.90;
				this.cy -= this.cy + this.radius - this.calcY(this.cx) + 1;
				this.onSlope = false;
				this.next();
			} else {
				// Game was paused
				this.interval = setInterval(this.drawBall, this.frameInterval);
			}
		},

		next: function () {
			let upper = 8,
				lower = 3;

			let selection = Math.floor(Math.random() * 2);
			if (selection == 1 && this.userFractions.length > 0) {
				let i = Math.floor(Math.random() * this.userFractions.length);
				this.parts = this.userFractions[i].den;
				this.answer = this.userFractions[i].num;
			} else {
				this.parts = Math.floor((Math.random() * (upper - lower)) + lower);
				this.answer = Math.floor((Math.random() * (this.parts - 1)) + 1);
			}
			this.$refs.slopecanvas.updateSlope(this.parts);

			document.addEventListener("keydown", this.changeSpeed);
			slopeCanvas.addEventListener("touchstart", this.onTouchStart);
			slopeCanvas.addEventListener("mousedown", this.onTouchStart);
			slopeCanvas.addEventListener("touchend", this.onTouchEnd);
			slopeCanvas.addEventListener("mouseup", this.onTouchEnd);
			this.interval = setInterval(this.drawBall, this.frameInterval);
		},

		drawBall: function () {
			let vm = this;
			this.clearCanvas();
			if (this.paused) {
				clearInterval(this.interval);
			}

			if (this.cx + this.radius >= mainCanvas.width) {
				this.vx = -this.vx * this.damping;
				this.cx = mainCanvas.width - this.radius;
			} else if (this.cx - this.radius <= 0) {
				this.vx = -this.vx * this.damping;
				this.cx = this.radius;
			}

			if (this.cy + this.radius >= this.calcY(this.cx)) {
				this.vx = 0;
				document.removeEventListener("keydown", this.changeSpeed);
				slopeCanvas.removeEventListener("touchstart", this.onTouchStart);
				slopeCanvas.removeEventListener("mousedown", this.onTouchStart);
				this.onTouchEnd();
				let result = this.$refs.slopecanvas.checkAnswer();
				if (result == this.answer) {
					this.successSound.play();
				} else {
					this.failSound.play();
				}
				this.onSlope = true;
				if (this.vy < 0.5) {
					if (result == this.answer) {
						this.correctAnswers++;
						if (this.log.hasOwnProperty(this.answer + '/' + this.parts)) {
							this.log[this.answer + '/' + this.parts].push(true);
						} else {
							this.log[this.answer + '/' + this.parts] = [true];
						}
					} else {
						if (this.log.hasOwnProperty(this.answer + '/' + this.parts)) {
							this.log[this.answer + '/' + this.parts].push(false);
						} else {
							this.log[this.answer + '/' + this.parts] = [false];
						}
					}
					clearInterval(this.interval);
					this.bounceCount++;
					setTimeout(function () {
						vm.launch();
						if (vm.launchDelay - 100 > 0) {
							vm.launchDelay -= 100;
						}
					}, this.launchDelay);
				}
				this.vy = -this.vy * this.damping;
				this.cy = this.calcY(this.cx) - this.radius;
				// traction here
				this.vx *= this.traction;
			} else if (this.cy - this.radius <= 0) {
				this.vy = -this.vy * this.damping;
				this.cy = this.radius;
			}

			this.vy += this.gravity;

			this.cx += this.vx;
			this.cy += this.vy;


			this.context.font = "24px Times New Roman";
			let str = '';
			switch (this.mode) {
				case 'percents':
					// To get decimals in percentage
					// str = Math.round((this.answer/this.parts*100 + Number.EPSILON) * 100) / 100 + '%';
					// Without decimal
					str = Math.floor(this.answer / this.parts * 100) + '%';

					// Custom image is set
					if (this.img.getAttribute('src')[0] == 'd') {
						this.context.translate(0, this.radius);
						this.context.drawImage(this.img, this.cx, this.cy, 2 * this.radius, 2 * this.radius);
						this.context.translate(0, -this.radius);
						// Top Rectangle
						this.createTopRectangle();
					} else {
						this.context.drawImage(this.img, this.cx, this.cy);
					}
					break;
				case 'fractions':
					str = this.answer + '/' + this.parts;
					// Custom image is set
					if (this.img.getAttribute('src')[0] == 'd') {
						this.context.translate(0, this.radius);
						this.context.drawImage(this.img, this.cx, this.cy, 2 * this.radius, 2 * this.radius);
						this.context.translate(0, -this.radius);
						// Top Rectangle
						this.createTopRectangle()
					} else {
						this.context.drawImage(this.img, this.cx, this.cy);
					}
					break;
				case 'sectors':
					str = this.answer + '/' + this.parts;
					this.context.translate(this.radius, 2 * this.radius);
					// Numerator
					this.context.fillStyle = this.currentenv.user.colorvalue.fill;
					this.context.beginPath();
					this.context.moveTo(this.cx, this.cy);
					this.context.arc(this.cx, this.cy, this.radius, 0 - this.toRadians(90), this.toRadians(this.answer / this.parts * 360) - this.toRadians(90));
					this.context.lineTo(this.cx, this.cy);
					this.context.closePath();
					this.context.fill();
					// Denominator
					this.context.fillStyle = this.currentenv.user.colorvalue.stroke;
					this.context.beginPath();
					this.context.moveTo(this.cx, this.cy);
					this.context.arc(this.cx, this.cy, this.radius, this.toRadians(this.answer / this.parts * 360) - this.toRadians(90), 0 - this.toRadians(90));
					this.context.lineTo(this.cx, this.cy);
					this.context.closePath();
					this.context.fill();
					//Outline
					this.context.strokeStyle = this.currentenv.user.colorvalue.stroke;
					this.context.beginPath();
					this.context.arc(this.cx, this.cy, this.radius, 0, this.toRadians(360));
					this.context.closePath();
					this.context.stroke();

					this.context.translate(-this.radius, -2 * this.radius);

					// Top Rectangle
					this.createTopRectangle()
					break;
			}
			this.context.fillStyle = "#000";
			this.context.textAlign = "center";
			this.context.fillText(str, vm.cx + this.radius, vm.cy + this.radius - 15);
		},

		toRadians: function (deg) {
			return deg * Math.PI / 180;
		},

		createTopRectangle: function () {
			this.context.fillStyle = '#fff';
			this.context.beginPath();
			this.context.moveTo(this.cx + 10, this.cy);
			this.context.lineTo(this.cx + 2 * this.radius - 10, this.cy);
			this.context.quadraticCurveTo(this.cx + 2 * this.radius, this.cy, this.cx + 2 * this.radius, this.cy + 10);
			this.context.lineTo(this.cx + 2 * this.radius, this.cy + 35 - 10);
			this.context.quadraticCurveTo(this.cx + 2 * this.radius, this.cy + 35, this.cx + 2 * this.radius - 10, this.cy + 35);
			this.context.lineTo(this.cx + 10, this.cy + 35);
			this.context.quadraticCurveTo(this.cx, this.cy + 35, this.cx, this.cy + 35 - 10);
			this.context.lineTo(this.cx, this.cy + 10);
			this.context.quadraticCurveTo(this.cx, this.cy, this.cx + 10, this.cy);
			this.context.closePath();
			this.context.fill();
		},

		clearCanvas: function () {
			this.context.translate(this.radius, 2 * this.radius);
			this.context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
			this.context.translate(-this.radius, -2 * this.radius);
		},

		accelerationChanged: function (acceleration) {
			this.changeSpeed({
				acceleration: acceleration
			});
		},

		onTouchStart: function (event) {
			this.touchEvent = event;
			this.changeSpeed();
			this.touchInterval = setInterval(this.changeSpeed, 2 * this.frameInterval);
		},

		onTouchEnd: function (event) {
			this.touchEvent = null;
			clearInterval(this.touchInterval);
		},

		changeSpeed: function (event) {
			let vm = this;

			if (this.touchEvent) {
				//Touch event
				if ((this.touchEvent.touches && this.touchEvent.touches[0].clientX > this.cx) ||
					//Mouse event
					(this.touchEvent.clientX > this.cx)) {
					this.vx += 10;
				} else {
					this.vx -= 10;
				}
			} else if (event.acceleration) {
				// Accelerometer
				if (this.paused || this.onSlope) return;
				if (event.acceleration.x < -4.5) {
					if (event.acceleration.y > 4.75) {
						this.vx -= 10;
					}
					else if (event.acceleration.y < -4.75) {
						this.vx += 10;
					}
				} else if (event.acceleration.x <= 4.5 && event.acceleration.x >= -4.5) {
					if (event.acceleration.y > 4.75) {
						this.vx += 10;
					}
					else if (event.acceleration.y < -4.75) {
						this.vx -= 10;
					}
				} else if (event.acceleration.x > 4.5) {
					if (event.acceleration.y > 4.75) {
						this.vx += 10;
					}
					else if (event.acceleration.y < -4.75) {
						this.vx -= 10;
					}
				}
			}
			// Keyboard event
			else {
				switch (event.keyCode) {
					case 37:
						this.vx -= 10;
						break;
					case 39:
						this.vx += 10;
						break;
				}
			}
			setTimeout(function () {
				vm.vx = 0;
			}, this.frameInterval);
		},

		calcY: function (x) {
			return ((-this.height / mainCanvas.width) * x + mainCanvas.height);
		},

		onFractionAdded: function (event) {
			this.userFractions.push({
				num: event.numerator,
				den: event.denominator
			});
		},

		onBallSelected: function (event) {
			let vm = this;
			this.clearCanvas();
			if (event.ball == "journal-ball") {
				this.insertImage('ball');
				return;
			}

			this.img.src = 'images/' + event.ball + '.svg';
			switch (event.ball) {
				case 'rugbyball':
				case 'soccerball':
					document.body.style.backgroundImage = 'url(images/grass_background.png)';
					break;
				case 'bowlingball':
				case 'basketball':
					document.body.style.backgroundImage = 'url(images/parquet_background.png)';
					break;
				case 'feather':
					document.body.style.backgroundImage = 'url(images/feather_background.png)';
					break;
				case 'beachball':
					document.body.style.backgroundImage = 'url(images/beach_background.png)';
					break;
			}
		},

		onBgSelected: function (event) {
			let vm = this;
			if (event.bg == "journal-bg") {
				this.insertImage('bg');
				return;
			}
			document.body.style.backgroundSize = 'cover';
			switch (event.bg) {
				case 'grass':
					document.body.style.backgroundImage = 'url(images/grass_background.png)';
					break;
				case 'wood':
					document.body.style.backgroundImage = 'url(images/parquet_background.png)';
					break;
				case 'clouds':
					document.body.style.backgroundImage = 'url(images/feather_background.png)';
					break;
				case 'sand':
					document.body.style.backgroundImage = 'url(images/beach_background.png)';
					break;
			}
		},

		insertImage: function (to) {
			let vm = this;
			requirejs(["sugar-web/datastore", "sugar-web/graphics/journalchooser"], function (datastore, journalchooser) {
				setTimeout(function () {
					journalchooser.show(function (entry) {
						if (!entry) {
							if (to == 'ball') {
								vm.img.onload();
							}
							return;
						}
						var dataentry = new datastore.DatastoreObject(entry.objectId);
						dataentry.loadAsText(function (err, metadata, data) {
							if (to == 'ball') {
								vm.img.src = data;
							} else if (to == 'bg') {
								document.body.style.backgroundImage = 'url(' + data + ')';
								document.body.style.backgroundSize = 'contain';
							}
						});
					}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
				}, 0);
			});
		},

		changeMode: function (mode) {
			this.mode = mode;
		},

		onHelp: function (type) {
			var steps = [
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: this.l10n.stringTutoTitle,
					content: this.l10n.stringTutoContent
				},
				{
					element: "#mainCanvas",
					placement: "top",
					backdrop: false,
					title: this.l10n.stringTutoBallTitle,
					content: this.l10n.stringTutoBallContent
				},
				{
					element: "#mainCanvas",
					placement: "top",
					title: this.l10n.stringTutoBallControlsTitle,
					content: this.l10n.stringTutoBallControlsContent
				},
				{
					element: "#slopeCanvas",
					placement: "top",
					backdrop: false,
					title: this.l10n.stringTutoSlopeTitle,
					content: this.l10n.stringTutoSlopeContent
				},
				{
					element: ".log",
					placement: "right",
					title: this.l10n.stringTutoLogTitle,
					content: this.l10n.stringTutoLogContent
				},
				{
					element: "#play-button",
					placement: "bottom",
					title: this.l10n.stringTutoPlayTitle,
					content: this.l10n.stringTutoPlayContent
				},
				{
					element: "#pause-button",
					placement: "bottom",
					title: this.l10n.stringTutoPlayTitle,
					content: this.l10n.stringTutoPlayContent
				},
				{
					element: "#settings-button",
					placement: "bottom",
					title: this.l10n.stringTutoSettingsTitle,
					content: this.l10n.stringTutoSettingsContent
				},
				{
					element: "#ball-button",
					placement: "bottom",
					title: this.l10n.stringTutoBallSelectTitle,
					content: this.l10n.stringTutoBallSelectContent
				},
				{
					element: "#bg-button",
					placement: "bottom",
					title: this.l10n.stringTutoBgSelectTitle,
					content: this.l10n.stringTutoBgSelectContent
				},
				{
					element: "#fractions-button",
					placement: "bottom",
					title: this.l10n.stringTutoFractionsModeTitle,
					content: this.l10n.stringTutoFractionsModeContent
				},
				{
					element: "#sectors-button",
					placement: "bottom",
					title: this.l10n.stringTutoSectorsModeTitle,
					content: this.l10n.stringTutoSectorsModeContent
				},
				{
					element: "#percents-button",
					placement: "bottom",
					title: this.l10n.stringTutoPercentsModeTitle,
					content: this.l10n.stringTutoPercentsModeContent
				}
			];
			this.$refs.SugarTutorial.show(steps);
		},

		onStop: function () {
			// Save current library in Journal on Stop
			var context = {
				userFractions: this.userFractions
			}
			this.$refs.SugarJournal.saveData(context);
			this.$refs.SugarDevice.vibrate(100);
		}
	}
});