define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette","tutorial"], function (activity,env, icon, webL10n, presencepalette,tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {		
		// Initialize the activity.		
		activity.setup();
		
		var presence = null;
		//var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		var networkButton = document.getElementById("network-button");
		presencepalette = new presencepalette.PresencePalette(networkButton, undefined);
		presencepalette.addEventListener('shared', shareActivity);

		// Launched with a shared id, activity is already shared
		if (window.top.sugar.environment.sharedId) {
			shareActivity();
			presencepalette.setShared(true);
		}
		var isHost = false;
		var pos='start';
		var game = new Chess();
		var board = null;
		var difficulty=1;
		var whiteSquareGrey = '#a9a9a9';
		var blackSquareGrey = '#696969';
		var userSettings = null;

		function shareActivity() {
			//palette.popDown();
			presencepalette.popDown();
			//console.log("Want to share");
			presence = activity.getPresenceObject(function(error, network) {
				if (error) {
					//console.log("Sharing error");
					return;
				}
				userSettings = network.getUserInfo();
				if (!window.top.sugar.environment.sharedId) {
					network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
						//console.log("Activity shared");
						isHost = true;
					});
				}
				network.onConnectionClosed(function (event) {
					presence=null;
					document.getElementById("stop-button").click();
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
				
			});
		};
		var onNetworkDataReceived = function(msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			if(msg.stop){
				document.getElementById("stop-button").click();
			}
			game=new Chess(msg.content.configuration);
			if(msg.content.alignment=="white"){
				board.orientation("black");
			}
			else{
				board.orientation("white");
			}
			//console.log(msg.content);
			if(game.game_over()===true){
				game=new Chess();
			}
			document.getElementById("PlayerTwo").innerHTML=msg.user.name.toUpperCase();
			onSnapEnd();
		};
		var onNetworkUserChanged = function(msg) {
			var DataPacket;
			if(msg.move===1){
				DataPacket={
				  	'configuration':game.fen(),
				  	'alignment':board.orientation(),
				  	'stop':false
				};
			}
			else{
				DataPacket={
				  	'configuration':game.fen(),
				  	'alignment':board.orientation(),
				  	'stop':true
				};
			}
			if (isHost&&(presence!==null)) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: DataPacket
				});
			}
			if(msg.move==-1){
				presence=null;
			}
			//console.log(msg.move);
		}; 
		env.getEnvironment(function(err, environment) {
			var currentenv = environment;
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			document.getElementById("PlayerOne").innerHTML=environment.user.name.toUpperCase();
			document.getElementById("Versus").innerHTML=" vs ";
			document.getElementById("PlayerTwo").innerHTML="COMPUTER";
			// Load from datastore
			if (!environment.objectId) {
				//console.log("New instance");
				//Change_Status(1);
				Translate();
			}
			else {
				//console.log("Existing instance");
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						//console.log(data);
						pos = data.configuration;
						game=new Chess(pos);
						Change_Status(data.level);
						//console.log(pos);
						if(game.game_over()===true){
							pos='start';
							game=new Chess();
							Change_Status(1);
						}
						board.orientation(data.alignment);
						onSnapEnd();
						Translate();
					}
					else{
						alert("Error in Loading! Start new Activity");
						//console.log("doit");
					}
				});
			}
			if (environment.sharedId) {
				//console.log("Shared instance");
				presence = activity.getPresenceObject(function(error, network) {
					if(error){
						return;
					}
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
		});		
		
		var onMoveEnd = function(oldPos, newPos) {
			// Alert if game is over
		  	if (game.game_over() === true) {
		   		GameOver();
		    	//console.log('Game Over');
		  	}
		  	// Log the current game position
		  	//console.log(game.fen());
		};
		var removeGreySquares = function() {
			$('#myBoard .square-55d63').css('background', '')
		};

		var greySquare = function(square) {
		 	var $square = $('#myBoard .square-' + square)
		 	var background = whiteSquareGrey
		 	if ($square.hasClass('black-3c85d')) {
		   		background = blackSquareGrey
		 	}
		  	$square.css('background', background)
		};

		var onDragStart = function(source, piece, position, orientation) {
			if(presence){
				if (game.game_over()){
					return false;	
				} 
				if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
					return false;
				}
				if((board.orientation()==='white'&& piece.search(/^b/) !== -1)||(board.orientation()==='black' && piece.search(/^w/) !== -1)){
					return false;
				}
			}
			else{
				if (game.game_over() === true || ((orientation=='white')&&(piece.search(/^b/) !== -1))) {
			    	return false;
			  	}
			  	else if (game.game_over() === true || ((orientation=='black')&&(piece.search(/^w/) !== -1))) {
			    	return false;
			  	}
			}		  
		};
		var onMouseoverSquare = function(square, piece) {
		  	// get list of possible moves for this square
		  	var moves = game.moves({
		    	square: square,
		    	verbose: true
		  	});
		  	// exit if there are no moves available for this square		  
		  	if (moves.length === 0){
		  		return;
		  	}		  
		 	 // highlight the square they moused over
		  	greySquare(square);
		 	//console.log("check");
		  	// highlight the possible squares for this piece
		  	for (var i = 0; i < moves.length; i++) {
		    	greySquare(moves[i].to);
		  	}
		};

		var onMouseoutSquare = function(square, piece) {
		 	removeGreySquares();
		};

		var onSnapEnd = function(){
		 	board.position(game.fen());
		};

		var randomMove = function() {
			var possibleMoves = game.moves();
			var randomIndex = Math.floor(Math.random() * possibleMoves.length);
			return possibleMoves[randomIndex];
		};
		/**
		 * Evaluates current chess board relative to player
		 * @param {string} color - Players color, either 'b' or 'w'
		 * @return {Number} board value relative to player
		 */
		var evaluateBoard = function(board, color) {
			// Sets the value for each piece using standard piece value
			var pieceValue = {
				'p': 100,
				'n': 350,
				'b': 350,
				'r': 525,
				'q': 1000,
				'k': 10000
			};
			// Loop through all pieces on the board and sum up total
			var value = 0;
			board.forEach(function(row) {
				row.forEach(function(piece) {
					if (piece) {
						// Subtract piece value if it is opponent's piece
						value += pieceValue[piece['type']]*(piece['color'] === color ? 1 : -1);
					}
				});
			});
			return value;
		};
		/**
		 * Calculates the best move looking one move ahead
		 * @param {string} playerColor - Players color, either 'b' or 'w'
		 * @return {string} the best move
		*/
		var calcBestMoveOne = function(playerColor) {
		  	// List all possible moves
		  	var possibleMoves = game.moves();
		  	// Sort moves randomly, so the same move isn't always picked on ties
		  	possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
		  	// exit if the game is over
		  	if (game.game_over() === true || possibleMoves.length === 0) return;
		  	// Search for move with highest value
		  	var bestMoveSoFar = null;
		  	var bestMoveValue = Number.NEGATIVE_INFINITY;
		  	possibleMoves.forEach(function(move) {
		    	game.move(move);
		    	var moveValue = evaluateBoard(game.board(), playerColor);
		    	if (moveValue > bestMoveValue) {
		      		bestMoveSoFar = move;
		      		bestMoveValue = moveValue;
		    	}
		    	game.undo();
		  	});
		  	return bestMoveSoFar;
		};

		/**
		 * Calculates the best move using Minimax without Alpha Beta Pruning.
		 * @param {Number} depth - How many moves ahead to evaluate
		 * @param {Object} game - The game to evaluate
		 * @param {string} playerColor - Players color, either 'b' or 'w'
		 * @param {Boolean} isMaximizingPlayer - If current turn is maximizing or minimizing player
		 * @return {Array} The best move value, and the best move
		*/
		var calcBestMoveNoAB = function(depth, game, playerColor,isMaximizingPlayer=true) {
			// Base case: evaluate board
			if (depth === 0) {
				value = evaluateBoard(game.board(), playerColor);
			    return [value, null]
			}
			// Recursive case: search possible moves
			var bestMove = null; // best move not set yet
			var possibleMoves = game.moves();
			// Set random order for possible moves
			possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
			// Set a default best move value
			var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
			// Search through all possible moves
			for (var i = 0; i < possibleMoves.length; i++) {
				var move = possibleMoves[i];
			    // Make the move, but undo before exiting loop
			    game.move(move);
			    // Recursively get the value of this move
			    value = calcBestMoveNoAB(depth-1, game, playerColor, !isMaximizingPlayer)[0];
			    // Log the value of this move
			    //console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value, bestMove, bestMoveValue);
			    if (isMaximizingPlayer) {
			      	// Look for moves that maximize position
			      	if (value > bestMoveValue) {
			        	bestMoveValue = value;
			        	bestMove = move;
			      	}
			    } 
			    else {
			     	// Look for moves that minimize position
			      	if (value < bestMoveValue) {
			        	bestMoveValue = value;
			        	bestMove = move;
			      	}
			    }
			    // Undo previous move
			    game.undo();
			  }
			// Log the best move at the current depth
			//console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue);
			// Return the best move, or the only move
			return [bestMoveValue, bestMove || possibleMoves[0]];
		};

		/**
		 * Calculates the best move using Minimax with Alpha Beta Pruning.
		 * @param {Number} depth - How many moves ahead to evaluate
		 * @param {Object} game - The game to evaluate
		 * @param {string} playerColor - Players color, either 'b' or 'w'
		 * @param {Number} alpha
		 * @param {Number} beta
		 * @param {Boolean} isMaximizingPlayer - If current turn is maximizing or minimizing player
		 * @return {Array} The best move value, and the best move
		*/
		var calcBestMove = function(depth, game, playerColor, alpha=Number.NEGATIVE_INFINITY, beta=Number.POSITIVE_INFINITY, isMaximizingPlayer=true) {
			// Base case: evaluate board
			if (depth === 0) {
				value = evaluateBoard(game.board(), playerColor);
			    return [value, null]
			}
			// Recursive case: search possible moves
			var bestMove = null; // best move not set yet
			var possibleMoves = game.moves();
			// Set random order for possible moves
			possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
			// Set a default best move value
			var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
			// Search through all possible moves
			for (var i = 0; i < possibleMoves.length; i++) {
			    var move = possibleMoves[i];
			    // Make the move, but undo before exiting loop
			    game.move(move);
			    // Recursively get the value from this move
			    value = calcBestMove(depth-1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
			    // Log the value of this move
			    //console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value, bestMove, bestMoveValue);
			    if (isMaximizingPlayer) {
			      	// Look for moves that maximize position
			      	if (value > bestMoveValue) {
			        	bestMoveValue = value;
			        	bestMove = move;
			      	}
			      	alpha = Math.max(alpha, value);
			    }
			    else {
			     	// Look for moves that minimize position
			      	if (value < bestMoveValue) {
			        	bestMoveValue = value;
			        	bestMove = move;
			      	}
			      	beta = Math.min(beta, value);
			    }
			    // Undo previous move
			    game.undo();
			    // Check for alpha beta pruning
			    if (beta <= alpha) {
			      	//console.log('Prune', alpha, beta);
			      	break;
			    }
			}
			// Log the best move at the current depth
			//console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue + ' | A: ' + alpha + ' | B: ' + beta);
			// Return the best move, or the only move
			return [bestMoveValue, bestMove || possibleMoves[0]];
		};

		var makeMove = function(algo, skill=3) {
			// exit if the game is over
			if (game.game_over() === true) {
			  	GameOver();
			    //console.log('game over');
			    return;
			}
			// Calculate the best move, using chosen algorithm
			if (algo === 1) {
				var move = randomMove();
			}
			else if (algo === 2) {
			    var move = calcBestMoveOne(game.turn());
			}
			else if (algo === 3) {
			    var move = calcBestMoveNoAB(skill, game, game.turn())[1];
			}
			else {
			    var move = calcBestMove(skill, game, game.turn())[1];
			}
			// Make the calculated move
			game.move(move);
			// Update board positions
			board.position(game.fen());
			Update();
		};

		// Handles what to do after human makes move.
		// Computer automatically makes next move
		var onDrop = function(source, target) {

			removeGreySquares();
			// see if the move is legal
			var move = game.move({
			    from: source,
			    to: target,
			    promotion: 'q' // NOTE: always promote to a queen for example simplicity
			});
			// If illegal move, snapback
			if (move === null) return 'snapback';
			// Log the move
			//console.log(move)
			var DataPacket={
			  	'configuration':game.fen(),
			  	'alignment':board.orientation(),
			  	'stop':false
			};
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: DataPacket
				});
			}
			else{
			  	Update();
			  	window.setTimeout(function() {
			    	makeMove(difficulty, 3);
			  	}, 100);
			}					 
		};
		var config = {
			  draggable: true,
			  position: pos,
			  onDragStart: onDragStart,
			  onDrop: onDrop,
			  onMoveEnd: onMoveEnd,
			  onMouseoutSquare: onMouseoutSquare,
			  onMouseoverSquare: onMouseoverSquare,
			  onSnapEnd: onSnapEnd
			}
		board = Chessboard('myBoard', config);
		document.getElementById("stop-button").addEventListener('click', function (event) {
			//console.log("writing...");
			var jsonData = {
				'configuration':game.fen(),
				'level':difficulty,
				'alignment':board.orientation()
			};
			var DataPacket={
			  	'configuration':game.fen(),
			  	'alignment':board.orientation(),
			  	'stop':true
			};
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: DataPacket
				});
			}
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					//console.log(jsonData);
				} else {
					//console.log("write failed.");
				}
			});
		});
		document.getElementById("fullscreen-button").addEventListener('click', function() {
		    document.getElementById("main-toolbar").style.visibility = "hidden";
		    document.getElementById("wrapper").style.paddingTop = "0px";
		    document.getElementById("unfullscreen-button").style.visibility = "visible";
		    //board.handleResize(window.innerWidth, state.state.boardState,state);
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			document.getElementById("main-toolbar").style.visibility = "visible";
		    document.getElementById("wrapper").style.paddingTop = "30px";
		    document.getElementById("unfullscreen-button").style.visibility = "hidden";
		});
		document.getElementById("newgame-button").addEventListener('click', function() {
		    board.start();
		    board.orientation('white');
		    game=new Chess();
		    //console.log("writing...");
			var jsonData = {
				'configuration':game.fen(),
				'level':1,
				'alignment':board.orientation()
			};
			Change_Status(1);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					//console.log(jsonData);
				} else {
					//console.log("write failed.");
				}
			});
		    onSnapEnd();
		    var DataPacket={
			  	'configuration':game.fen(),
			  	'alignment':board.orientation(),
			  	'stop':false
			};
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: DataPacket
				});
			}
	  	});
		document.getElementById("swap-button").addEventListener('click', function() {
			if(game.fen()=="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"){
				board.flip();
				//console.log("writing...");
				var jsonData = {
					'configuration':game.fen(),
					'level':difficulty,
					'alignment':board.orientation()
				};
				Change_Status(difficulty);
				game=new Chess(jsonData.configuration);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						//console.log(jsonData);
					} else {
						//console.log("write failed.");
					}
					onSnapEnd();
					if(board.orientation()=='black'){
						window.setTimeout(function() {
				   			makeMove(difficulty, 3);
				  		}, 100);
					}
				});	
				var DataPacket={
				  	'configuration':game.fen(),
				  	'alignment':board.orientation(),
				  	'stop':false
				};
				if (presence) {
					presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: DataPacket
					});
				}			    
			}	    
	  	});
		document.getElementById("indifficulty-button").addEventListener('click', function() {
			if(difficulty<4){
				difficulty++;
				Change_Status(difficulty); 
			} 					
		});
		document.getElementById("dedifficulty-button").addEventListener('click', function() {
			if(difficulty>1){
				difficulty--;
				Change_Status(difficulty); 
			}
		});
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});
		var Change_Status=function(level){
			difficulty=level;
			//console.log("Check");
			switch(difficulty){
				case 1:
					document.getElementById("diff_indicator").innerHTML=webL10n.get("VeryEasy");
					break;
				case 2:
					document.getElementById("diff_indicator").innerHTML=webL10n.get("Easy");
					break;
				case 3:
					document.getElementById("diff_indicator").innerHTML=webL10n.get("Medium");
					break;
				case 4:
					document.getElementById("diff_indicator").innerHTML=webL10n.get("Hard");
					break;
			}
		};
		var GameOver=function(){
			alert("Game Over");
			board.start();
		    board.orientation('white');
		    game=new Chess();
		    //console.log("writing...");
			var jsonData = {
				'configuration':game.fen(),
				'level':1,
				'alignment':board.orientation()
			};
			Change_Status(1);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					//console.log(jsonData);
				}
				else {
					//console.log("write failed.");
				}
			});
		    onSnapEnd();
		};
		var Update=function(){
			var jsonData = {
				'configuration':game.fen(),
				'level':difficulty,
				'alignment':board.orientation()
			};
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					//console.log(jsonData);
				}
				else {
					//console.log("write failed.");
				}
			});
		};
		var Translate=function(){
			document.getElementById("activity-button").title=webL10n.get("AB");
			document.getElementById("newgame-button").title=webL10n.get("NGB");
			document.getElementById("swap-button").title=webL10n.get("SWB");
			document.getElementById("dedifficulty-button").title=webL10n.get("DDB");
			document.getElementById("indifficulty-button").title=webL10n.get("IDB");
			document.getElementById("network-button").title=webL10n.get("NB");
			document.getElementById("stop-button").title=webL10n.get("STB");
			document.getElementById("fullscreen-button").title=webL10n.get("FB");
			document.getElementById("help-button").title=webL10n.get("HB");
			document.getElementById("unfullscreen-button").title=webL10n.get("UFB");
			document.getElementById("title").value=webL10n.get("TITLE");
		};
	});
});
