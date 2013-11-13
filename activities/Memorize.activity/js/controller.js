define(function (require) {

    var controller = {};

    controller.Controller = function (model, view) {
        this.model = model;
        this.view = view;
    };

    controller.Controller.prototype.newGame = function (size) {
        var size = size || this.model.size;
        this.model.createGame(size);
        this.view.createView(size);
        this.update();
    };

    // Add callback to click events of table buttons.
    controller.Controller.prototype.update = function () {
        var that = this;

        var buttonPressed = function (e) {
            var cardPosition = this.getAttribute('id');

            if (that.model.prohibitedMove(cardPosition)) {
                return;
            }

            var result = that.model.selectCard(cardPosition);

            that.view.unfoldCard(this, result.cardContent);

            if (result.end) {
                var match = that.model.checkMatches();
                if (match) {
                    that.view.highlightCards(that.model.currentUnfoldedCards);
                    that.model.unlockMove();

                    if (that.model.gameDone()) {
                        that.view.highlightDone(that.model.unfoldedCards);
                    }
                }
                else {
                    // Wait a second, fold them again.
                    window.setTimeout(function () {
                        that.view.foldCards(that.model.currentUnfoldedCards);
                        that.model.unlockMove();
                    }, 1000);
                }
            }
        };

        var buttons = document.querySelectorAll("#buttons-table button");
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.addEventListener('click', buttonPressed);
        }
    };

    return controller;

});
