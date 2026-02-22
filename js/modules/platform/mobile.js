define(function () {
	async function saveFileMobile({ filename, text, binary, mimetype }) {
		const cordovaFileStorage = sugarizer.constant.platform.ios
			? cordova.file.documentsDirectory
			: cordova.file.externalRootDirectory;

		try {
			const directory = await new Promise((resolve, reject) => {
				window.resolveLocalFileSystemURL(
					cordovaFileStorage,
					resolve,
					reject
				);
			});

			const file = await new Promise((resolve, reject) => {
				directory.getFile(filename, { create: true }, resolve, reject);
			});

			const fileWriter = await new Promise((resolve, reject) => {
				file.createWriter(resolve, reject);
			});

			fileWriter.seek(fileWriter.length);

			await new Promise((resolve, reject) => {
				fileWriter.onwriteend = resolve;
				fileWriter.onerror = reject;

				if (text) {
					const blob = new Blob([text], { type: mimetype });
					fileWriter.write(blob);
				} else {
					fileWriter.write(binary);
				}
			});

			return file.fullPath;
		} catch (error) {
			throw new Error(`Failed to save file: ${error.message}`);
		}
	}

	function openDocInAndroid(metadata, text) {
		const cordovaFileStorage = sugarizer.constant.platform.ios
			? cordova.file.documentsDirectory
			: cordova.file.externalCacheDirectory;

		window.resolveLocalFileSystemURL(
			cordovaFileStorage,
			function (directory) {
				directory.getFile(
					"sugarizertemp",
					{ create: true, exclusive: false },
					function (file) {
						if (!file) {
							return;
						}

						file.createWriter(function (fileWriter) {
							fileWriter.seek(fileWriter.length);
							const blob = base64toBlob(metadata.mimetype, text);
							fileWriter.write(blob);

							// Open in the file system
							const filename =
								cordovaFileStorage + "sugarizertemp";
							cordova.InAppBrowser.open(filename, "_system");
						});
					}
				);
			}
		);
	}
	function openDocInIOS(metadata, text, objectId) {
		// On iOS save in localStorage and display it as blob object in Open InApp window
		window.localStorage.setItem("sugar_inappbrowser_objectId", objectId);
		cordova.InAppBrowser.open("inapp.html", '_blank', 'location=no,closebuttoncaption='+sugarizer.modules.i18next.t("Ok"));
	}

	function openDocInMobile(metadata, text, objectId) {
		if (
			sugarizer.constant.platform.android ||
			sugarizer.constant.platform.androidChrome
		) {
			openDocInAndroid(metadata, text);
		} else {
			openDocInIOS(metadata, text, objectId);
		}
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

	return { saveFileMobile, openDocInMobile };
});
