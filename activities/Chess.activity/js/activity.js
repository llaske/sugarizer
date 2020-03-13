define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial"], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		env.getEnvironment(function(err, environment) {
			var presence = null;
			var pawns = [];
			var isHost = false;
			var networkButton = document.getElementById("network-button");
			var difficulty=1;
			// var presencepalette = new presencepalette.PresencePalette(networkButton,undefined);
			// presencepalette.addEventListener('shared',shareActivity);
			var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			document.getElementsByClassName("p4wn-log").innerHTML="Game logs";
			palette.addEventListener('shared',shareActivity);
			currentenv = environment;
			console.log(currentenv.user.colorvalue);
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			document.getElementById("PlayerOne").innerHTML=environment.user.name.toUpperCase();
			document.getElementById("Versus").innerHTML=" vs ";
			document.getElementById("PlayerTwo").innerHTML="COMPUTER";
			document.getElementById("canvas").style.backgroundColor=environment.user.colorvalue.fill;
			P4WN_LEVELS[0] = webL10n.get("stupid");
			P4WN_LEVELS[1] = webL10n.get("middling");
			P4WN_LEVELS[2] = webL10n.get("default");
			P4WN_LEVELS[3] = webL10n.get("slow");
			P4WN_LEVELS[4] = webL10n.get("slowest");
			button5_title = webL10n.get("PawnPromotesTo");
			button6_title = webL10n.get("ComputerLevel");
			
			var set_board = function(data_obj){
				for(var key in data_obj)
					{
						if(typeof(data_obj[key]) != "object")
							game["board_state"][key] = data_obj[key];
					}
					for(var i=0;i<120;i++)
					{
						game["board_state"]["board"][i] = data_obj["board"][i];
					}
					game.refresh();
					for(var index in data_obj["history"])
					{
						var len = data_obj["history"][index].length;
						if(game["board_state"]["history"][index] == undefined)
							game["board_state"]["history"].push(data_obj["history"][index]);
						else
							game["board_state"]["history"][index] = data_obj["history"][index];
					}
					game["board_state"]["pieces"] = data_obj["pieces"];
					for(var key in data_obj["position_counts"])
					{
						game["board_state"]["position_counts"][key] = data_obj["position_counts"][key];
					}
					game["board_state"]["stalemate_scores"] = data_obj["stalemate_scores"];
					game["board_state"]["best_pieces"] = data_obj["best_pieces"];
					game["board_state"]["values"] = data_obj["values"];
			}
				
			if (!environment.objectId) {
				

			} else {
				console.log("Existing instance");
				var load_fen="rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - ";
				var recieved_fen="";
				activity.getDatastoreObject().loadAsText(function(error, metadata, data){
					if (error==null && data!=null){
						recieved_fen = JSON.parse(data);
						game.record_values(
							recieved_fen[0],
							recieved_fen[1],
							parseInt(recieved_fen[2]),
							parseInt(recieved_fen[3]),
							parseInt(recieved_fen[4])
						);
						set_board(recieved_fen[5]);
						if(game["draw_offers"] == 1)
							document.getElementById("toolbut7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = recieved_fen[6];
						
						
					}
				});
			}

			// user join from shared instance
			if(environment.sharedId){
				console.log("shared instance",game);
				presence = activity.getPresenceObject(function(error,network){
					if (error){
						console.log("error in p");
						return;
					}
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
			function shareActivity() {
				palette.popDown();
				console.log("Want to share");
				game.players[0] = "human";
				game.players[1] = "human";
				document.getElementById("toolbut1").disabled = true;
				document.getElementById("toolbut2").disabled = true;
				document.getElementById("toolbut3").disabled = true;
				game.refresh_buttons();
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
					network.onConnectionClosed(function(event){
						presence = null;
						document.getElementById("stop-button").click();
						
					});
					
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}

			var onNetworkUserChanged = function(msg){
				if (isHost) {
					var log_div = document.getElementsByClassName("p4wn-log")[0]
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'init',
							data: game,
							log_div_html : log_div.innerHTML
						}
					});
				}
				window.alert("User "+msg.user.name+" "+(msg.move == 1 ? "join": "left"));
			};
			
			game.tapped = function(square){
				var board = game.board_state.board;
				var mover = game.board_state.to_play;
				var piece = board[square];
				//condition to make sure player doesn't make move of other in presence 
				if(presence != null)
				{
					if(mover == 0)
					{
						if(isHost){}
						else
							return;
					}
					else
					{
						if(isHost == false){}
						else
							return;
					}
				}
				if (game.start == square){
					//clicked back on previously chosen piece -- putting it down again
					game.stop_moving_piece();
				}
				else if (piece && (mover == (piece & 1))){
					//clicked on player's colour, so it becomes start
					game.start_moving_piece(square);
				}
				else if (game.move(game.start, square, P4WN_PROMOTION_INTS[game.pawn_becomes])){
					/*If the move works, drop the piece.*/
					game.stop_moving_piece(square);
					if (presence) {
						presence.sendMessage(presence.getSharedInfo().id, {
							user: presence.getUserInfo(),
							content: {
								action:'update',
								data: game,
								log_div_html: document.getElementsByClassName("p4wn-log")[0].innerHTML,
							}
						});
					}
				}
			}
			var onNetworkDataReceived = function(msg){
				if (presence.getUserInfo().networkId === msg.user.networkId) {
					console.log("ret");
					return;
				}
				switch(msg.content.action){
					case 'init':
						console.log("init case #204");
						game.players[0] = "human";
						game.players[1] = "human";
						document.getElementById("toolbut1").disabled = true;
						document.getElementById("toolbut2").disabled = true;
						document.getElementById("toolbut6").disabled = true;
						game.refresh_buttons();
						set_board(msg.content.data["board_state"]);
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("toolbut7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						game.board_bl_rotation();
						break;
	
					case 'update':{
						console.log("update case #220");
						set_board(msg.content.data["board_state"]);
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("toolbut7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						break;
					}
					
			}
			document.getElementById("PlayerTwo").innerHTML=msg.user.name.toUpperCase();
			
			};	
		});
		
		
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});
		
		console.log("activity started");
		
		
		var guest_joined = function(a){
			did_guest_join=a;
		}
		var difficulty = 1;
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
		document.getElementById("fullscreen-button").addEventListener('click', function(event) {
			// document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
		  });
  
		  //Return to normal size
		  document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.opacity = 1;
			// document.getElementById("main-toolbar").style.display = "block";
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
		});

		document.getElementById("restart_button").addEventListener('click',function(event){
			window.location.reload(true);
			return false;
		});
		document.getElementById("stop-button").addEventListener('click',function (event) {
			console.log("stop clicked.");
			var stringifiedData = [];
			stringifiedData.push(game.players[0]);
			stringifiedData.push(game.players[1]);
			stringifiedData.push(game.pawn_becomes);
			stringifiedData.push(game.computer_level);
			stringifiedData.push(game.draw_offers);
			stringifiedData.push(game["board_state"]);
			var log_div = document.getElementsByClassName("p4wn-log")[0];
			stringifiedData.push(log_div.innerHTML);
			var jsonData = JSON.stringify(stringifiedData);
			console.log("stringified");
			
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
					// console.log("write done.");
				} else {
					console.log("write failed.");
					console.log("write failed.");
		}
	});
		})

		var translator=function(){
			document.getElementById("activity-button").title=webL10n.get("AB");
			document.getElementById("network-button").title=webL10n.get("NB");
			document.getElementById("stop-button").title=webL10n.get("STB");
			document.getElementById("help-button").title=webL10n.get("HB");
			
			document.getElementById("title").value=webL10n.get("TITLE");
			document.getElementById("fullscreen-button").title=webL10n.get("FB");
			document.getElementById("unfullscreen-button").title=webL10n.get("UFB");
			document.getElementById("toolbut1").title=webL10n.get("WhitePlayer");
			document.getElementById("toolbut2").title=webL10n.get("BlackPlayer");
			document.getElementById("toolbut3").title=webL10n.get("Swap");
			document.getElementById("toolbut4").title=webL10n.get("UFB");
			document.getElementById("restart-button").title=webL10n.get("Restart");
		};
	});
});