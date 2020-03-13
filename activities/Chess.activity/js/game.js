// Ephox Job Application Entry
// Muckaround Backbone View
// Usually the API would be a model/collection
// (c) 2011 Thomas Davis <thomasalwyndavis@gmail.com>
// http://thomasdavis.github.com/chess/

var ChessBoard_View = Backbone.View.extend({
	// chessboard is essentially the backend and our Backbone view will render it
	chessboard: null,
	el: $("#chess_board"),
	initialize: function(){
		this.chessboard = new ChessBoard();
		this.render();
	},
	render: function(){
		// Do a full refresh of the pane
		$("td", this.el).html("");
		
		var piece, color, asciicode;
		var chessboard = this.chessboard;
		for( position in chessboard.positions ){
			// Split the string up to find out color and piece name of the current position
			piece = chessboard.positions[position].substring(1);
			color = chessboard.positions[position][0];
			if( color == "B" ) {
				asciicode = chessboard.fullpieces[piece][2];
			} else {
				asciicode = chessboard.fullpieces[piece][1];
			}
			// Pump the correct ascii code into corresponding position
			$("#" + position).html( "<a href='#'>" + asciicode + "</a>");
		}
	}

});



var App_View = Backbone.View.extend({
	el: $(".container"),
	initialize: function() {
		this.chessboard_view = new ChessBoard_View;
	},
	events: {
		"click #clearBoard": "clearBoard",
		"click #resetBoard": "resetBoard",
		"click #changePosition": "changePosition",
		"click #lookupPosition": "lookupPosition"
	},
	clearBoard: function(){
		this.chessboard_view.chessboard.clearBoard();
		this.chessboard_view.render();
	},
	resetBoard: function(){
		this.chessboard_view.chessboard.resetBoard();
		this.chessboard_view.render();
	},
	changePosition: function(){
		this.chessboard_view.chessboard.changePosition( $("#oldposition").val(), $("#newposition").val() );
		this.chessboard_view.render();
	},
	lookupPosition: function(){
		alert( this.chessboard_view.chessboard.lookupPosition( $("#lookup").val() ) );
	}
	
});

var app_view = new App_View;
