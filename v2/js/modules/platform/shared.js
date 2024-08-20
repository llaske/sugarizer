define(["sugar-web/datastore"], function (datastore) {
	const csvTypes = [
		"application/vnd.ms-excel",
		"text/csv",
		"text/x-csv",
		"text/tab-separated-values",
		"text/comma-separated-values",
	];
	const documentTypes = [
		"text/plain",
		"application/pdf",
		"application/msword",
		"application/vnd.oasis.opendocument.text",
	];

	const imageTypes = ["image/jpeg", "image/png"];
	const audioTypes = ["audio/wav", "audio/mp3", "audio/mpeg"];
	const videoTypes = ["video/webm", "video/mp4"];

	const otherTypes = ["application/json"];

	const validTypes = [
		...imageTypes,
		...audioTypes,
		...videoTypes,
		...documentTypes,
		...otherTypes,
	];

	async function writeFileToStore(file, text) {
		let metadata, content;
		if (file.type == "application/json") {
			// Handle JSON file
			let data = null;
			try {
				data = JSON.parse(text);
				if (!data.metadata) {
					throw new Error("No metadata found");
					return;
				}
			} catch (e) {
				throw new Error(`Error reading file: ${e}`);
				return;
			}
			metadata = data.metadata;
			content = data.text;
		} else {
			let activity = "";
			let mimetype = file.type;
			if (csvTypes.includes(file.type)) {
				activity = "org.sugarlabs.ChartActivity";
				mimetype = "text/csv";
			} else if (!documentTypes.includes(file.type)) {
				activity = "org.olpcfrance.MediaViewerActivity";
			}
			metadata = {
				title: file.name,
				mimetype: mimetype,
				activity: activity,
			};
			content = text;
		}

		if (metadata.assignmentId) {
			sugarizer.modules.humane.log(
				sugarizer.modules.i18next.t("CannotDuplicateAssignment", {
					file: file.name,
				})
			);
			return;
		}

		metadata.timestamp = new Date().getTime();
		metadata.creation_time = new Date().getTime();

		await createInDatastore(metadata, content);
	}

	function createInDatastore(metadata, content) {
		return new Promise((resolve, reject) => {
			datastore.create(metadata, resolve, content);
		});
	}

	return { writeFileToStore, validTypes, csvTypes, documentTypes };
});
