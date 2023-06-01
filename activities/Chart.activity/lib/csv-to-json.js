const CSVParser = {
	_detectDelimiter: function (lines) {
		const delimiters = [",", "\t", ";", "|"];
		let detectedDelimiter = "";
		let maxCount = 0;

		lines = lines.slice(0, 4);
		delimiters.forEach((delimiter) => {
			let delimiterCount = 0;
			lines.forEach((line) => {
				// check delimiter outside of quoted strings
				delimiterCount += line
					.split('"')
					.filter((_, index) => index % 2 === 0)
					.join("")
					.split(delimiter).length;
			});

			if (delimiterCount > maxCount) {
				maxCount = delimiterCount;
				detectedDelimiter = delimiter;
			}
		});

		return detectedDelimiter;
	},

	_convertToJSON: function (lines, delimiter) {
		const data = [];

		const headers = lines[0].split(delimiter).map((header) => header.replace(/"/g, "").trim());
		let multilineField = false;
		let value = "";
		let inQuotes = true;
		let currentIndex = 0;
		let row = {};

		for (let i = 1; i < lines.length; i++) {
			const currentLine = lines[i];
			if (!multilineField) {
				currentIndex = 0;
				inQuotes = false;
				value = "";
				row = {};
			}

			for (let j = 0; j < currentLine.length; j++) {
				const currentChar = currentLine[j];
				const nextChar = currentLine[j + 1];

				if (currentChar === '"') {
					// Ending quote
					if (j === currentLine.length - 1) {
						if (multilineField) multilineField = false;
						value = value.trim();
						row[headers[currentIndex]] = value;
						// Preserve ""quote text""
					} else if (inQuotes && nextChar === '"') {
						j++;
						value += '"';
					} else {
						if (multilineField) multilineField = false;
						inQuotes = !inQuotes;
					}
				} else if (currentChar === delimiter && !inQuotes) {
					value = value.trim();
					row[headers[currentIndex]] = value;

					value = "";
					currentIndex++;
				} else {
					value += currentChar;
					// Ending without quote
					if (j === currentLine.length - 1) {
						if (!inQuotes) {
							value = value.trim();
							row[headers[currentIndex]] = value;
						} else {
							multilineField = true;
							value += " ";
						}
					}
				}
			}

			if (!multilineField) data.push(row);
		}
		return data;
	},

	csvToJson: function (csvContent, delimiter) {
		const lines = csvContent.trim().split(/\r\n|\n|\r/);
		delimiter = delimiter || this._detectDelimiter(lines);
		return this._convertToJSON(lines, delimiter);
	},

	jsonToCsv: function (jsonObj, delimiter = ",") {
		if (!jsonObj.length) return;
		const headers = Object.keys(jsonObj[0]);
		let csvContent = headers.join(delimiter) +"\n";
		jsonObj.forEach((obj) => {
			let row = [];
			headers.forEach(header => {
				const value = `"${obj[header]}"`;
				row.push(value);
			});
			csvContent += row.join(delimiter) + "\n";
		})
		return csvContent;
	}
};
