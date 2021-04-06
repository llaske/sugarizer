// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		canvas: '',
		context: '',
		analyser: '',
		processor: '',
		time_domain: true,
		timeDomainData: [],
		play: true,
		time_div: 0.0005,
		num_of_samples: 1024,
		num_of_divs: 20
	},
	methods: {
		init: function() {
			
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight - 55 - (document.getElementById("axisScale").clientHeight);

			window.addEventListener("resize", () => {
				this.resizeCanvas()
			})
			this.drawGrid();
		},
		resizeCanvas: function() {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight - 55 - (document.getElementById("axisScale").clientHeight);
		},
		setTimeDomain: function(stream) {
			document.getElementById("domainName").innerText = 'Time'
			document.getElementById("scaleValue").innerText = this.time_div*1000;

			// Create and init a Web Audio Analyser node
			if (window.cordova || window.PhoneGap) {
				this.context = audioinput.getAudioContext();
				this.source = audioinput;
			}
			else {
				this.context = new AudioContext();
				this.source = this.context.createMediaStreamSource(stream);
			}
			this.analyser = this.context.createAnalyser();
			this.analyser.smoothingTimeConstant = 0;
			this.analyser.fftSize = 1024;
			
			this.processor = this.context.createScriptProcessor(this.analyser.fftSize, 1, 1);
			this.timeDomainData = new Float32Array(this.analyser.fftSize);
			this.source.connect(this.analyser);
			this.analyser.connect(this.processor);
			this.processor.connect(this.context.destination);
			this.processor.addEventListener('audioprocess', (e) => {
				if(!this.play) return;
				this.analyser.getFloatTimeDomainData(this.timeDomainData)
				
				this.num_of_divs = this.canvas.width/50; // 50 is width of one div
				var total_time_duration = this.time_div*this.num_of_divs;

				// Formula: num_of_samples = sampling_frequency*total_time_duration 
				this.num_of_samples = Math.ceil(total_time_duration*48000); //48000 is sampling frequency
				this.drawWaveform()
			})
		},
		drawWaveform: function() {
			var canvasCtx = this.canvas.getContext("2d");
			this.drawGrid();
			canvasCtx.lineWidth = 3;
			canvasCtx.strokeStyle = 'red';

			canvasCtx.beginPath();
			
			var sliceWidth = this.canvas.width*1.0/this.num_of_samples;
			var x = 0;
			for(var i=0;i<this.num_of_samples;i++) {
				let y = this.mapCoords(this.timeDomainData[i], -1, 1, 0, this.canvas.height);
				if(i == 0) {
					canvasCtx.moveTo(x,y);
				}
				else {
					canvasCtx.lineTo(x,y);
				}
				x += sliceWidth;
			}
			canvasCtx.lineTo(this.canvas.width, this.canvas.height/2);
			canvasCtx.stroke();
		},
		drawGrid: function() {
			var canvasCtx = this.canvas.getContext("2d");

			canvasCtx.fillStyle = 'black';
			canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			canvasCtx.fillStyle = 'grey';
			for (var i = 0; i < this.canvas.width; i = i + 50) {
				canvasCtx.fillRect(i, 0, 1, this.canvas.height)
			}
			for (var i = 0; i < this.canvas.height; i = i + 50) {
				canvasCtx.fillRect(0, i, this.canvas.width, 1)
			}
		},
		mapCoords: function(value, a, b, c, d) {
			value = (value - a) / (b - a);
			return c + value * (d - c);
		},
		playOrPause: function() {
			this.play = !this.play;
			if(this.play) {
				document.getElementById("play-button").style.display = "initial";
				document.getElementById("pause-button").style.display = "none";
			}
			else {
				document.getElementById("play-button").style.display = "none";
				document.getElementById("pause-button").style.display = "initial";
			}
		},
		onDeviceReady: function() {
			console.log("Hello")
			console.log("cordova from ondevice", window.cordova)
			console.log("audioinput from ondevice", window.audioinput)
			this.init()
			audioinput.start({
				streamToWebAudio: true
			});
			this.setTimeDomain(null)
		}
	},
	mounted() {
		this.canvas = document.getElementById("mainCanvas");
		if (window.cordova || window.PhoneGap) {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		}
		else {
			this.init()
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then((stream) => {
					if (this.time_domain) {
						this.setTimeDomain(stream)
					}
				})
				.catch((err) => alert('Please allow microphone access'))
		}
	}
});
