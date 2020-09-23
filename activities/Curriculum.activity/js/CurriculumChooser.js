define(['mustache'], function(mustache) {
	// Localize the strings
	var l10n = {
		stringHolderSearchCurriculum: ''
	}

	// Chooser feature to search in Curriculum database
	var featureCurriculum = {};
	featureCurriculum.id = "curriculum-button";
	featureCurriculum.title = "Curriculum";
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
	featureCurriculum.filelocation = "images/skills/";
	featureCurriculum.mimetype = "image/png";


	// --- Curriculum feature functions

	// Load Curriculum database
	featureCurriculum.curriculumInit = function(callback) {
		// Uses SugarL10n Vue component
		app.$refs.SugarL10n.localize(l10n);

		featureCurriculum.database = {};
		document.getElementById('journal-empty').style.visibility = 'visible';
		featureCurriculum.placeholder = l10n.stringHolderSearchCurriculum;	
		featureCurriculum.baseURL = document.location.href.substr(0, document.location.href.indexOf("/activities/")) + "/activities/Curriculum.activity/";

		requirejs(["text!../defaultTemplates/Kindergarten.json"], function (data) {
			var data = JSON.parse(data);
			var categories = data.categories;
			var entries = [];
			for (var i = 0; i < categories.length; i++) {
				for (var j = 0; j < categories[i].skills.length; j++) {
					entries.push({ 
						"code": categories[i].skills[j].image, 
						"text": app.$refs.SugarL10n.get(categories[i].skills[j].title),
					});
				}
			}

			entries.sort(function (a, b) {
				return a.text.localeCompare(b.text, 'en', { sensitivity: 'base' });
			});

			var sortedEntries = [];
			for (var i = 0; i < entries.length; i++) {
				entries[i].id = i;
				sortedEntries.push(entries[i]);
			}
			featureCurriculum.database.content = sortedEntries;
			callback();
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
			<div id='entry_{{id}}' style='height:60px'>\
				<div id='eicon_{{id}}' class='toolbutton' style='background-image:url(../../activities/MediaViewer.activity/activity/activity-icon.svg);background-size:40px 40px;width:40px;height:40px;display:inline-block;margin-left:20px;margin-top:5px;'></div>\
				<div id='etext_{{id}}' style='color:black;display:inline-block;vertical-align:middle;margin-left:30px;height:60px;margin-top:10px;font-weight:bold;font-size:14px;'>{{text}}</div>\
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
			var entry = document.getElementById('entry_' + content[i].id);
			entry.addEventListener('click', function (e) {
				var id = e.target.id;
				id = id.substr(id.indexOf("_") + 1);
				var line = document.getElementById('entry_' + id);
				line.style.backgroundColor = "#808080";

				var metadata = {
					mimetype: featureCurriculum.mimetype,
					title: featureCurriculum.database.content[id].text + featureCurriculum.fileformat,
					activity: "org.olpcfrance.Curriculum",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};

				var result = { 
					metadata: metadata, 
					path: featureCurriculum.database.content[id].code
				}
				requirejs(['sugar-web/graphics/journalchooser'], function(journalchooser) {
					journalchooser.close(result);
				});
			});
			if (featureCurriculum.mimetype == "image/png") {
				document.getElementById('eicon_' + content[i].id).style.backgroundImage = "url(" + featureCurriculum.baseURL + content[i].code + ")";
			}
		}
	}

	return featureCurriculum;
});	