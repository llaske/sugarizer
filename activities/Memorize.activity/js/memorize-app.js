/**
 * Created by ohayon_m on 17/08/15.
 */

define(["activity/sample-ressources", "activity/palettes/template-palette", "activity/palettes/size-palette", "activity/lz-string", "sugar-web/graphics/journalchooser", 'sugar-web/datastore'], function (SampleRessources, templatePalette, sizePalette, lzString, chooser, datastore) {

        var FOUND_COLOR = "#84f060";
        var MODE_CLASSIC = "classic";
        var MODE_SPLITTED = "splitted";
        var MODE_EQUAL = "equal";
        var MODE_NON_EQUAL = "non_equal";
        var INLINE_RES = "#inline#";

        var TEMPLATE_SUMS = {
            name: "Addition", icon: "addition.svg", cards: [
                [{text: "3+4"}, {text: "7"}],
                [{text: "5+5"}, {text: "10"}],
                [{text: "5+6"}, {text: "11"}],
                [{text: "4+4"}, {text: "8"}],
                [{text: "4+5"}, {text: "9"}],
                [{text: "3+3"}, {text: "6"}],
                [{text: "2+2"}, {text: "4"}],
                [{text: "1+1"}, {text: "2"}],
                [{text: "1+2"}, {text: "3"}],
                [{text: "9+9"}, {text: "18"}],
                [{text: "10+9"}, {text: "19"}],
                [{text: "8+8"}, {text: "16"}],
                [{text: "8+9"}, {text: "17"}],
                [{text: "7+7"}, {text: "14"}],
                [{text: "7+8"}, {text: "15"}],
                [{text: "6+6"}, {text: "12"}]
            ],
            mode: MODE_SPLITTED
        };
        var TEMPLATE_LETTERS = {
            name: "Letters", icon: "letters.svg", cards: [
                [{text: "A"}, {text: "a"}],
                [{text: "B"}, {text: "b"}],
                [{text: "C"}, {text: "c"}],
                [{text: "D"}, {text: "d"}],
                [{text: "E"}, {text: "e"}],
                [{text: "F"}, {text: "f"}],
                [{text: "G"}, {text: "g"}],
                [{text: "H"}, {text: "h"}],
                [{text: "I"}, {text: "i"}],
                [{text: "J"}, {text: "j"}],
                [{text: "K"}, {text: "k"}],
                [{text: "L"}, {text: "l"}],
                [{text: "M"}, {text: "m"}],
                [{text: "N"}, {text: "n"}],
                [{text: "O"}, {text: "o"}],
                [{text: "P"}, {text: "p"}],
                [{text: "Q"}, {text: "q"}],
                [{text: "R"}, {text: "r"}],
                [{text: "S"}, {text: "s"}],
                [{text: "T"}, {text: "t"}],
                [{text: "U"}, {text: "u"}],
                [{text: "V"}, {text: "v"}],
                [{text: "W"}, {text: "w"}],
                [{text: "X"}, {text: "x"}],
                [{text: "Y"}, {text: "y"}],
                [{text: "Z"}, {text: "z"}]
            ],
            mode: MODE_SPLITTED
        };

        var TEMPLATE_SOUNDS = {
            name: "Sounds", icon: "sounds.svg", cards: [
                [
                    {image: INLINE_RES + "drumkit1_b", sound: INLINE_RES + "beat1_a"},
                    {image: INLINE_RES + "drumkit1_b", sound: INLINE_RES + "beat1_a"}
                ],
                [
                    {image: INLINE_RES + "drumkit2_b", sound: INLINE_RES + "beat1_b"},
                    {image: INLINE_RES + "drumkit2_b", sound: INLINE_RES + "beat1_b"}
                ],
                [
                    {image: INLINE_RES + "drumkit3_b", sound: INLINE_RES + "beat1_c"},
                    {image: INLINE_RES + "drumkit3_b", sound: INLINE_RES + "beat1_c"}
                ],
                [
                    {image: INLINE_RES + "drumkit4_b", sound: INLINE_RES + "beat8"},
                    {image: INLINE_RES + "drumkit4_b", sound: INLINE_RES + "beat8"}
                ],
                [
                    {image: INLINE_RES + "drumkit5_b", sound: INLINE_RES + "beat10"},
                    {image: INLINE_RES + "drumkit5_b", sound: INLINE_RES + "beat10"}
                ],
                [
                    {image: INLINE_RES + "drumkit6_b", sound: INLINE_RES + "beat3"},
                    {image: INLINE_RES + "drumkit6_b", sound: INLINE_RES + "beat3"}
                ],
                [
                    {image: INLINE_RES + "drumkit7_b", sound: INLINE_RES + "beat4"},
                    {image: INLINE_RES + "drumkit7_b", sound: INLINE_RES + "beat4"}
                ],
                [
                    {image: INLINE_RES + "drumkit8_b", sound: INLINE_RES + "beat14"},
                    {image: INLINE_RES + "drumkit8_b", sound: INLINE_RES + "beat14"}
                ],
                [
                    {image: INLINE_RES + "drumkit9_b", sound: INLINE_RES + "beat6_2"},
                    {image: INLINE_RES + "drumkit9_b", sound: INLINE_RES + "beat6_2"}
                ],
                [
                    {image: INLINE_RES + "drumkit10_b", sound: INLINE_RES + "beat2"},
                    {image: INLINE_RES + "drumkit10_b", sound: INLINE_RES + "beat2"}
                ],
                [
                    {image: INLINE_RES + "drumkit11_b", sound: INLINE_RES + "beat16"},
                    {image: INLINE_RES + "drumkit11_b", sound: INLINE_RES + "beat16"}
                ],
                [
                    {image: INLINE_RES + "drumkit12_b", sound: INLINE_RES + "beat17"},
                    {image: INLINE_RES + "drumkit12_b", sound: INLINE_RES + "beat17"}
                ],
                [
                    {image: INLINE_RES + "guitar1_2", sound: INLINE_RES + "bending_a"},
                    {image: INLINE_RES + "guitar1_2", sound: INLINE_RES + "bending_a"}
                ],
                [
                    {image: INLINE_RES + "guitar2_2", sound: INLINE_RES + "bending_b"},
                    {image: INLINE_RES + "guitar2_2", sound: INLINE_RES + "bending_b"}
                ],
                [
                    {image: INLINE_RES + "guitar3_2", sound: INLINE_RES + "flashcomp2a"},
                    {image: INLINE_RES + "guitar3_2", sound: INLINE_RES + "flashcomp2a"}
                ],
                [
                    {image: INLINE_RES + "guitar4_2", sound: INLINE_RES + "flashcomp2b"},
                    {image: INLINE_RES + "guitar4_2", sound: INLINE_RES + "flashcomp2b"}
                ],
                [
                    {image: INLINE_RES + "guitar5_2", sound: INLINE_RES + "gedaempft"},
                    {image: INLINE_RES + "guitar5_2", sound: INLINE_RES + "gedaempft"}
                ],
                [
                    {image: INLINE_RES + "guitar6_2", sound: INLINE_RES + "ungedaempft"},
                    {image: INLINE_RES + "guitar6_2", sound: INLINE_RES + "ungedaempft"}
                ],
                [
                    {image: INLINE_RES + "guitar7_2", sound: INLINE_RES + "jimi4"},
                    {image: INLINE_RES + "guitar7_2", sound: INLINE_RES + "jimi4"}
                ],
                [
                    {image: INLINE_RES + "guitar8_2", sound: INLINE_RES + "git_hit1"},
                    {image: INLINE_RES + "guitar8_2", sound: INLINE_RES + "git_hit1"}
                ],
                [
                    {image: INLINE_RES + "guitar9_2", sound: INLINE_RES + "git_hit4"},
                    {image: INLINE_RES + "guitar9_2", sound: INLINE_RES + "git_hit4"}
                ],
                [
                    {image: INLINE_RES + "guitar10_2", sound: INLINE_RES + "jimi1"},
                    {image: INLINE_RES + "guitar10_2", sound: INLINE_RES + "jimi1"}
                ],
                [
                    {image: INLINE_RES + "guitar11_2", sound: INLINE_RES + "flasholet4"},
                    {image: INLINE_RES + "guitar11_2", sound: INLINE_RES + "flasholet4"}
                ],
                [
                    {image: INLINE_RES + "guitar12_2", sound: INLINE_RES + "guitcello"},
                    {image: INLINE_RES + "guitar12_2", sound: INLINE_RES + "guitcello"}
                ]
            ],
            mode: MODE_CLASSIC
        };

        var MemorizeApp = {
            strings: {add: "Add", update: "Update", remove: "Remove"},
            ui: {},
            templates: [TEMPLATE_SUMS, TEMPLATE_LETTERS, TEMPLATE_SOUNDS],
            isHost: false,
            editor: {pairMode: MODE_EQUAL, card1: {}, card2: {}, selectedPair: -1},
            game: {
                template: TEMPLATE_LETTERS,
                multiplayer: false,
                selectedCards: [],
                mode: undefined,
                cards: [],
                currentPlayer: "",
                players: [],
                size: 4
            },
            computeCards: computeCards,
            inEditMode: false,
            shareActivity: shareActivity,
            initUI: initUI,
            drawGame: drawGame,
            onUsersListChanged: onUsersListChanged,
            onDataReceived: onDataReceived
        };

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }


        function shareActivity(isHost) {
            if (!MemorizeApp.presence.isConnected()) {
                return;
            }
            MemorizeApp.inEditMode = false;

            leaveEditMode();
            disableEditMode();

            MemorizeApp.game.multiplayer = true;
            MemorizeApp.isHost = isHost;
            MemorizeApp.me = MemorizeApp.presence.userInfo;
            MemorizeApp.game.currentPlayer = MemorizeApp.me.networkId;
            MemorizeApp.ui.gamePlayers.style.display = "block";
        }


        function computeCards(ignoreSave) {
            MemorizeApp.game.cards = [];
            MemorizeApp.game.selectedCards = [];

            if (!MemorizeApp.game.template) {
                return;
            }
            MemorizeApp.game.mode = MemorizeApp.game.template.mode;

            var shuffledTemplate = {name: MemorizeApp.game.template.name, cards: []};
            shuffledTemplate.cards = JSON.parse(JSON.stringify(shuffle(MemorizeApp.game.template.cards)));

            var cardsNumber = 0;
            if (MemorizeApp.game.size % 2 == 0) {
                cardsNumber = MemorizeApp.game.size * MemorizeApp.game.size;
            } else {
                cardsNumber = MemorizeApp.game.size * MemorizeApp.game.size - 2;
            }

            if (MemorizeApp.game.mode == MODE_CLASSIC) {
                var cards = [];
                for (var i = 0; i < shuffledTemplate.cards.length && i < cardsNumber / 2; i++) {
                    var card1 = shuffledTemplate.cards[i][0];
                    var card2 = shuffledTemplate.cards[i][1];

                    card1.id = i;
                    card2.id = i;

                    cards.push(card1);
                    cards.push(card2);
                }
                MemorizeApp.game.cards = shuffle(cards);
            }

            if (MemorizeApp.game.mode == MODE_SPLITTED) {
                var cards1 = [];
                var cards2 = [];

                for (var i = 0; i < cardsNumber / 2 && i < shuffledTemplate.cards.length; i++) {
                    var card1 = shuffledTemplate.cards[i][0];
                    var card2 = shuffledTemplate.cards[i][1];

                    card1.id = i;
                    card2.id = i;

                    cards1.push(card1);
                    cards2.push(card2);
                }

                var shuffledCard1 = shuffle(cards1);
                for (var i = 0; i < shuffledCard1.length; i++) {
                    MemorizeApp.game.cards.push(shuffledCard1[i]);
                }

                var shuffledCard2 = shuffle(cards2);
                for (var i = 0; i < shuffledCard2.length; i++) {
                    MemorizeApp.game.cards.push(shuffledCard2[i]);
                }
            }
            if (!ignoreSave) saveGame();
        }


        function resizeTextInsideTextCardDivs() {
            var elements = document.getElementsByClassName('textCard');
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                while (el.scrollHeight > el.offsetHeight) {
                    el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
                }
                while (el.scrollWidth > el.offsetWidth) {
                    el.style.fontSize = parseInt(el.style.fontSize) - 1 + "px";
                }
            }

        }

        function generateCardDiv(card, minSize) {
            if (card.image) {
                if (card.image.indexOf(INLINE_RES) == 0) {
                    card.image = SampleRessources[card.image.slice(INLINE_RES.length)];
                }
                var div = document.createElement("div");
                div.style.background = "url('" + card.image + "')";
                div.style.backgroundRepeat = "no-repeat";
                div.style.backgroundSize = "contain";
                div.style.webkitBackgroundSize = "contain";
                div.style.backgroundPosition = "center center";
                div.style.height = minSize + "px";
                div.style.width = minSize + "px";

                return div;
            }

            if (card.text) {
                if (card.text.indexOf(INLINE_RES) == 0) {
                    card.text = SampleRessources[card.text.slice(INLINE_RES.length)];
                }
                var div = document.createElement("div");
                div.className = "textCard";
                div.style.textAlign = "center";
                div.style.display = "block";
                div.innerHTML = card.text;
                div.style.lineHeight = minSize + "px";
                div.style.fontSize = minSize + 'px';
                div.style.color = "#000";
                div.style.width = minSize + "px";
                div.style.height = minSize + "px";

                return div;
            }
        }

        function createAudioContextIfMissing() {
            if (MemorizeApp.context) {
                return;
            }
            var context = window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.oAudioContext ||
                window.msAudioContext;

            if (!context) {
                return;
            }
            context = new context();
            MemorizeApp.context = context;

            var buffer = context.createBuffer(1, 1, 22050);
            var source = context.createBufferSource();
            MemorizeApp.source = source;
            source.buffer = buffer;

            source.connect(context.destination);
            source.start(0);
        }

        function createFullCardDiv(i, minSize, card) {
            var fullCardDiv = document.createElement("div");
            fullCardDiv.cardPosition = i;
            fullCardDiv.webkitPerspective = "500px";
            fullCardDiv.perspective = "500px";
            fullCardDiv.style.border = "3px solid #fff";
            fullCardDiv.style.borderRadius = "6px";
            fullCardDiv.style.margin = "5px";
            fullCardDiv.style.webkitTransition = "transform 0.5s";
            fullCardDiv.style.transition = "transform 0.5s";

            fullCardDiv.style.transitionDuration = "0.5s";
            fullCardDiv.style.webkitTransitionDuration = "0.5s";

            fullCardDiv.style.transformStyle = "preserve-3d";
            fullCardDiv.style.webkitTransformStyle = "preserve-3d";
            fullCardDiv.style.position = "relative";
            fullCardDiv.style.float = "left";
            fullCardDiv.style.height = minSize + "px";
            fullCardDiv.style.width = minSize + "px";
            if (card.solved) {
                fullCardDiv.style.webkitTransform = "rotateY(180deg)";
                fullCardDiv.style.transform = "rotateY(180deg)";
            } else {
                fullCardDiv.style.webkitTransform = "";
                fullCardDiv.style.transform = "";
            }
            if (MemorizeApp.game.selectedCards.length != 0) {
                if (MemorizeApp.game.selectedCards[0].cardPosition == fullCardDiv.cardPosition) {
                    fullCardDiv.style.webkitTransform = "";
                    fullCardDiv.style.transform = "";
                }
            }

            return fullCardDiv;
        }

        function createFrontDiv(i, middle, minSize) {
            var front = document.createElement("div");
            if (MemorizeApp.game.mode == MODE_CLASSIC) {
                front.style.background = "#777";
            }
            if (MemorizeApp.game.mode == MODE_SPLITTED) {
                if (i < middle) {
                    front.style.background = "#777 url(icons/number1.svg)";
                } else {
                    front.style.background = "#777 url(icons/number2.svg)";
                }
            }
            front.zIndex = 2;
            front.style.borderRadius = "6px";
            front.style.webkitBackfaceVisibility = "hidden";
            front.style.backfaceVisibility = "hidden";

            front.style.backgroundPosition = "center center";
            front.style.backgroundRepeat = "no-repeat";
            front.style.height = minSize + "px";
            front.style.position = "absolute";
            front.style.top = "0px";
            front.style.left = "0px";
            front.style.width = minSize + "px";

            return front;
        }

        function createDiv(i, minSize, card) {
            var div = document.createElement("div");
            var generatedDiv = generateCardDiv(MemorizeApp.game.cards[i], minSize);
            div.appendChild(generatedDiv);
            div.style.height = minSize + "px";
            div.style.webkitBackfaceVisibility = "hidden";
            div.style.backfaceVisibility = "hidden";
            div.style.mozBackfaceVisibility = "hidden";
            div.style.position = "absolute";
            div.style.webkitTransform = "rotateY(180deg)";
            div.style.transform = "rotateY(180deg)";
            div.style.top = "0px";
            div.style.left = "0px";
            div.style.borderRadius = "6px";
            div.style.width = minSize + "px";
            div.style.background = "#fff";

            if (card.solved) {
                div.style.backgroundColor = FOUND_COLOR;
            }

            return div;
        }

        function cardClick(div, fromMe, user) {
            var middle = MemorizeApp.game.cards.length / 2;

            createAudioContextIfMissing();
            var t = div;

            if (t.card.solved || MemorizeApp.game.selectedCards.length == 2) {
                return;
            }

            if (MemorizeApp.game.mode == MODE_SPLITTED && MemorizeApp.game.selectedCards.length == 1) {
                if (t.cardPosition < middle && MemorizeApp.game.selectedCards[0].cardPosition < middle) {
                    return;
                }
                if (t.cardPosition >= middle && MemorizeApp.game.selectedCards[0].cardPosition >= middle) {
                    return;
                }
            }

            t.style.webkitTransform = "rotateY(180deg)";
            t.style.transform = "rotateY(180deg)";

            if(MemorizeApp.game.selectedCards.length == 1 && MemorizeApp.game.selectedCards[0] == t){
                return;
            }
            else{
                MemorizeApp.game.selectedCards.push(t);
            }

            if (t.card.sound) {
                if (t.card.sound.indexOf(INLINE_RES) == 0) {
                    t.card.sound = SampleRessources[t.card.sound.slice(INLINE_RES.length)];
                }
                var b64 = t.card.sound.split("base64,")[1];
                b64 = Base64Binary.decodeArrayBuffer(btoa(atob(b64)));

                if (MemorizeApp.context) {
                    MemorizeApp.context.decodeAudioData(b64, function (buffer) {
                        var source = MemorizeApp.context.createBufferSource(); // creates a sound source
                        if (MemorizeApp.source) {
                            try {
                                MemorizeApp.source.stop(0);
                            } catch (e) {
                            }
                        }
                        MemorizeApp.source = source;
                        source.buffer = buffer;
                        source.connect(MemorizeApp.context.destination);
                        try {
                            source.start(0);
                        } catch (e) {

                        }
                    }, function (err) {
                        console.log("err(decodeAudioData): " + err);
                    });
                }

            }

            if (MemorizeApp.game.selectedCards.length == 1) {
                return;
            }

            if (MemorizeApp.game.selectedCards[0].card.id == t.card.id) {
                MemorizeApp.game.selectedCards[0].card.solved = true;
                t.card.solved = true;

                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    if (MemorizeApp.game.players[i].networkId == user.networkId) {
                        MemorizeApp.game.players[i].score = MemorizeApp.game.players[i].score + 1;
                    }
                }

                displayUsersAndScores();
                var div1 = MemorizeApp.game.selectedCards[0].resultDiv;
                var div2 = t.resultDiv;
                setTimeout(function () {
                    div1.style.backgroundColor = FOUND_COLOR;
                    div2.style.backgroundColor = FOUND_COLOR;
                }, 1000);

                MemorizeApp.game.selectedCards = [];
                saveGame();
                return;
            }

            MemorizeApp.game.currentPlayer = "";

            setTimeout(function () {
                try {
                    t.style.webkitTransform = "";
                    t.style.transform = "";
                    MemorizeApp.game.selectedCards[0].style.webkitTransform = "";
                    MemorizeApp.game.selectedCards[0].style.transform = "";
                    MemorizeApp.game.selectedCards = [];

                    setTimeout(function () {
                        if (fromMe) {
                            for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                                if (MemorizeApp.game.players[i].online && MemorizeApp.game.players[i].networkId != MemorizeApp.me.networkId) {
                                    MemorizeApp.game.currentPlayer = MemorizeApp.game.players[i].networkId;
                                    sendMessage({
                                        action: "updateCurrentPlayer",
                                        currentPlayer: MemorizeApp.game.currentPlayer
                                    });
                                    displayUsersAndScores();
                                    break;
                                }
                            }
                        }
                    }, 300);


                } catch (e) {
                }
            }, 2000)

        }

        function saveGame() {
            MemorizeApp.activity.getDatastoreObject().setDataAsText(JSON.stringify({game: MemorizeApp.game}));
            MemorizeApp.activity.getDatastoreObject().save(function (error, meta) {
            });
        }

        function onCardClick() {
            if (MemorizeApp.game.multiplayer) {
                if (MemorizeApp.game.currentPlayer != MemorizeApp.me.networkId) {
                    return;
                }
                sendMessage({action: "cardClick", position: this.cardPosition});
                if (MemorizeApp.game.players.length == 0 || MemorizeApp.game.players.length == 1) {
                    cardClick(this, true);
                }
                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    if (MemorizeApp.game.players[i].networkId == MemorizeApp.me.networkId) {
                        cardClick(this, true, MemorizeApp.game.players[i]);
                    }
                }
            } else {
                cardClick(this, true);
            }

        }

        function drawGame() {
            if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                MemorizeApp.ui.gameEditorInsertModeButton.style.backgroundImage = "url(icons/pair-non-equals.svg)"
            } else {
                MemorizeApp.ui.gameEditorInsertModeButton.style.backgroundImage = "url(icons/pair-equals.svg)"
            }
            if (MemorizeApp.game.template.mode == MODE_CLASSIC) {
                MemorizeApp.ui.gameEditorPlayModeButton.style.backgroundImage = "url(icons/grouped_game1.svg)";
            } else {
                MemorizeApp.ui.gameEditorPlayModeButton.style.backgroundImage = "url(icons/grouped_game2.svg)";
            }

            MemorizeApp.ui.gameSizeButton.style.background = "url(icons/" + MemorizeApp.game.size + "x" + MemorizeApp.game.size + ".svg)";
            MemorizeApp.ui.gameTemplatesButton.style.backgroundImage = "url(icons/" + MemorizeApp.game.template.icon + ")";

            MemorizeApp.ui.gameGrid.innerHTML = "";

            var gameDiv = MemorizeApp.ui.gameGrid;
            var width = document.body.clientWidth;
            var height = document.body.clientHeight;
            var middle = MemorizeApp.game.cards.length / 2;

            var minSize = height;
            if (width < height) {
                minSize = width;
            }
            minSize = minSize - (56 + 20) * 3;
            minSize = minSize / MemorizeApp.game.size;

            for (var i = 0; i < MemorizeApp.game.cards.length; i++) {
                var card = MemorizeApp.game.cards[i];

                if (i % MemorizeApp.game.size == 0 && i > 0) {
                    var div = document.createElement("div");
                    div.style.clear = "both";
                    gameDiv.appendChild(div);
                }

                var fullCardDiv = createFullCardDiv(i, minSize, card);
                var front = createFrontDiv(i, middle, minSize);
                var div = createDiv(i, minSize, card);

                fullCardDiv.card = card;
                fullCardDiv.resultDiv = div;

                var clickEvent = "click";
                if ("ontouchstart" in document.documentElement) {
                    clickEvent = "touchend";
                }
                fullCardDiv.addEventListener(clickEvent, onCardClick, false);
                fullCardDiv.appendChild(div);
                fullCardDiv.appendChild(front);
                gameDiv.appendChild(fullCardDiv);
            }

            gameDiv.style.width = parseInt(minSize + 10) * parseInt(MemorizeApp.game.size + 1) + "px";
            gameDiv.style.marginLeft = "auto";
            gameDiv.style.marginRight = "auto";

            resizeTextInsideTextCardDivs();
        }

        function onDataReceived(data) {
            if (data.user.networkId == MemorizeApp.me.networkId) {
                return;
            }

            data.content = JSON.parse(lzString.decompressFromUTF16(data.content));

            if (data.content.action == "updateCurrentPlayer") {
                MemorizeApp.game.currentPlayer = data.content.currentPlayer;
                displayUsersAndScores();
            }

            if (data.content.action == "updateGame") {
                MemorizeApp.game = data.content.game;
                MemorizeApp.ui.gameSizeButton.style.background = "url(icons/" + MemorizeApp.game.size + "x" + MemorizeApp.game.size + ".svg)";
                MemorizeApp.ui.gameTemplatesButton.style.backgroundImage = "url(icons/" + MemorizeApp.game.template.icon + ")";
                MemorizeApp.drawGame();
                displayUsersAndScores();
                saveGame();
            }

            if (data.content.action == "cardClick") {
                var notFilteredCards = MemorizeApp.ui.gameGrid.childNodes;
                var cards = [];

                for (var i = 0; i < notFilteredCards.length; i++) {
                    if (!notFilteredCards[i].style.clear || notFilteredCards[i].style.clear == "") {
                        cards.push(notFilteredCards[i]);
                    }
                }

                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    if (MemorizeApp.game.players[i].networkId == data.user.networkId) {
                        cardClick(cards[data.content.position], false, MemorizeApp.game.players[i]);
                    }
                }
            }
        }

        function sendMessage(content) {
            if (!MemorizeApp.game.multiplayer) {
                return;
            }
            var sharedId = window.top.sugar.environment.sharedId;
            if (!sharedId) {
                sharedId = MemorizeApp.presence.getSharedInfo().id
            }

            MemorizeApp.presence.sendMessage(sharedId, {
                user: MemorizeApp.presence.getUserInfo(),
                content: lzString.compressToUTF16(JSON.stringify(content))
            });
        }

        function displayUsersAndScores() {
            if (MemorizeApp.game.players.length == 0) {
                return;
            }
            var div = document.createElement("div");

            var myTurn = false;
            if (MemorizeApp.game.currentPlayer == MemorizeApp.me.networkId) {
                myTurn = true;
            }
            var canPlay = document.createElement("div");
            canPlay.style.float = "left";
            canPlay.style.marginTop = "10px";
            canPlay.style.width = "30px";
            canPlay.style.marginRight = "3px";
            canPlay.style.borderRight = "1px solid #fff";
            canPlay.style.height = "30px";
            if (myTurn) {
                canPlay.style.backgroundImage = "url(icons/play.svg)"
            } else {
                canPlay.style.backgroundImage = "url(icons/sandclock.svg)"
            }
            canPlay.style.backgroundPosition = "center center";
            canPlay.style.backgroundRepeat = "no-repeat";
            div.appendChild(canPlay);

            for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                var player = MemorizeApp.game.players[i];
                var d = document.createElement("div");
                d.style.paddingTop = "15px";
                var xoColor = generateXOLogoWithColor(player.colorvalue);
                var scores = "";
                for (var j = 0; j < player.score; j++) {
                    scores += '<img style="height:13px;" src="icons/pair-add.svg">';
                }
                d.innerHTML = '<img style="height:23px; vertical-align:middle; " src="' + xoColor + '"><span style="color:#fff;">' + player.name + "</span> " + scores;
                d.style.float = "left";
                if (i != 0) {
                    d.style.marginLeft = "10px";
                }
                div.appendChild(d);
            }
            MemorizeApp.ui.gamePlayers.innerHTML = "";
            MemorizeApp.ui.gamePlayers.appendChild(div);
        }

        function onUsersListChanged(users) {
            for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                MemorizeApp.game.players[i].online = false;
            }

            if (!MemorizeApp.hasLoadedMultiplayer && users.length >= 3) {
                document.getElementById("stop-button").click();
                return;
            }

            MemorizeApp.hasLoadedMultiplayer = true;


            if (users.length == 1) {
                MemorizeApp.isHost = true;
                MemorizeApp.game.currentPlayer = MemorizeApp.me.networkId;
                MemorizeApp.game.selectedCards = [];
                drawGame();
                displayUsersAndScores();
                return;
            }

            for (var i = 0; i < users.length; i++) {
                var found = false;
                for (var j = 0; j < MemorizeApp.game.players.length; j++) {
                    if (MemorizeApp.game.players[j].networkId == users[i].networkId) {
                        MemorizeApp.game.players[j].online = true;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    var user = users[i];
                    user.score = 0;
                    user.online = true;
                    MemorizeApp.game.players.push(user);
                }
            }
            if (MemorizeApp.isHost) {
                sendMessage({action: "updateGame", game: MemorizeApp.game});
            }
            displayUsersAndScores();
        }

        var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

        function generateXOLogoWithColor(color) {
            var coloredLogo = xoLogo;
            coloredLogo = coloredLogo.replace("#010101", color.stroke);
            coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);

            return "data:image/svg+xml;base64," + btoa(coloredLogo);
        }

        function initUI(callback) {
            MemorizeApp.ui.gameGrid = document.getElementById("game-grid");
            MemorizeApp.ui.gamePlayers = document.getElementById("game-players");
            MemorizeApp.ui.gameEditor = document.getElementById("game-editor");

            MemorizeApp.ui.gameTemplatesButton = document.getElementById("game-templates-button");

            var gt = new templatePalette.TemplatePalette(MemorizeApp.ui.gameTemplatesButton, undefined, MemorizeApp.templates);
            gt.addEventListener('template', function (e) {
                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    MemorizeApp.game.players[i].score = 0;
                }
                MemorizeApp.game.template = e.detail.value;
                MemorizeApp.ui.gameTemplatesButton.style.backgroundImage = "url(icons/" + e.detail.value.icon + ")";
                MemorizeApp.computeCards();
                MemorizeApp.drawGame();
                sendMessage({action: "updateGame", game: MemorizeApp.game});
            });

            MemorizeApp.ui.gameSizeButton = document.getElementById("game-size-button");
            var sp = new sizePalette.SizePalette(MemorizeApp.ui.gameSizeButton);
            sp.addEventListener('size', function (e) {
                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    MemorizeApp.game.players[i].score = 0;
                }
                MemorizeApp.game.size = e.detail.value;
                MemorizeApp.ui.gameSizeButton.style.background = "url(icons/" + e.detail.value + "x" + e.detail.value + ".svg)";
                MemorizeApp.computeCards();
                MemorizeApp.drawGame();
                sendMessage({action: "updateGame", game: MemorizeApp.game});
            });


            MemorizeApp.ui.gameResetButton = document.getElementById("game-reset-button");
            MemorizeApp.ui.gameResetButton.addEventListener("click", function () {
                for (var i = 0; i < MemorizeApp.game.players.length; i++) {
                    MemorizeApp.game.players[i].score = 0;
                }
                MemorizeApp.game.selectedCards = [];
                MemorizeApp.game.cards = [];
                displayUsersAndScores();
                MemorizeApp.computeCards();
                MemorizeApp.drawGame();
                sendMessage({action: "updateGame", game: MemorizeApp.game});
            });

            MemorizeApp.ui.gameEditorButton = document.getElementById("game-editor-button");
            MemorizeApp.ui.gameEditorInsertModeButton = document.getElementById("game-editor-insert-mode-button");
            MemorizeApp.ui.gameEditorPlayModeButton = document.getElementById("game-editor-play-mode-button");

            MemorizeApp.ui.gameEditorPlayModeButton.addEventListener("click", function() {
                if (MemorizeApp.game.template.mode == MODE_CLASSIC) {
                    MemorizeApp.game.template.mode = MODE_SPLITTED;
                    MemorizeApp.ui.gameEditorPlayModeButton.style.backgroundImage = "url(icons/grouped_game2.svg)";
                } else {
                    MemorizeApp.game.template.mode = MODE_CLASSIC;
                    MemorizeApp.ui.gameEditorPlayModeButton.style.backgroundImage = "url(icons/grouped_game1.svg)";
                }
                saveGame();
                displayEditor();
            });


            MemorizeApp.ui.gameEditorClearButton = document.getElementById("game-editor-clear-button");

            MemorizeApp.ui.gameEditorInsertModeButton.addEventListener("click", function() {
               if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                   MemorizeApp.editor.pairMode = MODE_NON_EQUAL;
                   MemorizeApp.ui.gameEditorInsertModeButton.style.backgroundImage = "url(icons/pair-non-equals.svg)"
               } else {
                   MemorizeApp.editor.pairMode = MODE_EQUAL;
                   MemorizeApp.ui.gameEditorInsertModeButton.style.backgroundImage = "url(icons/pair-equals.svg)"
               }
                saveGame();
                displayEditor();
            });

            MemorizeApp.ui.gameEditorClearButton.addEventListener("click", function() {
                MemorizeApp.game.template.cards = [];
                saveGame();
                displayEditor();
            });

            MemorizeApp.ui.gameEditorButton.addEventListener("click", function () {
                if (MemorizeApp.inEditMode) {
                    leaveEditMode();
                } else {
                    enterEditMode();
                }
            });

            MemorizeApp.ui.gameEditorInsertModeButton.disabled = true;
            MemorizeApp.ui.gameEditorInsertModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorPlayModeButton.disabled = true;
            MemorizeApp.ui.gameEditorPlayModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorClearButton.disabled = true;
            MemorizeApp.ui.gameEditorClearButton.style.opacity = 0.3;

            //window.onresize = function () {
            //    setTimeout(function () {
            //        if (MemorizeApp.inEditMode) {
            //            displayEditor()
            //        } else {
            //            MemorizeApp.drawGame();
            //        }
            //    }, 250);
            //};


            if (callback) {
                callback();
            }
        }

        function enterEditMode() {
            //TODO palette equality
            //TODO palette show
            MemorizeApp.inEditMode = true;
            MemorizeApp.ui.gameGrid.innerHTML = "";
            MemorizeApp.ui.gameGrid.style.display = "none";
            MemorizeApp.ui.gameEditor.style.display = "block";
            MemorizeApp.game.selectedCards = [];
            MemorizeApp.editor.selectedPair = -1;

            /* Disable game buttons */

            MemorizeApp.ui.gameTemplatesButton.disabled = true;
            MemorizeApp.ui.gameTemplatesButton.style.opacity = 0.3;

            MemorizeApp.ui.gameSizeButton.disabled = true;
            MemorizeApp.ui.gameSizeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameResetButton.disabled = true;
            MemorizeApp.ui.gameResetButton.style.opacity = 0.3;

            /* Enable editor buttons */

            MemorizeApp.ui.gameEditorInsertModeButton.disabled = false;
            MemorizeApp.ui.gameEditorInsertModeButton.style.opacity = 1;

            MemorizeApp.ui.gameEditorPlayModeButton.disabled = false;
            MemorizeApp.ui.gameEditorPlayModeButton.style.opacity = 1;

            MemorizeApp.ui.gameEditorClearButton.disabled = false;
            MemorizeApp.ui.gameEditorClearButton.style.opacity = 1;

            MemorizeApp.ui.gameEditorButton.style.backgroundImage = "url(icons/play.svg)";

            displayEditor();
        }

        function generateEditorDiv(card) {
            var minSize = document.body.clientWidth;
            if (minSize > document.body.clientHeight) {
                minSize = document.body.clientHeight;
            }

            var e = document.createElement("div");
            e.style.width = parseInt(minSize / 3.5) + "px";
            e.style.marginLeft = "25px";
            e.style.float = "left";
            e.style.marginTop = "7px";

            var d = document.createElement("div");
            d.style.width = parseInt(minSize / 3.5) - 10 + "px";
            d.style.height = parseInt(minSize / 3.5) - 10 + "px";
            d.style.background = "rgb(119, 119, 119)";
            d.style.border = "4px solid #000";
            d.style.textAlign = "center";
            d.style.borderRadius = "9px";
            d.style.color = "#fff";
            d.style.fontSize = parseInt(minSize / 3.5) - 10 + "px";
            d.style.lineHeight = parseInt(minSize / 3.5) - 10 + "px";
            d.className = "textCard";
            d.style.backgroundRepeat = "no-repeat";
            d.style.backgroundSize = "100%";
            d.style.backgroundPosition = "center";
            if (card && card.text) {
                d.innerHTML = card.text;
            } else if (card && card.image) {
                d.style.backgroundImage = "url('" + card.image + "')";
            }

            var importPicture = document.createElement("img");
            importPicture.style.marginLeft = "5px";
            importPicture.style.marginTop = "5px";
            importPicture.style.textAlign = "center";
            importPicture.setAttribute("src", "icons/import_picture.svg");
            importPicture.style.width = "30px";
            importPicture.className = "insertImage";

            var input = document.createElement("input");
            input.setAttribute("type", "text");
            input.style.marginRight = "auto";
            input.style.marginLeft = "auto";
            input.style.width = parseInt(minSize / 3.5) - 50 + "px";
            input.style.marginTop = "5px";
            input.card = card;
            if (card && card.text) {
                input.value = card.text;
            }

            input.linkedDiv = d;
            input.onkeyup = function () {
                this.linkedDiv.innerHTML = this.value;
                this.linkedDiv.style.fontSize = this.linkedDiv.style.width;
                this.card.text = this.value;
                resizeTextInsideTextCardDivs()
            };

            e.appendChild(d);
            e.appendChild(input);
            e.appendChild(importPicture);

            return e;
        }

        function generateAddEditRemoveButton() {
            var div = document.createElement("div");
            var minSize = document.body.clientWidth;
            if (minSize > document.body.clientHeight) {
                minSize = document.body.clientHeight;
            }

            div.style.float = "right";
            div.style.height = parseInt(minSize / 3.5) + "px";
            div.style.marginRight = "20px";
            div.style.marginTop = "7px";

            var addButton = document.createElement("div");
            var updateButton = document.createElement("div");
            var deleteButton = document.createElement("div");

            var buttonSize = parseInt((minSize / 3.5) / 5) + "px";

            addButton.style.padding = "5px";
            addButton.style.userSelect = "none";
            addButton.style.webkitUserSelect = "none";
            addButton.style.mozUserSelect = "none";
            addButton.innerHTML = "<img style='height:" + buttonSize + "; width:" + buttonSize + ";' src='icons/pair-add.svg'><br/>" + MemorizeApp.strings.add;
            addButton.onmouseover = function () {
                this.style.background = "#888";
            };
            addButton.onmouseout = function () {
                this.style.background = "transparent";
            };
            addButton.addEventListener("click", function () {
                var cards = [];
                if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                    cards[0] = MemorizeApp.editor.card1;
                    cards[1] = MemorizeApp.editor.card1;
                }
                if (MemorizeApp.editor.pairMode == MODE_NON_EQUAL) {
                    cards[0] = MemorizeApp.editor.card1;
                    cards[1] = MemorizeApp.editor.card2;
                }

                if (!cards[0].text && !cards[0].image && !cards[0].sound) {
                    return;
                }

                if (!cards[1].text && !cards[1].image && !cards[1].sound) {
                    return;
                }

                cards = JSON.parse(JSON.stringify(cards));
                MemorizeApp.editor.card1 = {};
                MemorizeApp.editor.card2 = {};
                MemorizeApp.game.template.cards.push(cards);
                MemorizeApp.editor.selectedPair = -1;
                saveGame();
                displayEditor();
            });

            updateButton.style.padding = "5px";
            updateButton.style.userSelect = "none";
            updateButton.style.webkitUserSelect = "none";
            updateButton.style.mozUserSelect = "none";
            updateButton.innerHTML = "<img style='height:" + buttonSize + "; width:" + buttonSize + ";' src='icons/pair-update.svg'><br/>" + MemorizeApp.strings.update;
            updateButton.onmouseover = function () {
                this.style.background = "#888";
            };
            updateButton.onmouseout = function () {
                this.style.background = "transparent";
            };
            updateButton.addEventListener("click", function () {
                var cards = [];
                if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                    cards[0] = MemorizeApp.editor.card1;
                    cards[1] = MemorizeApp.editor.card1;
                }
                if (MemorizeApp.editor.pairMode == MODE_NON_EQUAL) {
                    cards[0] = MemorizeApp.editor.card1;
                    cards[1] = MemorizeApp.editor.card2;
                }

                if (!cards[0].text && !cards[0].image && !cards[0].sound) {
                    return;
                }

                if (!cards[1].text && !cards[1].image && !cards[1].sound) {
                    return;
                }

                cards = JSON.parse(JSON.stringify(cards));

                if (MemorizeApp.editor.selectedPair > -1) {
                    MemorizeApp.game.template.cards[MemorizeApp.editor.selectedPair] = cards
                }
                saveGame();
                displayEditor();
            });

            deleteButton.style.padding = "5px";
            deleteButton.style.userSelect = "none";
            deleteButton.style.webkitUserSelect = "none";
            deleteButton.style.mozUserSelect = "none";
            deleteButton.innerHTML = "<img style='height:" + buttonSize + "; width:" + buttonSize + ";' src='icons/remove.svg'><br/>" + MemorizeApp.strings.remove;
            deleteButton.onmouseover = function () {
                this.style.background = "#888";
            };
            deleteButton.onmouseout = function () {
                this.style.background = "transparent";
            };
            deleteButton.addEventListener("click", function () {
                if (MemorizeApp.editor.selectedPair > -1) {
                    MemorizeApp.game.template.cards.splice(MemorizeApp.editor.selectedPair, 1);
                }

                MemorizeApp.editor.selectedPair = -1;
                MemorizeApp.editor.card1 = {};
                MemorizeApp.editor.card2 = {};
                saveGame();
                displayEditor();
            });

            div.appendChild(addButton);
            div.appendChild(updateButton);
            div.appendChild(deleteButton);

            return div;
        }

        function generateCardFromCardsList(pair, minSize, index) {
            minSize = minSize - 10;
            var d = document.createElement("div");
            d.style.display = "inline-block";
            d.style.height = minSize + "px";
            d.style.marginLeft = "5px";

            if (index == MemorizeApp.editor.selectedPair) {
                d.style.border = "3px solid #00f";
            }
            //d.style.marginTop = "5px";
            //d.style.marginLeft = "15px";

            var card1 = document.createElement("div");
            card1.style.backgroundRepeat = "no-repeat";
            card1.style.backgroundSize = "cover";
            card1.style.backgroundPosition = "center center";

            card1.innerHTML = "&nbsp;";
            card1.style.backgroundColor = "#666";
            card1.className = "textCard";


            if (pair[0].text) {
                if (pair[0].text.indexOf(INLINE_RES) == 0) {
                    pair[0].text = SampleRessources[pair[0].image.slice(INLINE_RES.length)]
                }
                card1.innerHTML = pair[0].text;
            }
            else if (pair[0].image) {
                if (pair[0].image.indexOf(INLINE_RES) == 0) {
                    pair[0].image = SampleRessources[pair[0].image.slice(INLINE_RES.length)]
                }
                card1.style.backgroundImage = "url('" + pair[0].image + "')";

            }
            card1.style.width = parseInt(minSize / 2) + "px";
            card1.style.height = parseInt(minSize / 2) + "px";
            card1.style.lineHeight = card1.style.width + "";
            card1.style.borderRadius = "6px";
            card1.style.textAlign = "center";
            card1.style.fontSize = parseInt(minSize / 8) + "px";
            card1.style.border = "1px solid #000";
            card1.style.color = "#fff";
            card1.style.marginBottom = "5px";


            var card2 = document.createElement("div");
            card2.style.backgroundRepeat = "no-repeat";
            card2.style.backgroundPosition = "center center";
            card2.style.backgroundSize = "cover";


            card2.innerHTML = "&nbsp;";
            card2.style.backgroundColor = "#666";
            card2.className = "textCard";
            if (pair[1].text) {
                if (pair[1].text.indexOf(INLINE_RES) == 0) {
                    pair[1].text = SampleRessources[pair[1].image.slice(INLINE_RES.length)]
                }
                card2.innerHTML = pair[1].text;
            }
            else if (pair[1].image) {
                if (pair[1].image.indexOf(INLINE_RES) == 0) {
                    pair[1].image = SampleRessources[pair[1].image.slice(INLINE_RES.length)]
                }
                card2.style.backgroundImage = "url('" + pair[1].image + "')";
            }

            card2.style.width = parseInt(minSize / 2) + "px";
            card2.style.height = parseInt(minSize / 2) + "px";
            card2.style.textAlign = "center";
            card2.style.lineHeight = card2.style.width + "";
            card2.style.borderRadius = "6px";
            card2.style.fontSize = parseInt(minSize / 8) + "px";
            card2.style.border = "1px solid #000";
            card2.style.color = "#fff";

            d.appendChild(card1);
            d.appendChild(card2);

            return d;
        }

        function insertimagebuttonsFun(){
            document.getElementsByClassName("insertImage")[0].onclick = function(){
                var cards = [];
                chooser.show(function (entry) {
                    // No selection
                    if (!entry) {
                        return;
                    }
                    // Get object content
                    var dataentry = new datastore.DatastoreObject(entry.objectId);
                    dataentry.loadAsText(function (err, metadata, text) {
                        //We load the drawing inside an image element
                        var element = document.createElement('img');
                        if (entry.metadata.activity ==  'org.olpcfrance.PaintActivity') {
                            element.src = LZString.decompressFromUTF16(JSON.parse(text).src);
                        } else {
                            element.src = text;
                        }
                        element.onload = function () {
                            document.getElementsByClassName("textCard")[0].style.backgroundImage = 'url(' + element.src + ')';
                            if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                                MemorizeApp.editor.card1.image = element.src;
                                MemorizeApp.editor.card1.text = "";
                                MemorizeApp.editor.card2.image = element.src;
                                MemorizeApp.editor.card2.text = "";
                            }else{
                                MemorizeApp.editor.card1.image = element.src;
                                MemorizeApp.editor.card1.text = "";
                            }
                            var cards = [];
                            if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                                cards[0] = MemorizeApp.editor.card1;
                                cards[1] = MemorizeApp.editor.card1;
                            }
                            if (MemorizeApp.editor.pairMode == MODE_NON_EQUAL) {
                                cards[0] = MemorizeApp.editor.card1;
                                cards[1] = MemorizeApp.editor.card2;
                            }

                            if (!cards[0].text && !cards[0].image && !cards[0].sound) {
                                return;
                            }

                            if (!cards[1].text && !cards[1].image && !cards[1].sound) {
                                return;
                            }

                            cards = JSON.parse(JSON.stringify(cards));

                            if (MemorizeApp.editor.selectedPair > -1) {
                                MemorizeApp.game.template.cards[MemorizeApp.editor.selectedPair] = cards
                            }
                            saveGame();
                            displayEditor();
                        };
                    });
                }, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' }, { activity: 'org.olpcfrance.PaintActivity'});
            }
            if(document.getElementsByClassName("insertImage")[1]){
                document.getElementsByClassName("insertImage")[1].onclick = function(){
                    var cards = [];
                    chooser.show(function (entry) {
                        // No selection
                        if (!entry) {
                            return;
                        }
                        // Get object content
                        var dataentry = new datastore.DatastoreObject(entry.objectId);
                        dataentry.loadAsText(function (err, metadata, text) {
                            //We load the drawing inside an image element
                            var element = document.createElement('img');
                            element.src = text;
                            element.onload = function () {
                                document.getElementsByClassName("textCard")[1].style.backgroundImage = 'url(' + element.src + ')';
                                if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                                    MemorizeApp.editor.card1.image = element.src;
                                    MemorizeApp.editor.card1.text = "";
                                    MemorizeApp.editor.card2.image = element.src;
                                    MemorizeApp.editor.card2.text = "";
                                }else{
                                    MemorizeApp.editor.card2.image = element.src;
                                    MemorizeApp.editor.card2.text = "";
                                }
                                var cards = [];
                                if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                                    cards[0] = MemorizeApp.editor.card1;
                                    cards[1] = MemorizeApp.editor.card1;
                                }
                                if (MemorizeApp.editor.pairMode == MODE_NON_EQUAL) {
                                    cards[0] = MemorizeApp.editor.card1;
                                    cards[1] = MemorizeApp.editor.card2;
                                }

                                if (!cards[0].text && !cards[0].image && !cards[0].sound) {
                                    return;
                                }

                                if (!cards[1].text && !cards[1].image && !cards[1].sound) {
                                    return;
                                }
                                cards = JSON.parse(JSON.stringify(cards));
                                if (MemorizeApp.editor.selectedPair > -1) {
                                    MemorizeApp.game.template.cards[MemorizeApp.editor.selectedPair] = cards
                                }
                                saveGame();
                                displayEditor();
                            };
                        });
                    }, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
                }
            }
        }

        function generateCardsList() {
            var div = document.createElement("div");
            var minSize = document.body.clientWidth;
            if (minSize > document.body.clientHeight) {
                minSize = document.body.clientHeight;
            }

            div.style.position = "fixed";
            div.style.bottom = 0;
            div.style.width = document.body.clientWidth + "px";
            div.style.height = parseInt(minSize / 3) + "px";
            div.style.padding = "10px";
            div.style.paddingBottom = "20px";
            div.style.marginTop = "7px";
            div.style.background = "#eee";
            div.style.overflowX = "auto";
            div.style.whiteSpace = "nowrap"
            div.style.overflowY = "hidden";

            for (var i = 0; i < MemorizeApp.game.template.cards.length; i++) {
                var card = MemorizeApp.game.template.cards[i];
                var pair = generateCardFromCardsList(card, parseInt(minSize / 3), i);
                pair.cards = card;
                pair.index = i;
                pair.addEventListener("click", function() {
                    MemorizeApp.editor.selectedPair = this.index;
                    MemorizeApp.editor.pairMode = MODE_NON_EQUAL;
                    MemorizeApp.editor.card1 = this.cards[0];
                    MemorizeApp.editor.card2 = this.cards[1];
                    displayEditor();
                });

                div.appendChild(pair);
            }
            var emptyDiv = document.createElement("div");
            emptyDiv.style.height = parseInt(minSize/6)+"px";
            emptyDiv.style.width = "30px";
            emptyDiv.style.display = "inline-block";
            div.appendChild(emptyDiv);

            return div;
        }

        function generateClearBoth() {
            var d = document.createElement("div");
            d.style.clear = "both";
            return d;
        }

        function displayEditor() {
            MemorizeApp.ui.gameEditor.innerHTML = "";

            if (MemorizeApp.editor.pairMode == MODE_EQUAL) {
                MemorizeApp.ui.gameEditor.appendChild(generateEditorDiv(MemorizeApp.editor.card1));
            }

            if (MemorizeApp.editor.pairMode == MODE_NON_EQUAL) {
                MemorizeApp.ui.gameEditor.appendChild(generateEditorDiv(MemorizeApp.editor.card1));
                MemorizeApp.ui.gameEditor.appendChild(generateEditorDiv(MemorizeApp.editor.card2));
            }
            insertimagebuttonsFun();
            MemorizeApp.ui.gameEditor.appendChild(generateAddEditRemoveButton());
            MemorizeApp.ui.gameEditor.appendChild(generateClearBoth());
            MemorizeApp.ui.gameEditor.appendChild(generateCardsList());

            resizeTextInsideTextCardDivs()

        }

        function leaveEditMode() {
            MemorizeApp.editor.card1 = {};
            MemorizeApp.editor.card2 = {};
            MemorizeApp.inEditMode = false;
            MemorizeApp.ui.gameEditor.innerHTML = "";
            MemorizeApp.ui.gameEditor.style.display = "none";
            MemorizeApp.ui.gameGrid.style.display = "block";

            /* Enable game buttons */

            MemorizeApp.ui.gameTemplatesButton.disabled = false;
            MemorizeApp.ui.gameTemplatesButton.style.opacity = 1;

            MemorizeApp.ui.gameSizeButton.disabled = false;
            MemorizeApp.ui.gameSizeButton.style.opacity = 1;

            MemorizeApp.ui.gameResetButton.disabled = false;
            MemorizeApp.ui.gameResetButton.style.opacity = 1;

            /* Disable editor buttons */

            MemorizeApp.ui.gameEditorInsertModeButton.disabled = true;
            MemorizeApp.ui.gameEditorInsertModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorPlayModeButton.disabled = true;
            MemorizeApp.ui.gameEditorPlayModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorClearButton.disabled = true;
            MemorizeApp.ui.gameEditorClearButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorButton.style.backgroundImage = "url(icons/cog.svg)";

            MemorizeApp.drawGame();
        }

        function disableEditMode() {
            /* Disable All editor buttons */

            MemorizeApp.ui.gameEditorButton.disabled = true;
            MemorizeApp.ui.gameEditorButton.style.opacity = 0.3;
            MemorizeApp.ui.gameEditorButton.style.backgroundImage = "url(icons/cog.svg)";

            MemorizeApp.ui.gameEditorInsertModeButton.disabled = true;
            MemorizeApp.ui.gameEditorInsertModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorPlayModeButton.disabled = true;
            MemorizeApp.ui.gameEditorPlayModeButton.style.opacity = 0.3;

            MemorizeApp.ui.gameEditorClearButton.disabled = true;
            MemorizeApp.ui.gameEditorClearButton.style.opacity = 0.3;
        }

        var Base64Binary = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

            _arrayBufferToBase64: function (buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            },

            /* will return a  Uint8Array type */
            decodeArrayBuffer: function (input) {
                var bytes = (input.length / 4) * 3;
                var ab = new ArrayBuffer(bytes);
                this.decode(input, ab);

                return ab;
            },

            removePaddingChars: function (input) {
                var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
                if (lkey == 64) {
                    return input.substring(0, input.length - 1);
                }
                return input;
            },

            decode: function (input, arrayBuffer) {
                //get last chars to see if are valid
                input = this.removePaddingChars(input);
                input = this.removePaddingChars(input);

                var bytes = parseInt((input.length / 4) * 3, 10);

                var uarray;
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                var j = 0;

                if (arrayBuffer)
                    uarray = new Uint8Array(arrayBuffer);
                else
                    uarray = new Uint8Array(bytes);

                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                for (i = 0; i < bytes; i += 3) {
                    enc1 = this._keyStr.indexOf(input.charAt(j++));
                    enc2 = this._keyStr.indexOf(input.charAt(j++));
                    enc3 = this._keyStr.indexOf(input.charAt(j++));
                    enc4 = this._keyStr.indexOf(input.charAt(j++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    uarray[i] = chr1;
                    if (enc3 != 64) uarray[i + 1] = chr2;
                    if (enc4 != 64) uarray[i + 2] = chr3;
                }

                return uarray;
            }
        }


        return MemorizeApp;
    }
)
;
