// preload.js: preload script to expose APIs to the renderer process in a secure way
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	saveFile: (arg) => ipcRenderer.send("save-file-dialog", arg),
	onSaveFileReply: (cb) => ipcRenderer.once("save-file-reply", (_e, arg) => cb(arg)),

	readFile: () => ipcRenderer.send("choose-files-dialog"),
	onReadFileReply: (cb) => ipcRenderer.once("choose-files-reply", (_e, file, err, text) => cb(file, err, text)),

	chooseDirectory: () => ipcRenderer.send("choose-directory-dialog"),
	onChooseDirectoryReply: (cb) => ipcRenderer.once("choose-directory-reply", (_e, dir) => cb(dir)),

	createTempfile: (arg) => ipcRenderer.send("create-tempfile", arg),
	onCreateTempfileReply: (cb) => ipcRenderer.once("create-tempfile-reply", (_e, p) => cb(p)),
});