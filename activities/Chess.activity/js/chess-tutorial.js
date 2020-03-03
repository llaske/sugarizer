let ChessTutorial = {
	template: `
    <div id="chessboard-tut"></div>
	`,
	props: [],
	data: function() {
		return {
			game: null,
			board: null,
			gameAI: null,
			whiteSquareGrey: "#7b98ed",
			blackSquareGrey: '#476bd6',
			legalMoves: [],
			status: 'White to move',
			checkText: '',
			popupText: '',
			openPopup: false,
			fen: '',
			pgn: []
		}
	},
	mounted: function() {
    let vm = this;
    
    let fen = P4_INITIAL_BOARD;
    // Chess.js
    this.game = new Chess(fen);
    //Chessboard.js
    let config = {
      showNotation: false,
      draggable: true,
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onMouseoutSquare: this.onMouseoutSquare,
      onMouseoverSquare: this.onMouseoverSquare,
      onSnapEnd: this.onSnapEnd,
      pieceTheme: this.pieceTheme,
      sparePieces: true
    }
    this.board = Chessboard('chessboard-tut', config);
		
		// Handle resize
		window.addEventListener("resize", function() {
			vm.board.resize();
		});
	},
	methods: {

    startPos: function() {
      this.board.position(P4_INITIAL_BOARD);
    },
	
		removeGreySquares: function(square) {
			let squareElem = document.getElementsByClassName("square-" + square)[0];
			squareElem.style.background = '';
		},

		greySquare: function(square) {
			let squareElem = document.getElementsByClassName("square-" + square)[0];
		
			let background = this.whiteSquareGrey;
			if (squareElem.classList.contains('black-3c85d')) {
				background = this.blackSquareGrey;
			}
		
			squareElem.style.background = background;
		},
		
		onDragStart: function(source, piece) {
			//spectator
			if(this.spectator) return false;

			// opponent's turn
			if(this.game.turn() != this.currentcolor) return false;

			// do not pick up pieces if the game is over
			if (this.game.game_over()) return false
		
			// or if it's not that side's turn
			if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
					(this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
				return false
			}
		},

		onDrop: function(source, target) {
			for (let i = 0; i < this.legalMoves.length; i++) {
				this.removeGreySquares(this.legalMoves[i].to)
			}
		
			this.makeMove(source, target);
		},
		
		onMouseoverSquare: function(square, piece) {
			// spectator
			if(this.spectator) return;

			// opponent's turn
			if(this.game.turn() != this.currentcolor) return;

			// get list of possible moves for this square
			this.legalMoves = this.game.moves({
				square: square,
				verbose: true
			})
		
			// exit if there are no moves available for this square
			if (this.legalMoves.length === 0) return;

			let start = { to: square };
			this.legalMoves.push(start);
			// highlight the possible squares for this piece
			for (let i = 0; i < this.legalMoves.length; i++) {
				this.greySquare(this.legalMoves[i].to)
			}
		},

		onMouseoutSquare: function(square, piece) {
			for (let i = 0; i < this.legalMoves.length; i++) {
				this.removeGreySquares(this.legalMoves[i].to)
			}
		},

		onSnapEnd: function() {
			this.board.position(this.game.fen());
		},

		pieceTheme: function(piece) {
			return 'images/chesspieces/svg/' + piece + '.svg'
		}
	}
};