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
	requirejs(['domReady!'], function (doc) {

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
			},
			};
		var container = document.getElementById('editor');
		var editor = new Quill(container,options);
		editor.focus();
		
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
						editor.setContents(delta);
                    }
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
            {"id": 14, "title":"justify Full" , "cmd":"justifyFull"},
        ];
        parapalette = new parapalette.Parapalette(paraButton, undefined);
        parapalette.setCategories(paraoptions);
        parapalette.addEventListener('para', function () {
			parapalette.popDown();
			editor.focus();
        });

        document.getElementById(11).addEventListener("click",function(){
			editor.format('align','left');
        })
        document.getElementById(12).addEventListener("click",function(){         
			editor.format('align','right');
        });
        document.getElementById(13).addEventListener("click",function(){
            editor.format('align','center');
        });
        document.getElementById(14).addEventListener("click",function(){
            editor.format('align','justify');
		});
		
		// Initialise font palette
        var fontButton = document.getElementById("font-button");
        fontPalette = new fontPalette.Fontpalette(fontButton);
        fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
			if(newfont=="Arial") newfont="arial";
			if(newfont=="Comic Sans MS") newfont="comic";
            editor.format('font',newfont);
		});
		
		// Initiating colour palette for foreground and background
        var forecolorButton = document.getElementById("color-button-1");
        var changeForeColorPalette = new colorpalette.ColorPalette(forecolorButton);
        changeForeColorPalette.setColor('rgb(0, 0, 0)');
		changeForeColorPalette.addEventListener('colorChange', function(e) {
            editor.format('color',e.detail.color);
		});
		
		var backcolorButton = document.getElementById("color-button-2");
        var changeBackColorPalette = new colorpalette.ColorPalette(backcolorButton);
        changeBackColorPalette.setColor('rgb(255,255,255)');
		changeBackColorPalette.addEventListener('colorChange', function(e) {
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
			editor.format('size','24px');
		});
		document.getElementById(16).addEventListener("click",function(){
			editor.format('size','48px');
		});
		document.getElementById(17).addEventListener("click",function(){
			editor.format('size','75px');
		});
		document.getElementById(18).addEventListener("click",function(){
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


	});

	
});
