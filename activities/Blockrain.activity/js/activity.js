define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var myHighestScore = 0;

		//Loads highest score from Journal
		activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
			if (error == null && data != null) {
				myHighestScore = JSON.parse(data);
				console.log(myHighestScore);
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
			highestScore: myHighestScore,
      onStart: function(){},
		  onRestart: function(){},
		  // onGameOver: function(score){
		  // 	console.log(score);
		  // },
		  onLine: function(lines, scoreIncrement, score){
				if (score > myHighestScore){
					myHighestScore = score;
				}
			}
	  });

		// Save high score in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
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
