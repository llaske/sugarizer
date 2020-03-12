enyo.kind({
	name: "TamTam.Simon",
	components: [
        {classes: "Simon", components: [
            {name: "simonScore", classes: "Simon-score", content: ""},
            {classes: "Simon-game", components: [
                {name: "Red", classes: "Simon-button red", ontap: "handlePlayNote"},
                {name: "Green", classes: "Simon-button green", ontap: "handlePlayNote"},
                {name: "Yellow", classes: "Simon-button yellow", ontap: "handlePlayNote"},
                {name: "Blue", classes: "Simon-button blue", ontap: "handlePlayNote"},
                {classes: "Simon-centre Simon-centre-black",
                    components: [{
                        classes: "Simon-centre Simon-centre-white",
                        components: [
                            {name: "Simon-start", content: "START", ontap: "startGame"},
                            {name: "Simon-pause", content: "p", ontap: "pauseGame", showing: false},
                            {name: "Simon-reset", content: "r", ontap: "resetGame", showing: false}
                        ]
                    }]
                }
            ]}
        ]}
    ],

    handlePlayNote: function(s) {
        if(s.repeat || !simonMode) return;
        
        this.clickColor(s.name);
        this.userSequence.push(s.name);
        var correct = this.userSequence[this.userSequence.length-1] === this.correctSequence[this.userSequence.length-1]
        if (!correct){
            alert("incorrect")
            this.userSequence = [];
        }

        if (correct && this.correctSequence.length === this.userSequence.length){
            var steps = this.level + 1;
            // n points for nth step in a level
            this.score += steps*(steps + 1)/2;
            alert(`level cleared! score = ${this.score}`);
            this.correctSequence = [];
            this.userSequence = [];
            this.level++;
            this.startGame();
        }
    },
    
    clickColor(colorName){
        var colorMap = {
            "Red": "A",
            "Green": "E",
            "Blue": "E",
            "Yellow": "C-s"
        }
        this.$[colorName].addRemoveClass('darkenElement', true);
        setTimeout(function(){
            this.$[colorName].addRemoveClass('darkenElement', false);
        }.bind(this), 1000)

        var pitchName = colorMap[colorName];
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
        this.level = 1;
        this.correctSequence = [];
        this.userSequence = [];
        this.score = 0;
		var that = this;
		that.handlePlayNoteListener = that.handlePlayNoteListener.bind(this);
		tonePlayer.load('audio/database/'+currentSimonMode+".mp3");
		return;
    },

    startGame: function(){
        var colors = ["Red", "Green", "Yellow", "Blue"];
        this.addRemoveAll(colors, 'disableElement', true);
        var steps = this.level + 1;
        var delay = 1000;
        while(steps--){
            setTimeout(function(){
                var randomColor = colors[Math.floor(Math.random()*4)];
                this.clickColor(randomColor);
                this.correctSequence.push(randomColor);
            }.bind(this), delay);
            delay += 1100;
        }
        setTimeout(function(){
            this.addRemoveAll(colors, 'disableElement', false);
        }.bind(this), delay);
    },
    
    destroy: function () {
		var that = this;
		that.inherited(arguments);
    },

    // adds or removes a class from all elements
    addRemoveAll: function(elements, className, add){
        elements.forEach(function(element){
            this.$[element].addRemoveClass(className, add);
        }.bind(this));
    }
});