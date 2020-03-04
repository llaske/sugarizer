// Chess component
let ChessTemplate = {
	template: `
		<div class="chess-container">
			<div id="opponent-info">{{ opponentText }}</div>
			<chess-tutorial ref="chesstutorial" v-if="tutorialRunning"></chess-tutorial>
			<div id="chessboard" v-show="!tutorialRunning"></div>
			<div id="chess-info" class="chess-info">
				<div class="status-container">
					<p style="font-size: 10px; margin: 0" v-if="opponent == null && !spectator">{{ l10n.stringLevel }}: {{ difficulty }}</p>
					<p id="status">{{ status }}</p>
					<p class="check">{{ checkText }}</p>
				</div>
				<div class="moves-container">
					<p class="title">{{ l10n.stringMoves }}</p>
					<div class="move-list">
						<p v-for="(item, i) in pgnModified" :key="i">
							{{ i+1 }}. <span v-bind:style="{ color: whiteColors.fill }">{{ item.w }}</span> <span v-bind:style="{ color: blackColors.fill }">{{ item.b }}</span>
						</p>
					</div>
				</div>
			</div>
			<div class="popup-bg" v-show="openPopup">
				<div class="popup">{{ popupText }}</div>
			</div>
		</div>
	`,
	components: {
		'chess-tutorial': ChessTutorial
	},
	props: ['opponent', 'spectator', 'currentpgn', 'level', 'humane', 'currentcolor', 'tutorialRunning', 'whiteColors', 'blackColors'],
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
			pgn: [],
			l10n: {
				stringLevel: '',
				stringMoves: '',
				stringPlayer: '',
				stringComputer: '',
				stringPlayingAgainst: '',
				stringYouAre: '',
				stringBlack: '',
				stringWhite: '',
				stringYouAreSpectator: '',
				stringToMove: '',
				stringVeryEasy: '',
				stringEasy: '',
				stringModerate: '',
				stringHard: '',
				stringVeryHard: '',
				stringIsInCheck: '',
				stringIsInCheckmate: '',
				stringIsInGameOver: '',
			}
		}
	},
	computed: {
		opponentText: function() {
			let text;
			if(this.spectator) {
				return this.l10n.stringYouAreSpectator + ".";
			}
			text = this.l10n.stringPlayingAgainst + " ";
			text += this.opponent != null ? this.l10n.stringPlayer : this.l10n.stringComputer;
			text += ". ";
			text += this.currentcolor == 'w' ? this.l10n.stringYouAre + ' ' + this.l10n.stringWhite : this.l10n.stringYouAre + ' ' + this.l10n.stringBlack;
			text += ".";
			return text;
		},
		difficulty: function() {
			switch(this.level) {
				case 0:
					return this.l10n.stringVeryEasy;
				case 1:
					return this.l10n.stringEasy;
				case 2:
					return this.l10n.stringModerate;
				case 3:
					return this.l10n.stringHard;
				case 4:
					return this.l10n.stringVeryHard;
			}
		},
		pgnModified: function() {
			let a = [];
			for(let i=2; i<this.pgn.length; i+=2) {
				let split = this.pgn[i].split(' ');
				a.push({
					w: split[0],
					b: split[1]
				});
			}
			return a;
		}
	},
	watch: {
		currentpgn: function(newVal, oldVal) {
			this.game.load_pgn(this.currentpgn);
			this.updateBoardAI();
			this.updateStatus();
		},
		opponent: function(newVal, oldVal) {
			if(newVal == null) {
				if(this.game.turn() != this.currentcolor) {
					this.computer_move();
					this.board.position(this.game.fen());
				}
			}
		},
		currentcolor: function(newVal, oldVal) {
			this.checkOrientation();
		}
	},
	mounted: function() {
		let vm = this;
		
		this.startNewGame();
		
		// Handle resize
		window.addEventListener("resize", function() {
			vm.board.resize();
		});

		document.getElementsByClassName('popup-bg')[0].addEventListener('click', function() {
			vm.openPopup = false;
		});
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},

		startNewGame: function() {
			console.log('start new game');

			let fen = P4_INITIAL_BOARD;
			// Chess.js
			this.game = new Chess(fen);
			//Chessboard.js
			let config = {
				showNotation: false,
				draggable: true,
				position: fen,
				onDragStart: this.onDragStart,
				onDrop: this.onDrop,
				onMouseoutSquare: this.onMouseoutSquare,
				onMouseoverSquare: this.onMouseoverSquare,
				onSnapEnd: this.onSnapEnd,
				pieceTheme: this.pieceTheme,
			}
			this.board = Chessboard('chessboard', config);
			this.checkOrientation();
			//P4wn.js
			this.gameAI = p4_fen2state(fen);

			this.updateStatus();
		},

		checkOrientation: function() {
			return this.currentcolor == 'b' ? this.board.orientation('black') : this.board.orientation('white');
		},

		undo: function() {
			console.log('undo');
			this.game.undo();
			this.game.undo();
			this.updateBoardAI();
			this.updateStatus();
		},

		updateBoardAI: function() {
			this.gameAI = p4_fen2state(this.game.fen());
			this.board.position(this.game.fen());
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
			// this.removeGreySquares();
		},

		onSnapEnd: function() {
			this.board.position(this.game.fen());
		},

		makeMove: function(source, target, fromOpponent = false) {
			// see if the move is legal
			var move = this.game.move({
				from: source,
				to: target,
				promotion: 'q' // NOTE: always promote to a queen for simplicity
			})
		
			// illegal move
			if (move === null) return 'snapback';

			this.updateStatus();
			this.gameAI.move(source, target);

			// let app = this.getApp();
			if(this.opponent == null && !this.spectator) {
				this.computer_move();
			}

			// presence
			if(!fromOpponent) {
				this.$emit('move', { from: source, to: target });
			}
		},

		computer_move: function() {
			let moves = this.gameAI.findmove(this.level + 1);
			let start = String.fromCharCode(96+(moves[0]%10)) + (Math.floor(moves[0]/10)-1);
			let end = String.fromCharCode(96+(moves[1]%10)) + (Math.floor(moves[1]/10)-1);

			this.game.move({from: start, to: end });
			this.gameAI.move(start + '-' + end);
			this.updateStatus();
		},

		updateStatus: function() {
			let vm = this;
			this.status = '';
			this.checkText = '';
		
			var moveColor = this.l10n.stringWhite;
			if (this.game.turn() === 'b') {
				moveColor = this.l10n.stringBlack;
			}
		
			// checkmate?
			if (this.game.in_checkmate()) {
				this.popupText = this.status = this.l10n.stringGameOver + ', ' + moveColor + ' ' + this.l10n.stringIsInCheckmate;
				this.humane.log(this.popupText);
				this.openPopup = true;
			}
		
			// draw?
			else if (this.game.in_draw()) {
				this.popupText = this.status = 'Game over, drawn position';
				this.humane.log(this.popupText);
				this.openPopup = true;
			}
		
			// this.game still on
			else {
				this.status = moveColor + ' ' + this.l10n.stringToMove;
		
				// check?
				if (this.game.in_check()) {
					this.checkText += moveColor + ' ' + this.l10n.stringIsInCheck;
					this.humane.log(this.checkText);
				}
			}
		
			this.fen = this.game.fen();
			this.updatePgn();
		},

		updatePgn: function() {
			let vm = this;
			let temp = ' ' + this.game.pgn();
			this.pgn = temp.split(/(\s*\d*\. )/);
			setTimeout(function() {
				vm.scrollToBottom();
			}, 100);
		},

		scrollToBottom: function() {
			let list = document.querySelector('.move-list')
			list.scrollTop = list.scrollHeight;
		},

		pieceTheme: function(piece) {
			return 'images/chesspieces/svg/' + piece + '.svg'
		},
		
		onTutStartPos: function() {
			this.$refs.chesstutorial.startPos();
		},
	}
};