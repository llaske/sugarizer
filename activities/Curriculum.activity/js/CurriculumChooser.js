define(['sugar-web/env', 'mustache'], function(env, mustache) {
	var userSettings = null;
	env.getEnvironment(function(err, environment) {
		userSettings = environment.user;
	});

	// Chooser feature to search in Curriculum database
	var featureCurriculum = {};
	featureCurriculum.id = "curriculum-button";
	featureCurriculum.title = "$titleCurriculum";
	featureCurriculum.placeholder = "$holderSearchCurriculum";
	featureCurriculum.icon = "activity/activity-icon.svg";
	featureCurriculum.beforeActivate = function () {
		document.getElementById('favorite-button').style.visibility = "hidden";
		featureCurriculum.curriculumInit(featureCurriculum.curriculumFill);
	};
	featureCurriculum.beforeUnactivate = function () {
		document.getElementById('favorite-button').style.visibility = "visible";
	};
	featureCurriculum.onFavorite = function () { };
	featureCurriculum.onScroll = function () {
		var container = document.getElementById('journal-container');
		var scrollValue = (container.scrollTop) / (container.scrollHeight - container.clientHeight);
		if (scrollValue > 0.90) {
			featureCurriculum.resultCount += 30;
			featureCurriculum.curriculumDisplay(featureCurriculum.results, featureCurriculum.resultCount);
		}
	};
	featureCurriculum.onSearch = function () {
		featureCurriculum.curriculumFill();
	};
	featureCurriculum.onCancelSearch = function () {
		featureCurriculum.curriculumFill();
	};


	featureCurriculum.fileformat = ".jpg";
	featureCurriculum.filelocation = "js/imported/";
	featureCurriculum.mimetype = "image/png";


	// --- Curriculum feature functions

	// Load Curriculum database
	featureCurriculum.curriculumInit = function(callback) {
		featureCurriculum.database = {};
		document.getElementById('journal-empty').style.visibility = 'visible';
		featureCurriculum.baseURL = document.location.href.substr(0, document.location.href.indexOf("/activities/")) + "/activities/Curriculum.activity/";
		featureCurriculum.lang = (["en", "es", "fr"].indexOf(userSettings.language) != -1) ? userSettings.language : "en";
		featureCurriculum.filelocation = featureCurriculum.filelocation.replace("{{lang}}", featureCurriculum.lang);
		var loadDatabase = function (file, entry, subcallback) {
			var client = new XMLHttpRequest();
			var source = featureCurriculum.baseURL + file;
			client.onload = function () {
				if (entry == "ping") {
					featureCurriculum.database[entry] = (this.status == 0 || (this.status >= 200 && this.status < 300));
				} else if (this.status == 0 || (this.status >= 200 && this.status < 300)) {
					featureCurriculum.database[entry] = JSON.parse(this.responseText);
				}
				subcallback();
			};
			client.open("GET", source);
			client.send();
		};
		loadDatabase("js/imported/sections.json", "sections", function () {
			loadDatabase("js/imported/_ping.png?" + (new Date()).getTime(), "ping", function () {
				var sections = featureCurriculum.database.sections;
				var entries = [];
				for (var i = 0; i < sections.length; i++) {
					if (sections[i].isDomaine) continue;

					for (var j = 0; j < sections[i].items.length; j++) {
						entries.push({ "code": sections[i].items[j].uuid, "text": sections[i].items[j].titre });
					}
				}

				entries.sort(function (a, b) {
					return a.text.localeCompare(b.text, 'en', { sensitivity: 'base' });
				});

				var sortedEntries = [];
				for (var i = 0; i < entries.length; i++) {
					entries[i].i = sortedEntries.length;
					sortedEntries.push(entries[i]);
				}
				featureCurriculum.database.content = sortedEntries;
				callback();
			});
		});
	}

	// Fill popup with Curriculum items
	featureCurriculum.curriculumFill = function() {
		// Find entries matching search field
		var content = featureCurriculum.database.content;
		var title = document.getElementById('search-text').value.toLowerCase();
		if (title.length) {
			content = [];
			for (var i = 0; i < featureCurriculum.database.content.length; i++) {
				if (featureCurriculum.database.content[i].text.toLowerCase().indexOf(title) != -1) {
					content.push(featureCurriculum.database.content[i]);
				}
			}
		}

		// Display result
		featureCurriculum.results = content;
		featureCurriculum.resultCount = 30;
		featureCurriculum.curriculumDisplay(content, featureCurriculum.resultCount);
	}

	featureCurriculum.curriculumDisplay = function(content, count) {
		// Display entries
		var template = "\
		{{#items}}\
		<div id='entry_{{i}}' style='height:60px'>\
			<div id='eicon_{{i}}' class='toolbutton' style='background-image:url(../../activities/MediaViewer.activity/activity/activity-icon.svg);background-size:40px 40px;width:40px;height:40px;display:inline-block;margin-left:20px;margin-top:5px;'></div>\
			<div id='etext_{{i}}' style='color:black;display:inline-block;vertical-align:middle;margin-left:30px;height:60px;margin-top:10px;font-weight:bold;font-size:14px;'>{{text}}</div>\
		</div>\
		{{/items}}\
	";
		var items = { items: content.slice(0, count) };
		var render = mustache.render(template, items);
		document.getElementById('journal-empty').style.visibility = (content.length != 0 ? 'hidden' : 'visible');
		document.getElementById('journal-container').innerHTML = render;

		// Handle click
		var len = Math.min(count, content.length);
		for (var i = 0; i < len; i++) {
			var entry = document.getElementById('entry_' + content[i].i);
			entry.addEventListener('click', function (e) {
				var id = e.target.id;
				id = id.substr(id.indexOf("_") + 1);
				var line = document.getElementById('entry_' + id);
				line.style.backgroundColor = "#808080";
				featureCurriculum.curriculumCreateEntry(featureCurriculum.database.content[id], function () {
					modal.close(result);
				});
			});
			if (featureCurriculum.mimetype == "image/png") {
				document.getElementById('eicon_' + content[i].i).style.backgroundImage = "url(" + (featureCurriculum.database.ping ? featureCurriculum.baseURL : featureCurriculum.database.url) + featureCurriculum.filelocation + content[i].code + featureCurriculum.fileformat + ")";
			}
		}
	}

	// Create a record in Journal for the entry
	featureCurriculum.curriculumCreateEntry = function(entry, callback) {
		var url = featureCurriculum.database.ping ? featureCurriculum.baseURL : featureCurriculum.database.url;
		var mimetype = featureCurriculum.mimetype;
		var request = new XMLHttpRequest();
		request.open("GET", url + featureCurriculum.filelocation + entry.code + featureCurriculum.fileformat, true);
		request.setRequestHeader("Content-type", mimetype);
		request.responseType = "arraybuffer";
		var that = this;
		request.onload = function () {
			if (request.status == 200 || request.status == 0) {
				var blob = new Uint8Array(this.response);
				var base64 = "data:" + mimetype + ";base64," + toBase64(blob);
				var metadata = {
					mimetype: mimetype,
					title: entry.text + featureCurriculum.fileformat,
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				datastore.create(metadata, function (err, objectId) {
					console.log("Entry '" + entry.text + "' saved in journal.");
					result = { metadata: metadata, objectId: objectId };
					callback();
				}, base64);
			} else {
				console.log("Error loading entry '" + entry.code + "'.");
				callback();
			}
		};
		request.onerror = function () {
			console.log("Error loading entry '" + entry.code + "'.");
			callback();
		};
		request.send();
	}

	return featureCurriculum;
});	