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
		SugarPresence: null,
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
		existing_instance_time_data: [],
		existing_instance_freq_data: [],
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
		instrument_data: {
			guitar: {
				notes: {
					'E1': 82.4069,
					'A2': 110,
					'D2': 146.832,
					'G2': 195.998,
					'B3': 246.942,
					'E3': 329.628
				}
			},
			violin: {
				notes: {
					'G2': 195.998,
					'D3': 293.665,
					'A4': 440,
					'E4': 659.255
				}
			},
			viola: {
				notes: {
					'C2': 130.813,
					'G2': 195.998,
					'D3': 293.665,
					'A4': 440
				}
			},
			cello: {
				notes: {
					'C1': 65.4064,
					'G1': 97.9989,
					'D2': 146.832,
					'A3': 220
				}
			},
			bass: {
				notes: {
					'E0': 41.2034,
					'A1': 55,
					'D1': 73.4162,
					'G1': 97.9989
				}
			},
			charango: {
				notes: {
					'E3': 329.63,
					'G3': 392,
					'A4': 440,
					'C4': 523.25,
					'E4': 659.26
				}
			},
			cavaquinho: {
				notes: {
					'D3': 293.665,
					'G3': 391.995,
					'B4': 493.883,
					'D4': 587.330
				}
			},
			ukulele: {
				notes: {
					'C3': 261.626,
					'E3': 329.628,
					'G3': 391.995,
					'A4': 440
				}
			},
			sitar: {
				notes: {
					'F2': 174.614,
					'C2': 130.813,
					'G2': 195.998,
					'C1': 65.4064,
					'G3': 391.995,
					'C3': 261.626,
					'C4': 523.251
				}
			},
			mandolin: {
				notes: {
					'G2': 195.998,
					'D3': 293.665,
					'A4': 440,
					'E4': 659.255
				}
			}
		},
		draw_note: false,
		note_index: -2,
		note_freq: 0,
		instrument_name: 'none',
		note_name: 'all', // used only for instrument other than none (for highlighting)
		notes_arr: ['A', 'A♯/B♭', 'B', 'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭',
			'G', 'G♯/A♭'],
		colors: ['#B20008', '#00588C', '#F8E800', '#7F00BF', '#4BFF3A', '#FFA109',
		'#00A0FF', '#BCCEFF', '#008009', '#F8E800', '#AC32FF', '#FFFFFF'],
		harmonic_colors: ['#b54e52', '#4a7187', '#d4cc63', '#a568c4', '#89ed80', '#edbd6f',
			'#8ac8ed', '#d7e0f7', '#558558', '#f2ed9b', '#d4a4f5', '#e6e3e3'],
		show_harmonics: false,
		show_tuning_line: false,
		play_note : false,
		tone_osc: null,
		freq_input_note_index: 0,
		freq_input_octave: 4,
		A0: 27.5,
		TWELTHROOT2: 1.05946309435929,
		C8: 4186.01,
		existing_instance: false,
		existing_instrument_settings: {},
		shared_instance: false,
		shared_mode_initialised: false,
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
			stringSelectInstrument: '',
			stringSelectNote: '',
			stringSelectOctave: '',
			stringTuningSettings: '',
			stringTutoExplainTitle: '',
			stringTutoExplainContent: '',
			stringTutoTimeFreqTitle: '',
			stringTutoTimeFreqContent: '',
			stringTutoZoomSettingsTitle: '',
			stringTutoZoomSettingsContent: '',
			stringTutoPlayPauseTitle: '',
			stringTutoPlayPauseContent: '',
			stringTutoAmplitudeTitle: '',
			stringTutoAmplitudeContent: '',
			stringTutoWaveformInversionTitle: '',
			stringTutoWaveformInversionContent: '',
			stringTutoTriggeringEdgeTitle: '',
			stringTutoTriggeringEdgeContent: '',
			stringTutoLoggingExplainTitle: '',
			stringTutoLoggingExplainContent: '',
			stringTutoLoggingIntervalTitle: '',
			stringTutoLoggingIntervalContent: '',
			stringTutoStartStopTitle: '',
			stringTutoStartStopContent: '',
			stringTutoExportLoggingPDFTitle: '',
			stringTutoExportLoggingPDFContent: '',
			stringTutoExportLoggingCSVTitle: '',
			stringTutoExportLoggingCSVContent: '',
			stringTutoInstrumentExplainTitle: '',
			stringTutoInstrumentExplainContent: '',
			stringTutoInstrumentSelectTitle: '',
			stringTutoInstrumentSelectContent: '',
			stringTutoNoteSelectTitle: '',
			stringTutoNoteSelectContent: '',
			stringTutoOctaveSelectTitle: '',
			stringTutoOctaveSelectContent: '',
			stringTutoShowHarmonicsTitle: '',
			stringTutoShowHarmonicsContent: '',
			stringTutoTuningFreqInputTitle: '',
			stringTutoTuningFreqInputContent: '',
			stringTutoTuningLineTitle: '',
			stringTutoTuningLineContent: '',
			stringTutoPlayStopNoteTitle: '',
			stringTutoPlayStopNoteContent: '',
			stringTutoCaptureWaveformTitle: '',
			stringTutoCaptureWaveformContent: ''
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
			document.getElementById("harmonics-on-button").title = this.SugarL10n.get("ShowHarmonicsTitle");
			document.getElementById("harmonics-off-button").title = this.SugarL10n.get("HideHarmonicsTitle");
			document.getElementById("triggering-edge-none-button").title = this.SugarL10n.get("None");
			document.getElementById("triggering-edge-rising-button").title = this.SugarL10n.get("RisingEdge");
			document.getElementById("triggering-edge-falling-button").title = this.SugarL10n.get("FallingEdge");
			document.getElementById("TriggeringEdgeTitle").innerText = this.SugarL10n.get("TriggeringEdge");
			if(this.trigEdge == 0) {
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("None");
			}
			else if(this.trigEdge == 1) {
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("RisingEdge");
			}
			else {
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("FallingEdge");
			}
			for (var instrument in app.instrument_data) {
				document.getElementById(`${instrument}_instrument`).innerText = this.SugarL10n.get(instrument);
			}
			document.getElementById('none').innerText = this.SugarL10n.get("None");
			var len = this.notes_arr.length;
			for (var i = 0; i < len; i++) {
				document.getElementById(`note_${i}`).innerText = this.SugarL10n.get(this.notes_arr[i]);
			}
			document.getElementById("tuning-line-on-button").title = this.SugarL10n.get("ShowTuningLine");
			document.getElementById("tuning-line-off-button").title = this.SugarL10n.get("HideTuningLine");
			document.getElementById("play-note-button").title = this.SugarL10n.get("playTitle");
			document.getElementById("stop-note-button").title = this.SugarL10n.get("stopTitle");
			document.getElementById("interval-0.1").innerText = this.SugarL10n.get("IntervalSecond", { interval: "1/10" });
			document.getElementById("interval-1").innerText = this.SugarL10n.get("IntervalSecond", { interval: 1 });
			document.getElementById("interval-30").innerText = this.SugarL10n.get("IntervalSecond", { interval: 30 });
			document.getElementById("interval-300").innerText = this.SugarL10n.get("IntervalMinute", { interval: 5 });
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
			this.calcTimeDomainData();
			this.calcFreqDomainData();
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
			var sliceWidth = this.canvas.width * 1.0 / (samples-1);
			var is_trig = false;

			if ((!this.time_domain) && this.draw_note) {

				if (this.note_index == -1) {
					var instrument_notes_obj = this.instrument_data[this.instrument_name]['notes'];
					var j = 0;
					for(var i in instrument_notes_obj) {
						var freq_val = instrument_notes_obj[i];
						var x_coord = (50 / this.freq_div) * freq_val;
						canvasCtx.fillStyle = this.colors[j];
						canvasCtx.fillRect(x_coord, this.canvas.height, 2, -1 * this.canvas.height);
						if (this.show_harmonics) {
							canvasCtx.fillStyle = this.harmonic_colors[j];
							for (var k = 0; k < 3; k++) {
								var x_val = (k + 2) * x_coord;
								canvasCtx.fillRect(x_val, this.canvas.height, 2, -1 * (this.canvas.height - (k + 1) * 50));
							}
						}
						j++;
					}
				}
				else {
					var note_x_coord = (50/this.freq_div)*this.note_freq;
					canvasCtx.fillStyle = this.colors[this.note_index];
					canvasCtx.fillRect(note_x_coord, this.canvas.height, 2, -1*this.canvas.height);
					if(this.show_harmonics) {
						canvasCtx.fillStyle = this.harmonic_colors[this.note_index];
						for(var i=0;i<3;i++) {
							var x_coord = (i+2)*note_x_coord;
							canvasCtx.fillRect(x_coord, this.canvas.height, 2, -1 * (this.canvas.height - (i+1)*50));
						}
					}
				}
			}

			if ((!this.time_domain) && this.show_tuning_line) {
				var tuning_freq = parseFloat(document.getElementById("tuning-freq").value);
				var x_value = (50 / this.freq_div) * tuning_freq;
				canvasCtx.fillStyle = 'red';
				canvasCtx.fillRect(x_value, this.canvas.height, 2, -1*this.canvas.height);

				var freq_arr = this.freqDomainData.slice(0, samples+1);
				var indexOfMaxValue = freq_arr.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
				var x_coord_value = indexOfMaxValue*sliceWidth;
				var max_freq_value = (x_coord_value*this.freq_div)/50;

				var label = "";
				var color = "";

				for(var i=0;i<88;i++) {
					var f = this.A0 * Math.pow(this.TWELTHROOT2, i);
					if (max_freq_value < f*1.03 && max_freq_value > f*0.97) {
						label = this.SugarL10n.get(this.notes_arr[i%12]) + parseInt(i/12).toString();
						color = 'white';
						if (max_freq_value < f * 0.98) {
							label = '♭ ' + label + ' ♭';
							color = 'red';
						}
						else if (max_freq_value < f * 0.99) {
							label = '♭ ' + label + ' ♭';
							color = 'yellow';
						}
						else if (max_freq_value > f * 1.02) {
							label = '# ' + label + ' #';
							color = 'red';
						}
						else if (max_freq_value > f * 1.01) {
							label = '# ' + label + ' #';
							color = 'yellow';
						}
                		else {
							color = 'white';
						}
						break;
					}
				}
				canvasCtx.font = "20px Georgia";
				canvasCtx.fillStyle = color;
				canvasCtx.fillText(label, this.canvas.width - 200, 30);
			}

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
				sliceWidth = this.canvas.width * 1.0 / (samples - start);
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
		TimeOrFreq_switch: function() {
			if (this.time_domain) {
				if (this.show_harmonics) {
					this.harmonics_button_display();
				}
				if (this.show_tuning_line) {
					this.tuning_line_button_display();
				}
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
		TimeOrFreq: function() {

			// Switch between Time and Frequency Domain

			if(this.setInterval_id) {
				this.stopRecord()
			}

			this.time_domain = !this.time_domain;

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateTimeOrFreq',
						data: this.time_domain
					}
				}
				this.SugarPresence.sendMessage(message);
			}

			this.TimeOrFreq_switch();
		},
		setZoomSlider: function () {
			var slider = document.getElementById("zoomSlider");
			if(slider == null) {
				return;
			}
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

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateZoomSettings',
						data: {
							time_div: this.time_div,
							freq_div: this.freq_div
						}
					}
				}
				this.SugarPresence.sendMessage(message);
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

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateZoomSettings',
						data: {
							time_div: this.time_div,
							freq_div: this.freq_div
						}
					}
				}
				this.SugarPresence.sendMessage(message);
			}
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

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateZoomSettings',
						data: {
							time_div: this.time_div,
							freq_div: this.freq_div
						}
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		invertWaveform_change_button: function() {

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
		},
		invertWaveform: function() {

			// function to switch between invert and normal waveform

			if(!this.time_domain) {
				return;
			}
			this.invertWaveform_change_button();
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateWaveformInversion',
						data: this.invert_waveform
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		decreaseAmp: function() {
			var val = parseInt(document.getElementById("ampSlider").value);
			document.getElementById("ampSlider").value = val - 1;
			this.ampSettings();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateAmplitude',
						data: document.getElementById("ampSlider").value
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		increaseAmp: function() {
			var val = parseInt(document.getElementById("ampSlider").value);
			document.getElementById("ampSlider").value = val + 1;
			this.ampSettings();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateAmplitude',
						data: document.getElementById("ampSlider").value
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		ampSettings: function () {
			var slider_val = parseInt(document.getElementById("ampSlider").value);
			this.amp_value = 0.1*slider_val;
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateAmplitude',
						data: document.getElementById("ampSlider").value
					}
				}
				this.SugarPresence.sendMessage(message);
			}
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

					csvContent += session.interval + ";";

					csvContent += j + ';' + session.data[j] + '\n';
				}
				if (data_size == 0) {
					csvContent += i + ';';
					csvContent += session.mode + ';';
					csvContent += session.date + ';';

					csvContent += session.interval + ";";

					csvContent += j + ';' + '-' + '\n';
				}
				i += 1;
			}

			var vm = this;
			var metadata = {
				mimetype: "text/csv",
				title: this.SugarL10n.get("MeasureLoggingBy", { name: vm.currentenv.user.name}) + ".csv",
				activity: "org.sugarlabs.ChartActivity",
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
						if (session.interval == 300) {
							doc.text(this.SugarL10n.get("Interval") + ":   " + this.SugarL10n.get("IntervalMinute", { interval: 5 }), x, y + 21);
						}
						else {
							doc.text(this.SugarL10n.get("Interval") + ":   " + this.SugarL10n.get("IntervalSecond", { interval: session.interval }), x, y + 21);
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
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "";
			this.log_interval = e.secondVal;
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "darkgray";

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateLogInterval',
						data: this.log_interval
					}
				}
				this.SugarPresence.sendMessage(message);
			}
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
			this.log_session_obj.interval = this.log_interval
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
		captureImage: function() {
			var mimetype = 'image/jpeg';
			var inputData = this.canvas.toDataURL(mimetype, 1);
			var metadata = {
				mimetype: mimetype,
				title: this.SugarL10n.get("WaveformImage"),
				activity: "org.olpcfrance.MediaViewerActivity",
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
		triggeringEdge: function() {
			this.trigEdge += 1;

			if(this.trigEdge > 2) {
				this.trigEdge = 0;
			}

			if(this.trigEdge == 1) {
				document.getElementById("triggering-edge-none-button").style.display = "none";
				document.getElementById("triggering-edge-rising-button").style.display = "initial";
				document.getElementById("triggering-edge-falling-button").style.display = "none";
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("RisingEdge");
			}
			else if(this.trigEdge == 2) {
				document.getElementById("triggering-edge-none-button").style.display = "none";
				document.getElementById("triggering-edge-rising-button").style.display = "none";
				document.getElementById("triggering-edge-falling-button").style.display = "initial";
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("FallingEdge");
			}
			else {
				document.getElementById("triggering-edge-none-button").style.display = "initial";
				document.getElementById("triggering-edge-rising-button").style.display = "none";
				document.getElementById("triggering-edge-falling-button").style.display = "none";
				document.getElementById("TrigEdgeType").innerText = this.SugarL10n.get("None");
			}
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateTriggeringEdge',
						data: this.trigEdge
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		selectInstrument: function(e) {
			if (this.instrument_name == 'none') {
				document.getElementById("none").style.backgroundColor = '';
			}
			else {
				document.getElementById(`${this.instrument_name}_instrument`).style.backgroundColor = '';
			}

			this.instrument_name = e.instrument_name;

			if (this.instrument_name == 'none') {
				document.getElementById("none").style.backgroundColor = 'darkgray';
				this.draw_note = false;
				this.note_index = -2;
				this.note_freq = 0;
			}
			else {
				document.getElementById(`${this.instrument_name}_instrument`).style.backgroundColor = 'darkgray';
				this.draw_note = true;
				this.note_index = -1;
				this.note_freq = 0;
			}

			if (this.time_domain) {
				this.TimeOrFreq();
			}

			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateInstrument',
						data: {
							instrument_name: e.instrument_name,
							freq_input_note_index: this.freq_input_note_index,
							freq_input_octave: this.freq_input_octave,
							note_idx: this.note_index,
							note_freq: this.note_freq,
							note_name: this.note_name,
							show_harmonics: this.show_harmonics
						}
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		drawNote: function(note_idx, freq, note_key) {
			document.getElementById(`${this.instrument_name}_note_${this.note_name}`).style.backgroundColor = '';
			document.getElementById(`${this.instrument_name}_note_${note_key}`).style.backgroundColor = 'darkgray';
			this.draw_note = true;
			this.note_index = note_idx;
			this.note_freq = freq;
			this.note_name = note_key;
			if (this.time_domain) {
				this.TimeOrFreq();
			}
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateNoteForNotNone',
						data: {
							note_idx: this.note_index,
							note_freq: this.note_freq,
							note_name: this.note_name
						}
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		harmonics_button_display: function() {
			this.show_harmonics = !this.show_harmonics;
			if (this.show_harmonics) {
				document.getElementById("harmonics-on-button").style.display = "initial";
				document.getElementById("harmonics-off-button").style.display = "none";
			}
			else {
				document.getElementById("harmonics-on-button").style.display = "none";
				document.getElementById("harmonics-off-button").style.display = "initial";
			}
		},
		handleHarmonics: function() {
			if (this.instrument_name == 'none') {
				return;
			}
			this.harmonics_button_display();
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateHarmonics',
						data: this.show_harmonics
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		tuning_line_button_display: function() {
			this.show_tuning_line = !this.show_tuning_line;

			if (this.show_tuning_line) {
				document.getElementById("tuning-line-on-button").style.display = "initial";
				document.getElementById("tuning-line-off-button").style.display = "none";
			}
			else {
				document.getElementById("tuning-line-on-button").style.display = "none";
				document.getElementById("tuning-line-off-button").style.display = "initial";
			}
		},
		showTuningLine: function() {

			if(this.time_domain) {
				return;
			}
			this.tuning_line_button_display();
			this.drawWaveform();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateTuningLineDisplay',
						data: {
							show_tuning_line: this.show_tuning_line,
							tuning_freq_value: document.getElementById("tuning-freq").value
						}
					}
				}
				this.SugarPresence.sendMessage(message);
			}

		},
		playStopNote: function() {
			this.play_note = !this.play_note;

			if(this.play_note) {
				document.getElementById("play-note-button").style.display = "initial";
				document.getElementById("stop-note-button").style.display = "none";
				var note_freq_value = parseFloat(document.getElementById("tuning-freq").value);
				if(note_freq_value >= 0 && note_freq_value <= 20000) {
					this.tone_osc = new Tone.Oscillator(note_freq_value, "sine").toDestination().start();
				}
			}
			else {
				document.getElementById("play-note-button").style.display = "none";
				document.getElementById("stop-note-button").style.display = "initial";
				if(this.tone_osc != null) {
					this.tone_osc.stop();
					this.tone_osc = null;
				}
			}
		},
		setNote: function(idx){
			document.getElementById(`note_${this.freq_input_note_index}`).style.backgroundColor = '';
			this.freq_input_note_index = idx;
			document.getElementById(`note_${this.freq_input_note_index}`).style.backgroundColor = 'darkgray';
			this.updateFreqInput();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateNoteForNone',
						data: this.freq_input_note_index
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		setOctave: function(val) {
			document.getElementById(`octave_${this.freq_input_octave}`).style.backgroundColor = '';
			this.freq_input_octave = val;
			document.getElementById(`octave_${this.freq_input_octave}`).style.backgroundColor = 'darkgray';
			this.updateFreqInput();

			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateOctave',
						data: this.freq_input_octave
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		tuningFreqInputUpdate: function() {
			if (this.SugarPresence.isShared() && this.shared_mode_initialised) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'UpdateTuningFrequency',
						data: document.getElementById("tuning-freq").value
					}
				}
				this.SugarPresence.sendMessage(message);
			}
		},
		updateFreqInput: function() {
			var res = this.freq_input_octave * 12 + this.freq_input_note_index;
			var freq = this.A0 * Math.pow(this.TWELTHROOT2, res);
			document.getElementById("tuning-freq").value = freq.toFixed(3);
		},
		getActivityData: function() {

			var time_data = [];
			var freq_data = [];
			for (var i = 0; i < this.fftSize; i++) {
				time_data.push(this.timeDomainData[i]);
				freq_data.push(this.freqDomainData[i]);
			}

			var context = {
				time_domain: this.time_domain,
				time_div: this.time_div,
				freq_div: this.freq_div,
				play: this.play,
				num_of_samples_time: this.num_of_samples_time,
				num_of_samples_freq: this.num_of_samples_freq,
				timeDomainData: time_data,
				freqDomainData: freq_data,
				amp_slider_val: document.getElementById('ampSlider').value,
				invert_waveform: this.invert_waveform,
				trigEdge: this.trigEdge,
				log_data: this.log_data,
				log_interval: this.log_interval,
				instrument_name: this.instrument_name,
				existing_instrument_settings: {
					instrument_name: this.instrument_name,
					note_index: this.note_index,
					note_freq: this.note_freq,
					note_name: this.note_name,
					freq_input_note_index: this.freq_input_note_index,
					freq_input_octave: this.freq_input_octave,
					show_harmonics: this.show_harmonics,
					show_tuning_line: this.show_tuning_line,
					tuning_freq_value: document.getElementById("tuning-freq").value
				}
			};

			return context;
		},
		onActivityStop: function () {
			if (this.setInterval_id) {
				this.stopRecord();
			}

			var context = this.getActivityData();
			this.$refs.SugarJournal.saveData(context);
		},
		onJournalNewInstance: function () {
			console.log("New instance");
		},

		onJournalDataLoaded: function (data, metadata) {
			console.log("Existing instance");

			this.time_domain = data.time_domain;
			this.time_div = data.time_div;
			this.freq_div = data.freq_div;
			this.setZoomSlider();
			this.play = !data.play;
			this.playOrPause();
			this.num_of_samples_time = data.num_of_samples_time;
			this.num_of_samples_freq = data.num_of_samples_freq;
			this.existing_instance_time_data = data.timeDomainData;
			this.existing_instance_freq_data = data.freqDomainData;
			document.getElementById('ampSlider').value = data.amp_slider_val;
			this.ampSettings();
			this.invert_waveform = !data.invert_waveform;
			this.invertWaveform_change_button();
			this.trigEdge = data.trigEdge - 1;
			this.triggeringEdge();

			this.log_data = data.log_data;
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "";
			this.log_interval = data.log_interval;
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "darkgray";

			this.existing_instrument_settings = data.existing_instrument_settings;

			this.existing_instance = true;

			// specially for firefox
			if(this.timeDomainData.length > 0) {
				this.initDataForExisiting();
			}
		},

		onJournalLoadError: function (error) {
			console.log("Error loading from journal");
		},
		setInstrumentSettingsFromData: function() {
			var existing_time_domain = this.time_domain;
			var obj = this.existing_instrument_settings;
			if (obj.instrument_name == 'none') {
				document.getElementById("none").click();
				this.setNote(obj.freq_input_note_index);
				this.setOctave(obj.freq_input_octave);
			}
			else {
				document.getElementById(`${obj.instrument_name}_instrument`).click();
				this.drawNote(obj.note_index, obj.note_freq, obj.note_name);
				this.show_harmonics = !obj.show_harmonics;
				this.handleHarmonics();
			}
			document.getElementById("tuning-freq").value = obj.tuning_freq_value;
			this.show_tuning_line = !obj.show_tuning_line;
			this.showTuningLine();

			this.time_domain = existing_time_domain;
			this.shared_mode_initialised = true;
		},
		initDataForExisiting: function() {

			// this function handles existing instance data for firefox and mobile devices.
			if (!this.play) {
				this.freqDomainData = [];
				for (var i = 0; i < this.fftSize; i++) {
					this.timeDomainData[i] = this.existing_instance_time_data[i];
					this.freqDomainData.push(this.existing_instance_freq_data[i]);
				}
				this.drawWaveform();
			}

			this.setInstrumentSettingsFromData();
			this.time_domain = !this.time_domain;
			this.TimeOrFreq();

			this.existing_instance = false;
		},
		initSharedInstance: function (data) {
			this.time_domain = data.time_domain;
			this.time_div = data.time_div;
			this.freq_div = data.freq_div;
			this.setZoomSlider();
			this.num_of_samples_time = data.num_of_samples_time;
			this.num_of_samples_freq = data.num_of_samples_freq;
			document.getElementById('ampSlider').value = data.amp_slider_val;
			this.ampSettings();
			this.invert_waveform = !data.invert_waveform;
			this.invertWaveform_change_button();
			this.trigEdge = data.trigEdge - 1;
			this.triggeringEdge();
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "";
			this.log_interval = data.log_interval;
			document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "darkgray";
			this.existing_instrument_settings = data.existing_instrument_settings;

			this.shared_instance = true;
			if (this.timeDomainData.length > 0) {
				this.setInstrumentSettingsFromData();
				this.time_domain = !data.time_domain;
				this.TimeOrFreq();
				this.shared_instance = false;
			}
		},
		onJournalSharedInstance: function () {
			console.log("Shared instance");
		},
		onNetworkDataReceived(msg) {
			// Handles the data-received event

			switch (msg.content.action) {
				case 'init':
					{
						this.initSharedInstance(msg.content.data);
						break;
					}
				case 'UpdateTimeOrFreq':
					{
						this.time_domain = msg.content.data;
						this.TimeOrFreq_switch();
						break;
					}
				case 'UpdateZoomSettings':
					{
						this.time_div = msg.content.data.time_div,
						this.freq_div = msg.content.data.freq_div
						this.setZoomSlider();
						this.shared_mode_initialised = false;
						this.ZoomInOut();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateAmplitude':
					{
						document.getElementById("ampSlider").value = msg.content.data;
						this.shared_mode_initialised = false;
						this.ampSettings();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateWaveformInversion':
					{
						this.invert_waveform = !msg.content.data;
						this.shared_mode_initialised = false;
						this.invertWaveform();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateTriggeringEdge':
					{
						this.trigEdge = msg.content.data - 1;
						this.shared_mode_initialised = false;
						this.triggeringEdge();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateLogInterval':
					{
						document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "";
						this.log_interval = msg.content.data;
						document.getElementById(`interval-${this.log_interval}`).style.backgroundColor = "darkgray";
						break;
					}
				case 'UpdateInstrument':
					{
						this.shared_mode_initialised = false;
						var existing_time_domain = this.time_domain;
						var obj = msg.content.data;
						if (obj.instrument_name == 'none') {
							document.getElementById("none").click();
							this.setNote(obj.freq_input_note_index);
							this.setOctave(obj.freq_input_octave);
						}
						else {
							document.getElementById(`${obj.instrument_name}_instrument`).click();
							this.drawNote(obj.note_idx, obj.note_freq, obj.note_name);
							this.show_harmonics = !obj.show_harmonics;
							this.handleHarmonics();
						}

						this.time_domain = existing_time_domain;
						this.TimeOrFreq_switch();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateNoteForNone':
					{
						this.shared_mode_initialised = false;
						if(this.instrument_name == 'none') {
							this.setNote(msg.content.data);
						}
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateOctave':
					{
						this.shared_mode_initialised = false;
						this.setOctave(msg.content.data);
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateNoteForNotNone':
					{
						this.shared_mode_initialised = false;
						var msg_data = msg.content.data;
						if(this.instrument_name != 'none') {
							this.drawNote(msg_data.note_idx, msg_data.note_freq, msg_data.note_name);
						}
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateHarmonics':
					{
						this.shared_mode_initialised = false;
						this.show_harmonics = !msg.content.data;
						this.harmonics_button_display();
						this.drawWaveform();
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateTuningFrequency':
					{
						this.shared_mode_initialised = false;
						document.getElementById("tuning-freq").value = msg.content.data;
						this.shared_mode_initialised = true;
						break;
					}
				case 'UpdateTuningLineDisplay':
					{
						this.shared_mode_initialised = false;
						document.getElementById("tuning-freq").value = msg.content.data.tuning_freq_value;
						this.show_tuning_line = !msg.content.data.show_tuning_line;
						this.showTuningLine();
						this.drawWaveform();
						this.shared_mode_initialised = true;
						break;
					}
			}
		},

		onNetworkUserChanged(msg) {
			// Handles the user-changed event

			if (this.SugarPresence.isHost) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'init',
						data: this.getActivityData()
					}
				});
				this.shared_mode_initialised = true;
			}

		},
		tutorialGifContent: function(img_src, content) {
			return `<div><img src='tutorial_gifs/${img_src}' style='width: 100%;height: 100%;'><p>` + content + "</p></div>";
		},
		onHelp: function () {
			var steps = [
				{
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent
				},
				{
					element: "#time-domain-button",
					position: "bottom",
					title: this.l10n.stringTutoTimeFreqTitle,
					intro: this.tutorialGifContent('time_freq_switch_demo.gif',this.l10n.stringTutoTimeFreqContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("zoomSettingsPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("zoom-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("zoomSettingsPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("zoom-button").click();
						}
					},
					element: "#zoomSettingsPalette",
					position: "bottom",
					title: this.l10n.stringTutoZoomSettingsTitle,
					intro: this.tutorialGifContent('zoom_settings_demo.gif', this.l10n.stringTutoZoomSettingsContent)
				},
				{
					element: "#play-button",
					position: "bottom",
					title: this.l10n.stringTutoPlayPauseTitle,
					intro: this.tutorialGifContent('play_pause_demo.gif', this.l10n.stringTutoPlayPauseContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "visible") {
							document.getElementById("settings-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "hidden") {
							document.getElementById("settings-button").click();
						}
					},
					element: "#amplitudeSettings",
					position: "right",
					title: this.l10n.stringTutoAmplitudeTitle,
					intro: this.tutorialGifContent('amplitude_demo.gif', this.l10n.stringTutoAmplitudeContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "visible") {
							document.getElementById("settings-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "hidden") {
							document.getElementById("settings-button").click();
						}
					},
					element: "#waveformInversionSettings",
					position: "right",
					title: this.l10n.stringTutoWaveformInversionTitle,
					intro: this.tutorialGifContent('waveform_invert_demo.gif', this.l10n.stringTutoWaveformInversionContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "visible") {
							document.getElementById("settings-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("amplitudeSettings").offsetParent.style.visibility == "hidden") {
							document.getElementById("settings-button").click();
						}
					},
					element: "#triggeringEdgeSettings",
					position: "right",
					title: this.l10n.stringTutoTriggeringEdgeTitle,
					intro: this.tutorialGifContent('triggering_edge_demo.gif', this.l10n.stringTutoTriggeringEdgeContent)
				},
				{
					title: this.l10n.stringTutoLoggingExplainTitle,
					intro: this.l10n.stringTutoLoggingExplainContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("loggingPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("logging-interval-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("loggingPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("logging-interval-button").click();
						}
					},
					element: "#loggingPalette",
					position: "bottom",
					title: this.l10n.stringTutoLoggingIntervalTitle,
					intro: this.l10n.stringTutoLoggingIntervalContent
				},
				{
					onShow: function(tourType) {
						if (app.setInterval_id) {
							app.stopRecord();
						}
					},
					element: "#record-off-button",
					position: "bottom",
					title: this.l10n.stringTutoStartStopTitle,
					intro: this.l10n.stringTutoStartStopContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("export-formats").offsetParent.style.visibility == "visible") {
							document.getElementById("export-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("export-formats").offsetParent.style.visibility == "hidden") {
							document.getElementById("export-button").click();
						}
					},
					element: "#csv-export",
					position: "bottom",
					title: this.l10n.stringTutoExportLoggingCSVTitle,
					intro: this.l10n.stringTutoExportLoggingCSVContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("export-formats").offsetParent.style.visibility == "visible") {
							document.getElementById("export-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("export-formats").offsetParent.style.visibility == "hidden") {
							document.getElementById("export-button").click();
						}
					},
					element: "#pdf-export",
					position: "bottom",
					title: this.l10n.stringTutoExportLoggingPDFTitle,
					intro: this.l10n.stringTutoExportLoggingPDFContent
				},
				{
					title: this.l10n.stringTutoInstrumentExplainTitle,
					intro: this.l10n.stringTutoInstrumentExplainContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("instrumentPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("instrument-select-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("instrumentPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("instrument-select-button").click();
						}
					},
					element: "#instrumentPalette",
					position: "left",
					title: this.l10n.stringTutoInstrumentSelectTitle,
					intro: this.l10n.stringTutoInstrumentSelectContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("notePalette").offsetParent.style.visibility == "visible") {
							document.getElementById("note-select-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("notePalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("note-select-button").click();
						}
					},
					element: "#notePalette",
					position: "left",
					title: this.l10n.stringTutoNoteSelectTitle,
					intro: this.tutorialGifContent('select_note_demo.gif', this.l10n.stringTutoNoteSelectContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("octavePalette").offsetParent.style.visibility == "visible") {
							document.getElementById("octave-select-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("octavePalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("octave-select-button").click();
						}
					},
					element: "#octavePalette",
					position: "left",
					title: this.l10n.stringTutoOctaveSelectTitle,
					intro: this.l10n.stringTutoOctaveSelectContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("tuning-palette-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("tuning-palette-button").click();
						}
						if (app.show_harmonics) {
							app.handleHarmonics();
						}
					},
					element: "#harmonics-off-button",
					position: "left",
					title: this.l10n.stringTutoShowHarmonicsTitle,
					intro: this.tutorialGifContent('show_harmonics_demo.gif', this.l10n.stringTutoShowHarmonicsContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("tuning-palette-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("tuning-palette-button").click();
						}
					},
					element: "#tuning-freq",
					position: "bottom",
					title: this.l10n.stringTutoTuningFreqInputTitle,
					intro: this.l10n.stringTutoTuningFreqInputContent
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("tuning-palette-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("tuning-palette-button").click();
						}


						if(app.show_tuning_line) {
							app.showTuningLine();
						}
					},
					element: "#tuning-line-off-button",
					position: "bottom",
					title: this.l10n.stringTutoTuningLineTitle,
					intro: this.tutorialGifContent('show_tuning_line_demo.gif', this.l10n.stringTutoTuningLineContent)
				},
				{
					onHide: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "visible") {
							document.getElementById("tuning-palette-button").click();
						}
					},
					onShow: function (tourType) {
						if (document.getElementById("tuningPalette").offsetParent.style.visibility == "hidden") {
							document.getElementById("tuning-palette-button").click();
						}
						if(app.play_note) {
							app.playStopNote();
						}
					},
					element: "#stop-note-button",
					position: "bottom",
					title: this.l10n.stringTutoPlayStopNoteTitle,
					intro: this.l10n.stringTutoPlayStopNoteContent
				},
				{
					element: "#capture-image-button",
					position: "bottom",
					title: this.l10n.stringTutoCaptureWaveformTitle,
					intro: this.l10n.stringTutoCaptureWaveformContent
				}
			];
			this.$refs.SugarTutorial.show(steps);
		},
		onAudioInput: function(e) {

			// This function executes whenever stream from microphone is received (only for cordova)

			if(this.existing_instance) {
				this.initDataForExisiting();
			}

			if(this.shared_instance) {
				this.setInstrumentSettingsFromData();
				this.time_domain = !data.time_domain;
				this.TimeOrFreq();
				this.shared_instance = false;
			}

			if (!this.play) return;

			this.timeDomainData = e.data;

			if (this.time_domain) {
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
		this.SugarPresence = this.$refs.SugarPresence;
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

					if(!this.play && this.existing_instance) {
						for(var i=0;i<this.fftSize;i++) {
							this.timeDomainData[i] = this.existing_instance_time_data[i];
							this.freqDomainData[i] = this.existing_instance_freq_data[i];
						}
					}

					if (this.existing_instance || this.shared_instance) {
						this.setInstrumentSettingsFromData();
					}

					this.shared_instance = false;
					this.time_domain = !this.time_domain;
					this.TimeOrFreq();

				})
				.catch((err) => {
					console.log(err);
					alert("Please allow microphone access")
				})
		}
	}
});
