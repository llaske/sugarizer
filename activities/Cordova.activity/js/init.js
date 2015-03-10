
function show_accelerometer() {
	show_items(false, true, false, false, false, false, false);
}

function show_camera() {
	show_items(false, false, true, false, false, false, false);
}

function show_dialog() {
	show_items(false, false, false, true, false, false, false);
}

function show_device() {
	show_items(false, false, false, false, true, false, false);
}

function show_network() {
	show_items(false, false, false, false, false, true, false);
}
		
function show_globalization() {
	show_items(false, false, false, false, false, false, true);
}

function show_items(bapp, baccelerometer, bcamera, bdialog, bdevice, bnetwork, bglobalization) {
	if (!app.compliant) return;
	document.getElementById("app").style.display = bapp ? "block" : "none";
	document.getElementById("accelerometer").style.display = baccelerometer ? "block" : "none";
	document.getElementById("camera").style.display = bcamera ? "block" : "none";
	document.getElementById("dialog").style.display = bdialog ? "block" : "none";
	document.getElementById("device").style.display = bdevice ? "block" : "none";
	document.getElementById("network").style.display = bnetwork ? "block" : "none";
	document.getElementById("globalization").style.display = bglobalization ? "block" : "none";
}


//ACCELEROMETER - TEST 1 
// onSuccess: Get a snapshot of the current acceleration
//
 function onSuccess_accelerometer1(acceleration) {
alert('Acceleration X: ' + acceleration.x + '\n' +
	 'Acceleration Y: ' + acceleration.y + '\n' +
	 'Acceleration Z: ' + acceleration.z + '\n' +
	 'Timestamp: '      + acceleration.timestamp + '\n');
 }

 // onError: Failed to get the acceleration
 //
 function onError_accelerometer1() {
alert('onError!');
 }


//ACCELEROMETER - TEST 2
// Start watching the acceleration
//
 function startWatch() {

// Update acceleration every 3 seconds
var options = { frequency: 3000 };

watchID = navigator.accelerometer.watchAcceleration(onSuccess_accelerometer2, onError_accelerometer2, options);
 }

 // onSuccess: Get a snapshot of the current acceleration
 //
 function onSuccess_accelerometer2(acceleration) {
var element = document.getElementById('accelerometervalue');
element.innerHTML = 'Acceleration X: ' + acceleration.x         + ', ' +
				'Acceleration Y: ' + acceleration.y         + ', ' +
				'Acceleration Z: ' + acceleration.z         + '\n' +
				'Timestamp: '      + acceleration.timestamp + '\n';
 }

 // onError: Failed to get the acceleration
 //
 function onError_accelerometer2() {
alert('onError!');
 }


	 //ACCELEROMETER - TEST 3
 // Stop watching the acceleration
 //
 function stopWatch() {
if (watchID) {
navigator.accelerometer.clearWatch(watchID);
watchID = null;
}
 }


		 //CAMERA PLUGIN
 function getPicture1(){ 
	   console.log("getPicture1");
	   navigator.camera.getPicture(onSuccess_camera, onFail_camera, { quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
								sourceType: Camera.PictureSourceType.PHOTOLIBRARY
			});
 }


 function getPicture2(){
	   console.log("getPicture2");
	   navigator.camera.getPicture(onSuccess_camera, onFail_camera, { quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
								sourceType: Camera.PictureSourceType.CAMERA
			});
 }



function onSuccess_camera(imageData) {
		  console.log(imageData);
	var image = document.getElementById('myImage');
	image.src = "data:image/jpeg;base64," + imageData;

}

function onFail_camera(message) {
	alert('Failed because: ' + message);
}


//DIALOG PLUGIN
function alertDismissed() {
		var element = document.getElementById('insert_dialog');
		element.innerHTML = 'hello !';
}


function onConfirm(buttonIndex) {
	alert('You selected button ' + buttonIndex);
}

function onPrompt(results) {
	alert("You selected button number " + results.buttonIndex + " and entered " + results.input1);
}

//NETWORK CONNECTION PLUGIN
function checkConnection() {
	var networkState = navigator.connection.type;

	var states = {};
	states[Connection.UNKNOWN]  = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI]     = 'WiFi connection';
	states[Connection.CELL_2G]  = 'Cell 2G connection';
	states[Connection.CELL_3G]  = 'Cell 3G connection';
	states[Connection.CELL_4G]  = 'Cell 4G connection';
	states[Connection.CELL]     = 'Cell generic connection';
	states[Connection.NONE]     = 'No network connection';

	alert('Connection type: ' + states[networkState]);
}

app.initialize();
