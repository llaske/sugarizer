enyo.kind({
	name: "TamTam.Piano",
	components: [
		{tag: "div", classes: "container", components: [
			{ tag: "ul", components: [
				{ tag: "li", name: "C", classes:"standard red", ontap: "handlePlayNote", components: [
					{tag: "span", content: "1", classes:"number"}
				]},
	
				{ tag: "li", name: "D", classes:"standard orange", ontap: "handlePlayNote", components: [
					{tag: "span", content: "2", classes:"number"}
				]},
	
				{ tag: "li", name: "E", classes:"standard yellow", ontap: "handlePlayNote", components: [
					{tag: "span", content: "3", classes:"number"}
				]}, 
	
				{ tag: "li", name: "F", classes:"standard green", ontap: "handlePlayNote", components: [
					{tag: "span", content: "4", classes:"number"}
				]},
	
				{ tag: "li", name: "G", classes:"standard aquamarine", ontap: "handlePlayNote", components: [
					{tag: "span", content: "5", classes:"number"}
				]},
	
				{ tag: "li", name: "A", classes:"standard blue", ontap: "handlePlayNote", components: [
					{tag: "span", content: "6", classes:"number"}
				]},
	
				{ tag: "li", name: "B", classes:"standard purple", ontap: "handlePlayNote", components: [
					{tag: "span", content: "7", classes:"number"}
				]},
			]},
			{tag: "ul", classes: "blackkeys", components: [
					{ tag: "li", name: "C#", classes:"black", ontap: "handlePlayNote"},
					{ tag: "li", name: "D#", classes:"black", ontap: "handlePlayNote"},
					{ tag: "li", name: "hidden", classes:"black hidden"},
					{ tag: "li", name: "F#", classes:"black", ontap: "handlePlayNote"},
					{ tag: "li", name: "G#", classes:"black", ontap: "handlePlayNote"},
					{ tag: "li", name: "A#", classes:"black", ontap: "handlePlayNote"},
				]
			} 
		]}
	],

	handlePlayNote: function(s) {
		if(s.repeat || !pianoMode) return;
		var fromKeyPress = false;
		if(s.type == "keydown") {
			fromKeyPress = true;
		}

		var pitchName;
		var keyMap = {
			'1': 'C',
			'2': 'D',
			'3': 'E',
			'4': 'F',
			'5': 'G',
			'6': 'A',
			'7': 'B',
		};

		if(fromKeyPress) {
			pitchName = keyMap[s.key];
			if(!"1234567".includes(s.key)) {
				return;
			} else if(s.ctrlKey) {
				if("12456".includes(s.key)) {
					pitchName += "#";
				} else if(s.key == "3") {
					pitchName = "F";
				} else {
					return;
				}
			}
		} else {
			pitchName = s.name;
		}
		this.sound = "audio/database/"+currentPianoMode;
		
		var pitchMap = {
			'C': 0,
			'C#': 1,
			'D': 2,
			'D#': 3,
			'E': 4,
			'F': 5,
			'F#': 6,
			'G': 7,
			'G#': 8,
			'A': 9,
			'A#': 10,
			'B': 11
		};

		var player = new Tone.Player('./audio/database/'+currentPianoMode+".mp3");
		var pitchShift = new Tone.PitchShift({
			pitch: pitchMap[pitchName]
		}).toMaster();
		player.connect(pitchShift);
		player.autostart = true;
	},
	
	handlePlayNoteListener: function(event) {
		this.handlePlayNote(event);
	},

	create: function() {
		this.inherited(arguments);
		this.collection = 0;
		var that = this;

		document.addEventListener('keydown', that.handlePlayNoteListener.bind(that));
		return;
	},

	endofsound: function() {
		if (this.$.itemImage)
			this.$.itemImage.setAttribute("src", "images/database/"+this.name+".png");
	},

	abort: function() {
		this.endofsound();
	},

	destroy: function () {
		var that = this;
		that.inherited(arguments);
		document.removeEventListener('keydown', that.handlePlayNoteListener.bind(that));
	}
});