// TamTam audio stuff

// Tone.js handling
enyo.kind({
	name: "TamTam.TonePlayer",

	create: function() {
		this.player = new Tone.Player();
		this.pitchShift = new Tone.PitchShift();
	},

	load: function(file, callback) {
		var that = this;
		if (/iPad/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent)) {
			that.player.load(file+"?time="+(new Date().getTime()), callback);
			return;
		}
		// HACK: Use XHR Blob because Tone.Buffer can't load file from file:///
		var xhr = new XMLHttpRequest();
		xhr.open('GET', file+"?time="+(new Date().getTime()), true);
		xhr.responseType = 'blob';
		xhr.onload = function(){
			var blob = URL.createObjectURL(this.response);
			that.player.load(blob, callback);
		};
		xhr.send();
	},

	play: function(pitch) {
		this.pitchShift.pitch = pitch;
		this.pitchShift.toMaster();
		this.player.connect(this.pitchShift);
		this.player.start();
	},

	playSound: function(file) {
		var that = this;
		this.load(file, function() {
			that.pitchShift.pitch = 0;
			that.pitchShift.toMaster();
			that.player.connect(that.pitchShift);
			that.player.start();
		});
	},

	destroy: function() {
		this.pitchShift.disconnect();
		this.pitchShift.dispose();
		this.player.disconnect();
		this.player.dispose();
	}
});
