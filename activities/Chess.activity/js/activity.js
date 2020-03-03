define(["sugar-web/activity/activity","sugar-web/env","sugar-web/graphics/presencepalette","sugar-web/graphics/icon"], function (activity,env,presencepalette,icon) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();


		var isHost = false;
		var board = null
		pos='start'
		var game = new Chess()
		var $status = $('#status')
		var $fen = $('#fen')
		var $pgn = $('#pgn')


		
  
  
		
		// Welcome user
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			
	

		
		// Shared instances
		if (environment.sharedId) {
			console.log("Shared instance");
			presence = activity.getPresenceObject(function(error, network) {
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		
		}





		
		
		

	
	
	
	
	
		

		// Load from datastore
		if (!environment.objectId) {
			console.log("New instance");
		} else {
			activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
				console.log(data.configuration);
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
		console.log("Want to share");
		presence = activity.getPresenceObject(function(error, network) {
			network.onDataReceived(onNetworkDataReceived);
			
			
			if (error) {
				console.log("Sharing error");
				return;
			}
			network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
				console.log("Activity shared");
				isHost = true;
			});

			
			
			network.onSharedActivityUserChanged(onNetworkUserChanged);
			
		});
		

	});
	

	
	var onNetworkDataReceived = function(msg) {
		
		console.log("hi");
		if (presence.getUserInfo().networkId === msg.user.networkId) {
			
			return;
		}
		// if(msg.stop){
		// 	document.getElementById("stop-button").click();
		// }
		console.log(msg.content.alignment)
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
	
	}; 




	var onNetworkUserChanged = function(msg) {
		console.log("hello");

		
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
		Update();
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
		
		onSnapEnd: onSnapEnd
	  }
	  board = Chessboard('myBoard', config)
	  
	  updateStatus()

	  var Update=function(){
		var jsonData = {
			'configuration':game.fen(),
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
	  


	  




	  	document.getElementById("swap-button").addEventListener('click',function (event){
			  if(presence)
			  {
				  game=new Chess();
			  }
		  })




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


		

		
			
	
		
			
	
		
		


		});



});
