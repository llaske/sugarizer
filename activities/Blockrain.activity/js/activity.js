define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var $game = $('#canvas').blockrain({
      speed: 20,
      theme: 'gameboy',
	    autoplay: false,
	    autoplayRestart: true,
	    autoBlockWidth: true,
		  autoBlockSize: 24,
		  touchControls: true,
      onStart: function(){},
		  onRestart: function(){},
		  // onGameOver: function(score){
		  // 	console.log(score);
		  // },
		  onLine: function(lines, scoreIncrement, score){}
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

    var leftArrow = document.getElementById("left-arrow");
    var rightArrow = document.getElementById("right-arrow");
    var upArrow = document.getElementById("up-arrow");
    var downArrow = document.getElementById("down-arrow");

    leftArrow.addEventListener("mousedown", function() {
    	var e = jQuery.Event("keydown", { keyCode: 37 });
    	$(document).trigger(e);
    });
    leftArrow.addEventListener("mouseup", function() {
    	var e = jQuery.Event("keyup", { keyCode: 37 });
    	$(document).trigger(e);
    });

    rightArrow.addEventListener("mousedown", function() {
    	var e = jQuery.Event("keydown", { keyCode: 39 });
    	$(document).trigger(e);
    });
    rightArrow.addEventListener("mouseup", function() {
    	var e = jQuery.Event("keyup", { keyCode: 39 });
    	$(document).trigger(e);
    });

    upArrow.addEventListener("mousedown", function() {
    	var e = jQuery.Event("keydown", { keyCode: 38 });
    	$(document).trigger(e);
    });
    upArrow.addEventListener("mouseup", function() {
    	var e = jQuery.Event("keyup", { keyCode: 38 });
    	$(document).trigger(e);
    });

    downArrow.addEventListener("mousedown", function() {
    	var e = jQuery.Event("keydown", { keyCode: 40 });
    	$(document).trigger(e);
    });
    downArrow.addEventListener("mouseup", function() {
    	var e = jQuery.Event("keyup", { keyCode: 40 });
    	$(document).trigger(e);
    });


	});

});
