define(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        activity.setup();

        // Initialize the activity.
        var play = false;
        var score;
        var action;
        var timeremaining;
        var correctans;


        function hide(Id) {
            document.getElementById(Id).style.display = "none";
        }

        function show(Id) {
            document.getElementById(Id).style.display = "block";
        }

        function gameOver() {
            clearInterval(action);
            show("gameOver");
            document.getElementById("gameOver").innerHTML = "<p>Game Over, Your Score is : " + score + "</p>";
            document.getElementById("timeremaining").innerHTML = 60;
            document.getElementById("start").innerHTML = "Start Game";
            hide("time");
            hide("correct");
            hide("wrong");
            play = false;
        }

        function startCountdown() {
            action = setInterval(function () {
                timeremaining -= 1;
                document.getElementById("timeremaining").innerHTML = timeremaining;
                if (timeremaining == 0) {
                    gameOver();
                }
            }, 1000);
        }

        function generateQuestion() {
            var x = 1 + Math.round(9 * Math.random());
            var y = 1 + Math.round(9 * Math.random());
            var z = 1 + Math.round(2 * Math.random());
            var sign, prod;
            if (z == 1) {
                prod = x * y;
                sign = "x";
            } else if (z == 2) {
                prod = x + y;
                sign = "+";
            } else if (z == 3) {
                prod = x - y;
                sign = "-";
            }
            console.log(prod)
            correctans = prod;

            document.getElementById("question").innerHTML = x + sign + y;

            var ansbox = 1 + Math.round(3 * Math.random());
            document.getElementById("box" + ansbox).innerHTML = prod;

            var answers = [prod];

            for (var i = 1; i < 5; i++) {
                if (i != ansbox) {
                    var wrongans;

                    do {
                        wrongans = (1 + Math.round(99 * Math.random()))
                    } while (answers.indexOf(wrongans) > -1)

                    answers.push(wrongans);
                    document.getElementById("box" + i).innerHTML = wrongans;

                }
            }

        }

        for (var i = 1; i < 5; i++) {
            document.getElementById("box" + i).onclick = function () {
                if (play) {
                    if (this.innerHTML == correctans) {
                        score++;
                        document.getElementById("scorevalue").innerHTML = score;
                        hide("wrong");
                        show("correct");
                        setTimeout(function () {
                            hide("correct");
                        }, 1000);
                        generateQuestion();
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

        document.getElementById("start").onclick = startGame;

        function startGame() {
            if (play) {
                location.reload();
                play = false;
            } else {
                score = 0;
                play = true;
                document.getElementById("scorevalue").innerHTML = score;
                show("time");
                hide("gameOver");
                document.getElementById("start").innerHTML = "Reset Game";
                timeremaining = 60;
                startCountdown();
                generateQuestion();
            }
        }

        function resumeGame() {
            document.getElementById("scorevalue").innerHTML = score;
            document.getElementById("timeremaining").innerHTML= timeremaining;
            show("time");
            hide("gameOver");
            document.getElementById("start").innerHTML = "Reset Game";
            startCountdown();
            generateQuestion();
        }

        document.getElementById("stop-button").addEventListener('click', function (event) {
            if (play == true) {
                console.log("writing...");
                object_store = {
                    "play": play,
                    "score": score,
                    "timeremaining": timeremaining
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
            }
        });

        env.getEnvironment(function (err, environment) {
            currentenv = environment;

            // Load from datastore
            if (!environment.objectId) {
                console.log("New instance");
            } else {
                console.log("Existing instance");
                activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
                    if (error == null && data != null) {
                        stored_data= JSON.parse(data);
                        console.log(stored_data);
                        play=stored_data.play;
                        score=stored_data.score;
                        timeremaining= stored_data.timeremaining;
                        resumeGame();
                    }else{
                        console.log(error);
                    }
                });
            }
        });

    });

});
