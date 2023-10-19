const fs = require('fs');
const path = require('path');
const ini = require('ini');

function compareLanguageStrings(obj1, obj2) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	// Check if all keys in obj1 exist in obj2
	for (const key of keys1) {
		if (!keys2.includes(key)) {
			console.log(`\x1b[33mMissing key in [en]: ${key}\x1b[0m`);
			return false;
		}
	}

	// Check if all keys in obj2 exist in obj1
	for (const key of keys2) {
		if (!keys1.includes(key)) {
			console.log(`\x1b[33mMissing key in [*]: ${key}\x1b[0m`);
			return false;
		}
	}

	// Compare values, ignoring case
	for (const key of keys1) {
		const value1 = obj1[key].toLowerCase();
		const value2 = obj2[key].toLowerCase();

		if (value1 !== value2) {
			console.log(`\x1b[33mMismatched value for key '${key}': '${value1}' !== '${value2}'\x1b[0m`);
			return false;
		}
	}

	return true;
}


function checkLanguageStrings(defaultStrings, languageStrings) {
	if (!languageStrings) {
		console.log('\x1b[33mLanguage strings not found.\x1b[0m');
		return;
	}

	const isLanguageMatch = compareLanguageStrings(defaultStrings, languageStrings);

	if (isLanguageMatch) {
		console.log('\x1b[32mThe default language strings match the language strings.\x1b[0m');
	} else {
		console.log('\x1b[31mThe default language strings do not match the language strings.\x1b[0m');
	}
}

function loopThroughFolders(directory) {
	let num = 1;
	const folders = fs.readdirSync(directory, { withFileTypes: true });

	for (const folder of folders) {
		if (folder.isDirectory()) {
			const folderPath = path.join(directory, folder.name);
			const folderIniFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.ini'));

			if (folderIniFiles.length > 0) {
				console.log(num + 'INI file(s) found in: ', folderPath);
				num++;

				folderIniFiles.forEach((iniFile) => {
					const filePath = path.join(folderPath, iniFile);
					const localeData = fs.readFileSync(filePath, 'utf-8');

					try {
						const parsedData = ini.parse(localeData);
						const defaultStrings = parsedData['*'];
						const englishStrings = parsedData['en'];

						if (!defaultStrings) {
							console.log('\x1b[33mDefault language strings not found in:\x1b[0m', filePath);
							return;
						}


						if (!englishStrings) {
							console.log('\x1b[33mEnglish language strings not found in:\x1b[0m', filePath);
							return;
						}

						checkLanguageStrings(defaultStrings, englishStrings);
					} catch (error) {
						console.error(`\x1b[33mError parsing INI file: ${filePath}\x1b[0m`);
					}
				});
			}
		}
	}
}


const activityFolder = './activities';
loopThroughFolders(activityFolder);