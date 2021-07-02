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
		currentenv: null,
		SugarL10n: null,
		canvas: '',
		context: '',
		analyser: '',
		processor: '',
		webAudio_mediaStreamSource: '',
		time_domain: true,
		timeDomainData: [],
		play: true,
		time_div: 0.0005,
		num_of_samples_time: 1024,
		num_of_divs: 20,
		freq_div: 500,
		fftSize: 4096,
		freqDomainData: [],
		num_of_samples_freq: 4096,
		fullscreen: false,
		time_int_arr: [],
		invert_waveform: false,
		amp_value: 1,
		log_interval: 0.1,
		is_recording: false,
		setInterval_id: null,
		log_data: [],
		log_session_obj: {
			mode: '',
			interval: 0,
			date: '',
			data: []
		},
		trigEdge: 0, // 0 for none, 1 for rising edge, 2 for falling edge
		l10n: {
			stringPlay: '',
			stringPause: '',
			stringTimeDomain: '',
			stringFreqDomain: '',
			stringZoomInOut: '',
			stringFullScreen: '',
			stringUnFullScreen: '',
			stringWaveformSettings: '',
			stringExportSettings: '',
			stringLoggingInterval: '',
			stringRecordOff: '',
			stringRecordOn: '',
			stringCaptureImage: '',
			stringNone: '',
			stringRisingEdge: '',
			stringFallingEdge: ''
		}
	},
	methods: {
		initialized: function () {
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
		},
		localized: function () {
			this.freq_base_string = this.SugarL10n.get("FrequencyBase");
			this.time_base_string = this.SugarL10n.get("TimeBase");
			document.getElementById("axis").innerText = this.SugarL10n.get("axisString");
			document.getElementById("scale").innerText = this.SugarL10n.get("scaleString");
			document.getElementById("division").innerText = this.SugarL10n.get("divisionString");
			if (this.time_domain) {
				document.getElementById("domainName").innerText = this.time_base_string;
				document.getElementById("scaleValue").innerText = (this.time_div * 1000).toFixed(2) + ' ms';
				this.setZoomSlider();
			}
			else {
				document.getElementById("domainName").innerText = this.freq_base_string;
				document.getElementById("scaleValue").innerText = this.freq_div + ' Hz';
				this.setZoomSlider();
			}
			document.getElementById("zoom-in-button").title = this.SugarL10n.get("zoomIn");
			document.getElementById("zoom-out-button").title = this.SugarL10n.get("zoomOut");
			document.getElementById("amp-low-button").title = this.SugarL10n.get("decreaseAmp");
			document.getElementById("amp-high-button").title = this.SugarL10n.get("increaseAmp");
			document.getElementById("invert-on-button").title = this.SugarL10n.get("InvertWaveform");
			document.getElementById("invert-off-button").title = this.SugarL10n.get("NormalWaveform");
			document.getElementById("AmpTitle").innerText = this.SugarL10n.get("AmpTitle");
			document.getElementById("WaveformTitle").innerText = this.SugarL10n.get("WaveformTitle");
			document.getElementById("csv-export").title = this.SugarL10n.get("exportAsCSV");
			document.getElementById("pdf-export").title = this.SugarL10n.get("exportAsPDF");
			this.SugarL10n.localize(this.l10n);
		},
		init: function() {
			
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight - 55 - (document.getElementById("axisScale").clientHeight);

			window.addEventListener("resize", () => {
				this.resizeCanvas()
			})
			this.drawGrid();
		},
		resizeCanvas: function(scaleWidth = 55) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight - scaleWidth - (document.getElementById("axisScale").clientHeight);
			this.drawWaveform();
		},
		fullscreenOrUnfullscreen: function() {
			this.fullscreen = !this.fullscreen;

			if(this.fullscreen) {
				document.getElementById("main-toolbar").style.height = "0px";
				document.getElementById("unfullscreen-button").style.display = "initial";
				document.getElementById("fullscreen-button").style.display = "none";
				this.resizeCanvas(0);
			}
			else {
				document.getElementById("main-toolbar").style.height = "55px";
				document.getElementById("unfullscreen-button").style.display = "none";
				document.getElementById("fullscreen-button").style.display = "initial";
				this.resizeCanvas();
			}
		},
		createAnalyserNode: function(stream, fft_size) {

			// Create and init a Web Audio Analyser node
			this.context = new (window.AudioContext || window.webkitAudioContext)();
			this.source = this.context.createMediaStreamSource(stream);
			this.analyser = this.context.createAnalyser();
			this.analyser.smoothingTimeConstant = 0;
			this.analyser.fftSize = fft_size;
			this.processor = this.context.createScriptProcessor(this.analyser.fftSize, 1, 1);
			this.timeDomainData = new Float32Array(this.analyser.fftSize);
			this.time_int_arr = new Uint8Array(this.analyser.fftSize);
			this.source.connect(this.analyser);
			this.analyser.connect(this.processor);
			this.processor.connect(this.context.destination);

		},
		calcTimeDomainData: function() {

			// // Calculate Time Domain Data
			this.num_of_divs = this.canvas.width / 50; // 50 is width of one div
			var total_time_duration = this.time_div * this.num_of_divs;
			this.num_of_samples_time = Math.ceil(total_time_duration * 48000); //48000 is sampling frequency
			this.drawWaveform()
		},
		calcFreqDomainData: function() {

			// Calculate Frequency Domain Data
			this.num_of_divs = this.canvas.width / 50;
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
			if (window.cordova || window.PhoneGap) {
				this.num_of_samples_freq = total_freq / 44;
			}
			else {
				this.num_of_samples_freq = total_freq / 12;
			}

			this.drawWaveform()
		},
		getWebAudioTimeData: function() {

			//get time data from web audio
			if(this.analyser.getFloatTimeDomainData) {
				this.analyser.getFloatTimeDomainData(this.timeDomainData)
			}
			else {
				this.analyser.getByteTimeDomainData(this.time_int_arr);
				this.timeDomainData = []
				for(var i=0;i<this.fftSize;i++) {
					var val = (this.time_int_arr[i] - 128) * 0.0078125;
					this.timeDomainData.push(val);
				}
			}
		},
		setTimeDomain: function () {

			this.processor.addEventListener('audioprocess', (e) => {
				if (!this.play) return;
				this.getWebAudioTimeData();
				this.calcTimeDomainData();
			})
		},
		setFreqDomain: function() {

			this.processor.addEventListener('audioprocess', (e) => {
				if (!this.play) return;
				this.getWebAudioTimeData();
				this.calcFreqDomainData();
			})

		},
		drawWaveform: function() {
			// Plotting of waveform on canvas
			var canvasCtx = this.canvas.getContext("2d");
			this.drawGrid();
			canvasCtx.lineWidth = 3;
			canvasCtx.strokeStyle = 'red';

			canvasCtx.beginPath();
			
			var x = 0;
			var samples = (this.time_domain) ? this.num_of_samples_time : this.num_of_samples_freq;

			var start = 0;
			var sliceWidth = this.canvas.width * 1.0 / samples;
			var is_trig = false;

			if (this.time_domain && (this.trigEdge == 1 || this.trigEdge == 2)) {

				is_trig = true;

				if(this.trigEdge == 1) {
					for(var i=0;i<samples;i++) {
						if (this.timeDomainData[i] > 0) {
							start = i;
							break;
						}
					}
				}
				else {
					for (var i = 0; i < samples; i++) {
						if (this.timeDomainData[i] < 0) {
							start = i;
							break;
						}
					}
				}
				sliceWidth = this.canvas.width * 1.0 / (samples - start + 1);
				x += sliceWidth;
				canvasCtx.moveTo(0, this.canvas.height/2);
			}

			for (var i = start; i < samples;i++) {
				var time_amp = this.timeDomainData[i];
				if(this.invert_waveform) {
					time_amp = -1*time_amp;
				}
				let y = (this.time_domain) ? this.mapCoords(-1*this.amp_value*time_amp, -1, 1, 0, this.canvas.height)
					: this.mapCoords(this.amp_value *-1 * this.freqDomainData[i], 0, 100, this.canvas.height / 1.01, 2 * this.canvas.height);
				if(i == 0 && !is_trig) {
					canvasCtx.moveTo(x,y);
				}
				else {
					canvasCtx.lineTo(x,y);
				}
				x += sliceWidth;
			}

			canvasCtx.stroke();
		},
		drawGrid: function() {
			// Drawing grid on canvas
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
			// to bring value in range
			value = (value - a) / (b - a);
			return c + value * (d - c);
		},
		playOrPause: function() {

			// Switch between play and pause mode
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
		TimeOrFreq: function() {

			// Switch between Time and Frequency Domain

			if(this.setInterval_id) {
				this.stopRecord()
			}

			this.time_domain = !this.time_domain;

			if(this.time_domain) {
				document.getElementById("time-domain-button").style.display = "initial";
				document.getElementById("freq-domain-button").style.display = "none";
				document.getElementById("domainName").innerText = this.time_base_string;
				document.getElementById("scaleValue").innerText = (this.time_div * 1000).toFixed(2) + ' ms';
				this.setZoomSlider();
				this.calcTimeDomainData();
				if (!(window.cordova || window.PhoneGap)) {
					this.setTimeDomain();
				}
			}
			else {
				document.getElementById("time-domain-button").style.display = "none";
				document.getElementById("freq-domain-button").style.display = "initial";
				document.getElementById("domainName").innerText = this.freq_base_string;
				document.getElementById("scaleValue").innerText = this.freq_div + ' Hz';
				this.setZoomSlider();
				this.calcFreqDomainData();
				if (!(window.cordova || window.PhoneGap)) {
					this.setFreqDomain();
				}
			}
		},
		setZoomSlider: function () {
			var slider = document.getElementById("zoomSlider");
			if (this.time_domain) {
				slider.min = "0";
				slider.max = "95";
				slider.step = "0.00001";
				var val = (this.time_div - 0.00005) / 0.00001;
				val = Math.round(val * 100000) / 100000;
				slider.value = val;
			}
			else {
				slider.min = "50";
				slider.max = "1000";
				slider.step = "10";
				slider.value = this.freq_div;
			}
		},
		ZoomInOut: function() {

			var slider_value = document.getElementById("zoomSlider").value;
			if(this.time_domain) {
				var time_div_value = 0.00005 + 0.00001 * parseFloat(slider_value);
				this.time_div = Math.round(time_div_value * 100000) / 100000;
				this.calcTimeDomainData();
				document.getElementById("scaleValue").innerText = (this.time_div * 1000).toFixed(2) + ' ms';
			}
			else {
				var freq_div_value = parseInt(slider_value);
				this.freq_div = freq_div_value;
				this.calcFreqDomainData();
				document.getElementById("scaleValue").innerText = this.freq_div + ' Hz';
			}
		},
		decrementZoom: function() {
			if (this.time_domain) {
				this.time_div = this.time_div - 0.00001;
			}
			else {
				this.freq_div = this.freq_div - 10;
			}
			this.setZoomSlider();
			this.ZoomInOut();
		},
		incrementZoom: function() {
			if(this.time_domain) {
				this.time_div = this.time_div + 0.00001;
			}
			else {
				this.freq_div = this.freq_div + 10;
			}
			this.setZoomSlider();
			this.ZoomInOut();
		},
		invertWaveform: function() {

			// function to switch between invert and normal waveform

			if(!this.time_domain) {
				return;
			}
			this.invert_waveform = !this.invert_waveform;
			if (this.invert_waveform) {
				document.getElementById("invert-on-button").style.display = "initial";
				document.getElementById("invert-off-button").style.display = "none";
				document.getElementById("waveformStatus").innerText = 'Inverted';
			}
			else {
				document.getElementById("invert-on-button").style.display = "none";
				document.getElementById("invert-off-button").style.display = "initial";
				document.getElementById("waveformStatus").innerText = 'Normal';
			}
			this.drawWaveform();
		},
		decreaseAmp: function() {
			var val = parseInt(document.getElementById("ampSlider").value);
			document.getElementById("ampSlider").value = val - 1;
			this.ampSettings();
		},
		increaseAmp: function() {
			var val = parseInt(document.getElementById("ampSlider").value);
			document.getElementById("ampSlider").value = val + 1;
			this.ampSettings();
		},
		ampSettings: function () { 
			var slider_val = parseInt(document.getElementById("ampSlider").value);
			this.amp_value = 0.1*slider_val;
			this.drawWaveform();
		},
		exportFile: function(e) {
			var format = e.format;
			if(e.format == 'csv') {
				this.generateCSV();
			}
			else if(e.format == 'pdf'){
				this.generatePDF();
			}
		},
		generateCSV: function() {
			var csvContent = this.SugarL10n.get("Session") + ";"
			csvContent += this.SugarL10n.get("Mode") + ";"
			csvContent += this.SugarL10n.get("Date") + ";"
			csvContent += this.SugarL10n.get("Interval") + ";"
			csvContent += "S.No" + ";"
			csvContent += this.SugarL10n.get("Value") +  "\n";
			var i=1;
			for (var session of this.log_data) {

				var data_size = session.data.length;

				for (var j = 0; j < data_size; j++) {

					csvContent += i + ';';
					csvContent += session.mode + ';';
					csvContent += session.date + ';';

					csvContent += this.log_interval + ";";

					csvContent += j + ';' + session.data[j] + '\n';
				}
				i += 1;
			}

			var vm = this;
			var metadata = {
				mimetype: 'text/plain',
				title: this.SugarL10n.get("MeasureLoggingBy", { name: vm.currentenv.user.name}) + ".txt",
				activity: "org.olpcfrance.Measure",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};

			vm.$root.$refs.SugarJournal.createEntry(csvContent, metadata)
				.then(() => {
					vm.$root.$refs.SugarPopup.log(this.SugarL10n.get("exportedLogAsCSV"));
				});
		},
		canvasToImage(path) {
			if (path.indexOf('data:image/png') != -1) {
				return Promise.resolve(path);
			}
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.src = path;
				img.onload = () => {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").drawImage(img, 0, 0);
					resolve({
						dataURL: canvas.toDataURL("image/png"),
						width: img.width,
						height: img.height
					});
				}
			});
		},
		addCoverToPDF: function(doc) {
			let vm = this;
			return new Promise((resolve, reject) => {
				doc.setFontStyle("bold");
				doc.setFontSize(20);
				doc.text(105, 100, this.SugarL10n.get('TimeLoggingDetails'), { align: "center" });
				vm.$root.$refs.SugarIcon.generateIconWithColors("../icons/owner-icon.svg", vm.currentenv.user.colorvalue)
					.then(src => {
						vm.canvasToImage(src)
							.then(res => {
								doc.addImage(res.dataURL, 90, 110, 30, 30);
								// Next section
								resolve();
							});
					});
				doc.text(105, 150, vm.currentenv.user.name, { align: "center" });
				doc.setFontSize(16);
				doc.setFontStyle("normal");
			})
		},
		generatePDF: function() {

			let vm = this;
			var doc = new jsPDF();
			this.addCoverToPDF(doc)
				.then(() => {

					var x = 10;
					var y = 15;
					var i = 1;
					var pageHeight = 285;
					for (var session of this.log_data) {
						
						doc.addPage();
						y = 15;

						doc.setFontSize(18);
						doc.setFontStyle("bold");
						doc.text(x, y, this.SugarL10n.get("Session") + ": " + i);
						doc.setFontStyle("normal");
						doc.text(this.SugarL10n.get("Mode") + ":     " + session.mode, x, y + 14);
						if (this.log_interval == 300) {
							doc.text(this.SugarL10n.get("Interval") + ":   5" + " " + this.SugarL10n.get("Minutes_other"), x, y + 21);
						}
						else {
							doc.text(this.SugarL10n.get("Interval") + ":   " + this.log_interval + ' ' + this.SugarL10n.get("Second"), x, y + 21);
						}
						doc.text(this.SugarL10n.get("Date") + ":       " + session.date, x, y + 28);
						y = y + 42;
						doc.line(x, y-5, x+90, y-5);
						doc.text("S.No", x + 10, y+1);
						doc.text(this.SugarL10n.get("Value"), x + 65, y+1);
						doc.line(x, y + 3, x+90, y + 3);
						doc.line(x, y-5, x, y+3);
						doc.line(x + 50, y - 5, x + 50, y + 3);
						doc.line(x+90, y - 5, x+90, y + 3);

						var data_size = session.data.length;

						if(data_size != 0) {
							doc.line(x, y + 3, x, y + 9);
							doc.line(x + 50, y + 3, x + 50, y + 9);
							doc.line(x + 90, y + 3, x + 90, y + 9);
						}

						y = y+8;

						doc.setFontSize(14);

						for (var j = 0; j < data_size; j++) {
							if (y > pageHeight) {
								doc.addPage();
								y = 15;
								doc.line(x, y - 7, x, y + 7);
								doc.line(x + 50, y - 7, x + 50, y + 7);
								doc.line(x+90, y - 7, x+90, y + 7);
							}

							doc.text(j + '', x + 10, y);
							doc.text('' + session.data[j], x + 65, y);
							doc.line(x, y + 1, x+90, y + 1);
							if(j <data_size-1) {
								doc.line(x, y + 1, x, y + 8);
								doc.line(x + 50, y + 1, x + 50, y + 8);
								doc.line(x+90, y + 1, x+90, y + 8);
							}
							y += 7;
						}
						y += 7;
						i += 1;
					}
					
					metadata = {
						mimetype: 'application/pdf',
						title: this.SugarL10n.get("MeasureLoggingBy", { name: vm.currentenv.user.name }) + ".pdf",
						activity: "org.olpcfrance.Measure",
						timestamp: new Date().getTime(),
						creation_time: new Date().getTime(),
						file_size: 0
					};

					vm.$root.$refs.SugarJournal.createEntry(doc.output('dataurlstring'), metadata)
						.then(() => {
							vm.$root.$refs.SugarPopup.log(this.SugarL10n.get("exportedLogAsPDF"));
						});

				});

		},
		logInterval: function(e) {
			this.log_interval = e.secondVal;
		},
		getSessionDate: function(){
			var d = new Date()
			var completeDate = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
			var completeTime = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
			return completeDate + ' ' + completeTime;
		},
		startRecord: function() {
			this.is_recording = true;
			document.getElementById("record-off-button").style.display = "none";
			document.getElementById("record-on-button").style.display = "initial";
			document.getElementById("logging-interval-button").disabled = true;
			this.$root.$refs.SugarPopup.log(this.SugarL10n.get("recordingStarted"))
			this.log_session_obj.interval = '' + this.log_interval + ' second'
			this.log_session_obj.date = this.getSessionDate();
			this.log_session_obj.data = []
			if(this.time_domain) {
				this.log_session_obj.mode = 'Time'
				this.setInterval_id = setInterval(() => {
					var len = this.timeDomainData.length;
					var sum = 0;
					for(var i=0;i<len;i++) {
						sum += Math.abs(this.timeDomainData[i]);
					}
					var ans = sum / len;
					this.log_session_obj.data.push(ans.toFixed(2))
				}, this.log_interval * 1000);
			}
			else {
				this.log_session_obj.mode = 'Frequency'
				this.setInterval_id = setInterval(() => {
					var ans = this.amp_value*Math.max(...this.freqDomainData);
					this.log_session_obj.data.push(ans.toFixed(2))
				}, this.log_interval * 1000);
			}
		},
		stopRecord: function() {
			this.is_recording = false;
			document.getElementById("record-off-button").style.display = "initial";
			document.getElementById("record-on-button").style.display = "none";
			document.getElementById("logging-interval-button").disabled = false;
			this.$root.$refs.SugarPopup.log(this.SugarL10n.get("recordingEnded"));
			clearInterval(this.setInterval_id);
			this.log_data.push({...this.log_session_obj})
			this.setInterval_id = null;
		},
		onActivityStop: function() {
			if (this.setInterval_id) {
				this.stopRecord();
			}
		},
		captureImage: function() {
			var mimetype = 'image/jpeg';
			var inputData = this.canvas.toDataURL(mimetype, 1);
			var metadata = {
				mimetype: mimetype,
				title: "Measure Waveform Image",
				activity: "org.olpcfrance.Measure",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			var vm = this;
			vm.$root.$refs.SugarJournal.createEntry(inputData, metadata)
				.then(() => {
					vm.$root.$refs.SugarPopup.log(this.SugarL10n.get("CaptureImageDone"));
				});
		},
		triggeringEdge:function() {
			this.trigEdge += 1;

			if(this.trigEdge > 2) {
				this.trigEdge = 0;
			}

			if(this.trigEdge == 1) {
				document.getElementById("triggering-edge-none-button").style.display = "none";
				document.getElementById("triggering-edge-rising-button").style.display = "initial";
				document.getElementById("triggering-edge-falling-button").style.display = "none";
			}
			else if(this.trigEdge == 2) {
				document.getElementById("triggering-edge-none-button").style.display = "none";
				document.getElementById("triggering-edge-rising-button").style.display = "none";
				document.getElementById("triggering-edge-falling-button").style.display = "initial";
			}
			else {
				document.getElementById("triggering-edge-none-button").style.display = "initial";
				document.getElementById("triggering-edge-rising-button").style.display = "none";
				document.getElementById("triggering-edge-falling-button").style.display = "none";
			}
			this.drawWaveform();
		},
		onAudioInput: function(e) {

			// This function executes whenever stream from microphone is received (only for cordova) 
			if (!this.play) return;

			this.timeDomainData = e.data;

			if(this.time_domain) {
				this.calcTimeDomainData()
			}
			else {
				this.calcFreqDomainData()
			}
		},
		onDeviceReady: function() {

			window.addEventListener("audioinput", this.onAudioInput, false)

			this.init()

			audioinput.start({
				bufferSize: 4096,
				streamToWebAudio: false
			});
		}
	},
	mounted() {
		this.SugarL10n = this.$refs.SugarL10n;
		this.canvas = document.getElementById("mainCanvas");
		if (window.cordova || window.PhoneGap) {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		}
		else {
			this.init()
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then((stream) => {
					this.fftSize = 4096;
					this.createAnalyserNode(stream, this.fftSize);

					this.webAudio_mediaStreamSource = stream;

					if (this.time_domain) {
						this.setTimeDomain()
					}
					else {
						this.setFreqDomain()
					}
				})
				.catch((err) => alert('Please allow microphone access'))
		}
	}
});