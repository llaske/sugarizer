define(function (require) {

    var model = {};

    // Utility to shuffle array elements.
    function shuffle(array) {
        var counter = array.length;
        var temp;
        var index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = (Math.random() * counter--) | 0;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    model.Model = function () {
        this.cardsSet = undefined;
        this.inGameCards = undefined;
        this.size = undefined;
        this.status = undefined;
        this.selectedQuestion = undefined;
        this.selectedAnswer = undefined;
        this.unfoldedCards = undefined;
        this.currentUnfoldedCards = undefined;
    };

    model.Model.prototype.loadGame = function (cardsSet) {
        this.cardsSet = cardsSet;
    };

    // Initialize gameCards, the set of cards shuffled and grouped in
    // two suits: questions and answers.
    model.Model.prototype.createGame = function (size) {
        this.size = size || this.size || 4;
        this.status = "selecting question";
        this.selectedQuestion = undefined;
        this.selectedAnswer = undefined;
        this.unfoldedCards = [];
        this.currentUnfoldedCards = [];

        var pairs = Math.floor(this.size * this.size / 2);
        var questions = [];
        var answers = [];

        // Clone the set of cards, shuffle them, and select the needed
        // pairs.
        var subset = shuffle(this.cardsSet.slice(0)).slice(0, pairs);

        for (var i = 0; i < subset.length; i ++) {
            questions.push(subset[i].question);
            answers.push(subset[i].answer);
        }

        this.inGameCards = shuffle(questions).concat(shuffle(answers));
    };

    model.Model.prototype.unlockMove = function (cardPosition) {
        this.status = "selecting question";
    };

    // Return true if the move is prohibited in the current game
    // status.
    model.Model.prototype.prohibitedMove = function (cardPosition) {
        // The user is not allowed to move in the current status.
        if (this.status == "selecting none") {
            return true;
        }

        // The user should select a question but is trying to select
        // an answer.
        if (this.status == "selecting question") {
            if (cardPosition > (this.inGameCards.length / 2) - 1) {
                return true;
            }
        }

        // The user should select an answer but is trying to select
        // a question.
        if (this.status == "selecting answer") {
            if (cardPosition < (this.inGameCards.length / 2)) {
                return true;
            }
        }

        // The user is trying to select a card that was already
        // unfolded.
        for (var i = 0; i < this.unfoldedCards.length; i++) {
            if (cardPosition == this.unfoldedCards[i]) {
                return true;
            }
        }

        return false;
    };

    // Return the card content and update the game state.
    model.Model.prototype.selectCard = function (cardPosition) {
        var cardContent = this.inGameCards[cardPosition];

        if (this.status == "selecting question") {
            this.selectedQuestion = this.inGameCards[cardPosition];
            this.currentUnfoldedCards = [cardPosition];
            this.status = "selecting answer";
            return {'cardContent': cardContent, 'end': false};
        }
        else {
            if (this.status == "selecting answer") {
                this.selectedAnswer = this.inGameCards[cardPosition];
                this.currentUnfoldedCards.push(cardPosition);
                this.status = "selecting none";
                return {'cardContent': cardContent, 'end': true};
            }
        }
    };

    model.Model.prototype.gameDone = function () {
        return this.unfoldedCards.length == this.inGameCards.length;
    }

    // Return true if the unfolded cards match.
    model.Model.prototype.checkMatches = function () {
        for (var i = 0; i < this.cardsSet.length; i++) {
            if (this.cardsSet[i].question == this.selectedQuestion) {
                var match = (this.cardsSet[i].answer == this.selectedAnswer);
                if (match) {
                    // Update the list of unfolded cards.
                    for (var j = 0; j < this.currentUnfoldedCards.length; j++) {
                        this.unfoldedCards.push(this.currentUnfoldedCards[j]);
                    }
                }
                return match;
            }
        }
    };

    return model;

});
