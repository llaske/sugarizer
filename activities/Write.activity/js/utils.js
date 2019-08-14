function base64toBlob(mimetype, base64) {
    var contentType = mimetype;
    var byteCharacters = atob(base64.substr(`data:${contentType};base64,`.length));
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