enyo.kind({
	name: "TamTam.Simon",
	components: [
        {classes: "Simon-info", components: [
            {name: "SimonLevel", id: "SimonLevel", classes: "Simon-level", content: ""},
            {name: "SimonScroe", id: "SimonScroe", classes: "Simon-scroe", content: ""}
        ]},
        {classes: "Simon", id:"Simon-board", components: [
            {classes: "Simon-game", components: [
                {name: "Red", id:"Red", classes: "Simon-button red", ontap: "handlePlayNote"},
                {name: "Green", id: "Green", classes: "Simon-button green", ontap: "handlePlayNote"},
                {name: "Yellow", id: "Yellow", classes: "Simon-button yellow", ontap: "handlePlayNote"},
                {name: "Blue", id: "Blue", classes: "Simon-button blue", ontap: "handlePlayNote"},
                {classes: "Simon-centre Simon-centre-black",
                    components: [{
                        classes: "Simon-centre Simon-centre-white",
                        components: [
                            {name: "SimonStart", id: "SimonStart", classes: "Simon-start", content: "", ontap: "startGame"},
                        ]
                    }]
                }
            ]},
        ]}
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
            this.$.SimonStart.show();
            this.$.SimonStart.setContent(this.WRONG_MSG);
            this.$.SimonStart.addRemoveClass('wrongRed', true);
            this.addRemoveAll(["Red", "Green", "Yellow", "Blue"], 'disableElement', true);
            this.showPlayAgain();
        }

        if (correct && this.correctSequence.length === this.userSequence.length){
            // n points for nth step in a level
            this.score += this.level*(this.level + 1)/2;
            this.userSequence = [];
            this.level++;
            this.keysEnabled = false;
            this.$.SimonScroe.setContent(this.SCORE_MSG + " : " + this.score);
            this.$.SimonStart.setContent(this.RIGHT_MSG);
            this.$.SimonStart.addRemoveClass('rightGreen', true);
            this.addRemoveAll(["Red", "Green", "Yellow", "Blue"], 'disableElement', true);
            this.timeouts.push(setTimeout(function(){
                this.startGame();
            }.bind(this), 2000));
        }
    },

    showPlayAgain: function(){
        this.timeouts.push(setTimeout(function(){
            this.$.SimonStart.addRemoveClass('disableElement', false);
            this.$.SimonStart.addRemoveClass('wrongRed', false);
            this.$.SimonStart.setContent(this.PLAY_AGAIN);
        }.bind(this), 2000));
    },
    
    clickColor(colorName){
        var colorMap = {
            "Red": "A",
            "Green": "E",
            "Blue": "E",
            "Yellow": "C-s"
        }
        this.$[colorName].addRemoveClass('darkenElement', true);
        this.timeouts.push(setTimeout(function(){
            this.$[colorName].addRemoveClass('darkenElement', false);
        }.bind(this), 1000));

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
        this.timeouts = [];
        
        var that = this;
        requirejs(["webL10n"], function(webL10n) {
            that.START_MSG = webL10n.get("SimonStartMsg");
            that.SCORE_MSG = webL10n.get("SimonScoreMsg");
            that.LEVEL_MSG = webL10n.get("SimonLevelMsg");
            that.WRONG_MSG = webL10n.get("SimonWrongMsg");
            that.RIGHT_MSG = webL10n.get("SimonRightMsg");
            that.PLAY_AGAIN = webL10n.get("SimonPlayAgain");
            that.$.SimonStart.setContent(that.START_MSG);
            that.$.SimonLevel.setContent(that.LEVEL_MSG + " : " + that.level);
            that.$.SimonScroe.setContent(that.SCORE_MSG + " : " + that.score);
        });
        that.handlePlayNoteListener = that.handlePlayNoteListener.bind(this);
        document.addEventListener('keydown', that.handlePlayNoteListener, false);
        tonePlayer.load('audio/database/'+currentSimonMode+".mp3");
        this.addRemoveAll(["Red", "Green", "Yellow", "Blue"], 'disableElement', true);
		return;
    },

    startGame: function(){
        if (this.level === 1){
            this.score = 0;
            this.$.SimonScroe.setContent(this.SCORE_MSG + " : " + this.score);
        }
        this.$.SimonStart.setContent(' ');
        this.keysEnabled = false;
        var colors = ["Red", "Green", "Yellow", "Blue"];
        this.addRemoveAll(["SimonStart"].concat(colors), 'disableElement', true);

        var randomColor = colors[Math.floor(Math.random()*4)];
        this.correctSequence.push(randomColor);
        var delay = 1000;
        for(let steps = 0; steps < this.level; steps++){
            this.timeouts.push(setTimeout(function(){
                this.$.SimonStart.addRemoveClass('rightGreen', false);
                this.clickColor(this.correctSequence[steps]);
                this.$.SimonLevel.setContent(this.LEVEL_MSG + " : " + this.level);
                this.$.SimonStart.setContent(steps + 1);
            }.bind(this), delay));
            delay += 1100;
        }
        this.timeouts.push(setTimeout(function(){
            this.addRemoveAll(colors, 'disableElement', false);
            this.keysEnabled = true;
            this.$.SimonStart.setContent("");
        }.bind(this), delay));
    },
    
    destroy: function () {
        var that = this;
        that.timeouts.forEach((id)=>clearTimeout(id));
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