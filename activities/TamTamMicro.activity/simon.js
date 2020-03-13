enyo.kind({
	name: "TamTam.Simon",
	components: [
        {classes: "Simon-info", components: [
            {name: "SimonLevel", classes: "Simon-level", content: ""},
            {name: "SimonScroe", classes: "Simon-scroe", content: ""}
        ]},
        {classes: "Simon", components: [
            {classes: "Simon-game", components: [
                {name: "Red", classes: "Simon-button red", ontap: "handlePlayNote"},
                {name: "Green", classes: "Simon-button green", ontap: "handlePlayNote"},
                {name: "Yellow", classes: "Simon-button yellow", ontap: "handlePlayNote"},
                {name: "Blue", classes: "Simon-button blue", ontap: "handlePlayNote"},
                {classes: "Simon-centre Simon-centre-black",
                    components: [{
                        classes: "Simon-centre Simon-centre-white",
                        components: [
                            {name: "SimonStart", id: "SimonStart", classes: "Simon-start", content: "START", ontap: "startGame"},
                            {name: "SimonReplay", content: "", ontap: "pauseGame", showing: false}
                        ]
                    }]
                }
            ]},
        ]},
        {kind: "Image", src: "icons/redo.svg", classes: "Simon-reset", ontap: "resetGame"}
    ],

    handlePlayNote: function(s) {
        var colors = ["Red", "Green", "Yellow", "Blue"];
        if(s.repeat || !simonMode) return;
        
        this.clickColor(s.name);
        this.userSequence.push(s.name);
        this.$.SimonStart.setContent(this.userSequence.length);
        var correct = this.userSequence[this.userSequence.length-1] === this.correctSequence[this.userSequence.length-1]
        if (!correct){
            this.correctSequence = [];
            this.userSequence = [];
            this.$.SimonStart.show();
            this.$.SimonStart.setContent("WRONG");
            this.addRemoveAll(colors.concat("SimonStart"), "wrongRed", true);
            this.showStart();
        }

        if (correct && this.correctSequence.length === this.userSequence.length){
            var steps = this.level + 1;
            // n points for nth step in a level
            this.score += steps*(steps + 1)/2;
            this.correctSequence = [];
            this.userSequence = [];
            this.level++;
            this.$.SimonLevel.setContent("Level : " + this.level);
            this.$.SimonScroe.setContent("Score : " + this.score);
            this.$.SimonStart.setContent("RIGHT");
            this.addRemoveAll(colors.concat("SimonStart"), "rightGreen", true);
            this.showStart();
        }
    },

    showStart: function(){
        var colors = ["Red", "Green", "Yellow", "Blue"];
        setTimeout(function(){
            this.addRemoveAll(colors.concat("SimonStart"), "rightGreen", false);
            this.addRemoveAll(colors.concat("SimonStart"), "wrongRed", false);
            this.$.SimonStart.addRemoveClass('disableElement', false);
            this.$.SimonStart.setContent("START");
        }.bind(this), 2000);
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
        this.$.SimonLevel.setContent("Level : " + this.level);
        this.$.SimonScroe.setContent("Score : " + this.score);
        
		var that = this;
		that.handlePlayNoteListener = that.handlePlayNoteListener.bind(this);
		tonePlayer.load('audio/database/'+currentSimonMode+".mp3");
		return;
    },

    startGame: function(){
        var colors = ["Red", "Green", "Yellow", "Blue"];
        this.addRemoveAll(["SimonStart"].concat(colors), 'disableElement', true);
        // this.$.SimonStart.hide();

        var steps = this.level + 1;
        var delay = 1000;
        while(steps--){
            setTimeout(function(){
                var randomColor = colors[Math.floor(Math.random()*4)];
                this.clickColor(randomColor);
                this.correctSequence.push(randomColor);
                this.$.SimonStart.setContent(this.correctSequence.length);
            }.bind(this), delay);
            delay += 1100;
        }
        setTimeout(function(){
            this.addRemoveAll(colors, 'disableElement', false);
            this.$.SimonStart.setContent("");
        }.bind(this), delay);
    },

    resetGame: function(){
        this.collection = 0;
        this.level = 1;
        this.correctSequence = [];
        this.userSequence = [];
        this.score = 0;
        this.$.SimonLevel.setContent("Level : " + this.level);
        this.$.SimonScroe.setContent("Score : " + this.score);
        this.$.SimonStart.show();
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