// Script use by the inappbrowser on iOS to display the content of a file

function base64toBlob(mimetype, base64) {
    var contentType = mimetype;
    var byteCharacters = atob(base64.substr(base64.indexOf(';base64,')+8));
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += 1024) {
        var slice = byteCharacters.slice(offset, offset + 1024);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["sugar-web/datastore"], function (datastore) {
    var objectId = window.localStorage.getItem("sugar_inappbrowser_objectId");
    var dataentry = new datastore.DatastoreObject(objectId);
    dataentry.loadAsText(function(err, metadata, text) {
        var blob = base64toBlob(metadata.mimetype, text);
        var frame = document.getElementById("frame");
        frame.height = frame.contentWindow.document.documentElement.scrollHeight + 'px';
        frame.src = URL.createObjectURL(blob);
        window.localStorage.removeItem("sugar_inappbrowser_objectId");
    });
});