define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		//random movement
		var board = null
		var game = new Chess()

		function onDragStart (source, piece, position, orientation) {
		// do not pick up pieces if the game is over
		if (game.game_over()) return false

		// only pick up pieces for White
		if (piece.search(/^b/) !== -1) return false
		}

		function makeRandomMove () {
		var possibleMoves = game.moves()

		// game over
		if (possibleMoves.length === 0) return

		var randomIdx = Math.floor(Math.random() * possibleMoves.length)
		game.move(possibleMoves[randomIdx])
		board.position(game.fen())
		}

		function onDrop (source, target) {
		// see if the move is legal
		var move = game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		})

		// illegal move
		if (move === null) return 'snapback'

		// make random legal move for black
		window.setTimeout(makeRandomMove, 250)
		}

		// update the board position after the piece snap
		// for castling, en passant, pawn promotion
		function onSnapEnd () {
		board.position(game.fen())
		}

		var config = {
		draggable: true,
		position: 'start',
		onDragStart: onDragStart,
		onDrop: onDrop,
		onSnapEnd: onSnapEnd
		}
		board = Chessboard('myBoard', config)


		
		// //multiplayer
		// 	//highlight legal moves
		// 	function removeGreySquares () {
		// 	$('#myBoard .square-55d63').css('background', '')
		// 	}
		  
		// 	function greySquare (square) {
		// 	var $square = $('#myBoard .square-' + square)
		  
		// 	var background = whiteSquareGrey
		// 	if ($square.hasClass('black-3c85d')) {
		// 	  background = blackSquareGrey
		// 	}
		  
		// 	$square.css('background', background)
		// 	}
		  
		// 	function onDragStart (source, piece) {
		// 	// do not pick up pieces if the game is over
		// 	if (game.game_over()) return false
		  
		// 	// or if it's not that side's turn
		// 		if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
		// 			(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
		// 	  	return false
		// 		}
		// 	}
		  
		// 	function onDrop (source, target) {
		// 	removeGreySquares()
		  
		// 	// see if the move is legal
		// 	var move = game.move({
		// 	  from: source,
		// 	  to: target,
		// 	  promotion: 'q' // NOTE: always promote to a queen for example simplicity
		// 	})
		  
		// 	// illegal move
		// 	if (move === null) return 'snapback'
		// 	}
		  
		// 	function onMouseoverSquare (square, piece) {
		// 	// get list of possible moves for this square
		// 	var moves = game.moves({
		// 	  square: square,
		// 	  verbose: true
		// 	})
		  
		// 	// exit if there are no moves available for this square
		// 	if (moves.length === 0) return
		  
		// 	// highlight the square they moused over
		// 	greySquare(square)
		  
		// 	// highlight the possible squares for this piece
		// 	for (var i = 0; i < moves.length; i++) {
		// 	  greySquare(moves[i].to)
		// 	}
		// 	}
		  
		// 	function onMouseoutSquare (square, piece) {
		// 	removeGreySquares()
		// 	}
		  
		// 	function onSnapEnd () {
		// 	board.position(game.fen())
		// 	}

		// 	//only allow legal moves
		// 	function onDragStart (source, piece, position, orientation) {
		// 		// do not pick up pieces if the game is over
		// 		if (game.game_over()) return false
			  
		// 		// only pick up pieces for the side to move
		// 		if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
		// 			(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
		// 		  return false
		// 		}
		// 	  }
			  
		// 	  function onDrop (source, target) {
		// 		// see if the move is legal
		// 		var move = game.move({
		// 		  from: source,
		// 		  to: target,
		// 		  promotion: 'q' // NOTE: always promote to a queen for example simplicity
		// 		})
			  
		// 		// illegal move
		// 		if (move === null) return 'snapback'
			  
		// 		updateStatus()
		// 	  }
			  
		// 	  // update the board position after the piece snap
		// 	  // for castling, en passant, pawn promotion
		// 	  function onSnapEnd () {
		// 		board.position(game.fen())
		// 	  }
			  
		// 	  function updateStatus () {
		// 		var status = ''
			  
		// 		var moveColor = 'White'
		// 		if (game.turn() === 'b') {
		// 		  moveColor = 'Black'
		// 		}
			  
		// 		// checkmate?
		// 		if (game.in_checkmate()) {
		// 		  status = 'Game over, ' + moveColor + ' is in checkmate.'
		// 		}
			  
		// 		// draw?
		// 		else if (game.in_draw()) {
		// 		  status = 'Game over, drawn position'
		// 		}
			  
		// 		// game still on
		// 		else {
		// 		  status = moveColor + ' to move'
			  
		// 		  // check?
		// 		  if (game.in_check()) {
		// 			status += ', ' + moveColor + ' is in check'
		// 		  }
		// 		}
			  
		// 		$status.html(status)
		// 		$fen.html(game.fen())
		// 		$pgn.html(game.pgn())
		// 	  }
		// 	  var config = {
			
		// 		draggable: true,
		// 		dropOffBoard: 'trash',
		// 		sparePieces: true,
		// 		position: 'start',
		// 		onDragStart: onDragStart,
		// 		onDrop: onDrop,
		// 		onMouseoutSquare: onMouseoutSquare,
		// 		onMouseoverSquare: onMouseoverSquare,
		// 		onSnapEnd: onSnapEnd
		// 	  }
	
		
			  
		// 	  updateStatus()


		// var board = Chessboard('myBoard', config)
		// //start and clear button
		// $('#startBtn').on('click', board.start)
	  	// $('#clearBtn').on('click', board.clear)
		  	

	});

});
