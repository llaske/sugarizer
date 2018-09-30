// Main file, used only for Electron

var electron = require('electron'),
	fs = require('fs'),
	ini = require('ini'),
	requirejs = require('requirejs');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;
var ipc = electron.ipcMain;
var dialog = electron.dialog;

var mainWindow = null;

var debug = false;



// Localization features
l10n = {
	ini: null,
	language: '*',

	init: function() {
		this.language = app.getLocale() || "*";
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
	// Create the browser window
	mainWindow = new BrowserWindow({
		show: false,
		backgroundColor: '#FFF',
		minWidth: 640,
		minHeight: 480,
		webPreferences: {webSecurity: false},
		icon: './res/icon/electron/icon-1024.png'
	});
	if (process.platform === 'darwin') {
		app.dock.setIcon('./res/icon/electron/icon-1024.png');
	}

	// Load the index.html of Sugarizer
	mainWindow.loadFile('index.html');

	// Wait for 'ready-to-show' to display our window
	mainWindow.once('ready-to-show', function() {
		// Initialize locales
		l10n.init();

		// Handle save file dialog
		ipc.on('save-file-dialog', function(event, arg) {
			dialog.showSaveDialog({
				title: l10n.get("SaveFile"),
				defaultPath: arg.filename,
				buttonLabel: l10n.get("Save"),
				filters: [
					{ name: arg.mimetype, extensions: [arg.extension] }
				]
			}, function(file) {
				if (file) {
					var buf;
					if (arg.text) {
						buf = arg.text;
					} else {
						var data = arg.binary.replace(/^data:.+;base64,/, "");
						buf = new Buffer(data, 'base64');
					}
					fs.writeFile(file, buf, function(err) {
						event.sender.send('save-file-reply', {err: err, filename: file});
					});
				}
			});
		});

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

		// Debug console
		if (debug) {
			mainWindow.webContents.openDevTools();
		}

		// Show wmain window
		mainWindow.show();
	});

	// Emitted when the window is closed
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
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
