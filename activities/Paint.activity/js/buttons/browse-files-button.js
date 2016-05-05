/* Browse files button will open the filepicker to let the user choose an image stored in the localstorage */

define(["sugar-web/datastore", "sugar-web/filepicker"], function() {
    var filePicker = require("sugar-web/filepicker");
    
    function initGui() {
	var browseFilesButton = document.getElementById('browse-files-button');
	PaintApp.elements.browseFilesButton = browseFilesButton;
	browseFilesButton.addEventListener('click', filePicker.browseImages);
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
