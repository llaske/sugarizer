define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n", "sugar-web/graphics/presencepalette", "tutorial", "picoModal", "activity/palettes/computerdifficultypalette", "activity/palettes/pawnpromotionpalette"], function (activity, env, icon, webL10n, presencepalette, tutorial, picoModal, computerdifficultypalette, pawnpromotionpalette) {

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
				document.getElementById("button6").title = webL10n.get("ComputerLevel");
				document.getElementById("computerlevelheader").innerHTML = webL10n.get("ComputerLevel");
				document.getElementById("restart-game").title = webL10n.get("RestartTitle");
				document.getElementById("option-stupid").innerHTML = webL10n.get("stupid");
				document.getElementById("option-middling").innerHTML = webL10n.get("middling");
				document.getElementById("option-default").innerHTML = webL10n.get("default");
				document.getElementById("option-slow").innerHTML = webL10n.get("slow");
				document.getElementById("option-slowest").innerHTML = webL10n.get("slowest");
				document.getElementById("button5").title = webL10n.get("PawnPromotesTo");
				document.getElementById("pawnpromotionheader").innerHTML = webL10n.get("PawnPromotesTo");
				document.getElementById("theme-changer").title = webL10n.get("ChangeChessboardTheme");
				document.getElementById("game-over").innerHTML = webL10n.get("Gameover");
				document.getElementById("play-again").innerHTML = webL10n.get("PlayAgain");
			});

			document.getElementById("canvas").style.backgroundColor = currentenv.user.colorvalue.fill;
			var table_head = document.getElementsByClassName("board_table_head")[0];
			var table_body = document.getElementsByClassName("board_table_body")[0];
			for(var i=0;i<8;i++)
			{
				table_head.rows[0].cells[i+1].style.color = "rgb(240, 217, 181)";
				table_body.rows[i].cells[0].style.color = "rgb(240, 217, 181)";
			}

			//to keep track of connected users when activity is shared
			//key - networkId
			//value - name
			var connectedUsers = {};

			document.getElementById("play-again").addEventListener('click', function(){
				game.start = 0;
				game.draw_offers = 0;
				game.board_state = p4_new_game();
				document.getElementsByClassName("p4wn-log")[0].innerHTML = "";
				document.getElementById("myModal").style.display = "none";
				game.refresh();
			});

			//to keep track of theme no
			var theme_no = 1;
			function theme_change(theme_no){
				var white_square = document.getElementsByClassName("p4wn-white-square");
				var black_square = document.getElementsByClassName("p4wn-black-square");
				switch (theme_no) {
					case 1:{
						for(var i=0;i<32;i++){
							white_square[i].style.backgroundColor = "#F0D9B5";
							black_square[i].style.backgroundColor = "#B58863";
						}
						break;
					}
					case 2:{
						for(var i=0;i<32;i++){
							white_square[i].style.backgroundColor = "#EEEED2";
							black_square[i].style.backgroundColor = "#769656";
						}
						break;
					}
					case 3:{
						for(var i=0;i<32;i++){
							white_square[i].style.backgroundColor = "grey";
							black_square[i].style.backgroundColor = "white";
						}
						break;
					}
					case 4:{
						for(var i=0;i<32;i++){
							white_square[i].style.backgroundColor = "#6F82BA";
							black_square[i].style.backgroundColor = "white";
						}
						break;
					}
				}
			}

			//theme button
			document.getElementById("theme-changer").addEventListener('click', function(){
				theme_no++;
				if(theme_no >= 5)
					theme_no = 1;
				theme_change(theme_no);
			});
			
			//Computer Level palette
			var computerlevelpalette = new computerdifficultypalette.DifficultyPalette(document.getElementById("button6"));
			computerlevelpalette.addEventListener('difficulty', function(event){
				game.computer_level = event.option;
			});
			//Pawn promotion palette
			var promotionpalette = new pawnpromotionpalette.Promotionpalette(document.getElementById("button5"));
			promotionpalette.addEventListener('pawnpromotion', function(event){
				game.pawn_becomes = event.option;
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

			//function to generate xo with given colorvalue
			var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
			var generateXOLogoWithColor = function(color) {
				var coloredLogo = xoLogo;
				coloredLogo = coloredLogo.replace("#010101", color.stroke)
				coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
				return "data:image/svg+xml;base64," + btoa(coloredLogo);
			}

			//function to change icon and name of users in opponent box
			game.opponent_box =function(){
			var playerOneIcon_div = document.getElementsByClassName("playerOneIcon")[0];
			var playerOneName_div = document.getElementsByClassName("playerOneName")[0];
			var playerTwoIcon_div = document.getElementsByClassName("playerTwoIcon")[0];
			var playerTwoName_div = document.getElementsByClassName("playerTwoName")[0];
			if(game.players[0] == "human"){
				playerOneIcon_div.innerHTML = "<img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'>";
				playerOneName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ currentenv.user.name + "</h3>";
			}
			if(game.players[0] == "computer"){
				playerOneIcon_div.innerHTML = "<img src='icons/black-computer.svg'>";
				playerOneName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ "Computer" + "</h3>";
			}
			playerOneIcon_div.firstChild.style.height = playerOneIcon_div.style.height;
			playerOneIcon_div.firstChild.style.marginLeft = "5px";
			if(game.players[1] == "human"){
				playerTwoIcon_div.innerHTML = "<img src='" + generateXOLogoWithColor(currentenv.user.colorvalue) + "'>";
				playerTwoName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ currentenv.user.name + "</h3>";
			}
			if(game.players[1] == "computer"){
				playerTwoIcon_div.innerHTML = "<img src='icons/black-computer.svg'>";
				playerTwoName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ "Computer" + "</h3>";
			}

			playerTwoIcon_div.firstChild.style.height = playerTwoIcon_div.style.height;
			playerTwoIcon_div.firstChild.style.marginLeft = "5px";
			}
			game.opponent_box();


			function opponent_box_for_presence(playerone, playertwo){
				var playerOneIcon_div = document.getElementsByClassName("playerOneIcon")[0];
				var playerOneName_div = document.getElementsByClassName("playerOneName")[0];
				var playerTwoIcon_div = document.getElementsByClassName("playerTwoIcon")[0];
				var playerTwoName_div = document.getElementsByClassName("playerTwoName")[0];
				playerOneIcon_div.innerHTML = "<img src='" + generateXOLogoWithColor(playerone.colorvalue) + "'>";
				playerOneName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ playerone.name + "</h3>";
				playerOneIcon_div.firstChild.style.height = playerOneIcon_div.style.height;
				playerOneIcon_div.firstChild.style.marginLeft = "5px";
				playerTwoIcon_div.innerHTML = "<img src='" + generateXOLogoWithColor(playertwo.colorvalue) + "'>";
				playerTwoName_div.innerHTML = "<h3 style='text-align: center;margin-top:6px;color:rgb(240, 217, 181);'>" 
											+ playertwo.name + "</h3>";
				playerTwoIcon_div.firstChild.style.height = playerTwoIcon_div.style.height;
				playerTwoIcon_div.firstChild.style.marginLeft = "5px";
			}

			//Restart game
			document.getElementById("restart-game").addEventListener('click', function(){
				var cancel_button_title = webL10n.get("CancelChanges");
        		var continue_button_title = webL10n.get("Continue");
				var warning_title = webL10n.get("Warning");
				var warning_content = webL10n.get("RestartWarningContent");
				picoModal({
                    content:"<div style = 'width:400px;margin-bottom:60px'>" +
                        "<div style='width:50px;float:left'><img src='icons/emblem-warning.svg' style='padding:10px;height:40px;'></div>" +
                        "<div style='width:300px;float:left;margin-left:20px;'>" +
                        "<div style='color:white;margin-top:10px;'><b>" + warning_title + "</b></div>" +
                        "<div style='color:white;margin-top:2px;'>" + warning_content + "</div>" +
                        "</div>" +
                        "</div>" +
                        "<div>" +
                        "<button class='cancel-changes warningbox-cancel-button'><img  src='icons/dialog-cancel.svg' style='width: 20px; height: 16px;margin-right:5px;'> " + cancel_button_title + "</button> " +
                        "<button class='continue warningbox-refresh-button'><img src='icons/dialog-ok.svg' style='width: 20px; height: 16px;margin-right:5px;'> "+ continue_button_title + "</button>" +
                        "</div>",
                    closeButton: false,
                    modalStyles: {
                            backgroundColor: "#000000",
                            height: "120px",
                            width: "60%",
                            textColor: "white"
                        },
                }).afterCreate(function(modal) {
                    modal.modalElem().addEventListener("click", function(evt) {
                        if (evt.target && evt.target.matches(".continue")) {
							game.start = 0;
							game.draw_offers = 0;
							game.board_state = p4_new_game();
							document.getElementsByClassName("p4wn-log")[0].innerHTML = "";
							game.refresh();
                            modal.close();
                        } else if (evt.target && evt.target.matches(".cancel-changes")) {
                            modal.close();
                        }
                    });
                }).show();
			});

			//'update' action when undo button is pressed(for presence)
			document.getElementById("button4").addEventListener('click', function(){
				update_presence(connectedUsers, second_player);
			});

			//'update' action when draw button is pressed(for presence)
			document.getElementById("button7").addEventListener('click', function(){
				update_presence(connectedUsers, second_player);
			});

			//function to set background color
			function set_box_color(s,e){
				document.getElementsByClassName("box" + s)[0].style.background = "#0F52BA";
				document.getElementsByClassName("box" + e)[0].style.backgroundColor = "#6495ED";
			}

			//check if particular move creates 'check'
			function move_creates_check(s,e,colour){
				var move_will_check = false;
				if(game["board_state"].pieces != undefined){
					var changes = p4_make_move(game["board_state"], ((game.orientation == undefined) || (game.orientation == 0))?s:(119-s), ((game.orientation == undefined) || (game.orientation == 0))?e:(119-e), game.pawn_becomes);
					if (p4_check_check(game["board_state"], colour)){
						move_will_check = true;
					}
					p4_unmake_move(game["board_state"], changes);
				}
				if(!move_will_check){
					set_box_color(s,e);
				}
			}

			var piece_not_picked = true;

			//function to highlight moves
			function highlight_possible_move(s){

				var board = game["board_state"]["board"];
				var box_value = board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s)];
				var colour = null;
				if([2,4,6,8,10,12].indexOf(box_value) > -1){
					colour = 0;
				}
				if([3,5,7,9,11,13].indexOf(box_value) > -1){
					colour = 1;
				}
				var mover = game.board_state.to_play;

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
				if(piece_not_picked && (game["board_state"].to_play == colour)){
					var pieces = null;
					var dir = (10 - 20 * colour);
					dir = ((game.orientation == undefined) || (game.orientation == 0))?dir:(-dir);
					var e,E;
					var other_colour = 1 - colour;
					var ep=game["board_state"].enpassant;
					var castle_flags = (game["board_state"].castles >> (colour * 2)) & 3;
					if(game["board_state"].pieces !== undefined)
						pieces = game["board_state"].pieces[colour];
					else
						pieces = 0;
					var check = false;
					if(p4_check_check(game["board_state"], colour)){
						check = true;
					}
					
					//pawn
					if((box_value == 2) || (box_value == 3)){
						e =s + dir;
						var board_e_conditon = ((game.orientation == undefined) || (game.orientation == 0))? board[e]:board[119-e];
						if(!board_e_conditon){
							move_creates_check(s,e,colour);
								

							var e2 = e + dir;
							if(s * (120 - s) < 3200 && (!board[((game.orientation == undefined) || (game.orientation == 0))?e2:(119-e2)])){
								move_creates_check(s,e2,colour);
							}
						}

						/* +/-1 for pawn capturing */
						e = e-1;
						E = ((game.orientation == undefined) || (game.orientation == 0))? board[e] : board[119-e];
						if(E && (E & 17) == other_colour){
							move_creates_check(s,e,colour);
						}
						e = e+2;
						E = ((game.orientation == undefined) || (game.orientation == 0))? board[e]:board[119-e] ;
						if(E && (E & 17) == other_colour){
							move_creates_check(s,e,colour);
						}
					}
					else if(colour != null && pieces!=null){
						var a = box_value & 14;
						var moves = P4_MOVES[a];
						if(a & 2){
							for(i = 0; i < 8; i++){
								e = s + moves[i];
								E = board[((game.orientation == undefined) || (game.orientation == 0))?e:(119-e)];
								if(!E || ((E&17)==other_colour)){
									move_creates_check(s,e,colour);
								}
							}
							if(a == P4_KING && castle_flags){
								if((castle_flags & 1) &&
									(board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) - 1] + 
									board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) - 2] +
									board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) - 3] == 0) &&
									p4_check_castling(board, ((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) - 2, other_colour, dir, -1)){//Q side
									move_creates_check(s,(s-2),colour);
								}
								if((castle_flags & 2) && (board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) + 1] +
								 	board[((game.orientation == undefined) || (game.orientation == 0))?s:(119-s) + 2] == 0) &&
									p4_check_castling(board, ((game.orientation == undefined) || (game.orientation == 0))?s:(119-s), other_colour, dir, 1)){//K side
									move_creates_check(s,(s+2),colour);
								}
							}
						}
						else{//rook, bishop, queen
							var mlen = moves.length;
							for(i=0;i<mlen;){
								var m = moves[i++];
								e=s;
								do {
									e+=m;
									E=board[((game.orientation == undefined) || (game.orientation == 0))?e:(119-e)];
									if(!E || ((E&17)==other_colour)){
										move_creates_check(s,e,colour);
									}
								}while(!E);
							}
						}
					}
			
				}
			}

			//adding mouseover and mouseout events to all boxes
			for (var y = 9; y > 1; y--){
				for(var x = 1;  x < 9; x++){
					var i = y * 10 + x;
					var timerId = 0;
					document.getElementsByClassName("box" + i)[0].addEventListener("mouseover", function(event){
						var self = this;
						timerId =  setInterval(function(){
						highlight_possible_move(parseInt(self.className.split('x')[1]));
						},10);
					});
					document.getElementsByClassName("box" + i)[0].addEventListener("mouseout", function(event){
						clearInterval(timerId);
						theme_change(theme_no);
					});
				}
			}

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
						
						if(game.pawn_becomes == 0){
							document.getElementById("button5").style.backgroundImage = "url('images/white_queen.png')";
							document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_queen.png')";
						}
						else if(game.pawn_becomes == 1){
							document.getElementById("button5").style.backgroundImage = "url('images/white_rook.png')";
							document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_rook.png')";
						}
						else if(game.pawn_becomes == 2){
							document.getElementById("button5").style.backgroundImage = "url('images/white_knight.png')";
							document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_knight.png')";
						}
						else if(game.pawn_becomes == 3){
							document.getElementById("button5").style.backgroundImage = "url('images/white_bishop.png')";
							document.getElementsByClassName("palette-invoker")[2].style.backgroundImage = "url('images/white_bishop.png')";
						}
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
							game.orientation = 0;
							game.refresh();
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
			
			function update_presence(connectedUsers, second_player){
				if (presence) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action:'update',
							data: game,
							log_div_html: document.getElementsByClassName("p4wn-log")[0].innerHTML,
							users_connected: connectedUsers,
							second_user:second_player
						}
					});
				}
			}

			//called when any user join/leave
			var onNetworkUserChanged = function(msg) {
				game.players[1] = "human";
				game.players[1] = "human";
				game.refresh_buttons();

				if (isHost) {
					var log_div = document.getElementsByClassName("p4wn-log")[0];
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'init',
							data: game,
							log_div_html: log_div.innerHTML,
							users_connected: connectedUsers,
							second_user:second_player
						}
					});
				}
				else if(msg.content!=undefined){
					connectedUsers = msg.content.users_connected;
					connectedUsers[currentenv.user.networkId] = currentenv.user.name;
					second_player = msg.content.second_user;
					if(Object.keys(connectedUsers).length == 2){
						second_player = currentenv.user.networkId;
						update_presence(connectedUsers, second_player);	
					}
				}

				if(msg.move == 1){
					connectedUsers[msg.user.networkId] = msg.user.name;
				}

				//if user left was playing with host
				if(msg.move == -1 && (second_player == msg.user.networkId)){
					var connectedUsers_keys = Object.keys(connectedUsers);
					var index = connectedUsers_keys.indexOf(second_player);
					second_player = connectedUsers_keys[index+1];
					delete connectedUsers[msg.user.networkId];
					update_presence(connectedUsers, second_player);
				}
				else if(msg.move == -1){
					//if host leaves then stop the activity for all
					if(Object.keys(connectedUsers)[0] == msg.user.networkId){
						document.getElementById("stop-button").click();
					}
					delete connectedUsers[msg.user.networkId];
				}

				//when all connected users left
				if(isHost && (Object.keys(connectedUsers).length == 1) && (msg.move == -1)){
					game.players[1] = "computer";
					document.getElementById("button1").disabled = false;
					document.getElementById("button2").disabled = false;
					document.getElementById("button6").disabled = false;
					document.getElementById("restart-game").disabled = false;
					document.getElementById("button5").disabled = false;
					document.getElementById("button4").disabled = false;
					document.getElementById("button7").disabled = false;
					game.opponent_box();
					game.refresh_buttons();

				}
				
				console.log("User "+msg.user.name+" "+(msg.move == 1 ? "join": "left"));

				document.getElementsByClassName("humane-libnotify")[0].style.display = "";
 				document.getElementsByClassName("humane-libnotify")[0].innerHTML = "<img height=20 src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>" + " " +msg.user.name + " " +(msg.move == 1 ? "joined": "left"); 
				
				//notification box for joining and leaving user
				 var notificationDiv = function(){
					document.getElementsByClassName("humane-libnotify")[0].style.display = "none";
				}
				setTimeout(notificationDiv, 1000);
				if (presence && (presence.getSharedInfo()!=undefined)) {
					update_presence(connectedUsers, second_player);
				}

				//function to update xo color of opponent for host
				if(isHost && Object.keys(connectedUsers)[1]){
					presence.listSharedActivityUsers(presence.getSharedInfo().id , function(users){
						for (var i = 0; i < users.length; i++) {
							if(users[i].networkId == Object.keys(connectedUsers)[1]){

								document.getElementsByClassName("playerTwoIcon")[0].firstChild.src = generateXOLogoWithColor(users[i].colorvalue);
								document.getElementsByClassName("playerTwoName")[0].firstChild.innerHTML = users[i].name;
								break;
							}
						}
					});
				}
			};

			var drag_on_box = null;
			var drag_piece_color = null;

			//function called when drag starts
			game.drag_start = function(e,position){};

			//function called when dragging occurs
			game.dragging = function(e,position){
				
				document.ondragover = function(e){
					var box = e.target;
					drag_on_box = box.parentNode.className.split('x')[1];
					if(drag_on_box){

						document.getElementsByClassName("box" + drag_on_box)[0].style.border = "1px ridge orange";
					}
				};
				document.ondragleave = function(e){
					var box = e.target;
					drag_on_box = box.parentNode.className.split('x')[1];
					if(drag_on_box){
						document.getElementsByClassName("box" + drag_on_box)[0].style.border = "";
					}
				}

			};

			//function when dragging stops
			game.drag_stop = function(e,pos){
				var board_arr = game.board_state.board;
				var drag_box_value = board_arr[((game.orientation == undefined) || (game.orientation == 0))? pos :(119- pos)];
				if([2,4,6,8,10,12].indexOf(drag_box_value) > -1){
					drag_piece_color = 0;
				}
				if([3,5,7,9,11,13].indexOf(drag_box_value) > -1){
					drag_piece_color = 1;
				}
				if((drag_on_box != undefined) && (drag_piece_color == game.board_state.to_play)){
					
					pos = parseInt(pos);
					drag_on_box = parseInt(drag_on_box);
					var result = game.move(((game.orientation == undefined) || (game.orientation == 0))? pos :(119- pos),
					((game.orientation == undefined) || (game.orientation == 0))? drag_on_box :(119- drag_on_box),
					P4WN_PROMOTION_INTS[game.pawn_becomes]);
					if(result == true){
						update_presence(connectedUsers, second_player);
					}
				}
			};

			//to check whether use will be a spectator or opponent
			var is_spectator = false;
			var second_player = null;

			var onNetworkDataReceived = function(msg) {
				if (presence.getUserInfo().networkId === msg.user.networkId) {
					return;
				}
				switch (msg.content.action) {
					case 'init':{
						connectedUsers = msg.content.users_connected;
						connectedUsers[currentenv.user.networkId] = currentenv.user.name;
						second_player = msg.content.second_user;
						game.players[0] = "human";
						game.players[1] = "human";
						document.getElementById("button1").disabled = true;
						document.getElementById("button2").disabled = true;
						computerlevelpalette.popDown();
						document.getElementById("button6").disabled = true;
						game.refresh_buttons();
						set_board(msg.content.data["board_state"]);
						document.getElementsByClassName("playerOneIcon")[0].firstChild.src = generateXOLogoWithColor(msg.user.colorvalue);
						document.getElementsByClassName("playerOneName")[0].firstChild.innerHTML = msg.user.name;
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						if(!isHost){
							game.rotate_board_for_black();
						}

						if(Object.keys(connectedUsers).length == 2){
							second_player = currentenv.user.networkId;
							document.getElementsByClassName("playerTwoIcon")[0].firstChild.src = generateXOLogoWithColor(currentenv.user.colorvalue);
							document.getElementsByClassName("playerTwoName")[0].firstChild.innerHTML = currentenv.user.name;
						}

						//SPECTATOR MODE
						if((Object.keys(connectedUsers).length > 2) && (is_spectator == false) && (second_player != currentenv.user.networkId)){

							is_spectator = true;
							document.getElementById("restart-game").disabled = true;
							promotionpalette.popDown();
							document.getElementById("button5").disabled = true;
							document.getElementById("button4").disabled = true;
							document.getElementById("button7").disabled = true;
							document.getElementsByClassName("p4wn-board")[0].style.pointerEvents = "none";
							presence.listSharedActivityUsers(presence.getSharedInfo().id , function(users){
								for (var i = 0; i < users.length; i++) {
									if(users[i].networkId == Object.keys(connectedUsers)[1]){
										document.getElementsByClassName("playerTwoIcon")[0].firstChild.src = generateXOLogoWithColor(users[i].colorvalue);
										document.getElementsByClassName("playerTwoName")[0].firstChild.innerHTML = users[i].name;
										break;
									}
								}
							});

							break;
						}
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("button7").style.display = 'inline-block';
						break;
					}
					case 'update':{
						connectedUsers = msg.content.users_connected;
						connectedUsers[currentenv.user.networkId] = currentenv.user.name;
						second_player = msg.content.second_user;
						document.getElementById("restart-game").disabled = false;
						document.getElementById("button5").disabled = false;
						document.getElementById("button4").disabled = false;
						document.getElementById("button7").disabled = false;
						document.getElementsByClassName("p4wn-board")[0].style.pointerEvents = "auto";
						set_board(msg.content.data["board_state"]);
						document.getElementsByClassName("p4wn-log")[0].innerHTML = msg.content.log_div_html;
						if((Object.keys(connectedUsers).length == 2) && (isHost!=true)){
							second_player = currentenv.user.networkId;

						}

						presence.listSharedActivityUsers(presence.getSharedInfo().id , function(users){
							for (var i = 0; i < users.length; i++) {
								if(users[i].networkId == Object.keys(connectedUsers)[1]){
									document.getElementsByClassName("playerTwoIcon")[0].firstChild.src = generateXOLogoWithColor(users[i].colorvalue);
									document.getElementsByClassName("playerTwoName")[0].firstChild.innerHTML = users[i].name;
									break;
								}
							}
						});

						//SPECTATOR MODE
						if(is_spectator && (second_player != currentenv.user.networkId)){
							document.getElementById("restart-game").disabled = true;
							promotionpalette.popDown();
							document.getElementById("button5").disabled = true;
							document.getElementById("button4").disabled = true;
							document.getElementById("button7").disabled = true;
							document.getElementsByClassName("p4wn-board")[0].style.pointerEvents = "none";
							break;
						}
						game["draw_offers"] = parseInt(msg.content.data.draw_offers);
						if(game["draw_offers"] == 1)
							document.getElementById("button7").style.display = 'inline-block';
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
				console.log("Shared instance");
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
