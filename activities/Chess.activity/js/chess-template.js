// Chess component
let ChessTemplate = {
	template: `
		<div class="chess-container">
			<chess-tutorial ref="chesstutorial" v-if="tutorialRunning"></chess-tutorial>
			<div id="chessboard" v-show="!tutorialRunning"></div>
			<div id="chess-info" class="chess-info">
				<div class="status-container">
					<p class="level" v-if="opponent == null && !spectator">{{ l10n.stringLevel }}: {{ difficulty }}</p>
					<div></div>
					<div id="opponent-info" v-if="!spectator">
						<div class="player-info" id="user">
							<div class="player-icons">
								<div class="buddy" id="user-buddy"></div>
								<img v-bind:src="currentcolor == 'w' ? './images/chesspieces/svg/wP.svg' : './images/chesspieces/svg/bP.svg' " class="pawn-icon" id="user-pawn">							
							</div>
							<p>You</p>
						</div>
						<span>VS</span>
						<div class="player-info" id="opponent">
							<div class="player-icons">
								<img src="./icons/robot-on.svg" v-if="opponent == null && !spectator" id="opponent-computer">
								<div class="buddy" v-else id="opponent-buddy"></div>
								<img v-bind:src="currentcolor == 'w' ? './images/chesspieces/svg/bP.svg' : './images/chesspieces/svg/wP.svg' " class="pawn-icon" id="user-pawn">
							</div>
							<p>{{ opponent ? 'Opponent' : 'Computer' }}</p>
						</div>
					</div>
					<p style="font-size: 1.6em; font-weight: bold" v-else>SPECTATOR</p>
					<div class="row">
						<div id="status" v-if="popupText == ''">
							<span>
								{{ l10n.stringTurn }}: 
								<img v-bind:src="turnSrc" class="pawn-icon" id="user-pawn">
							</span>
						</div>
						<div id="check" :class="{ danger: checkText != '' }">
							<span>{{ checkText }}</span>
						</div>
					</div>
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
			turn: 'w',
			inDanger: '',
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
				stringTurn: '',
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
				stringAreIn: '',
				stringIsIn: '',
				stringCheck: '',
				stringCheckmate: '',
				stringGameOver: '',
				stringDrawPosition: '',
				stringYou: '',
				stringOpponent: ''
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
			//Update turn
			this.turn = this.game ? this.game.turn() : 'w';
			return a;
		},
		turnSrc: function() {
			return this.turn == 'w' ? './images/chesspieces/svg/wP.svg' : './images/chesspieces/svg/bP.svg';
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
		},
		whiteColors: function(newVal, oldVal) {
			this.colorBuddies();
		},
		blackColors: function(newVal, oldVal) {
			this.colorBuddies();
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

		colorBuddies: function() {
			let vm = this;
			requirejs(["sugar-web/graphics/icon"], function (icon) {
				let user = document.getElementById('user-buddy');
				let opponent = document.getElementById('opponent-buddy');
				if(vm.currentcolor == 'w') {
					icon.colorize(user, vm.whiteColors);
					if(vm.opponent != null && !vm.spectator) {
						icon.colorize(opponent, vm.blackColors);
					}
				} else {
					icon.colorize(user, vm.blackColors);
					if(vm.opponent != null && !vm.spectator) {
						icon.colorize(opponent, vm.whiteColors);
					}
				}

			});
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
				this.status = this.l10n.stringGameOver + ', ';
				if(this.game.turn() == this.currentcolor) {
					this.status += this.l10n.stringYou  + ' ' + this.l10n.stringAreIn + ' ' + this.l10n.stringCheckmate;
				} else {
					this.status += this.l10n.stringOpponent + ' ' + this.l10n.stringIsIn + ' ' + this.l10n.stringCheckmate;
				}
				this.humane.log(this.popupText);
				this.openPopup = true;
				this.checkText = this.popupText = this.status;
			}
		
			// draw?
			else if (this.game.in_draw()) {
				this.status = this.l10n.stringGameOver + ', ' + this.l10n.stringDrawPosition;
				this.humane.log(this.popupText);
				this.openPopup = true;
				this.checkText = this.popupText = this.status;
			}
		
			// this.game still on
			else {
				this.status = moveColor + ' ' + this.l10n.stringToMove;
		
				// check?
				if (this.game.in_check()) {
					if(this.game.turn() == this.currentcolor) {
						this.checkText += this.l10n.stringYou + ' ' + this.l10n.stringAreIn + ' ' + this.l10n.stringCheck;
					} else {
						this.checkText += this.l10n.stringOpponent + ' ' + this.l10n.stringIsIn + ' ' + this.l10n.stringCheck;
					}
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