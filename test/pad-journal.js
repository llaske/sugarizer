const axios = require("axios");
const crypto = require("crypto");

// Configuration
const config = {
	isSharedJournal: false,
	entries: 200,
	assignments: [
		{ type: "normal", count: 0 },
		{ type: "submitted", count: 0 },
		{ type: "expired", count: 0 },
		{ type: "lateTurnIn", count: 0 }, //that could be submitted after dueDate
	],
};

const args = process.argv.slice(2);
if (args.length < 2) {
	console.error(" To Pad Journal: node pad-journal <name> <password>");
	console.error(" To Delete Journal: node pad-journal <name> <password> -d");
	console.error(" To Change Config: modify config object in file");
	process.exit(1);
}

// Global Vars
const URL = "http://localhost:8080";
const loginURL = "/auth/login/";
const sendCloudURL = "/api/v1/journal/";

let user = null;
let token = null;

function getFutureDate(maxAddDays = 30) {
	const currentDate = new Date();
	const daysToAdd = Math.floor(Math.random() * maxAddDays) + 1;
	const futureDate = new Date(
		currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
	);
	return futureDate.getTime();
}
function getPastDate(maxPrevDays = 30) {
	const currentDate = new Date();
	const daysToSubtract = Math.floor(Math.random() * maxPrevDays) + 1;
	const pastDate = new Date(
		currentDate.getTime() - daysToSubtract * 24 * 60 * 60 * 1000,
	);
	return pastDate.getTime();
}

function getRandomActivity() {
	return user.favorites[Math.floor(Math.random() * user.favorites.length)];
}

function generateEntries() {
	const entries = [];

	for (let i = 0; i < config.entries; i++) {
		const activity = getRandomActivity();
		const title = `${activity.split(".")[2]}-${i + 1}`;
		const timestamp = getPastDate();
		entries.push({
			metadata: {
				title,
				title_set_by_user: "0",
				activity,
				activity_id: crypto.randomUUID(),
				creation_time:
					Math.random() > 0.5 ? timestamp - 8640000 : timestamp,
				timestamp,
				file_size: 0,
				textsize: Math.floor(Math.random() * 10000),
				buddy_name: user.name,
				buddy_color: user.color,
				keep: 1,
			},
			text: {
				link: "link-dummy",
			},
			objectId: crypto.randomUUID(),
		});
	}

	// Assignment entries
	for (const { type, count } of config.assignments) {
		for (let i = 0; i < count; i++) {
			const activity = getRandomActivity();
			const title = `${activity.split(".")[2]} Assg-${i + 1}`;
			const dueDate =
				type === "expired" || type === "lateTurnIn"
					? getPastDate()
					: getFutureDate();
			const creation_time = getPastDate();
			const lateTurnIn = type === "lateTurnIn";

			entries.push({
				metadata: {
					title,
					title_set_by_user: "0",
					activity,
					activity_id: crypto.randomUUID(),
					creation_time,
					timestamp: creation_time,
					file_size: 0,
					textsize: Math.floor(Math.random() * 10000),
					buddy_name: user.name,
					buddy_color: user.color,
					keep: 1,
					assignmentId: crypto.randomUUID(),
					submissionDate: type === "submitted" ? getPastDate() : null,
					dueDate,
					instructions: "instructions-placeholder",
					lateTurnIn,
					isSubmitted: type === "submitted",
				},
				text: {
					link: "link-placeholder",
				},
				objectId: crypto.randomUUID(),
			});
		}
	}

	return entries;
}

const computeHeader = function (token) {
	return { "x-key": token.x_key, "x-access-token": token.access_token };
};
function postJournalEntry(journalId, entry, token) {
	return new Promise(function (resolve, reject) {
		entry.metadata.user_id = token.x_key;
		var ajax = axios.create({
			responseType: "json",
			headers: computeHeader(token),
		});
		ajax.post(URL + sendCloudURL + journalId, {
			journal: JSON.stringify(entry),
		})
			.then(function (inResponse) {
				resolve(inResponse.data);
			})
			.catch(function (e) {
				reject(e);
			});
	});
}

function loginUser(user) {
	return new Promise(function (resolve, reject) {
		const [name, password] = args;
		const userValue = { name, password, role: ["student", "teacher"] };
		axios
			.post(URL + loginURL, { user: JSON.stringify(userValue) })
			.then(function (inResponse) {
				resolve(inResponse.data);
			})
			.catch(function (e) {
				reject(e);
			});
	});
}

async function padJournal() {
	try {
		const entries = generateEntries();
		let journalId;
		if (config.isSharedJournal) journalId = user.shared_journal;
		else journalId = user.private_journal;

		for (const entry of entries) {
			try {
				const response = await postJournalEntry(
					journalId,
					entry,
					token,
				);
			} catch (error) {
				console.error(`Failed to post entry ${entry.objectId}:`, error);
			}
		}
		console.log(
			`Successfully posted ${entries.length} entries to username: ${user.name}`,
		);
	} catch (e) {
		console.error(
			"Failed to log in or post entries:",
			e,
			e.code,
			e?.response?.status,
			e?.response?.data,
		);
	}
}

async function emptyJournal() {
	let journalId;
	if (config.isSharedJournal) journalId = user.shared_journal;
	else journalId = user.private_journal;
	try {
		const request = {
			field: "metadata",
		};
		const ajax = axios.create({
			responseType: "json",
			headers: computeHeader(token),
			params: request,
		});
		let res = await ajax.get(URL + sendCloudURL + journalId + "?limit=0");
		//prettier-ignore
		res = await ajax.get(URL + sendCloudURL + journalId + "?limit=" + res.data.total);

		res.data.entries.forEach(async (entry) => {
			const objectId = entry.objectId;
			var ajax = axios.create({
				responseType: "json",
				params: {
					oid: objectId,
					type: "partial",
				},
				headers: computeHeader(token),
			});
			await ajax.delete(URL + sendCloudURL + journalId);
		});
		console.log(
			`Successfully Deleted ${res.data.entries.length} entries from username: ${user.name} journal`,
		);
	} catch (error) {
		console.log("ERR: reading/emptying journal", error);
	}
}

async function main() {
	try {
		// Get & Set the user with token
		const response = await loginUser();
		user = response.user;
		token = {
			x_key: response.user._id,
			access_token: response.token,
		};
		if (args.includes("-d")) {
			await emptyJournal();
		} else {
			await padJournal();
		}
	} catch (e) {
		if (e.code == "ECONNREFUSED") {
			console.error("Please start the sugarizer-server:", e.code);
		} else console.error(e);
	}
}

main();
