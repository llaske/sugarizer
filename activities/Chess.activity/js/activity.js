define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette", "webL10n", "tutorial"], function (activity,env, icon, webL10n, presencepalette, webL10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!',"engine","display"], function (doc,engine,display) {

		// Initialize the activity.
		activity.setup();
		var presence = null;
		var pawns = [];
		var isHost = false;
		var did_guest_join=0;
		var x1=[];
		var x2=[];
		var a=0;
		var b=0;
		// var p = sendtoactivity();
		// console
		var networkButton = document.getElementById("network-button");
		// var presencepalette = new presencepalette.PresencePalette(networkButton,undefined);
		// presencepalette.addEventListener('shared',shareActivity);
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
		palette.addEventListener('shared',shareActivity);
		// if(window.top.sugar.environment.sharedId){
		// 	shareActivity();
		// 	palette.setShared(true);
		// }


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
		// 			var first_time=0;
		// 				console.log("outif");
		// 				if (presence){console.log("inif1");
		// 				if(first_time==0){console.log("inif2");
		// 				presence.sendMessage(presence.getSharedInfo().id,{
		// 					// username:currentenv.user.name,
		// 					user:presence.getUserInfo(),
		// 					data:"abcd"
		// 				})
		// 				first_time=1;
		// 			}
					

		// 		}
		// 		});
				
		// 		network.onDataReceived(onNetworkDataReceived);
		// 	});
		// });
		// Launch tutorial
		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		document.getElementById("addd").addEventListener('click',function(event){
			if(presence){
				presence.sendMessage(presence.getSharedInfo().id,{
					user:presence.getUserInfo(),
					content:"datasent"
				});
			}
		});

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
		var move_maker;
		// var load_fenaa;
		var onNetworkDataReceived = function(msg){
			var load_fena;
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				console.log("ret");
				return;
			}
			if (msg.stop){
				document.getElementById("stop-button").click();
			}
			console.log(msg.content);
			console.log("received something");
			console.log(msg.user.name);
			console.log("koined");
			switch(msg.content.action){
				case 'init':
					document.getElementById("make-move").style.display="block";
					
					document.getElementById("board-goes-here").style.display="none";
					var ed2=document.getElementById("board-goes-here2");
					var load_fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 1";
					console.log(msg.content.data);
					var sharing=1;
					move_maker=msg.content.make_move_clicked;
					// x1.push(p4wnify(ed2,true,load_fen,sharing))
					
					// var x1_len=x1.length();
					// x1[x1.length-1];
					p4wnify(ed2,true,load_fen,sharing);
					var tgg = returnfenarray();
					console.log("from fen arraygg");
					console.log(tgg);
					console.log(tgg[tgg.length-1]);
					var fen_string = tgg[tgg.length-1];
					console.log(fen_string);
					// p4wnify(ed2);
				case 'move_made_by_host':
					// if(a%2==0){
					// 	console.log("ait1");
					// 	document.getElementById("board-goes-here2").style.display="block";
					// 	var ed2=document.getElementById("board-goes-here2");
					// 	document.getElementById("board-goes-here4").style.display="none";
					// 	document.getElementById("board-goes-here3").style.display="none";
					// 	a=a+1;
					// }else{
					// 	console.log("ait2");
					// 	var ed2=document.getElementById("board-goes-here5").style.display="block";
					// 	var ed2=document.getElementById("board-goes-here5");
					// 	document.getElementById("board-goes-here2").style.display="none";
					// 	a=a+1;
					// }
					if(a%2==0){
						console.log("ait1");
						document.getElementById("board-goes-here2")="";
						document.getElementById("board-goes-here2").style.display="block";
						var ed2=document.getElementById("board-goes-here2");
						document.getElementById("board-goes-here4").style.display="none";
						document.getElementById("board-goes-here3").style.display="none";
						document.getElementById("board-goes-here5").style.display="none";
						a=a+1;
					}else{
						console.log("ait2");
						var ed2=document.getElementById("board-goes-here5").innerHTML="";
						var ed2=document.getElementById("board-goes-here5").style.display="block";
						var ed2=document.getElementById("board-goes-here5");
						document.getElementById("board-goes-here2").style.display="none";
						document.getElementById("board-goes-here4").style.display="none";
						document.getElementById("board-goes-here3").style.display="none";
						a=a+1;
					}
					// var ed2=document.getElementById("board-goes-here2");
					document.getElementById("board-goes-here").style.display="none";
					// if(document.getElementById("board-goes-here2").style.display=="none"){
					// 	ed2 = document.getElementById("board-goes-here2");
					// 	document.getElementById("board-goes-here3").style.display="none";
					// }else{
					// 	ed2 = document.getElementById("board-goes-here3");
					// 	document.getElementById("board-goes-here2").style.display="none";
					// document.getElementById("board-goes-here3").style.display="none";
					// }
					load_fena=msg.content.move;
					console.log(msg.content.move);
					move_maker=msg.content.make_move_clicked;
					console.log("checking");
					console.log(load_fena);
					console.log("load fen working");
					var splitted_load_fena_by_space = msg.content.move.split(' ');
					var splitted_load_fena_by_space_firpos = splitted_load_fena_by_space[0];
					var splitted_load_fena = splitted_load_fena_by_space_firpos.split("/");
					var splitted_load_fena_0pos = splitted_load_fena[0];
					var splitted_load_fena_1pos = splitted_load_fena[1];
					var splitted_load_fena_2pos = splitted_load_fena[2];
					var splitted_load_fena_3pos = splitted_load_fena[3];
					var splitted_load_fena_4pos = splitted_load_fena[4];
					var splitted_load_fena_5pos = splitted_load_fena[5];
					var splitted_load_fena_6pos = splitted_load_fena[6];
					var splitted_load_fena_7pos = splitted_load_fena[7];
					var new_load_fena_concatenated="";
					var new_splitted_load_fena_0pos=splitted_load_fena_7pos.toLowerCase();
					var new_splitted_load_fena_1pos=splitted_load_fena_6pos.toLowerCase();
					var new_splitted_load_fena_2pos=splitted_load_fena_5pos.toLowerCase();
					var new_splitted_load_fena_3pos=splitted_load_fena_4pos.toLowerCase();
					var new_splitted_load_fena_4pos=splitted_load_fena_3pos.toUpperCase();
					var new_splitted_load_fena_5pos=splitted_load_fena_2pos.toUpperCase();
					var new_splitted_load_fena_6pos=splitted_load_fena_1pos.toUpperCase();
					var new_splitted_load_fena_7pos=splitted_load_fena_0pos.toUpperCase();
					new_load_fena_concatenated=new_splitted_load_fena_0pos.concat('/',new_splitted_load_fena_1pos,'/',new_splitted_load_fena_2pos,'/',new_splitted_load_fena_3pos,'/',new_splitted_load_fena_4pos,'/',new_splitted_load_fena_5pos,'/',new_splitted_load_fena_6pos,'/',new_splitted_load_fena_7pos);
					var final_load_fen;
					final_load_fen = new_load_fena_concatenated.concat(" ",splitted_load_fena_by_space[1]," ",splitted_load_fena_by_space[2]," ",splitted_load_fena_by_space[3]);
					
					console.log("new");
					console.log(final_load_fen);
					var splitted_fenstring = msg.content.move.split(' ');
					console.log("splitted");
					var splitted_fenstring_1pos = splitted_fenstring[0];
					var splitted_fenstring_2pos = splitted_fenstring[1];
					var splitted_fenstring_3pos = splitted_fenstring[2];
					var splitted_fenstring_4pos = splitted_fenstring[3];
					// console.log(splitted_fenstring[1]);
					if (splitted_fenstring[1]=='b'){
						splitted_fenstring_2pos = 'w';
					}else{
						splitted_fenstring_2pos = 'b'
					}
					console.log("after fen str supdate");
					console.log(splitted_fenstring_2pos);
					var updated_fenstring = "";
					// for (var io = 0;i<=3;i++){
				

			// } 
					updated_fenstring = splitted_fenstring_1pos.concat(" ",splitted_fenstring_2pos," ",splitted_fenstring_3pos," ",splitted_fenstring_4pos);
					console.log("final");
					console.log(updated_fenstring);			 

					// var load_fen_concat;
					// load_fen_concat=load_fen.concat(" 1 1");
					// var final_load_fen=load_fen_concat;
					// console.log(final_load_fen);
					// document.getElementById("board-goes-here2").style.display="none";
					var sharing=1;
					move_maker=msg.content.make_move_clicked;
					
					// x1.push(p4wnify(ed2,true,load_fen,sharing))
					
					// var x1_len=x1.length();
					// x1[x1.length-1];
					p4wnify(ed2,true,final_load_fen,sharing);
					
				
				case 'move_made_by_guest':
					// if(b%2==0){
					// 	console.log("bit1");
					// 	document.getElementById("board-goes-here4").style.display="block";
					// 	var ed2=document.getElementById("board-goes-here4");
					// 	document.getElementById("board-goes-here2").style.display="none";
					// 	document.getElementById("board-goes-here3").style.display="none";
					// 	b=b+1;
					// }else{
					// 	console.log("bit2");
					// 	document.getElementById("board-goes-here3").style.display="block";
					// 	var ed2=document.getElementById("board-goes-here3");
					// 	document.getElementById("board-goes-here4").style.display="none";
					// 	document.getElementById("board-goes-here5").style.display="none"
					// 	b=b+1;
					// }
					if(b%2==0){
						console.log("bit1");
						document.getElementById("board-goes-here4").innerHTML="";
						document.getElementById("board-goes-here4").style.display="block";
						var ed2=document.getElementById("board-goes-here4");
						document.getElementById("board-goes-here2").style.display="none";
						document.getElementById("board-goes-here3").style.display="none";
						document.getElementById("board-goes-here5").style.display="none";
						b=b+1;
					}else{
						console.log("bit2");
						var ed2=document.getElementById("board-goes-here3").innerHTML="";
						document.getElementById("board-goes-here3").style.display="block";
						var ed2=document.getElementById("board-goes-here3");
						document.getElementById("board-goes-here4").style.display="none";
						document.getElementById("board-goes-here5").style.display="none";
						document.getElementById("board-goes-here2").style.display="none";
						b=b+1;
					}
					// var ed2=document.getElementById("board-goes-here2");
					// if(document.getElementById("board-goes-here2").style.display=="none"){
					// 	ed2 = document.getElementById("board-goes-here4");
					// 	document.getElementById("board-goes-here5").style.display="none";
					// }else{
					// 	ed2 = document.getElementById("board-goes-here5");
					// 	document.getElementById("board-goes-here4").style.display="none";
					// }
					document.getElementById("board-goes-here").style.display="none";
					load_fena=msg.content.move;
					console.log(msg.content.move);
					move_maker=msg.content.make_move_clicked;
					console.log("checking");
					console.log(load_fena);
					console.log("load fen working");
					var splitted_load_fena_by_space = msg.content.move.split(' ');
					var splitted_load_fena_by_space_firpos = splitted_load_fena_by_space[0];
					var splitted_load_fena = splitted_load_fena_by_space_firpos.split("/");
					var splitted_load_fena_0pos = splitted_load_fena[0];
					var splitted_load_fena_1pos = splitted_load_fena[1];
					var splitted_load_fena_2pos = splitted_load_fena[2];
					var splitted_load_fena_3pos = splitted_load_fena[3];
					var splitted_load_fena_4pos = splitted_load_fena[4];
					var splitted_load_fena_5pos = splitted_load_fena[5];
					var splitted_load_fena_6pos = splitted_load_fena[6];
					var splitted_load_fena_7pos = splitted_load_fena[7];
					var new_load_fena_concatenated="";
					var new_splitted_load_fena_0pos=splitted_load_fena_7pos.toLowerCase();
					var new_splitted_load_fena_1pos=splitted_load_fena_6pos.toLowerCase();
					var new_splitted_load_fena_2pos=splitted_load_fena_5pos.toLowerCase();
					var new_splitted_load_fena_3pos=splitted_load_fena_4pos.toLowerCase();
					var new_splitted_load_fena_4pos=splitted_load_fena_3pos.toUpperCase();
					var new_splitted_load_fena_5pos=splitted_load_fena_2pos.toUpperCase();
					var new_splitted_load_fena_6pos=splitted_load_fena_1pos.toUpperCase();
					var new_splitted_load_fena_7pos=splitted_load_fena_0pos.toUpperCase();
					new_load_fena_concatenated=new_splitted_load_fena_0pos.concat('/',new_splitted_load_fena_1pos,'/',new_splitted_load_fena_2pos,'/',new_splitted_load_fena_3pos,'/',new_splitted_load_fena_4pos,'/',new_splitted_load_fena_5pos,'/',new_splitted_load_fena_6pos,'/',new_splitted_load_fena_7pos);
					var final_load_fen;
					final_load_fen = new_load_fena_concatenated.concat(" ",splitted_load_fena_by_space[1]," ",splitted_load_fena_by_space[2]," ",splitted_load_fena_by_space[3]);
					
					console.log("new");
					console.log(final_load_fen);
					var splitted_fenstring = msg.content.move.split(' ');
					console.log("splitted");
					var splitted_fenstring_1pos = splitted_fenstring[0];
					var splitted_fenstring_2pos = splitted_fenstring[1];
					var splitted_fenstring_3pos = splitted_fenstring[2];
					var splitted_fenstring_4pos = splitted_fenstring[3];
					// console.log(splitted_fenstring[1]);
					if (splitted_fenstring[1]=='b'){
						splitted_fenstring_2pos = 'w';
					}else{
						splitted_fenstring_2pos = 'b'
					}
					console.log("after fen str supdate");
					console.log(splitted_fenstring_2pos);
					var updated_fenstring = "";
					// for (var io = 0;i<=3;i++){
				

			// } 
					updated_fenstring = splitted_fenstring_1pos.concat(" ",splitted_fenstring_2pos," ",splitted_fenstring_3pos," ",splitted_fenstring_4pos);
					console.log("final");
					console.log(updated_fenstring);			 

					// var load_fen_concat;
					// load_fen_concat=load_fen.concat(" 1 1");
					// var final_load_fen=load_fen_concat;
					// console.log(final_load_fen);
					// document.getElementById("board-goes-here2").style.display="none";
					var sharing=1;
					move_maker=msg.content.make_move_clicked;
					p4wnify(ed2,true,final_load_fen,sharing);
					// x2.push(p4wnify(ed2,true,final_load_fen,sharing));
					
					// var x2_len=x1.length();
					// x2[x2.length-1];
					// console.log("cs");
		
			}
			// document.getElementById("PlayerTwo").innerHTML=msg.user.name.toUpperCase();
			// var board_config = msg.content.present_configuration
			// p4wnify(ed,true,board_config).next_move();
			document.getElementById("PlayerTwo").innerHTML=msg.user.name.toUpperCase();
		}

		document.getElementById("make-move1").addEventListener('click',function(event){
			if(move_maker === "host" ){
				var ta = returnfenarray();
				console.log("from fen array");
				console.log(ta);
				console.log(ta[ta.length-1]);
				var fen_string_ta = ta[ta.length-1];
				if(move_maker==="host"){
					move_maker="guest";
				}else{
					move_maker="host";
				}
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'move_made_by_host',
						data: "mading move",
						move:fen_string_ta,
						make_move_clicked:move_maker
					}
				});

			}
			else if(move_maker ==="guest"){
				var ta = returnfenarray();
				console.log("from fen array");
				console.log(ta);
				console.log(ta[ta.length-1]);
				var fen_string_ta = ta[ta.length-1];
				if(move_maker==="host"){
					move_maker="guest";
				}else{
					move_maker="host";
				}
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'move_made_by_guest',
						data: "mading move",
						move:fen_string_ta,
						make_move_clicked:move_maker
					}
				});

			}
			
			// elseif(move_maker==="guest"){
			// 	var taa = returnfenarray();
			// 	console.log("from fen array");
			// 	console.log(taa);
			// 	console.log(taa[taa.length-1]);
			// 	var fen_string_taa = taa[taa.length-1];
			// 	if(move_maker==="host"){
			// 		move_maker="guest";
			// 	}else{
			// 		move_maker="host";
			// 	}
			// 	presence.sendMessage(presence.getSharedInfo().id, {
			// 		user: presence.getUserInfo(),
			// 		content: {
			// 			action: 'move_made_by_guest',
			// 			data: "mading move",
			// 			move:fen_string_taa,
			// 			make_move_clicked:move_maker
			// 		}
			// 	});
			// }
		});
		document.getElementById("make-move").addEventListener('click',function(event){
			if(move_maker === "host" ){
				var ta = returnfenarray();
				console.log("from fen array");
				console.log(ta);
				console.log(ta[ta.length-1]);
				var fen_string_ta = ta[ta.length-1];
				if(move_maker==="host"){
					move_maker="guest";
				}else{
					move_maker="host";
				}
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'move_made_by_host',
						data: "mading move",
						move:fen_string_ta,
						make_move_clicked:move_maker
					}
				});

			}
			else if(move_maker ==="guest"){
				var ta = returnfenarray();
				console.log("from fen array");
				console.log(ta);
				console.log(ta[ta.length-1]);
				var fen_string_ta = ta[ta.length-1];
				if(move_maker==="host"){
					move_maker="guest";
				}else{
					move_maker="host";
				}
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'move_made_by_guest',
						data: "mading move",
						move:fen_string_ta,
						make_move_clicked:move_maker
					}
				});

			}
			
			// elseif(move_maker==="guest"){
			// 	var taa = returnfenarray();
			// 	console.log("from fen array");
			// 	console.log(taa);
			// 	console.log(taa[taa.length-1]);
			// 	var fen_string_taa = taa[taa.length-1];
			// 	if(move_maker==="host"){
			// 		move_maker="guest";
			// 	}else{
			// 		move_maker="host";
			// 	}
			// 	presence.sendMessage(presence.getSharedInfo().id, {
			// 		user: presence.getUserInfo(),
			// 		content: {
			// 			action: 'move_made_by_guest',
			// 			data: "mading move",
			// 			move:fen_string_taa,
			// 			make_move_clicked:move_maker
			// 		}
			// 	});
			// }
		});
		// var onNetworkUserChanged = function(msg) {
		// 	var DataPacket;
		// 	if(msg.move===1){
		// 		DataPacket = {
		// 			'present_configuration': " " ,
		// 			'stop':false
		// 		};
		// 	}else{
		// 		DataPacket={
		// 			'present_configuration': " " ,
		// 			'stop':true
		// 		}
		// 	}
		// 	if(isHost &&(presence!=null)){
		// 		presence.sendMessage(presence.getSharedInfo().id,{
		// 			user:presence.getUserInfo(),
		// 			content:DataPacket
		// 		});
		// 	}
		// }

		var onNetworkUserChanged = function(msg){
			if (isHost) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init',
						data: "pawns"
					}
				});
			}
		}

		
		
		console.log("activity started");
		env.getEnvironment(function(err, environment) {
			currentenv = environment;
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			document.getElementById("PlayerOne").innerHTML=environment.user.name.toUpperCase();
			document.getElementById("Versus").innerHTML=" vs ";
			document.getElementById("PlayerTwo").innerHTML="COMPUTER";
			// document.getElementById("user").innerHTML = "<h1>"+"Hello"+" "+environment.user.name+" !</h1>";
			var ed=document.getElementById("board-goes-here");
			translator();
			// pawns.push(p);
			// Load from datastore
			if (!environment.objectId) {
				console.log("New instance");
				
				console.log("Captured activity.js");
				// var load_fen="rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - ";
				// r2qr1k1/ppp2ppp/2nb1n2/3p1b2/4P3/PPPP2pP/8/RNBQKBNR b KQ
				
				p4wnify(ed).next_move();
				// p4wnify(ed,true,load_fen);
				// pawns.push(p);
				console.log("p");
				// console.log(p[0]);
				console.log("p said");

			} else {
				console.log("Existing instance");
				var load_fen="rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - ";
				var recieved_fen="";
				activity.getDatastoreObject().loadAsText(function(error, metadata, data){
					if (error==null && data!=null){
						recieved_fen = JSON.parse(data);
						p4wnify(ed,true,recieved_fen).next_move();
					}
				});
			}

			// user join from shared instance
			if(environment.sharedId){
				console.log("shared instance");
				presence = activity.getPresenceObject(function(error,network){
					if (error){
						console.log("error in p");
						return;
					}
					console.log("work");
					guest_joined(1);
					document.getElementById("startt").style.display="block";
					
					network.onDataReceived(onNetworkDataReceived);
					// network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
		});
		// console.log(p);
		var guest_joined = function(a){
			did_guest_join=a;
		}

		// document.getElementById("fullscreen-button").addEventListener('click', function() {
		// 	document.getElementById("main-toolbar").style.display = "none";
		// 	document.getElementById("canvas").style.display = "none";
		// 	document.getElementById("unfullscreen-button").style.visibility = "visible";
		//   });
		  
		// document.getElementById("unfullscreen-button").addEventListener('click', function() {
		// 	document.getElementById("main-toolbar").style.display = "block";
		// 	document.getElementById("canvas").style.display="block";
		// 	document.getElementById("canvas").style.marginTop = "0px";
		// 	document.getElementById("unfullscreen-button").style.visibility = "hidden";
  
		// });

		// document.getElementById("fullscreen-button").addEventListener('click', function() {
		// 	// if (document.getElementById("photo-button").classList.contains('active')) {
		// 	// 	return;
		// 	// }
		// 	// document.getElementById("main-toolbar").style.opacity = 0;
		// 	// document.getElementById("input-box").style.opacity = 0;
		// 	document.getElementById("main-toolbar").style.display = "none";
		// 	document.getElementById("canvas").style.top = "0px";
		// 	document.getElementById("unfullscreen-button").style.visibility = "visible";
		// 	// resizeHandler();
		// });
		// 	document.getElementById("unfullscreen-button").addEventListener('click', function() {
		// 	// document.getElementById("main-toolbar").style.opacity = 1;
		// 	// document.getElementById("input-box").style.opacity = 1;
		// 	document.getElementById("main-toolbar").style.display = "block";
		// 	document.getElementById("canvas").style.top = "55px";
		// 	document.getElementById("canvas").style.padding = "0px";
		// 	document.getElementById("unfullscreen-button").style.visibility = "hidden";
		// 	// resizeHandler();
		// });

		document.getElementById("fullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.display = "none";
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
			resizeHandler();
		  });
  
		  //Return to normal size
		  document.getElementById("unfullscreen-button").addEventListener('click', function(event) {
			document.getElementById("main-toolbar").style.display = "block";
			document.getElementById("canvas").style.top = "55px";
			
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
			resizeHandler();
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

		document.getElementById("startt").addEventListener('click',function(event){
			document.getElementById("make-move1").style.display="block";
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: 'init',
					data: "reset",
					make_move_clicked:"host"
				}
			});
		});

		// Compute size of QR Code
		var toolbarSize = 55;
		var headerSize = toolbarSize + 40;
		var marginPercent = 20;
		var qrSize = document.getElementById("canvas").parentNode.offsetHeight - headerSize;
		qrSize -= (marginPercent*qrSize)/100;
		var margin = (document.getElementById("canvas").parentNode.offsetWidth - qrSize) / 2;
		document.getElementById("canvas").style.marginLeft =  "px";
		document.getElementById("canvas").style.marginTop = "px";


		document.getElementById("stop-button").addEventListener('click',function (event) {
			// console.log("stop clicked."
			// var jsonData= JSON.stringify(pawns);
			//fen2array imp
			var p = sendtoactivity();
			console.log("from back");
			console.log(p);
			var t = returnfenarray();
			console.log("from fen array");
			console.log(t);
			console.log(t[t.length-1]);
			var fen_string = t[t.length-1];
			var splitted_fenstring = fen_string.split(' ');
			console.log("splitted");
			var splitted_fenstring_1pos = splitted_fenstring[0];
			var splitted_fenstring_2pos = splitted_fenstring[1];
			var splitted_fenstring_3pos = splitted_fenstring[2];
			var splitted_fenstring_4pos = splitted_fenstring[3];
			// console.log(splitted_fenstring[1]);
			if (splitted_fenstring[1]=='b'){
				splitted_fenstring_2pos = 'w';
			}else{
				splitted_fenstring_2pos = 'b'
			}
			console.log("after fen str supdate");
			console.log(splitted_fenstring_2pos);
			var updated_fenstring = "";
			// for (var io = 0;i<=3;i++){
				

			// } 
			updated_fenstring = splitted_fenstring_1pos.concat(" ",splitted_fenstring_2pos," ",splitted_fenstring_3pos," ",splitted_fenstring_4pos);
			console.log("final");
			console.log(updated_fenstring);			 

			console.log("stop clicked.");
			var jsonData = JSON.stringify(updated_fenstring);
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
		};

		
	});
	


});