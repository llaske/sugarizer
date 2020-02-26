define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		var config = {
			position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
		  }
		  var board = Chessboard('myBoard', config)

		// Initialize the activity.
		activity.setup();

	});

});
