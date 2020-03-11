enyo.kind({
	name: "TamTam.Simon",
	components: [
        {tag: "div", classes: "", components: [
            {tag: "div", classes: "Simon-game", components: [
                {tag: "div", name: "A", classes: "Simon-button red", ontap: "handlePlayNote"},
                {tag: "div", name: "E", classes: "Simon-button green", ontap: "handlePlayNote"},
                {tag: "div", name: "E", classes: "Simon-button blue", ontap: "handlePlayNote"},
                {tag: "div", name: "C#", classes: "Simon-button yellow", ontap: "handlePlayNote"},
                {tag: "div", classes: "Simon-centre"}
            ]}
        ]}
    ],

    handlePlayNote: function(s) {
		if(s.repeat || !simonMode) return;

		var pitchName = s.name;
		var pitchMap = {
			'C#': 1,
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