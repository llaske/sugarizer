define(function (require) {
    var mustache = require("mustache");

    var view = {};

    // Utility to make the text fit the button.
    function scaleTextToFit(button) {

        // Remove 'px' from CSS strings.
        px = function (styleString) {
            return styleString.slice(0, -2);
        }

        var buttonStyle = button.currentStyle ||
            window.getComputedStyle(button, '');

        // Get the allowed space inside the button.
        var targetWidth = px(buttonStyle.width) -
            (2 * px(buttonStyle.borderBottomWidth)) -
            (2 * px(buttonStyle.paddingLeft));

        // Temporarily add a new div to the document.  Copy the
        // content of the button to the div.
        var helperDiv = document.createElement('div');
        helperDiv.style.visibility = "hidden";
        helperDiv.style.display = "inline-block";
        helperDiv.style.fontSize = buttonStyle.fontSize;
        helperDiv.innerHTML = button.innerHTML;
        document.body.appendChild(helperDiv);

        // Try smaller font sizes in the div until its width is not
        // bigger than the button.

        var divStyle = helperDiv.currentStyle ||
            window.getComputedStyle(helperDiv, '');

        var width = px(divStyle.width);
        if (width > targetWidth) {
            while (width > targetWidth) {
                // Remove 'px' from the strings.
                var oldSize = px(helperDiv.style.fontSize);
                var newSize = oldSize - 1 + "px";
                helperDiv.style.fontSize = newSize;

                divStyle = helperDiv.currentStyle ||
                    window.getComputedStyle(helperDiv, '');

                width = px(divStyle.width);
            }
            button.style.fontSize = helperDiv.style.fontSize;
        }

        document.body.removeChild(helperDiv);
    }

    view.View = function () {
        this.template =
            '<tbody>' +
            '{{#rows}}' +
              '<tr>' +
                '{{#.}}' +
                '<td>' +
                  '<button id="{{id}}" class="suit-{{suit}} folded"></button>' +
                '</td>' +
                '{{/.}}' +
              '</tr>' +
            '{{/rows}}' +
            '</tbody>';
    };

    view.View.prototype.createView = function (size) {
        // Calculate the number of cards per row, based in the number
        // of cards.
        var cardsLength = size * size;

        // The number of cards must be even.
        if (cardsLength % 2 != 0) {
            cardsLength -= 1;
        }
        var cardsPerRow = Math.ceil(Math.sqrt(cardsLength));

        var tableData = {"rows": []};
        var currentRow = [];
        for (var i = 0; i < cardsLength; i++) {
            var suit;
            if (i < cardsLength / 2) {
                suit = 1;
            }
            else {
                suit = 2;
            }
            currentRow.push({"id": i, "suit": suit});
            if (currentRow.length == cardsPerRow) {
                tableData.rows.push(currentRow);
                currentRow = [];
            }
            // The row is not complete but it is the last card.
            else {
                if (i == cardsLength -1) {
                    tableData.rows.push(currentRow);
                    currentRow = [];
                }
            }
        }

        // Arrange the cards in a table.
        var tableElem = document.getElementById("buttons-table");
        tableElem.innerHTML = mustache.render(this.template, tableData);
    };

    view.View.prototype.unfoldCard = function (card, cardContent) {
        card.innerHTML = cardContent;
        scaleTextToFit(card);
        card.classList.remove('folded');
    };

    view.View.prototype.highlightCards = function (unfoldedCards) {
        for (var j = 0; j < unfoldedCards.length; j++) {
            var elem = document.getElementById(unfoldedCards[j]);
            elem.classList.add('match');
        }
    };

    view.View.prototype.highlightDone = function (unfoldedCards) {
        for (var j = 0; j < unfoldedCards.length; j++) {
            var elem = document.getElementById(unfoldedCards[j]);
            elem.classList.add('done');
        }
    };

    view.View.prototype.foldCards = function (unfoldedCards) {
        for (var j = 0; j < unfoldedCards.length; j++) {
            var elem = document.getElementById(unfoldedCards[j]);
            elem.innerHTML = '';
            elem.classList.add('folded');
        }
    };

    return view;

});
