define(["platform/handler"], function (platform) {
	const file = {};

	// Write a new file
	file.writeFile = async function (directory, metadata, content) {
		let binary = null;
		let text = null;
		let extension = "json";
		let title = metadata.title;
		let mimetype = "application/json";

		if (metadata && metadata.mimetype) {
			mimetype = metadata.mimetype;
			extension = getFileExtension(mimetype);
			if (mimetype.startsWith("text/")) {
				text = content;
			} else {
				binary = base64DecToArr(
					content.substr(content.indexOf("base64,") + 7)
				).buffer;
			}
		} else {
			text = JSON.stringify({ metadata: metadata, text: content });
		}

		let filename = title;
		if (!filename.endsWith(`.${extension}`)) {
			filename += `.${extension}`;
		}
		await platform.saveFile({
			filename,
			text,
			binary,
			mimetype,
			directory,
		});
		return filename;
	};

	function getFileExtension(mimetype) {
		const mimetypeExtensions = {
			"image/jpeg": "jpg",
			"image/png": "png",
			"audio/wav": "wav",
			"video/webm": "webm",
			"audio/mp3": "mp3",
			"audio/mpeg": "mp3",
			"video/mp4": "mp4",
			"text/plain": "txt",
			"application/pdf": "pdf",
			"application/msword": "doc",
			"application/vnd.oasis.opendocument.text": "odt",
			"text/csv": "csv",
		};

		return mimetypeExtensions[mimetype] || "bin";
	}

	function base64DecToArr(sBase64, nBlocksSize) {
		var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
			nInLen = sB64Enc.length,
			nOutLen = nBlocksSize
				? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
				: (nInLen * 3 + 1) >> 2,
			taBytes = new Uint8Array(nOutLen);
		for (
			var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
			nInIdx < nInLen;
			nInIdx++
		) {
			nMod4 = nInIdx & 3;
			nUint24 |=
				b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (
					nMod3 = 0;
					nMod3 < 3 && nOutIdx < nOutLen;
					nMod3++, nOutIdx++
				) {
					taBytes[nOutIdx] =
						(nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
				}
				nUint24 = 0;
			}
		}
		return taBytes;
	}
	// Decoding functions taken from
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	function b64ToUint6(nChr) {
		return nChr > 64 && nChr < 91
			? nChr - 65
			: nChr > 96 && nChr < 123
			? nChr - 71
			: nChr > 47 && nChr < 58
			? nChr + 4
			: nChr === 43
			? 62
			: nChr === 47
			? 63
			: 0;
	}

	// Ask the user a set files and write it to datastore
	file.askAndReadFiles = async function () {
		await platform.readFile();
	};

	// Open the content as a document in a new Window
	file.openAsDocument = function (metadata, text, objectId) {
		platform.openAsDocument(metadata, text, objectId);
	};

	return file;
});
