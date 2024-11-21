define(function () {
	async function saveFileMobile({ filename, text, binary, mimetype }) {
		const cordovaFileStorage = platform.ios
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
		const cordovaFileStorage = enyo.platform.ios
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
	function openDocInIOS(metadata, text) {
		const blob = base64toBlob(metadata.mimetype, text);
		const blobUrl = URL.createObjectURL(blob);
		cordova.InAppBrowser.open(
			blobUrl,
			"_blank",
			"location=no,closebuttoncaption=" + l10n.get("Ok")
		);
	}

	function openDocInMobile(metadata, text) {
		if (
			sugarizer.constant.platform.android ||
			sugarizer.constant.platform.androidChrome
		) {
			openDocInAndroid(metadata, text);
		} else {
			openDocInIOS(metadata, text);
		}
	}

	return { saveFileMobile, openDocInMobile };
});
