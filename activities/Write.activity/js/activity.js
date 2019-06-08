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
], function (activity, env, icon, webL10n, presencepalette, editpalette , parapalette , listpalette , colorpalette, formatpalette , fontPalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
        activity.setup();
        
        // Setting default font settings ( Will be removed after journal integration 
        // and will be invoked only for new activity)
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
            richTextField.document.execCommand("justifyLeft",false,null);
        })
        document.getElementById("6").addEventListener("click",function(){
            richTextField.document.execCommand("justifyRight",false,null);
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

        // Set the functioning of increase and decrease of font size
        // Increase
        document.getElementById("resize-inc").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            cursize++;
            richTextField.document.execCommand("fontSize",false,cursize);
        });
        // Decrease
        document.getElementById("resize-dec").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            cursize--;
            richTextField.document.execCommand("fontSize",false,cursize);
        });

        // Journal handling ( Load and save )

        // Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            
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

        // Load From datastore
        env.getEnvironment(function(err, environment) {
            
            currentenv = environment;

            if (!environment.objectId) {
                // New instance
            } else {
                // Existing instance
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        html = JSON.parse(data);
                        richTextField.document.getElementsByTagName('body')[0].innerHTML = html;
                        console.log(html);
                    }
                });
            }
        });

        
        
	});

});
