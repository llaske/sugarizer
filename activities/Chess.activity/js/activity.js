define(["sugar-web/activity/activity","sugar-web/graphics/presencepalette", "sugar-web/env", "sugar-web/graphics/icon", "webL10n"], function (activity,presencepalette,env, icon,webL10n) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {
		
		// //random movement
		// var board = null
		// var game = new Chess()

		// function onDragStart (source, piece, position, orientation) {
		// // do not pick up pieces if the game is over
		// if (game.game_over()) return false

		// // only pick up pieces for White
		// if (piece.search(/^b/) !== -1) return false
		// }

		// function makeRandomMove () {
		// var possibleMoves = game.moves()

		// // game over
		// if (possibleMoves.length === 0) return

		// var randomIdx = Math.floor(Math.random() * possibleMoves.length)
		// game.move(possibleMoves[randomIdx])
		// board.position(game.fen())
		// }

		// function onDrop (source, target) {
		// // see if the move is legal
		// var move = game.move({
		// 	from: source,
		// 	to: target,
		// 	promotion: 'q' // NOTE: always promote to a queen for example simplicity
		// })

		// // illegal move
		// if (move === null) return 'snapback'

		// // make random legal move for black
		// window.setTimeout(makeRandomMove, 250)
		// }

		// // update the board position after the piece snap
		// // for castling, en passant, pawn promotion
		// function onSnapEnd () {
		// board.position(game.fen())
		// }

		// var config = {
		// draggable: true,
		// position: 'start',
		// onDragStart: onDragStart,
		// onDrop: onDrop,
		// onSnapEnd: onSnapEnd
		// }
		// board = Chessboard('myBoard', config)


		
		var board = null
		var game = new Chess()
		var $status = $('#status')
		var $fen = $('#fen')
		var $pgn = $('#pgn')

		function onDragStart (source, piece, position, orientation) {
		// do not pick up pieces if the game is over
		if (game.game_over()) return false

		// only pick up pieces for the side to move
		if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
			return false
		}
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
		position: 'start',
		onDragStart: onDragStart,
		onDrop: onDrop,
		onSnapEnd: onSnapEnd
		}
		board = Chessboard('myBoard', config)

		updateStatus()

		

	// 	// Link presence palette
	// var presence = null;
	// var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
	// palette.addEventListener('shared', function() {
	// 	palette.popDown();
	// 	console.log("Want to share");
	// 	presence = activity.getPresenceObject(function(error, network) {
	// 		if (error) {
	// 			console.log("Sharing error");
	// 			return;
	// 		}
	// 		network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
	// 			console.log("Activity shared");
	// 		});
	// 		network.onDataReceived(onNetworkDataReceived);
	// 		console.log("hi");
	// 	});
	// });

	function shareActivity() {
		palette.popDown();
		console.log("Want to share");
		presence = activity.getPresenceObject(function(error,network){
			// if no error in getting presence obj means connected to server
			if (error) {
				console.log("error in sharing ");
				return;
			}
			userSettings = network.getUserInfo();
			if(!window.top.sugar.environment.sharedId){
				network.createSharedActivity('org.sugarlabs.Chess',function(groupId){
					console.log("Activity Shared");
					
					isHost = true;
				});
			}
			if(did_guest_join==1){
				console.log("guest joined");
			}
			var first_time=0;
				console.log("outif");
				if (presence){console.log("inif1");
				if(first_time==0){console.log("inif2");
				presence.sendMessage(presence.getSharedInfo().id,{
					// username:currentenv.user.name,
					user:presence.getUserInfo(),
					data:"abcd"
				})
				first_time=1;
				}
			}
			network.onConnectionClosed(function(event){
				presence = null;
				document.getElementById("stop-button").click();
				
			});
			
			network.onDataReceived(onNetworkDataReceived);
			// network.onSharedActivityUserChanged(onNetworkUserChanged);
		});
	}
	
	var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
	palette.addEventListener('shared',shareActivity);
		
		  	

	});

});
