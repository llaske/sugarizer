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
		time_div: 0.00005,
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
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then((stream) => {
					if (this.time_domain) {
						this.setTimeDomain(stream)
					}
				})
				.catch((err) => alert('Please allow microphone access'))
		},
		resizeCanvas: function() {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight - 55 - (document.getElementById("axisScale").clientHeight);
		},
		setTimeDomain: function(stream) {
			document.getElementById("scaleValue").innerText = "0.05";
			this.context = new AudioContext();
			this.analyser = this.context.createAnalyser();
			this.analyser.smoothingTimeConstant = 0;
			this.analyser.fftSize = 1024;
			this.source = this.context.createMediaStreamSource(stream);
			this.processor = this.context.createScriptProcessor(this.analyser.fftSize, 1, 1);
			this.timeDomainData = new Float32Array(this.analyser.fftSize);
			this.source.connect(this.analyser);
			this.analyser.connect(this.processor);
			this.processor.connect(this.context.destination);
			this.processor.addEventListener('audioprocess', (e) => {
				if(!this.play) return;
				this.analyser.getFloatTimeDomainData(this.timeDomainData)
				
				this.num_of_divs = this.canvas.width/50;
				var total_time_duration = this.time_div*this.num_of_divs;
				this.num_of_samples = Math.ceil(total_time_duration*48000);
				this.drawWaveform()
			})
		},
		drawWaveform: function() {
			var canvasCtx = this.canvas.getContext("2d");
			canvasCtx.fillStyle = 'white';
			canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			canvasCtx.lineWidth = 1;
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
		mapCoords: function(value, a, b, c, d) {
			value = (value - a) / (b - a);
			return c + value * (d - c);
		}
	},
	mounted() {
		this.canvas = document.getElementById("mainCanvas");
		this.init()
	}
});
