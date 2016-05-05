/* Undo button will undo the canvas using the history */

define(["sugar-web/datastore", "sugar-web/filepicker"], function() {
    var filePicker = require("sugar-web/filepicker")

/*    function browseFiles() {
	console.log("Clicked browseFiles");
	var filePicker = document.createElement('div');
	var files = datastore.localStorage.getAll();

	console.log(files);
	for (var key in files) {
	    if (files.hasOwnProperty(key)) {
		if (typeof JSON.parse(files[key]) == "string"){
		    img = new Image();
		    img.src = JSON.parse(files[key]);
		    console.log(img.outerHTML);
		    document.getElementById('browse-files-button').innerHTML += img.outerHTML;
		}
	    }
	}
  }*/

    function test(){
	alert("test");
    }
    
    function initGui() {
	console.log("initGui Called");
      var browseFilesButton = document.getElementById('browse-files-button');
      PaintApp.elements.browseFilesButton = browseFilesButton;
      browseFilesButton.addEventListener('click', filePicker.browse);
  }
  function hideGui() {
    var browseFilesButton = document.getElementById('browse-files-button');
    PaintApp.elements.browseFilesButton = browseFilesButton;
    PaintApp.elements.browseFilesButton.disabled = true;
  }

  var browseFilesButton = {
      initGui: initGui,
      hideGui: hideGui,
  };

  return browseFilesButton;
});
