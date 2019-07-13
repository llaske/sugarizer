define([
	"sugar-web/activity/activity",
    "sugar-web/env",
    "sugar-web/graphics/icon",
    "webL10n",
    "sugar-web/graphics/presencepalette",
    "activity/palettes/edit-text-palette",
    "activity/palettes/paragraph-palette",
    "activity/palettes/list-palette",
    "sugar-web/graphics/colorpalette",
    "activity/palettes/format-text-palette",
    "activity/palettes/font-palette",
    "sugar-web/datastore",
    "sugar-web/graphics/journalchooser",
    "activity/palettes/export-palette",
], function (activity, env, icon, webL10n, presencepalette, editpalette , parapalette , listpalette , colorpalette, formatpalette , fontPalette , datastore , journalchooser , exportpalette ) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!', 'humane'], function (doc,humane) {

		// Initialize the activity.
        activity.setup();
        var text = document;
        var textarea = document.getElementById("textarea");

        // Variables for Displaying carset of other users
        var myposition;
        var myid;

        // Load From datastore
        
        // Create variable for handling undo-redo in multi user env
        var stack = [] ;
        var top = -1;

        env.getEnvironment(function(err, environment) {
            
            currentenv = environment;
            
            if (!environment.objectId) {
                // New instance
                // Set focus on textarea
                document.getElementById("textarea").focus();
                document.execCommand('defaultParagraphSeparator', false, 'p');
                document.execCommand("fontSize",false,4);
                // Set Arial as default
                text.getElementById("textarea").style.fontFamily = "Arial";
            } else {
                // Existing instance
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        html = JSON.parse(data);
                        text.getElementById("textarea").innerHTML = html;
                        document.execCommand('defaultParagraphSeparator', false, 'p')
                        document.execCommand("fontSize",false,4);
                        document.getElementById('textarea').setAttribute("style","display:block;height:100%");
                        document.getElementById("textarea").focus();
                        imageHandler();
                        
                    }
                });
            }

            // Shared instances
            if (environment.sharedId) {
                console.log("Shared instance");
                
                // Hide GUI of undo and redo for non host users
                document.getElementById("3").style.display = "none";
                document.getElementById("4").style.display = "none";
                
                presence = activity.getPresenceObject(function(error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                    network.onSharedActivityUserChanged(onNetworkUserChanged);
                });
            }


        });
        
        // Create Listeners for images on start of activity
        function imageHandler() {
            
            var area = text.getElementById("textarea");
            var imgs = area.getElementsByTagName("img")
            if(imgs.length>0){
                
                for (var i = 0; i < imgs.length; i++) {
                    imgSrcs[i]=imgs[i].id;
                }
                console.log(imgSrcs);
                imgSrcs.forEach(function (id, index) {
                    text.getElementById(id).addEventListener("click",function(){
                        document.getElementById("textarea").blur();
                        if(id==currentImage){
                            var image = text.getElementById(id);
                            image.style.border = "none";
                            image.style.borderImage = "none";
                            currentImage=null;
                            console.log("Des");
                            restoreRangePosition(document.getElementById("textarea"));
                        } else {
                            console.log("sel");
                            currentImage=id;
                            imgSrcs.forEach(function(id2,index2){
                                if(id2==currentImage){
                                    var image = text.getElementById(id2);
                                    image.style.border = "30px solid transparent";
                                    image.style.borderImage = "url("+borderurl+") 45 round";
                                } else {
                                    var image = text.getElementById(id2);
                                    if(image){
                                        image.style.border = "none";
                                        image.style.borderImage = "none";
                                    }
                                }
                            })
                        }
                        
                    })
                    if(currentImage){
                        var selectimage = text.getElementById(currentImage);
                        selectimage.style.border = "30px solid transparent";
                        selectimage.style.borderImage = "url("+borderurl+") 45 round";
                    }
                    
                });
            }
            
        }
        
		
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
        });
        document.getElementById("1").addEventListener("click",function(){
            text.execCommand("copy",false,null);
            updateContent();
            storechangesinstack();
        })
        document.getElementById("2").addEventListener("click",function(){
            text.execCommand("paste",false,null);
            updateContent();
            storechangesinstack();
        });
        document.getElementById("3").addEventListener("click",function(){
            if(presence){
                undo();
            } else {
                text.execCommand("undo",false,null);
            }
            updateContent();
        });
        document.getElementById("4").addEventListener("click",function(){
            if(presence){
                redo();
            } else{
                text.execCommand("redo",false,null);
            }
            updateContent();
        });

        // Initiating paragraph palette ( Alignment settings )
        
        var paraButton = document.getElementById("paragraph");
        var paraoptions = [
            {"id": 5, "title":"justify Left" , "cmd":"justifyLeft"},
            {"id": 6, "title":"justify Right" , "cmd":"justifyRight"},
            {"id": 7, "title":"justify Center" , "cmd":"justifyCenter"},
            {"id": 8, "title":"justify Full" , "cmd":"justifyFull"},
        ];
        parapalette = new parapalette.Parapalette(paraButton, undefined);
        parapalette.setCategories(paraoptions);
        parapalette.addEventListener('para', function () {
            parapalette.popDown();
        });

        document.getElementById("5").addEventListener("click",function(){
   
            if(!currentImage){
                text.execCommand("justifyLeft",false,null);
            } else {
                // Float left for images
                var image = text.getElementById(currentImage);
                image.style.cssFloat = "left";
            }
            updateContent();
            storechangesinstack();
        })
        document.getElementById("6").addEventListener("click",function(){
            
            if(!currentImage){
                text.execCommand("justifyRight",false,null);
            } else {
                // Float right for images
                var image = text.getElementById(currentImage);
                image.style.cssFloat = "right";
            }
            updateContent();
            storechangesinstack();
        });
        document.getElementById("7").addEventListener("click",function(){
            text.execCommand("justifyCenter",false,null);
            updateContent();
            storechangesinstack();
        });
        document.getElementById("8").addEventListener("click",function(){
            text.execCommand("justifyFull",false,null);
            updateContent();
            storechangesinstack();
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
            text.execCommand("insertorderedList",false,"A");
            updateContent();
            storechangesinstack();
        });
        document.getElementById("10").addEventListener("click",function(){
            text.execCommand("insertUnorderedList",false,null);
            updateContent();
            storechangesinstack();
        });

        // Initiating colour palette for foreground and background
        var forecolorButton = document.getElementById("color-button-1");
        var changeForeColorPalette = new colorpalette.ColorPalette(forecolorButton);
        changeForeColorPalette.setColor('rgb(0, 0, 0)');
		changeForeColorPalette.addEventListener('colorChange', function(e) {
            var forergb = e.detail.color;
            var forehex = rgb2hex(forergb);
            text.execCommand("foreColor",false,forehex);
            updateContent();
            storechangesinstack();
        });
        
        var backcolorButton = document.getElementById("color-button-2");
        var changeBackColorPalette = new colorpalette.ColorPalette(backcolorButton);
        changeBackColorPalette.setColor('rgb(255,255,255)');
		changeBackColorPalette.addEventListener('colorChange', function(e) {
            var backrgb = e.detail.color;
            var backhex = rgb2hex(backrgb);
            text.execCommand("hiliteColor",false,backhex);
            updateContent();
            storechangesinstack();
        });
        // hack to convert rgb to hex
        function rgb2hex(rgb){
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
             ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
             ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
             ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
           }

        // initiating the format text palette (for bold/italic/strikethrough/underline)
        var formatButton = document.getElementById("format-text");
        var formatoptions = [
            {"id": 11, "title": "bold", "cmd":"bold"},
            {"id": 12, "title": "italic", "cmd":"italic"},
            {"id": 13, "title": "underline", "cmd":"underline"},
            {"id": 14, "title": "strikethrough", "cmd":"strikeThrough"}
        ];
        formatpalette = new formatpalette.Formatpalette(formatButton, undefined);
        formatpalette.setCategories(formatoptions);
        formatpalette.addEventListener('format', function () {
            formatpalette.popDown();
        });

        document.getElementById("11").addEventListener("click",function(){
            text.execCommand("bold",false,null);
            updateContent();
            storechangesinstack();
        })
        document.getElementById("12").addEventListener("click",function(){
            text.execCommand("italic",false,null);
            updateContent();
            storechangesinstack();
        });
        document.getElementById("13").addEventListener("click",function(){
            text.execCommand("underline",false,null);
            updateContent();
            storechangesinstack();
        });
        document.getElementById("14").addEventListener("click",function(){
            text.execCommand("strikeThrough",false,null);
            updateContent();
            storechangesinstack();
        });

        // Initialise font palette
        var fontButton = document.getElementById("font-button");
        fontPalette = new fontPalette.Fontpalette(fontButton);
        fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
            text.execCommand("fontName",false,newfont);
        });

        // Set the functioning of increase and decrease of font size and selected image
        // Increase
        document.getElementById("resize-inc").addEventListener('click',function(e){
            var cursize = text.queryCommandValue ('fontSize');
            if(!cursize) cursize=4;
            cursize++;
            text.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = text.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                curwidth=curwidth+20;
                image.style.width=curwidth+"px";
            }
            updateContent();
            storechangesinstack();
        });
        // Decrease
        document.getElementById("resize-dec").addEventListener('click',function(e){
            var cursize = text.queryCommandValue ('fontSize');
            cursize--;
            text.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = text.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                curwidth=curwidth-80;
                image.style.width=curwidth+"px";
            }
            updateContent();
            storechangesinstack();
        });

        // Images Handling
	
        // variable to maintain id of current image
        var currentImage = null;
        var imgSrcs = [];
        var borderurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAM4SURBVHhe7du9bRtBFIVRNeHcLaoXV6HMgZpw7EwVOFDgTJk8GxgwiMc7GHl34fU7B7gZgeHPfgRIgg8AAAAAAAAAAAAAAAAAH/Q09n7CDlEdtPe2J4i+BDKZQHoTyGQC6U0gkwmkN4FMJpDeBDKZQHoTyGQC6U0gkwmkN4FM9jL2xdpue/2r62LvHaI6yOyKO0R1kNkVd4jqILMr7hDVQWZX3CGqg8yuuENUB+29r2OfrO2217+6LvbeIaqD9p7fQXrzO8hkAulNIJMJpDeBTCaQ3gQymUB6E8hkAulNIJMJpDeBTCaQ3gQymUB6E8hkAuntcWy7Bu7t3v9Fnseq29/bIaqD7u1t7PZBvI5Vt/1z2xME92x/qrq9rrZ9HruUH2O3D+LbGPwNgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUBwuUCe7uxt7PZBvI5Vt53tcQw2lwukurN7b4uEPrY3xNs3yd97Gauukeex6vZpp6ju7N477cHwT9he7+o62HunqA7eewLpRSCLE0gvAlmcQHoRyOIE0otAFieQXgSyOIH0IpDFCaQXgSxOIL0IZHEC6UUgixNILwJZnEB6Ecjifo59tzbbXu/qOth7p6gONrvCTlEdbHaFnaI62OwKO0V1sNkVdorq4L3nQ3qv+ZC+OF/z9uJr3sUJpBeBLE4gvQhkcQLpRSCLE0gvAlmcQHr5rwKBvQkEAAAAAAAAAAAAAACAD3p4+AULle55ucyNGwAAAABJRU5ErkJggg=="
        //  Insert image Handling
        document.getElementById("insert-picture").addEventListener('click', function (e) {
            journalchooser.show(function (entry) {
                //  No selection
                if (!entry) {
                    return;
                }
                //  Get object content
                var dataentry = new datastore.DatastoreObject(entry.objectId);
                dataentry.loadAsText(function (err, metadata, data) {
                    img=data.toString();
                    var id = "rand" + Math.random();
                    img = "<img src='" + img + "' id=" + id + " style='float:none'>";
                    restoreRangePosition(document.getElementById("textarea"));
                    document.execCommand("insertHTML", false, img);
                    imgSrcs.push(id);
                    text.getElementById(id).addEventListener("click",function(){
                        document.getElementById("textarea").blur();
                        if(id==currentImage){
                            var image = text.getElementById(id);
                            image.style.border = "none";
                            image.style.borderImage = "none";
                            currentImage=null;
                            restoreRangePosition(document.getElementById("textarea"));
                    } else {
                        currentImage=id;
                        imgSrcs.forEach(function(id2,index2){
                            if(id2==currentImage){
                                var image = text.getElementById(id2);
                                image.style.border = "30px solid transparent";
                                image.style.borderImage = "url("+borderurl+") 45 round";
                            } else {
                                var image = text.getElementById(id2);
                                if(image){
                                    image.style.border = "none";
                                    image.style.borderImage = "none";
                                }
                            }
                        })
                    }
                        
                    });
                    document.getElementById(id).click();
                    updateContent();
                    storechangesinstack();
                });
            }, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
        });
        
        
        // Journal handling ( save )

        // Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            
            // Remove image border's if image left selected
            removeSelection();
            // Journal handling
            var data = text.getElementById("textarea").innerHTML ;
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

        // Initiating export-palette 

		var exportButton = document.getElementById("export");
        var options = [
            {"id": 15, "title": "export to txt" , "cmd":"save-as-txt"},
            {"id": 16, "title": "export to pdf", "cmd":"save-as-pdf"},
        ];
        exportpalette = new exportpalette.Exportpalette(exportButton, undefined);
        exportpalette.setCategories(options);
        exportpalette.addEventListener('export', function () {
            exportpalette.popDown();
        });

        // Remove image selection
        function removeSelection(){
            for(var i=0 ; i < imgSrcs.length ; i++){
                var im = text.getElementById(imgSrcs[i]);
                if(im){
                    im.style.border = "none";
                    im.style.borderImage = "none";
                }
            }
        }

        // save as txt
        document.getElementById("15").addEventListener('click',function(){
            // Remove image border's if image left selected
            removeSelection();
            var title = document.getElementById("title").value;
            var mimetype = 'text/plain';
            var inputData = text.getElementById("textarea").textContent;
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
        document.getElementById("16").addEventListener('click',function(){
            // Remove image border's if image left selected
            removeSelection();
            var title = document.getElementById("title").value;
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            html2canvas(document.getElementById("textarea"),{
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

        // Multi User collab.

        // Link presence palette
        var presence = null;
        var isHost = false;
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
                    storechangesinstack();
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);
            });
        });
        var nomoreinit = false;
        var onNetworkDataReceived = function(msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return;
            }
            
            var screenheight = document.getElementById('textarea').clientHeight;
            if(screenheight - msg.position.top <= 100){
                screenheight=screenheight+msg.position.top;
                document.getElementById('textarea').setAttribute("style","display:block;height:"+screenheight+"px");
            }
            // Changes made by user in presence will be handled here
            if(text.getElementById("textarea").innerHTML!=msg.data){
                var inilen = document.getElementById("textarea").textContent.length;
                var restore;
                text.getElementById("fake").innerHTML = msg.data;
                var finallen = document.getElementById("fake").textContent.length;
                if(finallen==inilen){
                    var restore = saveCaretPosition(textarea);
                } else {
                    saveRangePosition(textarea);
                }
                
                text.getElementById("textarea").innerHTML = msg.data ;
                
                if(inilen==finallen){
                    restore();
                } else {
                    restoreRangePosition(textarea);
                }
            }
            
            // Code to show xoicons as cursors of other users
            if(msg.action == 'update'){
            var carets = document.getElementsByClassName("cursor-container");
            var found = false;
            for(var i = 0 ; i<carets.length ; i++){
                if(carets[i].id == myid){
                    carets[i].remove();
                } else if(carets[i].id == msg.user.networkId){
                    carets[i].style.top = msg.position.top.toString()+"px";
                    carets[i].style.left = msg.position.left.toString()+"px";
                    found = true;
                }
            }
            if(found == false){
                var html = "<span style='top:"+msg.position.top.toString()+"px; left:"+msg.position.left.toString()+"px;' class='cursor-container' id=" + msg.user.networkId.toString() + ">"+
                    "<span class='cursor' style='background-color:"+msg.user.colorvalue.stroke.toString()+"'></span>"+
                    "<span class='cursor-name' style='background-color:"+msg.user.colorvalue.fill.toString()+"'>"+msg.user.name.toString()+"</span>"+
                    "</span>";
                document.getElementById("cursors").innerHTML = document.getElementById("cursors").innerHTML + html;
                }
            }
            if(msg.action == 'init' && !nomoreinit){
                nomoreinit = true;
                document.getElementById("cursors").innerHTML = msg.cursors;
                var carets = document.getElementsByClassName("cursor-container");
                for(var i = 0 ; i<carets.length ; i++){
                    if(carets[i].id == myid)
                    {carets[i].remove();}
                }
                if(msg.position.top!=null){
                    var html = "<span style='top:"+msg.position.top.toString()+"px; left:"+msg.position.left.toString()+"px;' class='cursor-container' id=" + msg.user.networkId.toString() + ">"+
                    "<span class='cursor' style='background-color:"+msg.user.colorvalue.stroke.toString()+"'></span>"+
                    "<span class='cursor-name' style='background-color:"+msg.user.colorvalue.fill.toString()+"'>"+msg.user.name.toString()+"</span>"+
                    "</span>";
                    document.getElementById("cursors").innerHTML = document.getElementById("cursors").innerHTML + html;
                } 
                
            }
            
            // Add event list. to images
            imageHandler();
            restoreRangePosition(textarea);
            // Store the changes made by non host users in stack 
            storechangesinstack();
        };

        // Creating xo for notifications
        var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
        function generateXOLogoWithColor(color) {
            var coloredLogo = xoLogo;
            coloredLogo = coloredLogo.replace("#010101", color.stroke)
            coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
        
            return "data:image/svg+xml;base64," + btoa(coloredLogo);
          }

        // For loading the initial content for other users ( init )
        var onNetworkUserChanged = function(msg) {
            // Fetch all the cursors
            var cursors = document.getElementById("cursors").innerHTML;
            myposition = $("#textarea").caret('position');
            if (isHost) {
                var data = text.getElementById("textarea").innerHTML ;
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'init',
                    data: data,
                    cursors: cursors,
                    position: myposition
                });
            }

            if(!myid){
                myid = msg.user.networkId;
            }
            // handle user enter/exit Notifications
            var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
            var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>"
            
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
            if (msg.move === 1) {
            humane.log(html+userName+" Joined");
            if(msg.user.networkId != myid){
                console.log("user join ",msg.user.name);
                var cursor = "<span style='top:0px; left:0px;' class='cursor-container' id=" + msg.user.networkId.toString() + ">"+
                    "<span class='cursor' style='background-color:"+msg.user.colorvalue.stroke.toString()+"'></span>"+
                    "<span class='cursor-name' style='background-color:"+msg.user.colorvalue.fill.toString()+"'>"+msg.user.name.toString()+"</span>"+
                    "</span>";
                document.getElementById("cursors").innerHTML = document.getElementById("cursors").innerHTML + cursor;
            }
            }

            if (msg.move === -1) {
            humane.log(html+userName+" Left");
            // Show undo redo for second master if first master leaves
            if(msg.user.networkId == connectedPeople[0].networkId){
                if(connectedPeople[1].networkId == myid){
                    document.getElementById("3").style.display = "inline";
                    document.getElementById("4").style.display = "inline";
                }
            }
            // Remove the cursor of the user who left
            var carets = document.getElementsByClassName("cursor-container");
            for(var i = 0 ; i<carets.length ; i++){
                if(carets[i].id == msg.user.networkId){
                    carets[i].remove();
                }
            }
            }
        };
        
        // For loading content of other users (update)
        text.addEventListener("keyup",function(){
            myposition = $("#textarea").caret('position');
            var screenheight = document.getElementById('textarea').clientHeight;
            if(screenheight - myposition.top <= 100){
                screenheight=screenheight+842;
                document.getElementById('textarea').setAttribute("style","display:block;height:"+screenheight+"px");
            }
            updateContent();
            storechangesinstack();
            // saveRangePosition(document.getElementById("textarea"));
        });
        
        // Remove image selection on clicking in textarea  ( if image is in select mode )
        // Also save the carset position
        document.getElementById("textarea").addEventListener("click",function(event){
            myposition = $("#textarea").caret('position');
            if(myposition) updateContent();
            if(document.getElementById(currentImage) && currentImage!=null){

                if(document.getElementById(currentImage)!=event.target){
                    document.getElementById(currentImage).click();
                }                
            } else {
                if(!presence) saveRangePosition(document.getElementById("textarea"));
            }
        })
        function updateContent(){
            if(presence){
                var data = text.getElementById("textarea").innerHTML ;
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'update',
                    data: data,
                    position : myposition
                });
            }
        }

        // Handling undo and redo in multi user env        

        function storechangesinstack(){
            if(presence){
            var html = text.getElementById("textarea").innerHTML;
            if((top!=-1)&&(stack[top]==html)){
                console.log("No HTML changes");
            }
            else{
                top++;
                stack.splice(top, 0, html);
            }
            }
        }
        
        function undo(){
            if(top==-1||top==0){
                console.log("No changes made");
            }
            else {
                
                top--;
                text.getElementById("textarea").innerHTML = stack[top];
                
            }
        }
        
        function redo(){
            
            if(top==-1||top==0){
                console.log("No changes made");
            } else{
                var check = top+1;
                if(stack[check]==null){
                    console.log("Empty");
                } else{
                    top++;
                    text.getElementById("textarea").innerHTML = stack[top];
                }
            }
        }

        
        
	});

});
