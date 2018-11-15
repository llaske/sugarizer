define(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var highScore = 0; // High score holder

		//Loads saved score data
		activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
			if (error == null && data != null) {
				highScore = JSON.parse(data);
				console.log(highScore);
			}
		});

		var $game = $('#canvas').blockrain({
      speed: 20,
      theme: 'candy',
	    autoplay: false,
	    autoplayRestart: true,
	    autoBlockWidth: true,
		  autoBlockSize: 24,
		  touchControls: true,
		  savedScore: highScore,
      onStart: function(){},
		  onRestart: function(){},
		  // onGameOver: function(score){
		  // 	console.log(score);
		  // },
		  onLine: function(lines, scoreIncrement, score){
		  	if (score > highScore){
				highScore = score;
			}
		  }
	  });

    // I added this so that the continue button will only appear if the instance is existing. If it's new, it hides the continue button.
    env.getEnvironment(function(env, environment) {
			//Check if an instance is existing
			if (!environment.objectId){
				console.log('New Instance');
				document.getElementById('continue-btn').style.display = 'none';
			} else {
				console.log('Exisitng Instance');
			}
		});

	    // Save the score in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");
			var jsonData = JSON.stringify(highScore);
			//console.log(jsonData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

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
