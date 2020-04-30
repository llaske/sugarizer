define([
    "sugar-web/activity/activity",
    "sugar-web/env",
    "sugar-web/graphics/icon",
    "webL10n",
    "sugar-web/graphics/presencepalette",
    "toolpalette",
    "humane",
    "tutorial"
], function (activity, env, icon, webL10n, presencepalette, toolpalette, humane, tutorial) {
    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        activity.setup();

        // initiating the level palette (for easy/ medium/ hard)
        var levelButton = document.getElementById("level-button");
        var levels = [
            {"id": 1, "title": webL10n.get("easy")},
            {"id": 2, "title": webL10n.get("medium")},
            {"id": 3, "title": webL10n.get("hard")}
        ];
        levelpalette = new toolpalette.FilterPalette(levelButton, undefined);
        levelpalette.setCategories(levels);
        levelpalette.addEventListener('filter', function () {
            setLevel(levelpalette.getFilter());
            levelpalette.popDown();
        });

        // initiating the filter palette (for add/ sub/ multiplication)
        var filterButton = document.getElementById("filter-button");
        var filter = [
            {"id": 1, "title": "+"},
            {"id": 2, "title": "-"},
            {"id": 3, "title": "x"},
            {"id": 4, "title": "+ / x / -"}
        ];
        fpalette = new toolpalette.FilterPalette(filterButton, undefined);
        fpalette.setCategories(filter);
        fpalette.addEventListener('filter', function () {
            setOperation(fpalette.getFilter());
            fpalette.popDown();
        });

        // initializing network palette

        // Link presence palette
        var presence = null;
        var isHost = false;
        var networkpalette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
        networkpalette.addEventListener('shared', function () {
            networkpalette.popDown();
            presence = activity.getPresenceObject(function (error, network) {
                if (error) {
                    console.log("Sharing error");
                    return;
                }
                network.createSharedActivity('org.sugarlabs.SprintMath', function (groupId) {
                    console.log("Activity shared");
                    // disable toolbar buttons functionally
                    hidetoolbarbuttons();
                    isHost = true;
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);

            });
        });


        // Initialize the activity.
        var play = false;            // whether the game is playing (True) or ended (False)
        var score;                   // score of the user in the game
        var action;                  // instance of the interval
        var time;                    // time remaining in the game
        var questions = [];          // array to hold all 200 random questions
        var questionNumber = 0;      // index of current question
        var gameLevel = "easy";      // game level (easy/med/hard)
        var gameOperation = 1;       // game operation (add/sub/multiply)
        var gameOverMessages = [];   // in case of presence stores all game over messages
        var gamePlaying = [];        // in case of presence stores all users that are playing
        var restart= false;

        // function to hide a particular DOM element
        function hide(Id) {
            document.getElementById(Id).style.display = "none";
        }

        // function to show a particular DOM element
        function show(Id) {
            document.getElementById(Id).style.display = "block";
        }

        // function to run when game over
        function gameOver() {
            clearInterval(action);
            document.getElementById("timeremaining").innerHTML = 60;
            hide("time");
            hide("correct");
            hide("score");
            hide("wrong");
            hide("box1");
            hide("box2");
            hide("box3");
            hide("box4");
            show("gameOver");
            setGameOverMessage();
            play = false;
            restart= true;
            if(!play && presence && isHost){
                hidetoolbarbuttons();
            }
        }

        // to set game over message after game is finished
        function setGameOverMessage() {
            if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'gameover',
                        data: score
                    }
                });
                gameOverMessages.push({"user": currentenv.user, "score": score});
                showAllUserScores();
            } else {
                document.getElementById("gameOver").innerHTML = webL10n.get("GameOver", {
                    name: currentenv.user.name,
                    score: score
                });

                document.getElementById("gameOver").style.backgroundColor = currentenv.user.colorvalue.stroke;
                document.getElementById("gameOver").style.color = currentenv.user.colorvalue.fill;
            }
            document.getElementById("question").innerHTML = '';
            for (var i = 1; i < 5; i++) {
                document.getElementById("box" + i).innerHTML = '';
            }

        }

        // to show all presence user scores
        function showAllUserScores() {
            var div = document.createElement("div");
            for (i = 0; i < gameOverMessages.length; i++) {
                var div_child = document.createElement("div");
                div_child.innerHTML = webL10n.get("GameOver", {
                    name: gameOverMessages[i].user.name,
                    score: gameOverMessages[i].score
                });

                div_child.style.backgroundColor= gameOverMessages[i].user.colorvalue.stroke;
                div_child.style.color= gameOverMessages[i].user.colorvalue.fill;
                div.appendChild(div_child)
            }
            for (i=0;i<gamePlaying.length;i++){
                var div_child = document.createElement("div");
                div_child.innerHTML = webL10n.get("GamePlaying", {
                    name: gamePlaying[i].name
                });

                div_child.style.backgroundColor= gamePlaying[i].colorvalue.stroke;
                div_child.style.color= gamePlaying[i].colorvalue.fill;
                div.appendChild(div_child)
            }
            document.getElementById("gameOver").innerHTML = '';
            document.getElementById("gameOver").appendChild(div);
        }

        // starts the timer
        function startCountdown() {
            action = setInterval(function () {
                time -= 1;
                document.getElementById("timeremaining").innerHTML = time;
                if (time == 0) {
                    gameOver();
                }
            }, 1000);
        }

        // setting event listeners on answer boxes
        for (var i = 1; i < 5; i++) {
            document.getElementById("box" + i).onclick = function () {
                var Correctans = questions[questionNumber].answer;
                if (play) {
                    if (this.innerHTML == Correctans) {
                        score++;
                        document.getElementById("scorevalue").innerHTML = score;
                        hide("wrong");
                        show("correct");
                        setTimeout(function () {
                            hide("correct");
                        }, 1000);
                        // generateQuestion();
                        questionNumber++;
                        displayCurrentQuestion();
                    } else {
                        show("wrong");
                        hide("correct");
                        setTimeout(function () {
                            hide("wrong");
                        }, 1000);
                    }
                }
            }
        }

        // function to start a new game
        function startGame() {
            clearInterval(action);
            score = 0;
            play = true;
            time = 60;
            questionNumber = 0;
            document.getElementById("scorevalue").innerHTML = score;
            hide("gameOver");
            show("time");
            show("box1");
            show("box2");
            show("box3");
            show("box4");
            show("score");
            startCountdown();
            if (!presence) {
                questions = [];
                generateQuestions();
            }
            else if(isHost) {
                gameOverMessages=[];
                gamePlaying=[];
                gamePlaying.push(currentenv.user);
            }

            if(restart && !isHost){
                gamePlaying.push(currentenv.user)
                adduser();
            }

            // disable toolbar buttons in case of presence and display question
            if(play && presence){
                if(isHost){
                    questions=[]
                    generateQuestions()
                }
                // disable toolbar buttons functionally
                hidetoolbarbuttons();
                displayCurrentQuestion();

            }

        }

        // function to resume an old game
        function resumeGame() {
            document.getElementById("scorevalue").innerHTML = score;
            document.getElementById("timeremaining").innerHTML = time;
            show("time");
            startCountdown();
            displayCurrentQuestion();
        }

        // generate questions (will generate 200 questions at the start of the game)
        function generateQuestions() {
            for (i = 0; i < 200; i++) {

                // level factor decides which questions will be taken
                var levelFactor = 5;

                // levels logic
                if (gameLevel === 'easy') levelFactor = 5;
                else if (gameLevel === 'medium') levelFactor = 7;
                else if (gameLevel === 'hard') levelFactor = 10;

                // operation logic
                var z = 1;
                if (gameOperation === 4) {
                    z = 1 + Math.round(3 * Math.random());
                } else {
                    z = gameOperation;
                }

                var x = 1 + Math.round((levelFactor - 1) * Math.random());
                var y = 1 + Math.round((levelFactor - 1) * Math.random());

                var currentQues, currentAns;
                if (z === 1) {
                    currentAns = x + y;
                    currentQues = x + "+" + y;
                } else if (z === 2) {
                    if (x >= y) {
                        currentAns = x - y;
                        currentQues = x + "-" + y;
                    } else {
                        currentAns = y - x;
                        currentQues = y + "-" + x;
                    }
                } else {
                    currentAns = x * y;
                    currentQues = x + "x" + y;
                }

                var choices = [currentAns];

                for (var j = 1; j < 4; j++) {
                    var wrongans;
                    do {
                        if (gameOperation === 1 || gameOperation === 2) wrongans = (1 + Math.round((levelFactor + levelFactor) * Math.random()));
                        else wrongans = (1 + Math.round((levelFactor * levelFactor) * Math.random()));
                    } while (choices.indexOf(wrongans) > -1);
                    choices.push(wrongans);
                }

                shuffleArray(choices);

                questions.push({
                    "question": currentQues,
                    "answer": currentAns,
                    "choices": choices
                })
            }

            if(presence && isHost){

                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'init',
                        data: questions,
                        gameover: gameOverMessages,
                        gameplaying: gamePlaying
                    }
                });
            }

            displayCurrentQuestion();
        }

        // shuffle array
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        // set current question (will set the current question in the html DOM)
        function displayCurrentQuestion() {
            var CurrentQues = questions[questionNumber].question;
            var choices = questions[questionNumber].choices;

            // display question
            document.getElementById("question").innerHTML = CurrentQues;

            // display answers
            for (var i = 1; i < 5; i++) {
                document.getElementById("box" + i).innerHTML = choices[i - 1];
            }
        }

        document.getElementById("restart-button").onclick = startGame;

        // Launch tutorial
        document.getElementById("help-button").addEventListener('click', function(e) {
            tutorial.start();
        });

        // Sugar functions
        document.getElementById("stop-button").addEventListener('click', function (event) {
            console.log("writing...");
            object_store = {
                "play": play,
                "score": score,
                "timeremaining": time,
                "questions": questions,
                "questionNumber": questionNumber,
                "gameLevel": gameLevel,
                "gameOperation": gameOperation
            };


            var jsonData = JSON.stringify(object_store);
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.log("write failed.");
                }
            });
        });

        env.getEnvironment(function (err, environment) {
            currentenv = environment;

            var fill = currentenv.user.colorvalue.fill;
            var stroke = currentenv.user.colorvalue.stroke;

            setColor(fill, stroke);

            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            webL10n.language.code = language;

            // Load from datastore
            if (!environment.objectId) {
                startGame();
            } else {
                activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
                    if (error == null && data != null) {
                        stored_data = JSON.parse(data);

                        play = stored_data.play;
                        score = stored_data.score;
                        time = stored_data.timeremaining;
                        questions = stored_data.questions;
                        questionNumber = stored_data.questionNumber;
                        gameLevel = stored_data.gameLevel;
                        gameOperation = stored_data.gameOperation;
                        if (play && time>0) {
                            resumeGame()
                        } else {
                            startGame()
                        }

                    } else {
                        console.log(error);
                    }
                });
            }

            if (environment.sharedId) {
                // disable toolbar buttons functionally
                hidetoolbarbuttons();
                presence = activity.getPresenceObject(function (error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                    network.onSharedActivityUserChanged(onNetworkUserChanged);
                });
            }

        });

        window.addEventListener("localized", function () {
            // Set current language to Sugarizer

            document.getElementById("timeString").innerHTML = webL10n.get("Time");
            document.getElementById("scoreString").innerHTML = webL10n.get("Score");
            document.getElementById("correct").innerHTML = webL10n.get("correct");
            document.getElementById("wrong").innerHTML = webL10n.get("wrong");

            var levels = [
                {"id": 1, "title": webL10n.get("easy")},
                {"id": 2, "title": webL10n.get("medium")},
                {"id": 3, "title": webL10n.get("hard")}
            ];
            levelpalette.setCategories(levels);

        });

        // network callback
        var onNetworkDataReceived = function (msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return;
            }
            switch (msg.content.action) {
                case 'init':
                    if(gamePlaying.length===0) {
                        questions = msg.content.data;
                        gameOverMessages = msg.content.gameover;
                        gamePlaying = msg.content.gameplaying;
                        startGame();
                    }
                    break;
                case 'adduser':
                    // add user
                    gamePlaying= msg.content.data;
                    showAllUserScores();
                    break;
                case 'removeuser':
                    // remove user
                    gamePlaying= msg.content.data;

                    if(gamePlaying.length===0 && isHost) showtoolbarbuttons();
                    showAllUserScores();
                    break;
                case 'gameover':
                    // remove user from playing array
                    gamePlaying = gamePlaying.filter(function (user) {
                        return user.name !== msg.user.name
                    });
					if (presence) {
						presence.sendMessage(presence.getSharedInfo().id, {
							user: presence.getUserInfo(),
							content: {
								action: 'removeuser',
								data: gamePlaying
							}
						});
					}
                    // add user in game over array
                    gameOverMessages.push({"user": msg.user, "score": msg.content.data});
                    showAllUserScores();
                    break;
            }
        };

        var onNetworkUserChanged = function (msg) {
            if (isHost) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'init',
                        data: questions,
                        gameover: gameOverMessages,
                        gameplaying: gamePlaying
                    }
                });

                if(msg.move === 1) {
                    gamePlaying.push(msg.user);
                    adduser();
                }
                if(msg.move===-1) {
                    gamePlaying = gamePlaying.filter(function (user) {
                        return user.name !== msg.user.name
                    });
                    removeuser();
                }

                showAllUserScores();
            }

            var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');

            if(msg.move === 1){
                humane.log(webL10n.get("joined", {
                    name: userName
                }));
            }else{
                humane.log(webL10n.get("left", {
                    name: userName
                }));
            }
        };

        function adduser() {
            if (!presence) {
                return;
            }
            presence.sendMessage(presence.getSharedInfo().id, {
                user: presence.getUserInfo(),
                content: {
                    action: 'adduser',
                    data: gamePlaying
                }
            });
        }

        function removeuser() {
            presence.sendMessage(presence.getSharedInfo().id, {
                user: presence.getUserInfo(),
                content: {
                    action: 'removeuser',
                    data: gamePlaying
                }
            });
        }

        // function to set color theme based on User Colors
        function setColor(fill, stroke) {
            // set colors based on user stroke and fill colors

            document.getElementById("box1").style.backgroundColor = stroke;
            document.getElementById("box2").style.backgroundColor = stroke;
            document.getElementById("box3").style.backgroundColor = stroke;
            document.getElementById("box4").style.backgroundColor = stroke;

            // dynamically change the font color between white and black based on the fill and stroke colors
            // to provide better user experience
            if (tinycolor(stroke).isLight()) {
                document.getElementById("choices").style.color = "black";
                // document.getElementById("time_score_container").style.color = "black";
            } else {
                document.getElementById("choices").style.color = "white";
                // document.getElementById("time_score_container").style.color = "white";
            }

            document.getElementById("container").style.color = fill;

        }

        // set level
        function setLevel(e) {
            var level = gameLevel;

            if (e === 1) {
                level = "easy";
            } else if (e === 2) {
                level = "medium";
            } else if (e === 3) {
                level = "hard";
            }

            if (gameLevel !== level) {
                gameLevel = level;
                startGame();
            }
        }

        // set operation
        function setOperation(e) {
            if (gameOperation !== e) {
                gameOperation = e;
                startGame();
            }
        }

        // show toolbar buttons
        function showtoolbarbuttons() {
            // enable toolbar buttons functionally
            document.getElementById("restart-button").disabled = false;
            document.getElementById("filter-button").disabled = false;
            document.getElementById("level-button").disabled = false;
            document.getElementById("network-button").disabled = false;

            // enable toolbar buttons visually
            document.getElementById("restart-button").classList.remove('disabled');
            document.getElementById("filter-button").classList.remove('disabled');
            document.getElementById("level-button").classList.remove('disabled');
            document.getElementById("network-button").classList.remove('disabled');
        }

        // hide toolbar buttons
        function hidetoolbarbuttons() {
            // disable toolbar buttons functionally
            document.getElementById("restart-button").disabled = true;
            document.getElementById("filter-button").disabled = true;
            document.getElementById("level-button").disabled = true;
            document.getElementById("network-button").disabled = true;

            // disable toolbar buttons visually
            document.getElementById("restart-button").classList.add('disabled');
            document.getElementById("filter-button").classList.add('disabled');
            document.getElementById("level-button").classList.add('disabled');
            document.getElementById("network-button").classList.add('disabled');
        }

    });
});
