define(["sugar-web/datastore"], function(){
    var datastore = require("sugar-web/datastore")
    var filePicker = {};
    
    filePicker.browse = function(){
	if (datastore.localStorage !== undefined){
	    var files = datastore.localStorage.getAll();
	    
	    console.log(files);
	    for (var key in files) {
		if (files.hasOwnProperty(key)) {
		    if (typeof JSON.parse(files[key]) == "string"){
			img = new Image();
			img.src = JSON.parse(files[key]);
			console.log(img.outerHTML);
			document.body.innerHTML = img.outerHTML;
		    }
		}
	    }
	}
	else {
	    console.log("Localstorage is empty");
	}
    }

    filePicker.getFiles = function(){
	return datastore.localStorage.getAll();
    }
    
    return filePicker;
});
