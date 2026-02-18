// Interface to qrcode
define([], function() {
	var qrcode = {};

	var currentCamera = 0;
	var qrCancelCallback = null;

	function closeQR() {
		QRScanner.cancelScan(function(status){});
		if (qrCancelCallback) {
			qrCancelCallback();
		}
		document.getElementById("app").style.opacity = 1;
		document.getElementById("qrclosebutton").style.visibility = "hidden";
		document.getElementById("qrswitchbutton").style.visibility = "hidden";
		var qrBackground = document.getElementById("qrbackground");
		qrBackground.parentNode.removeChild(qrBackground);
	}

	function switchCameraQR() {
		currentCamera = (currentCamera + 1) % 2;
		QRScanner.useCamera(currentCamera, function(err, status){});
	}

	qrcode.scanQRCode = function(okCallback, cancelCallback) {
		currentCamera = 0;
		qrCancelCallback = cancelCallback;
		var qrBackground = document.createElement('div');
		qrBackground.className = "first-qrbackground";
		qrBackground.id = "qrbackground";
		document.getElementById("app").appendChild(qrBackground);
		document.getElementById("qrclosebutton").addEventListener('click', closeQR);
		document.getElementById("qrswitchbutton").addEventListener('click', switchCameraQR);
		QRScanner.prepare(function(err, status) {
			document.getElementById("app").style.opacity = 0;
			document.getElementById("qrclosebutton").style.visibility = "visible";
			document.getElementById("qrswitchbutton").style.visibility = "visible";
			if (err) {
				console.log("Error "+err);
			} else {
				QRScanner.scan(function(err, code) {
					if (err) {
						console.log("Error "+err);
					} else {
						if (okCallback) {
							okCallback(code);
						}
					}
					qrcode.cancelScan();
					document.getElementById("app").style.opacity = 1;
					document.getElementById("qrclosebutton").style.visibility = "hidden";
					document.getElementById("qrswitchbutton").style.visibility = "hidden";
				});
				QRScanner.show(function(status) {});
			}
		});
	}
	
	qrcode.cancelScan = function() {
		QRScanner.cancelScan(function(status){});
		qrCancelCallback = null;
		document.getElementById("qrclosebutton").removeEventListener('click', closeQR);
		document.getElementById("qrswitchbutton").removeEventListener('click', switchCameraQR);
		var qrBackground = document.getElementById("qrbackground");
		if (qrBackground) qrBackground.parentNode.removeChild(qrBackground);
	}

	return qrcode;
});
