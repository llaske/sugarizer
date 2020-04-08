define(["sugar-web/activity/activity","sugar-web/env","sugar-web/graphics/presencepalette","sugar-web/graphics/icon","tutorial","webL10n"], function (activity,env,presencepalette,icon,tutorial,webL10n) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		//chess board
		var isHost = false;
		var board = null
		pos='start'
		var game = new Chess()
		var $status = $('#status')
		var $fen = $('#fen')
		var $pgn = $('#pgn')
		var whiteSquareGrey = '#a9a9a9'
		var blackSquareGrey = '#696969'
		//full-screen
		var toolbarSize = 55;
		var marginPercent = 20;
		var headerSize = toolbarSize + 40;
		var qrSize = document.getElementById("canvas").parentNode.offsetHeight - headerSize;
		qrSize -= (marginPercent*qrSize)/100;
		var margin = (document.getElementById("canvas").parentNode.offsetWidth - qrSize) / 2;
		document.getElementById("canvas").style.marginLeft =  "px";
		document.getElementById("canvas").style.marginTop = "px";
		
		// Welcome user
		env.getEnvironment(function(err, environment) {
			document.getElementById("canvas").style.backgroundColor=environment.user.colorvalue.fill;

			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;

			currentenv = environment;
			
			// Shared instances
			if (environment.sharedId) {
				//console.log("Shared instance");
				presence = activity.getPresenceObject(function(error, network) {
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
					
				});
			
			}

			

			// Load from datastore
			if (!environment.objectId) {
				//console.log("New instance");
			} else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					//console.log(data.configuration);
					if (error==null && data!=null) {
						
						game=new Chess(pos);
						pos = data.configuration;
						
						
						//console.log(pos);
						if(game.game_over()===true){
							pos='start';
							game=new Chess();
							
						}
						board.orientation(data.alignment);
						onSnapEnd();
						
					}
					else{
						alert("Error in Loading! Start new Activity");
						//console.log("doit");
					}
				});
			}
		});
	
		


		// Link presence palette
	
		var presence = null;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		palette.addEventListener('shared', function() {
			palette.popDown();
			//console.log("Want to share");
			presence = activity.getPresenceObject(function(error, network) {
				network.onDataReceived(onNetworkDataReceived);
				
				
				if (error) {
					//console.log("Sharing error");
					return;
				}
				network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
					//console.log("Activity shared");
					isHost = true;
				});

				
				
				network.onSharedActivityUserChanged(onNetworkUserChanged);
				
			});
			

		});
	

	
		var onNetworkDataReceived = function(msg) {
			
			//console.log("hi");
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				
				return;
			}
			// if(msg.stop){
			// 	document.getElementById("stop-button").click();
			// }
			//console.log(msg.content.alignment)
			game=new Chess(msg.content.configuration);
			//console.log(msg.content.configuration);
			
			//localization
			window.addEventListener("localized", function() {
			
				document.getElementById("status-update").title = webL10n.get("Status");
			});
			
			
			
			document.getElementById("start-button").addEventListener('click', function (event) {
				game=new Chess();
				board.position('start');
				updateStatus();
			})
			
			
			if(msg.content.alignment=="white"){
				board.orientation("black");
				board.position(msg.content.configuration);
				updateStatus();
				
			}
			else{
				
				board.orientation("white");
				board.position(msg.content.configuration);
				updateStatus();
				
				
			}
			//console.log(msg.content);
			if(game.game_over()===true){
				game=new Chess();
			}
		
		}; 




		var onNetworkUserChanged = function(msg) {
			//console.log("hello");
			

			
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


	
		function onDragStart (source, piece, position, orientation) {
			
			if (game.game_over()){
				return false;	
			} 
			if(presence){
				
				if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
					return false;
				}
				if((board.orientation()==='white'&& piece.search(/^b/) !== -1)||(board.orientation()==='black' && piece.search(/^w/) !== -1)){
					return false;
				}
				
			}
			else{
				// only pick up pieces for White
  				if (piece.search(/^b/) !== -1) return false
			}
		
		  
		  }
		function removeGreySquares () {
			$('#myBoard .square-55d63').css('background', '')
		}
		  
		function greySquare (square) {
			var $square = $('#myBoard .square-' + square)
		  
			var background = whiteSquareGrey
			if ($square.hasClass('black-3c85d')) {
			  background = blackSquareGrey
		 	}
		  
			$square.css('background', background)
		}
		function onMouseoverSquare (square, piece) {
			// get list of possible moves for this square
			var moves = game.moves({
			  square: square,
			  verbose: true
			})
		  
			// exit if there are no moves available for this square
			if (moves.length === 0) return
		  
			// highlight the square they moused over
			greySquare(square)
		  
			// highlight the possible squares for this piece
			for (var i = 0; i < moves.length; i++) {
			  greySquare(moves[i].to)
			}
		}
		  
		function onMouseoutSquare (square, piece) {
			removeGreySquares()
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
			removeGreySquares()
			// see if the move is legal
			var move = game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
			})
		
			// illegal move
			if (move === null) return 'snapback'

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
			else{ // make random legal move for black
				window.setTimeout(makeRandomMove, 250)
			}
	  
			updateStatus()
		}
		
		// update the board position after the piece snap
		// for castling, en passant, pawn promotion
		function onSnapEnd () {
			board.position(game.fen())
		}
	  
		function updateStatus () {
			var status = ''
		
			var moveColor = 'White'
			if (game.turn() === 'b') {
			moveColor = 'Black'
			}
	  
			// checkmate?
			if (game.in_checkmate()) {
			status = 'Game over, ' + moveColor + ' is in checkmate.'
			}
	  
			// draw?
			else if (game.in_draw()) {
			status = 'Game over, drawn position'
			}
		
			// game still on
			else {
			status = moveColor + ' to move'
		
			// check?
			if (game.in_check()) {
				status += ', ' + moveColor + ' is in check'
			}
			}
	  
				$status.html(status)
				$fen.html(game.fen())
				$pgn.html(game.pgn())
			}
			
			var config = {
				draggable: true,
				position: pos,
				onDrop: onDrop,
				onDragStart: onDragStart,
				onMouseoutSquare: onMouseoutSquare,
  				onMouseoverSquare: onMouseoverSquare,
				onSnapEnd: onSnapEnd
			}
			board = Chessboard('myBoard', config)
			$('#start-button').on('click', board.start)
			
			updateStatus()

				// document.getElementById("start-button").addEventListener('click',function (event){
				// 	if(presence)
				// 	{
				// 		game=new Chess();
				// 	}
				// });

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

		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		var resizeHandler = function() {
			var windowSize = document.body.clientHeight - headerSize + (document.getElementById("unfullscreen-button").style.visibility == "visible"?toolbarSize:0);
			var zoom = windowSize/((qrSize*(100+marginPercent))/100);
			document.getElementById("canvas").style.zoom = zoom;
			var useragent = navigator.userAgent.toLowerCase();
			if (useragent.indexOf('chrome') == -1) {
				document.getElementById("canvas").style.MozTransform = "scale("+zoom+")";
				document.getElementById("canvas").style.MozTransformOrigin = "0 0";
			}
			
		}
		window.addEventListener('resize', resizeHandler);

		document.getElementById("fullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			resizeHandler();
		  });
  
		  
		  document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.display = "block";
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			resizeHandler();
		});


	});



});
