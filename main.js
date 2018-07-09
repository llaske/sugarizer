// Main file, used only for Electron

var electron = require('electron');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

var requirejs = require('requirejs');

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		show: false,
		backgroundColor: '#FFF',
		minWidth: 640,
		minHeight: 480,
		webPreferences: {webSecurity: false}
	});

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	// Wait for 'ready-to-show' to display our window
	mainWindow.once('ready-to-show', function() {
		mainWindow.show();
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X force quit like on other platforms
	if (process.platform == 'darwin') {
		app.quit()
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});
