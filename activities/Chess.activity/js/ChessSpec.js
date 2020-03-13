// Ephox Job Application Entry
// Test Suite
// (c) 2011 Thomas Davis <thomasalwyndavis@gmail.com>
// http://thomasdavis.github.com/chess/


describe("ChessBoard", function() {
  var chessboard;
  
	describe("when a new chessboard has been created", function(){
		
		beforeEach(function() {
			chessboard = new ChessBoard();
		});
		
	    it("should indicate there is a fully set board", function() {
			expect(chessboard.positions).toEqual( { A8 : 'BR', B8 : 'BKN', C8 : 'BB', D8 : 'BK', E8 : 'BQ', F8 : 'BB', G8 : 'BKN', H8 : 'BR', A7 : 'BP', B7 : 'BP', C7 : 'BP', D7 : 'BP', E7 : 'BP', F7 : 'BP', G7 : 'BP', H7 : 'BP', A2 : 'WP', B2 : 'WP', C2 : 'WP', D2 : 'WP', E2 : 'WP', F2 : 'WP', G2 : 'WP', H2 : 'WP', A1 : 'WR', B1 : 'WKN', C1 : 'WB', D1 : 'WK', E1 : 'WQ', F1 : 'WB', G1 : 'WKN', H1 : 'WR' });
		});
		
		it("should indicate pieces are in the correct places using a lookup", function(){
			expect(chessboard.lookupPosition("A8")).toEqual( "BR" );
			
		});
		it("should have empty positions", function(){
			expect(chessboard.lookupPosition("A5")).toEqual( "empty" );
			expect(chessboard.lookupPosition("A6")).toEqual( "empty" );
		});
		
		it("should move pieces correctly", function(){
			var piece1 = chessboard.lookupPosition("A8");
			// Move A8 To B8
			chessboard.changePosition( "A8", "B8");
			var piece2 = chessboard.lookupPosition("B8")
			expect(piece1).toEqual(piece2);
			// Old position should be empty
			expect( chessboard.lookupPosition("A8")).toEqual("empty");
		});
	})
	
  	describe("when a chessboard is reset", function(){
		
		beforeEach(function() {
			chessboard = new ChessBoard( { A8 : 'BR', B8 : 'BKN', C8 : 'BB', D8 : 'BK' } );
			chessboard.changePosition( "A8", "B8");
			chessboard.resetBoard();
		});
		
	    it("should indicate there is a fully set board", function() {
			expect(chessboard.positions).toEqual( { A8 : 'BR', B8 : 'BKN', C8 : 'BB', D8 : 'BK', E8 : 'BQ', F8 : 'BB', G8 : 'BKN', H8 : 'BR', A7 : 'BP', B7 : 'BP', C7 : 'BP', D7 : 'BP', E7 : 'BP', F7 : 'BP', G7 : 'BP', H7 : 'BP', A2 : 'WP', B2 : 'WP', C2 : 'WP', D2 : 'WP', E2 : 'WP', F2 : 'WP', G2 : 'WP', H2 : 'WP', A1 : 'WR', B1 : 'WKN', C1 : 'WB', D1 : 'WK', E1 : 'WQ', F1 : 'WB', G1 : 'WKN', H1 : 'WR' });
		});
		
	}) 
	describe("when an empty chessboard has been created", function(){
		
		beforeEach(function() {
			var empty = {};
			chessboard = new ChessBoard( empty );
		});
		
	    it("should indicate there are no pieces on the board", function() {
			expect(chessboard.positions).toEqual({});
		});
	})

});
