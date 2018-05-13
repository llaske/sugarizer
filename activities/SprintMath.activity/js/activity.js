define(["sugar-web/activity/activity", "sugar-web/env", "toolpalette", "sugar-web/graphics/icon", "webL10n"], function (activity, env, palette, icon, webL10n) {
    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        activity.setup();

        // initiating the level palette (for easy/ medium/ hard)
        var levelButton = document.getElementById("level-button");
        var levels = [
            {"id": 1, "title": webL10n.get("easy")},
            {"id": 2, "title": webL10n.get("medium")},
            {"id": 3, "title": webL10n.get("hard")}
        ];
        levelpalette = new palette.FilterPalette(levelButton, undefined);
        levelpalette.setCategories(levels);
        levelpalette.addEventListener('filter', function () {
            console.log("level" + levelpalette.getFilter());
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
        fpalette = new palette.FilterPalette(filterButton, undefined);
        fpalette.setCategories(filter);
        fpalette.addEventListener('filter', function () {
            console.log("level" + fpalette.getFilter());
            setOperation(fpalette.getFilter());
            fpalette.popDown();
        });


        // Initialize the activity.
        var play = false;       // whether the game is playing (True) or ended (False)
        var score;              // score of the user in the game
        var action;             // instance of the interval
        var time;               // time remaining in the game
        var questions = [];     // array to hold all 200 random questions
        var questionNumber = 0; // index of current question
        var gameLevel = "easy";  // game level (easy/med/hard)
        var gameOperation = 1;   // game operation (add/sub/multiply)

        // function to hide a particular DOM element
        function hide(Id) {
            document.getElementById(Id).style.display = "none";
        }

        // function to show a particular DOM element
        function show(Id) {
            console.log(Id);
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
            document.getElementById("gameOver").innerHTML = webL10n.get("GameOver", {
                name: currentenv.user.name,
                score: score
            });
            document.getElementById("question").innerHTML = '';

            for (var i = 1; i < 5; i++) {
                document.getElementById("box" + i).innerHTML = '';
            }

            play = false;
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
            questions = [];
            document.getElementById("scorevalue").innerHTML = score;
            hide("gameOver");
            show("time");
            show("box1");
            show("box2");
            show("box3");
            show("box4");
            show("score");
            startCountdown();
            generateQuestions();
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
                        wrongans = (1 + Math.round((levelFactor * levelFactor) * Math.random()));
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
            console.log(questions);
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

            console.log(object_store);


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
            console.log("Language code in env=" + language);

            // Load from datastore
            if (!environment.objectId) {
                console.log("New instance");
            } else {
                activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
                    if (error == null && data != null) {
                        stored_data = JSON.parse(data);
                        console.log(stored_data);

                        play = stored_data.play;
                        score = stored_data.score;
                        time = stored_data.timeremaining;
                        questions = stored_data.questions;
                        questionNumber = stored_data.questionNumber;
                        gameLevel = stored_data.gameLevel;
                        gameOperation = stored_data.gameOperation;
                        if (play) {
                            resumeGame()
                        } else {
                            startGame()
                        }

                    } else {
                        console.log(error);
                    }
                });
            }
        });

        window.addEventListener("localized", function () {
            // Set current language to Sugarizer
            console.log("Language code in window.addeventlistener=" + webL10n.language.code);

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

        // function to set color theme based on User Colors
        function setColor(fill, stroke) {
            // set colors based on user stroke and fill colors

            document.getElementById("box1").style.backgroundColor = stroke;
            document.getElementById("box2").style.backgroundColor = stroke;
            document.getElementById("box3").style.backgroundColor = stroke;
            document.getElementById("box4").style.backgroundColor = stroke;

            document.getElementById("gameOver").style.backgroundColor = stroke;
            document.getElementById("gameOver").style.color = fill;

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

    });
});