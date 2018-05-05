define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n"], function (activity, env, icon, webL10n) {
    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        activity.setup();

        // Initialize the activity.
        var play = false;       // weather the game is playing (True) or ended (False)
        var score;              // score of the user in the game
        var action;             // instance of the interval
        var time;               // time remaining in the game
        var questions = [];     // array to hold all 200 random questions
        var questionNumber = 0; // index of current question

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
            document.getElementById("gameOver").innerHTML = 'Your Final Score is: ' + score;

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
                var Correctans= questions[questionNumber].answer;
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
            questionNumber=0;
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
                var x = 1 + Math.round(9 * Math.random());
                var y = 1 + Math.round(9 * Math.random());
                var z = 1 + Math.round(2 * Math.random());

                var currentQues, currentAns;
                if (z === 1) {
                    currentAns = x * y;
                    currentQues = x + "x" + y;
                } else if (z === 2) {
                    currentAns = x + y;
                    currentQues = x + "+" + y;
                } else if (z === 3) {
                    currentAns = x - y;
                    currentQues = x + "-" + y;
                }

                questions.push({
                    "question": currentQues,
                    "answer": currentAns
                })
            }
            console.log(questions);
            displayCurrentQuestion();
        }

        // set current question (will set the current question in the html DOM)
        function displayCurrentQuestion() {
            var CurrentQues= questions[questionNumber].question;
            var CurrentAns= questions[questionNumber].answer;
            // display question
            document.getElementById("question").innerHTML = CurrentQues;

            // display answers
            var ansbox = 1 + Math.round(3 * Math.random());
            document.getElementById("box" + ansbox).innerHTML = CurrentAns;

            var answers = [CurrentAns];

            for (var i = 1; i < 5; i++) {
                if (i != ansbox) {
                    var wrongans;
                    do {
                        wrongans = (1 + Math.round(99 * Math.random()))
                    } while (answers.indexOf(wrongans) > -1);

                    answers.push(wrongans);
                    document.getElementById("box" + i).innerHTML = wrongans;
                }
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
                "questionNumber": questionNumber
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
                        questions= stored_data.questions;
                        questionNumber= stored_data.questionNumber;
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


        });

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

    });
});