enyo.kind({
	name: "TamTam.Simon",
	components: [
        {classes: "Simon", components: [
            {classes: "Simon-game", components: [
                {name: "A", classes: "Simon-button red", ontap: "handlePlayNote"},
                {name: "E", classes: "Simon-button green", ontap: "handlePlayNote"},
                {name: "C-s", classes: "Simon-button yellow", ontap: "handlePlayNote"},
                {name: "E", classes: "Simon-button blue", ontap: "handlePlayNote"},
                {classes: "Simon-centre Simon-centre-black", components: [{classes: "Simon-centre Simon-centre-white"}]}
            ]}
        ]}
    ],

    handlePlayNote: function(s) {
		if(s.repeat || !simonMode) return;

		var pitchName = s.name;
		var pitchMap = {
			'C-s': 1,
			'E': 4,
			'A': 9,
		};

		tonePlayer.play(pitchMap[pitchName]);
	},

    handlePlayNoteListener: function(event) {
		this.handlePlayNote(event);
	},

    create: function() {
		this.inherited(arguments);
		this.collection = 0;
		var that = this;
		that.handlePlayNoteListener = that.handlePlayNoteListener.bind(this);
		tonePlayer.load('audio/database/'+currentSimonMode+".mp3");
		return;
    },
    
    destroy: function () {
		var that = this;
		that.inherited(arguments);
	}
});