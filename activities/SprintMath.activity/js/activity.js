define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

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
            document.getElementById("gameOver").innerHTML = "<p>Game Over</p><p>Your Score is : " + score + "</p>";
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
            },1000);
        }

        function generateQuestion(){
            var x=1+Math.round(9*Math.random());
            var y=1+Math.round(9*Math.random());
            var prod= x*y;
            correctans=prod;

            document.getElementById("question").innerHTML=x+"x"+y;

            var ansbox=1+Math.round(3*Math.random());
            document.getElementById("box"+ansbox).innerHTML=prod;

            var answers= [prod];

            for(var i=1;i<5;i++){
                if(i != ansbox){
                    var wrongans;

                    do{
                        wrongans=(1+Math.round(99*Math.random()))
                    }while(answers.indexOf(wrongans) > -1)

                    answers.push(wrongans);
                    document.getElementById("box"+i).innerHTML=wrongans;

                }
            }

        }

        for(var i=1;i<5;i++){
            document.getElementById("box"+i).onclick = function() {
                if (play) {
                    if (this.innerHTML==correctans){
                        score++;
                        document.getElementById("score").innerHTML= score;
                        hide("wrong");
                        show("correct");
                        setTimeout(function(){
                            hide("correct");
                        },1000);
                        generateQuestion();
                    }else{
                        show("wrong");
                        hide("correct");
                        setTimeout(function(){
                            hide("wrong");
                        },1000);
                    }
                }
            }
        }


        document.getElementById("start").onclick = function () {
            if (play) {
                location.reload();
                play = false;
            } else {
                score = 0;
                play=true;
                document.getElementById("scorevalue").innerHTML = score;
                show("time");
                hide("gameOver");
                document.getElementById("start").innerHTML = "Reset Game";
                timeremaining=60;
                startCountdown();
                generateQuestion();
            }
        }

	});

});
