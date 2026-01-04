define(["FileSaver", "sugar-web/datastore", "platform/shared"], function (
	FileSaver,
	datastore,
	{ writeFileToStore, validTypes, csvTypes }
) {
	function saveFileWeb({ filename, text, binary, mimetype }) {
		const blob = new Blob(text ? [text] : [binary], { type: mimetype });
		FileSaver.saveAs(blob, filename);
	}

	async function readFileWeb() {
		try {
			const input = document.createElement("input");
			input.type = "file";
			input.multiple = true;

			const files = await new Promise((resolve, reject) => {
				input.onchange = (e) => resolve(e.target.files);
				input.oncancel = () =>
					reject(new Error("File selection was cancelled"));
				input.click();
			});

			if (!files || files.length === 0) {
				console.log("No files were selected");
				return;
			}

			// Process each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				try {
					const text = await loadFileWeb(file);
					writeFileToStore(file, text);
				} catch (err) {
					console.error("Error in readFileWeb", file.name, err);
				}
			}
		} catch (err) {
			if (err.message === "File selection was cancelled") {
				console.log(err.message);
			} else {
				console.error("An unexpected error occurred:", err);
			}
		}
	}

	function openDocInWeb(metadata, text) {
		// Convert blob object URL
		const blob = base64toBlob(metadata.mimetype, text);
		const blobUrl = URL.createObjectURL(blob);

		// Open in a new browser tab
		window.open(blobUrl, "_blank");
	}

	//helper functions
	function loadFileWeb(file) {
		return new Promise((resolve, reject) => {
			if (!validTypes.includes(file.type)) {
				reject(new Error("Invalid file type:", file.type));
			}

			const reader = new FileReader();

			reader.onload = function () {
				resolve(reader.result);
			};

			reader.onerror = function () {
				reject(new Error("Error reading file:", file.name));
			};

			if (
				file.type === "application/json" ||
				file.type === "text/plain" ||
				csvTypes.includes(file.type)
			) {
				reader.readAsText(file);
			} else {
				reader.readAsDataURL(file);
			}
		});
	}

	function base64toBlob(mimetype, base64) {
		var contentType = mimetype;
		var byteCharacters = atob(
			base64.substr(base64.indexOf(";base64,") + 8)
		);
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
		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}

	return { saveFileWeb, readFileWeb, openDocInWeb };
});
