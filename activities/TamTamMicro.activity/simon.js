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

        var fromKeyPress = false;
		if(s.type == "keydown") {
			fromKeyPress = true;
        }
        
        var keyColourMap = {
            'ArrowUp': 'Red',
            'ArrowDown': 'Blue',
            'ArrowRight': 'Green',
            'ArrowLeft': 'Yellow'
        }
        
        if (fromKeyPress){
            this.clickColor(keyColourMap[s.key]);
            this.userSequence.push(keyColourMap[s.key]);
        } else {
            this.clickColor(s.name);
            this.userSequence.push(s.name);
        }
        this.$.SimonStart.setContent(this.userSequence.length);
        var correct = this.userSequence[this.userSequence.length-1] === this.correctSequence[this.userSequence.length-1]
        if (!correct){
            this.correctSequence = [];
            this.userSequence = [];
            this.level = 1;
            this.keysEnabled = false;
            this.$.SimonLevel.setContent("Level : " + this.level);
            this.$.SimonStart.show();
            this.$.SimonStart.setContent("WRONG");
            this.$.SimonStart.addRemoveClass('wrongRed', true);
            this.showStart();
        }

        if (correct && this.correctSequence.length === this.userSequence.length){
            var steps = this.level + 1;
            // n points for nth step in a level
            this.score += steps*(steps + 1)/2;
            this.userSequence = [];
            this.level++;
            this.keysEnabled = false;
            this.$.SimonLevel.setContent("Level : " + this.level);
            this.$.SimonScroe.setContent("Score : " + this.score);
            this.$.SimonStart.setContent("RIGHT");
            this.$.SimonStart.addRemoveClass('rightGreen', true);
            this.showStart();
        }
    },

    showStart: function(){
        var colors = ["Red", "Green", "Yellow", "Blue"];
        setTimeout(function(){
            this.$.SimonStart.addRemoveClass('rightGreen', false);
            this.$.SimonStart.addRemoveClass('wrongRed', false);
            this.$.SimonStart.addRemoveClass('disableElement', false);
            this.startGame();
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
        if (this.keysEnabled){
            this.handlePlayNote(event);
        }
    },

    create: function() {
		this.inherited(arguments);
        this.collection = 0;
        this.level = 1;
        this.correctSequence = [];
        this.userSequence = [];
        this.score = 0;
        this.keysEnabled = false;
        this.$.SimonLevel.setContent("Level : " + this.level);
        this.$.SimonScroe.setContent("Score : " + this.score);
        
		var that = this;
        that.handlePlayNoteListener = that.handlePlayNoteListener.bind(this);
        document.addEventListener('keydown', that.handlePlayNoteListener, false);
		tonePlayer.load('audio/database/'+currentSimonMode+".mp3");
		return;
    },

    startGame: function(){
        this.keysEnabled = false;
        var colors = ["Red", "Green", "Yellow", "Blue"];
        this.addRemoveAll(["SimonStart"].concat(colors), 'disableElement', true);

        var randomColor = colors[Math.floor(Math.random()*4)];
        this.correctSequence.push(randomColor);
        var delay = 1000;
        for(let steps = 0; steps < this.level; steps++){
            setTimeout(function(){
                this.clickColor(this.correctSequence[steps]);
                this.$.SimonStart.setContent(steps + 1);
            }.bind(this), delay);
            delay += 1100;
        }
        setTimeout(function(){
            this.addRemoveAll(colors, 'disableElement', false);
            this.keysEnabled = true;
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
		document.removeEventListener('keydown', that.handlePlayNoteListener, false);
    },

    // adds or removes a class from all elements
    addRemoveAll: function(elements, className, add){
        elements.forEach(function(element){
            this.$[element].addRemoveClass(className, add);
        }.bind(this));
    }
});