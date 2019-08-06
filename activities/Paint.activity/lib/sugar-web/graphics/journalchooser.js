// Journal object chooser dialog
define(['picoModal','sugar-web/datastore','sugar-web/graphics/icon','mustache','sugar-web/env','sugar-web/graphics/radiobuttonsgroup'], function(picoModal,datastore,icon,mustache,env,radioButtonsGroup) {

	var chooser = {};

	// Load settings
	var userSettings = null;
	var activities = [];
	env.getEnvironment(function(err, environment) {
		userSettings = environment.user;
		for (var i = 0 ; userSettings.activities && i < userSettings.activities.length ; i++) {
			var activity = userSettings.activities[i];
			activities[activity.id] = activity;
		}
	});

	// Chooser feature to search in the Local Journal
	var featureLocalJournal = {};
	featureLocalJournal.id = "journal-button";
	featureLocalJournal.title = "$titleJournal";
	featureLocalJournal.placeholder = "$holderSearchJournal";
	featureLocalJournal.icon = "lib/sugar-web/graphics/icons/actions/activity-journal.svg";
	featureLocalJournal.beforeActivate = function() {
		fillJournal.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.beforeUnactivate = function() {
	};
	featureLocalJournal.onFavorite = function() {
		var favorite = document.getElementById('favorite-button');
		if (!featureLocalJournal.isFavorite) {
			icon.colorize(favorite, userSettings.colorvalue, function() {});
		} else {
			favorite.style.backgroundImage = "url(lib/sugar-web/graphics/icons/emblems/favorite.svg)";
		}
		featureLocalJournal.isFavorite = !featureLocalJournal.isFavorite;
		fillJournal.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.onSearch = function() {
		fillJournal.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.onCancelSearch = function() {
		fillJournal.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.isFavorite = false;

	// Chooser feature to search in Abecedarium database
	var featureAbecedarium = {};
	featureAbecedarium.id = "journal-button";
	featureAbecedarium.title = "$titleAbecedarium";
	featureAbecedarium.placeholder = "$holderSearchAbecedarium";
	featureAbecedarium.icon = "lib/sugar-web/graphics/icons/actions/activity-abecedarium.svg";
	featureAbecedarium.beforeActivate = function() {};
	featureAbecedarium.beforeUnactivate = function() {};
	featureAbecedarium.onFavorite = function() {};
	featureAbecedarium.onSearch = function() {};
	featureAbecedarium.onCancelSearch = function() {};

	// Display object chooser dialog with journal content
	// Each filter has the form = {title: "%hysics", creation_time: "<12222", activity: ["org.olpcfrance.Paint","org.olpcfrance.Record"]}
	// When more than one filter is provided, an entry is valid if it match one filter or more. Usage examples:
	// 		chooser.show();
	// 		chooser.show({title: 'Paint Activity', creation_time: '>'+now.getTime()});
	// 		chooser.show({title: ['Paint Activity', '%hysics']});
	// 		chooser.show({keep: 1});
	// 		chooser.show({activity: 'org.olpcfrance.PaintActivity'}, {mimetype: 'image/png'})
	var modal;
	var result;
	var features = [featureLocalJournal];
	var currentFeature = 0;
	chooser.show = function(callback, filter1, orFilter2, orFilter3, orFilter4) {
		result = null;
		var contentHeader = "<div id='pictotoolbar' class='toolbar' style='padding: 0'>";
		for (var i = 0 ; i < features.length ; i++) {
			contentHeader += "<button class='toolbutton"+(i==0?" active":"")+"' id='"+features[i].id+"' title='"+features[i].title+"' style='background-image: url("+features[i].icon+")'></button>";
		}
		contentHeader += "<button class='toolbutton pull-right' id='close-button' title='$titleClose' style='background-image: url(lib/sugar-web/graphics/icons/actions/dialog-cancel.svg)'></button>";
		contentHeader += "<div style='position: relative; display: inline-block; margin-left: 10px; vertical-align:middle; height:55px'>$titleChoose</div></div>";
		modal = picoModal({
			content: doLocalize(contentHeader+"\
				<div class='toolbar' style='border-top-style: solid; border-color: #c0c0c0; border-width: 1px'>\
					<span class='icon-input' style='vertical-align:top;'>\
					<input id='search-text' type='text' style='width: 200px; font-size: 10pt'/>\
					<button id='cancel-search' class='cancel right'></button>\
					</span>\
					<button class='toolbutton' id='favorite-button' title='$titleFavorite' style='background-image: url(lib/sugar-web/graphics/icons/emblems/favorite.svg)'></button>\
				</div>\
				<div id='journal-empty' style='position:absolute;width:100%;top:50%;left:50%'>\
					<div style='width:60px;height:60px;background-repeat: no-repeat;background-image: url(lib/sugar-web/graphics/icons/actions/activity-journal.svg)'></div>\
					<div style='text-align:left!important;margin-left:-30px;color:#808080;text-align:center;font-size:14px;'>$noMatchingEntries</div>\
				</div>\
				<div id='journal-container' style='width: 100%; overflow:auto'></div>"),
			closeButton: false,
			modalStyles: {
				backgroundColor: "white",
				height: "400px",
				width: "600px",
				maxWidth: "90%"
			}
		})
		.afterShow(function(modal) {
			var color = userSettings.colorvalue;
			icon.colorize(document.getElementById(features[currentFeature].id), color, function() {});
			var radios = [];
			for (var i = 0 ; i < features.length ; i++) {
				radios.push(document.getElementById(features[i].id));
			}
			new radioButtonsGroup.RadioButtonsGroup(radios);

			var targetHeight = document.getElementById("pictotoolbar").parentNode.offsetHeight - 55*2;
			document.getElementById('journal-container').style.height = targetHeight + "px";

			var favorite = document.getElementById('favorite-button');
			favorite.addEventListener('click', function() {
				features[currentFeature].onFavorite();
			});

			document.getElementById('search-text').addEventListener('keyup', function() {
				features[currentFeature].onSearch();
			});

			document.getElementById('cancel-search').addEventListener('click', function() {
				document.getElementById('search-text').value = '';
				features[currentFeature].onCancelSearch();
			});
			document.getElementById('close-button').addEventListener('click', function() {
				result = null;
				modal.close();
			});

			document.getElementById('search-text').placeholder=doLocalize(features[currentFeature].placeholder);
			features[currentFeature].filters = [filter1, orFilter2, orFilter3, orFilter4];
			features[currentFeature].beforeActivate();
		})
		.afterClose(function(modal) {
			modal.destroy();
			if (callback) {
				callback(result);
			}
		})
		.show();
	}

	// Get journal entries and fill dialog with entries
	function fillJournal(filter1, orFilter2, orFilter3, orFilter4) {
		// Get filters
		var filters = [];
		if (filter1) { filters.push(filter1); }
		if (orFilter2) { filters.push(orFilter2); }
		if (orFilter3) { filters.push(orFilter3); }
		if (orFilter4) { filters.push(orFilter4); }

		// Compute filtering
		var journal = datastore.find();
		var rawJournal = [];
		for (var i = 0 ; i < journal.length ; i++) {
			var entry = journal[i];
			var match = true;
			if (featureLocalJournal.isFavorite) {
				match = match && entry.metadata.keep;
			}
			var title = document.getElementById('search-text').value;
			if (title && title.length > 0) {
				match = match && (entry.metadata.title && (entry.metadata.title.indexOf(title) != -1));
			}
			if (match) {
				rawJournal.push(entry)
			}
		}
		var length = filters.length;
		var filteredJournal = rawJournal;
		if (length > 0) {
			filteredJournal = [];
			for(var i = 0 ; i < rawJournal.length ; i++) {
				var entry = rawJournal[i];
				var match = false;
				for (var j = 0 ; j < length ; j++) {
					match = match || filterMatch(entry, filters[j]);
				}
				if (match) {
					filteredJournal.push(entry);
				}
			}
		}

		// Get entries
		var journal = {entries: filteredJournal.sort(function(e0, e1) {
			return parseInt(e1.metadata.timestamp) - parseInt(e0.metadata.timestamp);
		})};

		// Add style properties
		for (var i = 0 ; i < journal.entries.length ; i++) {
			var entry = journal.entries[i];
			var activity = activities[entry.metadata.activity];
			entry.imageUrl = "../../" + activity.directory + "/" + activity.icon;
			entry.index = i;
			entry.ago = timestampToElapsedString(entry.metadata.creation_time);
		}

		// Draw it
		var template = "\
			{{#entries}}\
			<div id='entry_{{index}}' style='height:60px'>\
				<div id='eicon_{{index}}' class='toolbutton' style='background-image:url({{imageUrl}});background-size:40px 40px;width:40px;height:40px;display:inline-block;margin-left:20px;margin-top:5px;'></div>\
				<div id='etext_{{index}}' style='color:black;display:inline-block;vertical-align:middle;margin-left:30px;height:60px;margin-top:10px;font-weight:bold;font-size:14px;'>{{metadata.title}}</div>\
				<div id='edate_{{index}}' style='color:black;vertical-align:baseline;text-align:right;float:right;height:45px;padding-top:15px;margin-right:10px;clear:right;font-weight:normal;font-size:14px;'>{{ago}}</div>\
			</div>\
			{{/entries}}\
		";
		var render = mustache.render(template, journal);
		document.getElementById('journal-container').innerHTML = render;

		// Handle click
		for (var i = 0 ; i < journal.entries.length ; i++) {
			var entry = document.getElementById('entry_'+i);
			entry.addEventListener('click', function(e) {
				var id = e.target.id;
				id = id.substr(id.indexOf("_")+1);
				var line = document.getElementById('entry_'+id);
				line.style.backgroundColor = "#808080";
				result = journal.entries[id];
				delete result['ago'];
				delete result['index'];
				delete result['imageUrl'];
				window.setTimeout(function() {
					modal.close(result);
				}, 200);
			});
		}
		document.getElementById('journal-empty').style.visibility = (journal.entries.length != 0 ? 'hidden' : 'visible');
	}

	// Test if an entry match a value
	function entryMatch(entry, name, value) {
		var fieldValue = entry[name];
		if (!fieldValue) { return false; }
		var firstChar = value[0];
		if (firstChar == '%') {
			return fieldValue.indexOf(value.substr(1)) != -1;
		} else if (firstChar == '>') {
			return parseInt(fieldValue) > parseInt(value.substr(1));
		} else if (firstChar == '<') {
			return parseInt(fieldValue) < parseInt(value.substr(1));
		} else {
			return fieldValue == value;
		}
	}

	// Test if an entry match a filter
	function filterMatch(entry, filter) {
		var metadata = entry.metadata;
		var keys = Object.keys(filter);
		var match = true;
		for (var j = 0 ; j < keys.length ; j++) {
			var field = keys[j];
			var value = filter[field];
			if (value instanceof Array) {
				var or = false;
				for (var k = 0 ; k < value.length ; k++) {
					or = or || entryMatch(metadata, field, value[k]);
				}
				match = match && or;
			} else {
				match = match && entryMatch(metadata, field, value);
			}
		}
		return match;
	}


	// Util: Localize content - currently means only localize in English
	var l10n = {
		titleJournal: 'Local journal',
		titleAbecedarium: 'Abecedarium database',
		titleClose: 'Cancel',
		titleChoose: 'Choose an object',
		holderSearchJournal: 'Search in Journal',
		holderSearchAbecedarium: 'Search in Abecedarium database',
		noMatchingEntries: 'No matching entries',
		SecondsAgo: 'Seconds ago',
		Ago: ' ago',
		Minutes_one: 'minute',
		Minutes_other: 'minutes',
		Hours_one: 'hour',
		Hours_other: 'hours',
		Days_one: 'day',
		Days_other: 'days',
		Weeks_one: 'week',
		Weeks_other: 'weeks',
		Months_one: 'month',
		Months_other: 'months',
		Years_one: 'year',
		Years_other: 'years'
	};
	function doLocalize(str) {
		var out = str;
		for(var current in l10n) {
			out = out.replace('$'+current, l10n[current]);
		}
		return out;
	}

	// Util: compute elapsed time as a string
	function timestampToElapsedString(timestamp) {
		var units = [{name:'Years', factor:356 * 24 * 60 * 60},
					 {name:'Months', factor:30 * 24 * 60 * 60},
					 {name:'Weeks', factor:7 * 24 * 60 * 60},
					 {name:'Days', factor:24 * 60 * 60},
					 {name:'Hours', factor:60 * 60},
					 {name:'Minutes', factor:60}];
		var maxlevel = 1;
		var levels = 0;
		var time_period = '';
		var time_stamp = (new Date(timestamp).getTime());
		var elapsed_seconds = ((new Date().getTime()) - time_stamp)/1000;
		for (var i = 0; i < units.length ; i++) {
			var factor = units[i].factor;

			var elapsed_units = Math.floor(elapsed_seconds / factor);
			if (elapsed_units > 0) {
				if (levels > 0)
					time_period += ',';

				time_period += ' '+elapsed_units+" "+(elapsed_units==1?doLocalize("$"+units[i].name+"_one"):doLocalize("$"+units[i].name+"_other"));

				elapsed_seconds -= elapsed_units * factor;
			}

			if (time_period != '')
				levels += 1;

			if (levels == maxlevel)
				break;
		}

		if (levels == 0) {
			return doLocalize("$SecondsAgo");
		}

		return time_period+doLocalize("$Ago");
	}

	return chooser;
});
