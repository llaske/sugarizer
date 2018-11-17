define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var myHighestScore = 0;

		//Loads highest score from Journal
		loadHighScore();

		var $game = $('#canvas').blockrain({
      speed: 20,
      theme: 'candy',
	    autoplay: false,
	    autoplayRestart: true,
	    autoBlockWidth: true,
		  autoBlockSize: 24,
		  touchControls: true,
			highestScore: myHighestScore,
      onStart: function(){},
		  onRestart: function(){
				loadHighScore(); // loads highscore when game is restarted.
			},
		  onGameOver: function(score){
				saveHighestScore();
			},

		  onLine: function(lines, scoreIncrement, score){
				if (score > myHighestScore){
					myHighestScore = score;
				}
			},
		});

		// Save high score in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			saveHighestScore();
		});

		//Function to save high score
		function saveHighestScore() {
			console.log("writing...");
			var jsonData = JSON.stringify(myHighestScore);
			//console.log(jsonData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		}

		//Function to load high score
		function loadHighScore() {
			activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
				if (error == null && data != null) {
					myHighestScore = JSON.parse(data);
					console.log(myHighestScore);
				}
			});
		}


    function switchTheme(next) {
      var themes = Object.keys(BlockrainThemes);
      var currentTheme = $game.blockrain('theme');
      var currentIx = themes.indexOf(currentTheme);

      if( next ) { currentIx++; }
      else { currentIx--; }

      if( currentIx >= themes.length ){ currentIx = 0; }
      if( currentIx < 0 ){ currentIx = themes.length-1; }

      $game.blockrain('theme', themes[currentIx]);
    }

    document.getElementById("btn-next").onclick = function() {
        switchTheme(true);
    };

	});

});
