define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n", "sugar-web/graphics/presencepalette", "tutorial"], function (activity, env, icon, webL10n, presencepalette, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			
			// Set current language to Sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ?
			 chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			window.addEventListener("localized", function() {
				document.getElementById("button1").title = webL10n.get("WhitePlayer");
				document.getElementById("button2").title = webL10n.get("BlackPlayer");
				document.getElementById("button3").title = webL10n.get("Swap");
				document.getElementById("button4").title = webL10n.get("Undo");
				P4WN_LEVELS[0] = webL10n.get("stupid");
				P4WN_LEVELS[1] = webL10n.get("middling");
				P4WN_LEVELS[2] = webL10n.get("default");
				P4WN_LEVELS[3] = webL10n.get("slow");
				P4WN_LEVELS[4] = webL10n.get("slowest");
				button5_title = webL10n.get("PawnPromotesTo");
				button6_title = webL10n.get("ComputerLevel");
			});

			// Full screen
			document.getElementById("fullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 0;
				document.getElementById("canvas").style.top = "0px";
				document.getElementById("unfullscreen-button").style.visibility = "visible";
			});
			// Unfull screen
			document.getElementById("unfullscreen-button").addEventListener('click', function() {
				document.getElementById("main-toolbar").style.opacity = 1;
				document.getElementById("canvas").style.top = "55px";
				document.getElementById("unfullscreen-button").style.visibility = "hidden";
			});

			// Launch tutorial
			document.getElementById("help-button").addEventListener('click', function(e) {
				tutorial.start();
			});

			//'update' action when undo button is pressed(for presence)
			document.getElementById("button4").addEventListener('click', function(){
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
			});

			//'update' action when draw button is pressed(for presence)
			document.getElementById("button7").addEventListener('click', function(){
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
			});

			//function to set board from datastore data
			//also for setting board during multiplayer
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

			// Link presence palette
			var presence = null;
			var isHost = false;
			var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			palette.addEventListener('shared', function() {
				palette.popDown();
				console.log("Want to share");
				game.players[0] = "human";
				game.players[1] = "human";
				document.getElementById("button1").disabled = true;
				document.getElementById("button2").disabled = true;
				document.getElementById("button6").disabled = true;
				game.refresh_buttons();
				
				presence = activity.getPresenceObject(function(error, network) {
					if (error) {
						console.log("Sharing error");
						return;
					}
					network.createSharedActivity('org.sugarlabs.Chess', function(groupId) {
							console.log("Activity shared");
							isHost = true;
					});
					network.onConnectionClosed(function (event) {
						presence=null;
						document.getElementById("stop-button").click();
					});
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			});
			
			var onNetworkUserChanged = function(msg) {
				if (isHost) {
					var log_div = document.getElementsByClassName("p4wn-log")[0];
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'init',
							data: game,
							log_div_html: log_div.innerHTML
						}
					});
				}
				console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "left"));
				document.getElementsByClassName("humane-libnotify")[0].style.display = "";
 				document.getElementsByClassName("humane-libnotify")[0].innerHTML = msg.user.name + " " +(msg.move == 1 ? "joined": "left"); 
				var notificationDiv = function(){
					document.getElementsByClassName("humane-libnotify")[0].style.display = "none";
				}
				setTimeout(notificationDiv, 1000);
			};

			//function to control movement of chess pieces
			game.square_clicked = function(square){
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

			var onNetworkDataReceived = function(msg) {
				if (presence.getUserInfo().networkId === msg.user.networkId) {
					return;
				}
				switch (msg.content.action) {
					case 'init':{
						console.log("inside init");
						game.players[0] = "human";
						game.players[1] = "human";
						document.getElementById("button1").disabled = true;
						document.getElementById("button2").disabled = true;
						document.getElementById("button6").disabled = true;
						game.refresh_buttons();
						set_board(msg.content.data["board_state"]);
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("button7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						game.rotate_board_for_black();
						break;
					}
					case 'update':{
						console.log("inside update");
						set_board(msg.content.data["board_state"]);
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("button7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						break;
					}
				}
			}; 
			

			// Load from datastore
			if (!environment.objectId) {} 
			else {
				activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
					if (error==null && data!=null) {
						var datastore_data = JSON.parse(data);
						game.set_data(
							datastore_data[0],
							datastore_data[1],
							parseInt(datastore_data[2]),
							parseInt(datastore_data[3]),
							parseInt(datastore_data[4])
						);
						set_board(datastore_data[5]);
						if(game["draw_offers"] == 1)
							document.getElementById("button7").style.display = 'inline-block';
						document.getElementsByClassName("p4wn-log")[0].innerHTML = datastore_data[6];
					}
				});
			}
			// Shared instances
			if (environment.sharedId) {
				console.log("Shared instance", game);
				presence = activity.getPresenceObject(function(error, network) {
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}

		});

		//save data in journal on pressing stop button
		document.getElementById("stop-button").addEventListener("click", function(){
			var data = [];
			data.push(game.players[0]);
			data.push(game.players[1]);
			data.push(game.pawn_becomes);
			data.push(game.computer_level);
			data.push(game.draw_offers);
			data.push(game["board_state"]);
			var log_div = document.getElementsByClassName("p4wn-log")[0];
			data.push(log_div.innerHTML);
			var jsonData = JSON.stringify(data);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {}); 
		});

	});

});
