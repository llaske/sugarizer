define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette","sugar-web/datastore","sugar-web/graphics/journalchooser","pawnpalette","tutorial"], function (activity, env, icon, webL10n, presencepalette,datastore, journalchooser,pawnpalette,tutorial) {
	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();


		document.getElementById("help-button").addEventListener('click', function(e) {
			tutorial.start();
		});

		var addpalette = new pawnpalette.PawnPalette(document.getElementById("add-button2"), "Add pawn");
		var presence = null;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
	
		palette.addEventListener('shared',function(){
			palette.popDown();
			console.log("want to share");
	
			presence = activity.getPresenceObject(function(error,network){
				if(error){
					console.log("shearing error");
					reutrn ;
				}
				network.createSharedActivity('org.sugarlabs.Pawn',function(groupId){
					console.log("Activity shared");
				});
				network.onDataReceived(onNetworkDataReceived);
			});
		});
	
	

	var currentenv;

	env.getEnvironment(function(err, environment) {
		currentenv = environment;
		console.log(environment.objectId);
		document.getElementById("user").innerHTML = "<h1>"+"Hello"+" "+environment.user.name+" !</h1>";
	
		// Load from datastore
		if (!environment.objectId) {
			console.log("New instance");
		} else {

			activity.getDatastoreObject().loadAsText(function(error,metadata,data){
				
				if(error==null && data != null){
					pawns = JSON.parse(data);
					drawPawns();
				}


			});
		

			document.getElementById("picture-button").addEventListener('click', function (e) {
				journalchooser.show(function (entry) {
					// Do nothing for the moment
					if (!entry) {
						return;
					}
					// Get object content
					var dataentry = new datastore.DatastoreObject(entry.objectId);
					dataentry.loadAsText(function (err, metadata, data) {
						document.getElementById("canvas").style.backgroundImage = "url('"+data+"')";
					});
				}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
			});
		

	}

	




});
	



	
	var pawns = []

	var drawPawns = function(){
		document.getElementById("pawns").innerHTML = "";

		for(var i =0; i<pawns.length; i++){
			var pawn = document.createElement("div");
			pawn.className = "pawn";
			document.getElementById("pawns").appendChild(pawn);

		}
	}


	addpalette.addEventListener('pawnClick', function (event) {
		for (var i = 0 ; i < event.count ; i++) {
			pawns.push(currentenv.user.colorvalue);
			drawPawns();
	
			document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Played", {name:currentenv.user.name})+"</h1>";
	
			if (presence) {
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'update',
						data: currentenv.user.colorvalue
					}
				});
			}
		}
	});

	

	document.getElementById("stop-button").addEventListener('click',function(event){
		
		console.log("writing");
		var jsonData = JSON.stringify(pawns);
		activity.getDatastoreObject().setDataAsText(jsonData);
		

		activity.getDatastoreObject().save(function (error) {
			if (error === null) {
		
				console.log("write done.");
			} else {
				console.log("write failed.");
			}
		});


	});


	


	});
	



});
