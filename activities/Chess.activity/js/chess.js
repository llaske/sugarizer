// Ephox Job Application Entry
// ChessBoard API
// (c) 2011 Thomas Davis <thomasalwyndavis@gmail.com>
// http://thomasdavis.github.com/chess/


// Wrap API in self executing anonymous function to keep globals tidy
(function(){
	
		// Save a reference to the root
		var root = this;
		
		// Pre-configure a standard chessboard layout
		var set_board = {
			// Black pieces
			A8: "BR", B8: "BKN", C8: "BB", D8: "BK", E8: "BQ", F8: "BB", G8: "BKN", H8: "BR",
			A7: "BP", B7: "BP", C7: "BP", D7: "BP", E7: "BP", F7: "BP", G7: "BP", H7: "BP",
			
			// White Pieces
			A2: "WP", B2: "WP", C2: "WP", D2: "WP", E2: "WP", F2: "WP", G2: "WP", H2: "WP",
			A1: "WR", B1: "WKN", C1: "WB", D1: "WK", E1: "WQ", F1: "WB", G1: "WKN", H1: "WR"
		}
		
		// A simple lookup object for piece labels
		// FullName, White ASCII, Black ASCII
		var fullpieces = {
			"K": ["King", "&#9813;", "&#9819;"],
			"Q": ["Queen", "&#9812;", "&#9818;"],
			"B": ["Bishop", "&#9815;", "&#9821;"],
			"KN": ["Knight", "&#9816;", "&#9822;"],
			"R": ["Rook", "&#9814;", "&#9820;"],
			"P": ["Pawn", "&#9817;", "&#9823;"]
		}
		
		// Create a global variable to access the ChessBoard library at anytime
		var ChessBoard = root.ChessBoard = function( positions ) {
			
			// If any positions are passed to the board use them for the setup.
			// Otherwise load the board with a standard setup. This allows for saving and starting of games
			this.positions = positions || $.extend(true, {}, set_board);
			
			
			var chessboard = this;
			chessboard.fullpieces = fullpieces;
			
			this.lookupPosition = function( position ) {
				// Returns the piece that is at a certain position on the grid otherwise 'empty'
				return chessboard.positions[position] || "empty";
			}
			
			this.clearPosition = function( position ) {
				// Remove any pieces from the current position
				delete chessboard.positions[position];
			}
			
			this.changePosition = function( old_position, new_position ) {
				// Move the piece in the old position to the new position, delete the old positions
				chessboard.positions[new_position] = chessboard.positions[old_position]
				chessboard.clearPosition( old_position );
			}
			
			this.resetBoard = function( ){
				// Resets the board to a configured ready to play board
				delete chessboard.positions;
				chessboard.positions = $.extend(true, {}, set_board);
			}
			
			this.clearBoard = function( ){
				// Clears the board entirely
				chessboard.positions = {};
			}
		};

}).call(this);
