define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n", "sugar-web/graphics/presencepalette", "tutorial"], function (activity, env, icon, webL10n, presencepalette, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!', "sugar-web/graphics/palette"], function (doc, palette) {

		// Initialize the activity.
		activity.setup();

		var board = null;
		var game = new Chess();
		var existing = [];
		
		var currentenv = null;
		var presenceObject = null;
		var isBlackPlayer = false;
		var isSpectator = false;
		var easy = true;
		var hasLeftTheGame = false;
		var canvasSize = document.getElementById("canvas").parentNode.offsetHeight - 55;
		var userIcon = null;
		canvasSize -= (3 * canvasSize) / 100;
		var getInstances = function (environment) {
			setTimeout(function () {
				document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'><strong> " + environment.user.name + "<img src='" + userIcon + "'></strong> vs. <img src='icons/robot-off.svg'>" + webL10n.get("Computer") + " (<strong>" + webL10n.get("Easy") + "</strong>) <img class='labelled' src='img/chesspieces/wikipedia/bQ.png'>" + "</h2>";
				document.getElementById("information").innerHTML = "<h3>" + webL10n.get("NextTurn") + ": <br><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'></h3>";
				document.getElementById("spectators-title").innerHTML = webL10n.get("SpectatorsTitle") + ": ";
				document.getElementById("move-history-title").innerHTML = webL10n.get("MoveHistory");
				document.getElementById("canvas").style.backgroundColor = currentenv.user.colorvalue.stroke;
				document.getElementById("move-history").style.border = currentenv.user.colorvalue.fill;
				document.getElementById("move-history").style.borderStyle = "solid";
				document.getElementById("move-history").style.borderRadius = "14px";
				document.getElementById("move-history").style.padding = "7px 14px 7px 14px";
			}, 500);
			var userIcon = generateXOLogoWithColor(currentenv.user.colorvalue);
			if (environment.sharedId) {
				presenceObject = activity.getPresenceObject(function (error, network) {
					console.log("Shared instance");
					setTimeout(function () {
						if (network.getSharedInfo().users.length > 2) {
							document.getElementById("spectators").style.visibility = "visible";
							network.sendMessage(network.getSharedInfo().id, {
								user: network.getUserInfo(),
								network: network.getSharedInfo(),
								content: {
									userColor: currentenv.user.colorvalue,
									user: currentenv.user,
									gameState: game.fen(),
									gameHistory: game.history(),
									isSpectator: true
								}
							});
							isSpectator = true;
						}
						else {
							isBlackPlayer = true;
							document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/bQ.png'><strong> " + environment.user.name + "<img src='" + userIcon + "'></strong>" + webL10n.get("WaitingForHostToStart") + "...";
							setTimeout(function () {
								network.sendMessage(network.getSharedInfo().id, {
									user: network.getUserInfo(),
									network: network.getSharedInfo(),
									content: {
										userColor: currentenv.user.colorvalue,
										user: currentenv.user,
										gameState: game.fen(),
										gameHistory: game.history(),
										isSpectator: false
									}
								});
							});
						}
					}, 1000);
					network.onDataReceived(onNetworkDataReceived);
				});
				var config = {
					draggable: true,
					position: 'start',
					onDragStart: onDragStart,
					onDrop: onDrop,
					onMouseoutSquare: onMouseoutSquare,
					onMouseoverSquare: onMouseoverSquare,
					onSnapEnd: onSnapEnd,
					orientation: 'black'
				};
				board = ChessBoard('board', config);

				easyButton.style.visibility = "hidden";
				hardButton.style.visibility = "hidden";
				restartButton.style.visibility = "hidden";
				undoButton.style.visibility = "hidden";
				leaveGameButton.style.visibility = "visible";

			}

			else {
				// Load from datastore
				if (!environment.objectId) {
					console.log("New instance");

					var config = {
						draggable: true,
						position: 'start',
						onDragStart: onDragStart,
						onDrop: onDrop,
						onMouseoutSquare: onMouseoutSquare,
						onMouseoverSquare: onMouseoverSquare,
						onSnapEnd: onSnapEnd,
					};
					game = Chess();
					board = ChessBoard('board', config);
				} else {
					console.log("Existing instance");
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							gameData = JSON.parse(data);
							game.load(gameData[0]);
							renderMoveHistory(gameData[1]);
							var config = {
								draggable: true,
								position: gameData[0],
								onDragStart: onDragStart,
								onDrop: onDrop,
								onMouseoutSquare: onMouseoutSquare,
								onMouseoverSquare: onMouseoverSquare,
								onSnapEnd: onSnapEnd,
							};
							board = ChessBoard('board', config);
						}
					});
				}
			}
		}

		// Update the header info.
		env.getEnvironment(function (err, environment) {
			currentenv = environment;

			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			window.addEventListener('localized', function (e) {
				if (e.language != language) {
					setTimeout(function () {
						webL10n.language.code = language;
					}, 50);
				}
			});

			// Shared instances
			userIcon = generateXOLogoWithColor(currentenv.user.colorvalue);
			setTimeout(getInstances(environment), 500);
		});

		/*The "AI" part starts here */

		var calculateBestMove1 = function (game) {

			var newGameMoves = game.moves();

			return newGameMoves[Math.floor(Math.random() * newGameMoves.length)];

		};

		var calculateBestMove2 = function (game) {

			var newGameMoves = game.moves();
			var bestMove = null;
			//use any negative large number
			var bestValue = -9999;

			for (var i = 0; i < newGameMoves.length; i++) {
				var newGameMove = newGameMoves[i];
				game.move(newGameMove);

				//take the negative as AI plays as black
				var boardValue = -evaluateBoard(game.board())
				game.undo();
				if (boardValue > bestValue) {
					bestValue = boardValue;
					bestMove = newGameMove
				}
			}

			return bestMove;

		};

		var evaluateBoard = function (board) {
			var totalEvaluation = 0;
			for (var i = 0; i < 8; i++) {
				for (var j = 0; j < 8; j++) {
					totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
				}
			}
			return totalEvaluation;
		};

		var getPieceValue = function (piece) {
			if (piece === null) {
				return 0;
			}
			var getAbsoluteValue = function (piece) {
				if (piece.type === 'p') {
					return 10;
				} else if (piece.type === 'r') {
					return 50;
				} else if (piece.type === 'n') {
					return 30;
				} else if (piece.type === 'b') {
					return 30;
				} else if (piece.type === 'q') {
					return 90;
				} else if (piece.type === 'k') {
					return 900;
				}
				throw "Unknown piece type: " + piece.type;
			};

			var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
			return piece.color === 'w' ? absoluteValue : -absoluteValue;
		};

		var minimaxRoot = function (depth, game, isMaximisingPlayer) {

			var newGameMoves = game.moves();
			var bestMove = -9999;
			var bestMoveFound;

			for (var i = 0; i < newGameMoves.length; i++) {
				var newGameMove = newGameMoves[i]
				game.move(newGameMove);
				var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
				game.undo();
				if (value >= bestMove) {
					bestMove = value;
					bestMoveFound = newGameMove;
				}
			}
			return bestMoveFound;
		};

		var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
			positionCount++;
			if (depth === 0) {
				return -evaluateBoard(game.board());
			}

			var newGameMoves = game.moves();

			if (isMaximisingPlayer) {
				var bestMove = -9999;
				for (var i = 0; i < newGameMoves.length; i++) {
					game.move(newGameMoves[i]);
					bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
					game.undo();
					alpha = Math.max(alpha, bestMove);
					if (beta <= alpha) {
						return bestMove;
					}
				}
				return bestMove;
			} else {
				var bestMove = 9999;
				for (var i = 0; i < newGameMoves.length; i++) {
					game.move(newGameMoves[i]);
					bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
					game.undo();
					beta = Math.min(beta, bestMove);
					if (beta <= alpha) {
						return bestMove;
					}
				}
				return bestMove;
			}
		};


		/* board visualization and games state handling starts here*/

		var onDragStart = function (source, piece, position, orientation) {
			// do not pick up pieces if the game is over
			if (game.game_over() || game.in_checkmate() || game.in_draw()) return false

			// or if it's not that side's turn
			if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
				(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
				return false
			}
			// or if I am in multiplayer and not my turn
			if (presenceObject) {
				if (isBlackPlayer && game.turn() === 'w' || !isBlackPlayer && game.turn() === 'b') return false;
			}
			// or if I am a spectator 
			if (isSpectator) return false;
		};

		var makeBestMove = function () {
			var bestMove = getBestMove(game);
			game.move(bestMove);
			board.position(game.fen());
			renderMoveHistory(game.history());
			if (game.game_over()) {
				document.getElementById("result").innerHTML = "<h3>" + (( game.turn() === 'b') ? currentenv.user.name : webL10n.get("Computer")) + " " + webL10n.get("Wins") + "!</h3>";
			}
		};

		var getBestMove = function (game) {
			if (game.game_over()) {
				document.getElementById("result").innerHTML = "<h3>" +( (game.turn() === 'b') ? currentenv.user.name : webL10n.get("Computer")) + " " + webL10n.get("Wins") + "!</h3>";
			}
			if (easy) {
				var bestMove = calculateBestMove1(game);
			}
			else {
				var bestMove = calculateBestMove2(game);
			}
			
			return bestMove;

			// positionCount = 0;
			// var depth = parseInt($('#search-depth').find(':selected').text());

			// var d = new Date().getTime();
			// var bestMove = minimaxRoot(depth, game, true);
			// var d2 = new Date().getTime();
			// var moveTime = (d2 - d);
			// var positionsPerS = (positionCount * 1000 / moveTime);

			// $('#position-count').text(positionCount);
			// $('#time').text(moveTime / 1000 + 's');
			// $('#positions-per-s').text(positionsPerS);
			// return bestMove;
		};

		var renderMoveHistory = function (moves) {
			var historyElement = $('#move-history');
			for (var i = 0; i < moves.length; i = i + 2) {
				historyElement.append('<div style="text-align: center; font-size: 14px; border-radius: 5px; background-color: ' + currentenv.user.colorvalue.fill + '">' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</div><br>');
				existing.push(moves[i]);
				existing.push(moves[i + 1] ? moves[i + 1] : ' ');
			}
			historyElement.scrollTop(historyElement[0].scrollHeight);

			if ( game.in_check()) document.getElementById("in-check").innerHTML = "<h4>CHECK</h4>";
			if ( game.in_checkmate()) document.getElementById("in-checkmate").innerHTML = "<h4>CHECK MATE</h4>";
			if ( game.in_draw()) document.getElementById("in-draw").innerHTML = "<h4>Draw</h4>";
			if ( game.in_stalemate()) document.getElementById("in-stalemate").innerHTML = "<h4>Stalemate</h4>";
			if ( !game.in_check()) document.getElementById("in-check").innerHTML = "";
			if ( !game.in_checkmate()) document.getElementById("in-checkmate").innerHTML = "";
			if ( !game.in_draw()) document.getElementById("in-draw").innerHTML = "";
			if ( !game.in_stalemate()) document.getElementById("in-stalemate").innerHTML = "";
			if ( !game.game_over()) document.getElementById("result").innerHTML = "";

			if (game.turn() === 'w') document.getElementById("information").innerHTML = "<h3>" + webL10n.get("NextTurn") + ": <br><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'></h3>";
			if (game.turn() === 'b') document.getElementById("information").innerHTML = "<h3>" + webL10n.get("NextTurn") + ": <br><img class='labelled' src='img/chesspieces/wikipedia/bQ.png'></h3>";

			if (presenceObject) {
				if (game.in_checkmate() || game.game_over()) {
					if (game.turn() === 'b' && !isBlackPlayer) {
						document.getElementById("result").innerHTML = "<h3><img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'> " + webL10n.get("Wins");
					}
					else {
						document.getElementById("result").innerHTML = "<h3><img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'> " + webL10n.get("Lose");
					}
				}
			}

		};

		var onDrop = function (source, target) {

			var move = game.move({
				from: source,
				to: target,
				promotion: 'q'
			});

			removeGreySquares();
			if (move === null) {
				return 'snapback';
			}

			if (presenceObject) {
				console.log("presence is active     ");  
				setTimeout(function () {
					presenceObject.sendMessage(presenceObject.getSharedInfo().id, {
						user: presenceObject.getUserInfo(),
						network: presenceObject.getSharedInfo(),
						content: {
							userColor: presenceObject.getUserInfo().colorvalue,
							user: currentenv.user,
							gameState: game.fen(),
							gameHistory: game.history(),
							isSpectator: false
						}
					});
				}, 500);
				
			}

			if (!presenceObject || hasLeftTheGame) {
				window.setTimeout(makeBestMove, 1000);
			}
			renderMoveHistory(game.history());
		};

		var onSnapEnd = function () {
			board.position(game.fen());
		};

		var onMouseoverSquare = function (square, piece) {
			var moves = game.moves({
				square: square,
				verbose: true
			});

			if (moves.length === 0) return;

			if (presenceObject) {
				if (isBlackPlayer && game.turn() === 'w' || !isBlackPlayer && game.turn() === 'b') return false;
			}

			greySquare(square);

			for (var i = 0; i < moves.length; i++) {
				greySquare(moves[i].to);
			}
		};

		var onMouseoutSquare = function (square, piece) {
			removeGreySquares();
		};

		var removeGreySquares = function () {
			$('#board .square-55d63').css('background', '');
		};

		var greySquare = function (square) {
			var squareEl = $('#board .square-' + square);

			var background = '#a9a9a9';
			if (squareEl.hasClass('black-3c85d') === true) {
				background = '#696969';
			}

			squareEl.css('background', background);
		};

		// Toolbar buttons
		var easyButton = document.getElementById("easy-button");
		var hardButton = document.getElementById("hard-button");
		var restartButton = document.getElementById("restart-button");
		var canvas = document.getElementById("canvas");
		var moveHistory = document.getElementById("move-history");
		var undoButton = document.getElementById("undo-button");
		var leaveGameButton = document.getElementById("leave-game-button");

		easyButton.addEventListener("click", function(event) {
			easy = true;
			var userIcon = generateXOLogoWithColor(currentenv.user.colorvalue);
			document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'><strong> " + currentenv.user.name + "<img src='" + userIcon + "'></strong> vs. <img src='icons/robot-off.svg'>" + webL10n.get("Computer") + " (<strong>" + webL10n.get("Easy") + "</strong>) <img class='labelled' src='img/chesspieces/wikipedia/bQ.png'>" + "</h2>";
		});
		hardButton.addEventListener("click", function(event) {
			easy = false;
			var userIcon = generateXOLogoWithColor(currentenv.user.colorvalue);
			document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'><strong> " + currentenv.user.name + "<img src='" + userIcon + "'></strong> vs. <img src='icons/robot-on.svg'>" + webL10n.get("Computer") + " (<strong>" + webL10n.get("Hard") + "</strong>) <img class='labelled' src='img/chesspieces/wikipedia/bQ.png'>" + "</h2>";
		});
		restartButton.addEventListener("click", function(event) {
			var config = {
				draggable: true,
				position: 'start',
				onDragStart: onDragStart,
				onDrop: onDrop,
				onMouseoutSquare: onMouseoutSquare,
				onMouseoverSquare: onMouseoverSquare,
				onSnapEnd: onSnapEnd,
			};
			board = ChessBoard('board', config);
			game = Chess();
			var moveHistory = document.getElementById("move-history");
			moveHistory.innerHTML = "";
			easy = true;
			document.getElementById("in-check").innerHTML = "";
			document.getElementById("in-checkmate").innerHTML = "";
			document.getElementById("in-draw").innerHTML = "";
			document.getElementById("in-stalemate").innerHTML = "";
			document.getElementById("result").innerHTML = "";
		});
		leaveGameButton.addEventListener("click", function () {
			if (currentenv.sharedId) {
				currentenv.sharedId = null;
				presenceObject.onDataReceived(function () {
					console.log("Changed to single mode.");
				});
				hasLeftTheGame = true;

				isBlackPlayer = false;
				easyButton.style.visibility = "visible";
				hardButton.style.visibility = "visible";
				restartButton.style.visibility = "visible";
				undoButton.style.visibility = "visible";
				leaveGameButton.style.visibility = "hidden";
				setTimeout(getInstances(currentenv), 500);
				if (isSpectator) {
					document.getElementById("stop-button").click();
				}
			}
			else {
				window.location.reload();
			}
			setTimeout(function () {
				presenceObject.sendMessage(presenceObject.getSharedInfo().id, {
					user: presenceObject.getUserInfo(),
					network: presenceObject.getSharedInfo(),
					content: {
						userColor: null, // A workaround to check for leaves.
						user: currentenv.user,
						gameState: game.fen(),
						gameHistory: game.history(),
						isSpectator: false
					}
				});
			}, 500);
		});
		// Full screen
		document.getElementById("fullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			// resizeHandler();
			window.onresize();
		});
		// Unfull screen
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			// document.getElementById("canvas").style.zoom = 1;
		});
		document.getElementById("undo-button").addEventListener('click', function(event) {
			game.undo();
			game.undo();
			board.position(game.fen());
		});
		window.onresize = function () {
			var config = {
				draggable: true,
				position: game.fen(),
				onDragStart: onDragStart,
				onDrop: onDrop,
				onMouseoutSquare: onMouseoutSquare,
				onMouseoverSquare: onMouseoverSquare,
				onSnapEnd: onSnapEnd,
				orientation: 'white'
			};
			board = ChessBoard('board', config);
		}
		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function (event) {
			// board = Chessboard('board', position='start');
			tutorial.start();
			// window.onresize();
		});

		// Save in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");
			var jsonData = JSON.stringify([game.fen(), existing]);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});

		// Link presence palette
		var onNetworkDataReceived = function (msg) {
			var xoColor = generateXOLogoWithColor(msg.content.user.colorvalue);
			if (presenceObject.getUserInfo().networkId === msg.user.networkId && msg.content.isSpectator) {
				document.getElementById("spectators").style.visibility = "visible";
				document.getElementById("header").innerHTML = "<h2>" + webL10n.get("SpectatorMode") + "</h2>";
				var spectators = $('#spectators');
				spectators.append('<img style="height:23px; vertical-align:middle; " src="' + xoColor + '"><span>' + msg.content.user.name + ' ' + webL10n.get("Joined") + ' </span><br>');
				return;
			}

			if (msg.content.userColor === null) {
				var spectators = $('#spectators');
				document.getElementById("spectators").style.visibility = "visible";
				spectators.append('<img style="height:23px; vertical-align:middle; " src="' + xoColor + '"> <span>' + msg.content.user.name + ' ' + webL10n.get("Left") + ' </span><br>');
			}

			if (msg.content.isSpectator) {
				console.log(msg.content.user + "joins ");
				document.getElementById("spectators").style.visibility = "visible";
				var spectators = $('#spectators');
				spectators.append('<img style="height:23px; vertical-align:middle; " src="' + xoColor + '"> <span>' + msg.content.user.name + ' ' + webL10n.get("Joined") + ' </span><br>');
				var moveHistory = document.getElementById("move-history");
				// moveHistory.innerHTML = "";
				renderMoveHistory(msg.content.gameHistory);
			}
			else {
				game.load(msg.content.gameState);
				board.position(msg.content.gameState);
				var moveHistory = document.getElementById("move-history");
				// moveHistory.innerHTML = "";
				renderMoveHistory(msg.content.gameHistory);
				if (presenceObject.getUserInfo().networkId !== msg.user.networkId) {
					if (!isBlackPlayer) {
						document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'><strong> " + currentenv.user.name + "</strong><img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'> vs. <img src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>" + msg.content.user.name + " <img class='labelled' src='img/chesspieces/wikipedia/bQ.png'>" + "</h2>";
					}
					else {
						document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/bQ.png'><strong> " + currentenv.user.name + "</strong><img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'> vs. <img src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>" + msg.content.user.name + " <img class='labelled' src='img/chesspieces/wikipedia/wQ.png'>" + "</h2>";
					}
				}
			}
		}; 

		var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

		function generateXOLogoWithColor(color) {
			var coloredLogo = xoLogo;
			coloredLogo = coloredLogo.replace("#010101", color.stroke);
			coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);

			return "data:image/svg+xml;base64," + btoa(coloredLogo);
		}
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		palette.addEventListener('shared', function () {
			palette.popDown();
			console.log("Want to share");
			presenceObject = activity.getPresenceObject(function (error, presenceObject) {
				if (error) {
					console.log("Sharing error");
					return;
				}
				presenceObject.createSharedActivity('org.sugarlabs.Chess', function (groupId) {
					console.log("Activity shared");
					var config = {
						draggable: true,
						position: 'start',
						onDragStart: onDragStart,
						onDrop: onDrop,
						onMouseoutSquare: onMouseoutSquare,
						onMouseoverSquare: onMouseoverSquare,
						onSnapEnd: onSnapEnd,
						orientation: 'white'
					};
					board = ChessBoard('board', config);
					game = new Chess();
					var moveHistory = document.getElementById("move-history");
					moveHistory.innerHTML = "";
					var easyButton = document.getElementById("easy-button");
					var hardButton = document.getElementById("hard-button");
					var restartButton = document.getElementById("restart-button");
					var undoButton = document.getElementById("undo-button");
					var leaveGameButton = document.getElementById("leave-game-button");

					easyButton.style.visibility = "hidden";
					hardButton.style.visibility = "hidden";
					restartButton.style.visibility = "hidden";
					undoButton.style.visibility = "hidden";
					leaveGameButton.style.visibility = "visible";
					document.getElementById("header").innerHTML = "<h2><img class='labelled' src='img/chesspieces/wikipedia/wQ.png'><strong> " + currentenv.user.name + "<img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) +"'></strong> " + webL10n.get("WaitingForPlayer") + "..." + "</h2>";
					

				});
				presenceObject.onDataReceived(onNetworkDataReceived);
				presenceObject.onConnectionClosed(function () {
					console.log("Connection closed");
					setTimeout(function () {
						presenceObject.sendMessage(presenceObject.getSharedInfo().id, {
							user: presenceObject.getUserInfo(),
							network: presenceObject.getSharedInfo(),
							content: {
								userColor: presenceObject.getUserInfo().colorvalue,
								user: currentenv.user,
								gameState: null, // small hack to check if the user is not in the netowrk now
								gameHistory: game.history(),
								isSpectator: false
							}
						});
					}, 500);
				});
			});
		});

	});

});