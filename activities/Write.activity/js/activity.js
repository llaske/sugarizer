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
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
        activity.setup();

        // Load From datastore
        env.getEnvironment(function(err, environment) {
            
            currentenv = environment;

            if (!environment.objectId) {
                // New instance
                // Set focus on textarea
                richTextField.focus();
                // Set Arial as default font 
                richTextField.document.execCommand("fontName",false,"Arial");
                // Set 4 as default font size
                richTextField.document.execCommand("fontSize",false,"4");
            } else {
                // Existing instance
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        html = JSON.parse(data);
                        richTextField.document.getElementsByTagName('body')[0].innerHTML = html;
                    }
                });
            }
        });
        
        // Set focus on textarea
        richTextField.focus();
        // Set Arial as default font 
        richTextField.document.execCommand("fontName",false,"Arial");
        // Set 4 as default font size
        richTextField.document.execCommand("fontSize",false,"4");
		
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
            richTextField.document.execCommand("copy",false,null);
        })
        document.getElementById("2").addEventListener("click",function(){
            richTextField.document.execCommand("paste",false,null);
        });
        document.getElementById("3").addEventListener("click",function(){
            richTextField.document.execCommand("undo",false,null);
        });
        document.getElementById("4").addEventListener("click",function(){
            richTextField.document.execCommand("redo",false,null);
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
                richTextField.document.execCommand("justifyLeft",false,null);
            } else {
                // Float left for images
                var image = richTextField.document.getElementById(currentImage);
                image.style.cssFloat = "left";
            }
        })
        document.getElementById("6").addEventListener("click",function(){
            
            if(!currentImage){
                richTextField.document.execCommand("justifyRight",false,null);
            } else {
                // Float right for images
                var image = richTextField.document.getElementById(currentImage);
                image.style.cssFloat = "right";
            }
        });
        document.getElementById("7").addEventListener("click",function(){
            richTextField.document.execCommand("justifyCenter",false,null);
        });
        document.getElementById("8").addEventListener("click",function(){
            richTextField.document.execCommand("justifyFull",false,null);
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
            richTextField.document.execCommand("insertorderedList",false,"A");
        });
        document.getElementById("10").addEventListener("click",function(){
            richTextField.document.execCommand("insertUnorderedList",false,null);
        });

        // Initiating colour palette for foreground and background
        var forecolorButton = document.getElementById("color-button-1");
        var changeForeColorPalette = new colorpalette.ColorPalette(forecolorButton);
        changeForeColorPalette.setColor('rgb(0, 0, 0)');
		changeForeColorPalette.addEventListener('colorChange', function(e) {
            var forergb = e.detail.color;
            var forehex = rgb2hex(forergb);
            richTextField.document.execCommand("foreColor",false,forehex);
        });
        
        var backcolorButton = document.getElementById("color-button-2");
        var changeBackColorPalette = new colorpalette.ColorPalette(backcolorButton);
        changeBackColorPalette.setColor('rgb(255,255,255)');
		changeBackColorPalette.addEventListener('colorChange', function(e) {
            var backrgb = e.detail.color;
            var backhex = rgb2hex(backrgb);
            richTextField.document.execCommand("hiliteColor",false,backhex);
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
            richTextField.document.execCommand("bold",false,null);
        })
        document.getElementById("12").addEventListener("click",function(){
            richTextField.document.execCommand("italic",false,null);
        });
        document.getElementById("13").addEventListener("click",function(){
            richTextField.document.execCommand("underline",false,null);
        });
        document.getElementById("14").addEventListener("click",function(){
            richTextField.document.execCommand("strikeThrough",false,null);
        });

        // Initialise font palette
        var fontButton = document.getElementById("font-button");
        fontPalette = new fontPalette.Fontpalette(fontButton);
        fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
            richTextField.document.execCommand("fontName",false,newfont);
        });

        // Set the functioning of increase and decrease of font size and selected image
        // Increase
        document.getElementById("resize-inc").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            if(!cursize) cursize=4;
            cursize++;
            richTextField.document.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = richTextField.document.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                curwidth=curwidth+20;
                image.style.width=curwidth+"px";
            }
        });
        // Decrease
        document.getElementById("resize-dec").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            cursize--;
            richTextField.document.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = richTextField.document.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                console.log(curwidth);
                curwidth=curwidth-80;
                image.style.width=curwidth+"px";
            }
        });

        // Images Handling
	
        // variable to maintain id of current image
        var currentImage;
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
                    richTextField.document.execCommand("insertHTML", false, img);
                    richTextField.document.getElementById(id).addEventListener("click",function(){
                    var imgs = richTextField.document.getElementsByTagName("img");
                    for (var i = 0; i < imgs.length; i++) {
                        imgSrcs.push(imgs[i].id);
                    }
                    console.log(imgSrcs);
                        if(id==currentImage){
                            console.log("Unselect mode");
                            for(var i=0 ; i < imgSrcs.length ; i++){
                                var i = richTextField.document.getElementById(imgSrcs[i]);
                                i.style.border = "none";
                                i.style.borderImage = "none";
                            }
                            currentImage=null;
                        } else {
                            console.log("select mode");
                            currentImage=id;
                            for(var i=0 ; i < imgSrcs.length ; i++){
                                if(imgSrcs[i]!=currentImage){
                                    var i = richTextField.document.getElementById(imgSrcs[i]);
                                    i.style.border = "none";
                                    i.style.borderImage = "none";
                                } else {
                                    var i = richTextField.document.getElementById(imgSrcs[i]);
                                    i.style.border = "30px solid transparent";
                                    i.style.borderImage = "url("+borderurl+") 45 round";
                                }
                            }
                        }
                        
                    });
                });
            }, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
        });
        
        
        // Journal handling ( save )

        // Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            
            // Remove image border's if image left selected
            for(var i=0 ; i < imgSrcs.length ; i++){
                var i = richTextField.document.getElementById(imgSrcs[i]);
                i.style.border = "none";
                i.style.borderImage = "none";
            }
            // Journal handling
            var data = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
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

        // Initiating export-palette ( for cut/copy/undo/redo )

		var exportButton = document.getElementById("export");
        var options = [
            {"id": 15, "title": "export to txt" , "cmd":"save-as-txt"},
            {"id": 16, "title": "export to html", "cmd":"save-as-html"},
            {"id": 17, "title": "export to pdf", "cmd":"save-as-pdf"},
        ];
        exportpalette = new exportpalette.Exportpalette(exportButton, undefined);
        exportpalette.setCategories(options);
        exportpalette.addEventListener('export', function () {
            exportpalette.popDown();
        });

        // save as txt
        document.getElementById("15").addEventListener('click',function(){
            // Remove image border's if image left selected
            for(var i=0 ; i < imgSrcs.length ; i++){
                var i = richTextField.document.getElementById(imgSrcs[i]);
                i.style.border = "none";
                i.style.borderImage = "none";
            }
            var content = richTextField.document.getElementsByTagName('body')[0].textContent ;
            var link = document.createElement('a');
            var mimeType='text/plain';
            link.setAttribute('download','download.txt');
            link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
            document.body.append(link);
            link.click();
            document.body.removeChild(link);
        });
        
        // save as html
        document.getElementById("16").addEventListener('click',function(){
            // Remove image border's if image left selected
            for(var i=0 ; i < imgSrcs.length ; i++){
                var i = richTextField.document.getElementById(imgSrcs[i]);
                i.style.border = "none";
                i.style.borderImage = "none";
            }
            var content = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
            var link = document.createElement('a');
            var mimeType='text/html';
            link.setAttribute('download','download.html');
            link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
            document.body.append(link);
            link.click();
            document.body.removeChild(link);
        });

	});

});
