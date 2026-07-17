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
			window.electronAPI.onSaveFileReply((arg) => {
				if (arg.err) {
					reject(new Error(arg.err));
				} else {
					resolve();
				}
			});
			window.electronAPI.saveFile({
				directory,
				filename,
				mimetype,
				extension,
				text,
				binary,
			});
		});
	}

	function readFileElecton() {
		window.electronAPI.readFile();

		return new Promise((resolve, reject) => {
			window.electronAPI.onReadFileReply((file, err, text) => {
				if (err) {
					reject(err);
					console.error("Error in readFileElecton:", err);
				} else {
					writeFileToStore(file, text);
					resolve();
				}
			});
		});
	}

	return { saveFileElectron, readFileElecton };
});
