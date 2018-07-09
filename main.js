// Main file, used only for Electron

var electron = require('electron'),
	fs = require('fs'),
	ini = require('ini');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;

var mainWindow = null;

var requirejs = require('requirejs');


// Localization features
l10n = {
	ini: null,
	language: '*',

	init: function() {
		var env = process.env;
		var language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
		this.language = (language && language.length >= 2) ? language.substr(0, 2) : "*";
		this.ini = ini.parse(fs.readFileSync('./locale.ini', 'utf-8'));
	},

	setLanguage: function(lang) {
		this.language = lang;
	},

	getLanguage: function() {
		return this.language;
	},

	get: function(text, params) {
		var locales = this.ini[this.language];
		if (!locales) {
			locales = this.ini['*'];
		}
		if (!locales[text]) {
			return text;
		}
		var translate = locales[text];
		for (var param in params) {
			translate = translate.replace('{{'+param+'}}', params[param]);
		}
		return translate;
	}
}

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
		// Initialize locales
		l10n.init();

		// Build menu
		var template = [];
		if (process.platform === 'darwin') {
			var appname = electron.app.getName();
			var menu = {
				label: appname,
				submenu: [{
					label: 'Quit',
					accelerator: 'Command+Q',
					click: function () {
						app.quit()
					}
				}]
			};
			menu.submenu[0].label = l10n.get("Quit");
			template.unshift(menu);
		}
		var menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);

		// Show wmain window
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
