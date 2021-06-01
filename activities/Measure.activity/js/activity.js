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
		num_of_samples_time: 1024,
		num_of_divs: 20,
		freq_div: 100,
		fftSize: 1024,
		freqDomainData: [],
		num_of_samples_freq: 4096
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
		createAnalyserNode: function(stream, fft_size) {

			// Create and init a Web Audio Analyser node
			this.context = new AudioContext();
			this.source = this.context.createMediaStreamSource(stream);
			this.analyser = this.context.createAnalyser();
			this.analyser.smoothingTimeConstant = 0;
			this.analyser.fftSize = fft_size;

			this.processor = this.context.createScriptProcessor(this.analyser.fftSize, 1, 1);
			this.timeDomainData = new Float32Array(this.analyser.fftSize);
			this.source.connect(this.analyser);
			this.analyser.connect(this.processor);
			this.processor.connect(this.context.destination);

		},
		setTimeDomain: function(stream) {
			document.getElementById("domainName").innerText = 'Time'
			document.getElementById("scaleValue").innerText = this.time_div*1000;

			this.createAnalyserNode(stream, this.fftSize);

			this.processor.addEventListener('audioprocess', (e) => {
				if(!this.play) return;
				this.analyser.getFloatTimeDomainData(this.timeDomainData)
				
				this.num_of_divs = this.canvas.width/50; // 50 is width of one div
				var total_time_duration = this.time_div*this.num_of_divs;

				// Formula: num_of_samples_time = sampling_frequency*total_time_duration 
				this.num_of_samples_time = Math.ceil(total_time_duration*48000); //48000 is sampling frequency
				this.drawWaveform()
			})
		},
		calcFreqDomainData: function() {

			this.num_of_divs = this.canvas.width / 50; // 50 is width of one div
			var total_freq = this.freq_div * this.num_of_divs;

			this.freqDomainData = []
			for (var i = 0; i < this.fftSize; i++) {
				if(this.timeDomainData[i]) {
					this.freqDomainData.push(this.timeDomainData[i]);
				}
				else {
					this.freqDomainData.push(0);
				}
			}

			var imag = []
			for (var i = 0; i < this.fftSize; i++) {
				imag.push(0);
			}

			transform(this.freqDomainData, imag)

			for (var i = 0; i < this.fftSize; i++) {
				this.freqDomainData[i] = Math.min(
					100,
					Math.sqrt(Math.pow(this.freqDomainData[i], 2) + Math.pow(imag[i], 2))
				)
			}
			// if (window.cordova || window.PhoneGap) {
			// 	this.num_of_samples_freq = total_freq;
			// }
			// else {
				this.num_of_samples_freq = total_freq / 12;
			// }

			this.drawWaveform()
		},
		setFreqDomain: function(stream) {
			document.getElementById("domainName").innerText = 'Frequency'
			document.getElementById("scaleValue").innerText = this.freq_div + ' Hz';

			this.fftSize = 4096;
			this.createAnalyserNode(stream, this.fftSize);

			this.processor.addEventListener('audioprocess', (e) => {
				if (!this.play) return;
				this.analyser.getFloatTimeDomainData(this.timeDomainData)
				this.calcFreqDomainData();
			})

		},
		drawWaveform: function() {
			var canvasCtx = this.canvas.getContext("2d");
			this.drawGrid();
			canvasCtx.lineWidth = 3;
			canvasCtx.strokeStyle = 'red';

			canvasCtx.beginPath();
			
			var x = 0;
			var samples = (this.time_domain) ? this.num_of_samples_time : this.num_of_samples_freq;

			var sliceWidth = this.canvas.width * 1.0 / samples;

			for (var i = 0; i < samples;i++) {
				let y = (this.time_domain) ? this.mapCoords(this.timeDomainData[i], -1, 1, 0, this.canvas.height) 
					: this.mapCoords(-1 * this.freqDomainData[i], 0, 100, this.canvas.height / 1.01, 2 * this.canvas.height);
				if(i == 0) {
					canvasCtx.moveTo(x,y);
				}
				else {
					canvasCtx.lineTo(x,y);
				}
				x += sliceWidth;
			}

			// if(this.time_domain) {
			// 	canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
			// }
			// else {
			// 	canvasCtx.lineTo(this.canvas.width, this.canvas.height / 1.01);
			// }
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
		onAudioInput: function(e) {
			if (!this.play) return;

			this.timeDomainData = e.data;

			// if(this.time_domain) {
			// 	this.num_of_divs = this.canvas.width / 50; // 50 is width of one div
			// 	var total_time_duration = this.time_div * this.num_of_divs;
			// 	this.num_of_samples_time = Math.ceil(total_time_duration * 48000); //48000 is sampling frequency
			// 	this.drawWaveform()
			// }
			// else {
				this.calcFreqDomainData()
			// }
		},
		onDeviceReady: function() {

			window.addEventListener("audioinput", this.onAudioInput, false)
			this.init()
			// if(this.time_domain) {
			// 	document.getElementById("domainName").innerText = 'Time'
			// 	document.getElementById("scaleValue").innerText = (this.time_div * 1000) + ' ms';
			// }
			// else {
				this.time_domain = false;
				document.getElementById("domainName").innerText = 'Frequency'
				document.getElementById("scaleValue").innerText = this.freq_div + ' Hz';
			// }
			audioinput.start({
				bufferSize: 4096,
				streamToWebAudio: false
			});
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
					// if (this.time_domain) {
					// 	this.setTimeDomain(stream)
					// }
					// else {
						this.time_domain = false;
						this.setFreqDomain(stream)
					// }
				})
				.catch((err) => alert('Please allow microphone access'))
		}
	}
});
