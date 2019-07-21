define([
	"sugar-web/activity/activity",
	"activity/palettes/edit-text-palette",
	"activity/palettes/format-text-palette",
	"activity/palettes/list-palette",
	"activity/palettes/paragraph-palette",
	"activity/palettes/font-palette",
	"sugar-web/graphics/colorpalette",
	"activity/palettes/font-size-palette",
	"sugar-web/datastore",
	"sugar-web/graphics/journalchooser",
	"sugar-web/env",
	"sugar-web/graphics/presencepalette",
	"activity/palettes/export-palette",
], function (activity,editpalette,formatpalette,listpalette,parapalette,fontPalette,colorpalette,sizepalette , datastore , journalchooser,env,presencepalette,exportpalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!','humane'], function (doc,humane) {

		// Initialize the activity.
		activity.setup();
		
		var options = {
			modules: {
			  toolbar: '#main-toolbar',
			  history: {
				maxStack: 500,
			  },
			  imageResize: {
				displaySize: true,
				resize: true,
				toolbar: true
			  },
			  cursors: true,
			},
			};
		Quill.register('modules/cursors', QuillCursors);
		var container = document.getElementById('editor');
		var editor = new Quill(container,options);
		editor.focus();
		const cursors = editor.getModule('cursors');
		// Journal Handling (Load)
		env.getEnvironment(function(err, environment) {
            
            currentenv = environment;
            
            if (!environment.objectId) {
                // New instance
                // Set focus on textarea
				
            } else {
                // Existing instance
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
						var delta = JSON.parse(data);
						console.log(delta);
						editor.setContents(delta);
                    }
                });
			}
			// Shared instances
			if (environment.sharedId) {
				console.log("Shared instance");

				// Hide GUI of undo and redo for non host users
                document.getElementById("3").style.display = "none";
				document.getElementById("4").style.display = "none";
				document.getElementById("shared-button").click();
				presence = activity.getPresenceObject(function(error, network) {
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}

		});
		
		// Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            
            // Journal handling
			var data = editor.getContents();
            var jsondata = JSON.stringify(data);
            activity.getDatastoreObject().setDataAsText(jsondata);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.log("write failed.");
                }
            });
            
        });
		
		var changeMadebyUser=false;
		// Initiating edit-text-palette ( for cut/copy/undo/redo )

		var editButton = document.getElementById("edit-text");
		var options = [
			{"id": 1, "title": "copy" , "cmd":"copy"},
			{"id": 2, "title": "paste", "cmd":"paste"},
			{"id": 3, "title": "undo", "cmd":"undo"},
			{"id": 4, "title": "redo", "cmd":"redo"},
		];
		editpalette = new editpalette.Editpalette(editButton, undefined);
		editpalette.setCategories(options);
		editpalette.addEventListener('edit', function () {
			editpalette.popDown();
			editor.focus();
		});
		document.getElementById(3).addEventListener('click',function(){
			editor.history.undo();
		});
		document.getElementById(4).addEventListener('click',function(){
			editor.history.redo();
		});
		// Initiating format-text-palette ( for cut/copy/undo/redo )
		var formatButton = document.getElementById("format-text");
        var formatoptions = [
            {"id": 5, "title": "bold", "cmd":"bold"},
            {"id": 6, "title": "italic", "cmd":"italic"},
            {"id": 7, "title": "underline", "cmd":"underline"},
            {"id": 8, "title": "strike", "cmd":"strikeThrough"}
        ];
        formatpalette = new formatpalette.Formatpalette(formatButton, undefined);
        formatpalette.setCategories(formatoptions);
        formatpalette.addEventListener('format', function () {
			formatpalette.popDown();
			editor.focus();
		});
		document.getElementById(5).addEventListener('click',function(){
			document.getElementById("bold").click();
		});
		document.getElementById(6).addEventListener('click',function(){
			document.getElementById("italic").click();
		});
		document.getElementById(7).addEventListener('click',function(){
			document.getElementById("underline").click();
		});
		document.getElementById(8).addEventListener('click',function(){
			document.getElementById("strike").click();
		});
		

		// Initiating lists palette
        var listButton = document.getElementById("list");
        var listoptions = [
            {"id": 9, "title": "ordered list", "cmd":"insertorderedList"},
            {"id": 10, "title": "unordered list", "cmd":"insertUnorderedList"},
        ];
        listpalette = new listpalette.Listpalette(listButton, undefined);
        listpalette.setCategories(listoptions);
        listpalette.addEventListener('list', function () {
            listpalette.popDown();
		});
		document.getElementById("9").addEventListener("click",function(){
			document.getElementById("list-ordered").click();
        });
        document.getElementById("10").addEventListener("click",function(){
			document.getElementById("list-unordered").click();
        });

		// Initiating paragraph palette ( Alignment settings )
        
        var paraButton = document.getElementById("paragraph");
        var paraoptions = [
            {"id": 11, "title":"justify Left" , "cmd":"justifyLeft"},
            {"id": 12, "title":"justify Right" , "cmd":"justifyRight"},
            {"id": 13, "title":"justify Center" , "cmd":"justifyCenter"},
        ];
        parapalette = new parapalette.Parapalette(paraButton, undefined);
        parapalette.setCategories(paraoptions);
        parapalette.addEventListener('para', function () {
			parapalette.popDown();
			editor.focus();
        });

        document.getElementById(11).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('align','justify');
        })
        document.getElementById(12).addEventListener("click",function(){         
			changeMadebyUser=true;
			editor.format('align','right');
        });
        document.getElementById(13).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('align','center');
        });
		
		// Initialise font palette
        var fontButton = document.getElementById("font-button");
        fontPalette = new fontPalette.Fontpalette(fontButton);
        fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
			if(newfont=="Arial") newfont="arial";
			if(newfont=="Comic Sans MS") newfont="comic";
			changeMadebyUser=true;
			editor.format('font',newfont);
		});
		
		// Initiating colour palette for foreground and background
        var forecolorButton = document.getElementById("color-button-1");
        var changeForeColorPalette = new colorpalette.ColorPalette(forecolorButton);
        changeForeColorPalette.setColor('rgb(0, 0, 0)');
		changeForeColorPalette.addEventListener('colorChange', function(e) {
			changeMadebyUser=true;
			editor.format('color',e.detail.color);
		});
		
		var backcolorButton = document.getElementById("color-button-2");
        var changeBackColorPalette = new colorpalette.ColorPalette(backcolorButton);
        changeBackColorPalette.setColor('rgb(255,255,255)');
		changeBackColorPalette.addEventListener('colorChange', function(e) {
			changeMadebyUser=true;
			editor.format('background-color',e.detail.color);
		});
		

		// Initiating font-size-palette ( for small,normal,large,huge )

		var sizeButton = document.getElementById("resize-inc");
		var options = [
			{"id": 15, "title": "small" , "cmd":"small"},
			{"id": 16, "title": "normal", "cmd":"normal"},
			{"id": 17, "title": "large", "cmd":"large"},
			{"id": 18, "title": "huge", "cmd":"huge"},
		];
		sizepalette = new sizepalette.Sizepalette(sizeButton, undefined);
		sizepalette.setCategories(options);
		sizepalette.addEventListener('size', function () {
			sizepalette.popDown();
			editor.focus();
		});
		document.getElementById(15).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('size','24px');
		});
		document.getElementById(16).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('size','48px');
		});
		document.getElementById(17).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('size','75px');
		});
		document.getElementById(18).addEventListener("click",function(){
			changeMadebyUser=true;
			editor.format('size','100px');
		});

		// Insert Image handling
		document.getElementById("insert-picture").addEventListener("click",function(e){
			journalchooser.show(function (entry) {
				if (!entry) {
                    return;
				}
				var dataentry = new datastore.DatastoreObject(entry.objectId);
				dataentry.loadAsText(function (err, metadata, data) {
					editor.focus();
					changeMadebyUser=true;
					var Delta =  Quill.import('delta');
					editor.updateContents(
						new Delta()
						.retain(editor.getSelection().index)
						.insert({ 
							image: data
						  }),
					);
				});
			}, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
		});


		// Initiating export-palette 

		var exportButton = document.getElementById("export");
        var options = [
            {"id": 19, "title": "export to txt" , "cmd":"save-as-txt"},
            {"id": 20, "title": "export to pdf", "cmd":"save-as-pdf"},
            {"id": 21, "title": "export to doc", "cmd":"save-as-word"},
        ];
        exportpalette = new exportpalette.Exportpalette(exportButton, undefined);
        exportpalette.setCategories(options);
        exportpalette.addEventListener('export', function () {
            exportpalette.popDown();
		});
		
		// save as txt
        document.getElementById("19").addEventListener('click',function(){
            var title = document.getElementById("title").value;
            var mimetype = 'text/plain';
            var inputData = document.getElementById("editor").textContent;
			inputData=JSON.stringify(inputData);
            var metadata = {
			mimetype: mimetype,
			title: title+".txt",
			activity: "",
			timestamp: new Date().getTime(),
			creation_time: new Date().getTime(),
			file_size: 0
		};
		datastore.create(metadata, function() {
			console.log("export done.")
		}, inputData);
		});
		
		// save as PDF
        document.getElementById("20").addEventListener('click',function(){

            var title = document.getElementById("title").value;
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            html2canvas(document.getElementById("editor"),{
                onrendered : function(canvas){
                    var imgData = canvas.toDataURL('image/png');

                    var imgWidth = 210;
                    var pageHeight = 295;
                    var imgHeight = canvas.height * imgWidth / canvas.width;
                    var heightLeft = imgHeight;

                    var doc = new jsPDF('p', 'mm');
                    var position = 0;

                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    }
                    var inputData = doc.output('dataurlstring');
                    var mimetype = 'application/pdf';
                    var metadata = {
                        mimetype: mimetype,
                        title: title+".pdf",
                        activity: "",
                        timestamp: new Date().getTime(),
                        creation_time: new Date().getTime(),
                        file_size: 0
                    };
                    datastore.create(metadata, function() {
                        console.log("export done.")
                    }, inputData);
                }
            })
			});
			
			editor.on('text-change', function(delta, oldDelta, source) {
				
				if ((source == 'user' || changeMadebyUser==true) && presence!=null) {
					var range = editor.getSelection();
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'typing',
							data: delta,
							range: range
						}
					});
					changeMadebyUser=false;
				}
				
			});

			editor.on('selection-change', function(range, oldRange, source) {
				if (range) {
				  if (range.length == 0 && presence!=null) {
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: 'selection',
							range: range
						}
					});
				  } 
				} 
			  });

		// Presence Palette
		// Link presence palette
		var presence = null;
		var isHost = false;
		var myid;
		var nomoreinit = false;
		var mycursor;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
        palette.addEventListener('shared', function() {
            palette.popDown();
            console.log("Want to share");
            presence = activity.getPresenceObject(function(error, network) {
                if (error) {
                    console.log("Sharing error");
                    return;
                }
                network.createSharedActivity('org.sugarlabs.Write', function(groupId) {
                    console.log("Activity shared");
                    isHost = true;
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);
            });
		});
		
		var onNetworkDataReceived = function(msg) {
			if (presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			if(msg.content.action=='init' && nomoreinit==false){
				editor.updateContents(msg.content.data);
				var getallcursors = msg.content.allcursors;
				for(var i = 0 ; i < getallcursors.length ; i++){
					console.log(getallcursors[i]);
					if(getallcursors[i].id!=myid){
						cursors.createCursor(getallcursors[i].id, getallcursors[i].name,getallcursors[i].color) ;
						cursors.moveCursor(getallcursors[i].id, getallcursors[i].range) ;
					}
				}
				cursors.update();
				nomoreinit=true;
			}
			if(msg.content.action=='typing'){
				editor.updateContents(msg.content.data);
				cursors.moveCursor(msg.user.networkId,msg.content.range);
				console.log(msg.user.networkId);
			}
			if(msg.content.action=='selection'){
				cursors.moveCursor(msg.user.networkId,msg.content.range);
			}
			
		}; 

		var onNetworkUserChanged = function(msg) {
			if (isHost) {
				var data = editor.getContents();
				var range = editor.getSelection();
				mycursor.range = range;
				var allcursors = cursors.cursors();
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: 'init',
						data: data,
						allcursors: allcursors
					}
				});
				mycursor.range = null;
			}
			if(!myid){
                myid = msg.user.networkId;
            }
			// handle user enter/exit Notifications
            var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
			var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";
			presence.listSharedActivities(function(activities){
                for (var i = 0; i < activities.length; i++) {
                    if (activities[i].id === presence.getSharedInfo().id) {
                        getConnectedPeople(activities[i].users);
                    }
                  }
            });
            for (var key in connectedPeople) {
                console.log(connectedPeople[key].name,key,connectedPeople[key].networkId);
            }
			if(msg.move==1){
				humane.log(html+userName+" Joined");
				var c = cursors.createCursor(msg.user.networkId, userName, msg.user.colorvalue.stroke);
				if(myid==msg.user.networkId) {mycursor=c;}
			}
			if (msg.move === -1) {
				cursors.removeCursor(msg.user.networkId);
				humane.log(html+userName+" Left");
				if(msg.user.networkId == connectedPeople[0].networkId){
					if(connectedPeople[1].networkId == myid){
						document.getElementById(3).style.display = "inline";
						document.getElementById(4).style.display = "inline";
						isHost=true;
					}
				}
			}	
		};
		
		
		var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
        function generateXOLogoWithColor(color) {
            var coloredLogo = xoLogo;
            coloredLogo = coloredLogo.replace("#010101", color.stroke)
            coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
        
            return "data:image/svg+xml;base64," + btoa(coloredLogo);
		}
		
		var connectedPeople = {};
        // Maintain a list of connected users
        function displayConnectedPeople(){
            var presenceUsersDiv = document.getElementById("presence-users");
            var html = "<hr><ul style='list-style: none; padding:0;'>";
            for (var key in connectedPeople) {
                html += "<li><img style='height:30px;' src='" + generateXOLogoWithColor(connectedPeople[key].colorvalue) + "'>" + connectedPeople[key].name + "</li>"
            }
              html += "</ul>"
              presenceUsersDiv.innerHTML = html
        }

        function getConnectedPeople(users){
            var presenceUsersDiv = document.getElementById("presence-users");
            if (!users || !presenceUsersDiv) {
            return;
            }
            connectedPeople = {};
            presence.listSharedActivityUsers(presence.getSharedInfo().id , function(usersConnected){
                connectedPeople = {};
                for (var i = 0; i < usersConnected.length; i++) {
                    var userConnected = usersConnected[i];
                    connectedPeople[i] = userConnected;
                }
                displayConnectedPeople();
            });
        }

	});
		
});
