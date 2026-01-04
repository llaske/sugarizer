define(["platform/shared"], function ({ writeFileToStore }) {
	function saveFileElectron({
		filename,
		text,
		binary,
		mimetype,
		extension,
		directory,
	}) {
		return new Promise((resolve, reject) => {
			const ipc = require("electron").ipcRenderer;
			ipc.removeAllListeners("save-file-reply");

			ipc.send("save-file-dialog", {
				directory,
				filename,
				mimetype,
				extension,
				text,
				binary,
			});

			ipc.once("save-file-reply", (event, arg) => {
				if (arg.err) {
					reject(new Error(arg.err));
				} else {
					resolve();
				}
			});
		});
	}

	function readFileElecton() {
		const ipc = require("electron").ipcRenderer;
		ipc.removeAllListeners("choose-files-reply");
		ipc.send("choose-files-dialog");

		return new Promise((resolve, reject) => {
			ipc.once("choose-files-reply", (event, file, err, text) => {
				if (err) {
					reject(err);
					console.erro("Error in readFileElecton:", error);
				} else {
					writeFileToStore(file, text);
					resolve();
				}
			});
		});
	}

	// function openDocInElectron(metadata, text) {
	// 	const shell = require("electron").shell;
	//
	// 	ipc.removeAllListeners("create-tempfile-reply");
	// 	ipc.send("create-tempfile", { metadata, text });
	// 	ipc.on("create-tempfile-reply", function (event, file) {
	// 		// Open in a shell
	// 		shell.openExternal("file://" + file);
	// 	});
	// }
	return { saveFileElectron, readFileElecton };
});
