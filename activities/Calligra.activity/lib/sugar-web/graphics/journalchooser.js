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
		featureLocalJournal.isFavorite = false;
		document.getElementById('favorite-button').style.backgroundImage = "url(lib/sugar-web/graphics/icons/emblems/favorite.svg)";
		journalFill.apply(null, featureLocalJournal.filters);
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
		journalFill.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.onScroll = function() {};
	featureLocalJournal.onSearch = function() {
		journalFill.apply(null, featureLocalJournal.filters);
	};
	featureLocalJournal.onCancelSearch = function() {
		journalFill.apply(null, featureLocalJournal.filters);
	};

	// Chooser feature to search in Abecedarium database
	var featureAbecedarium = {};
	featureAbecedarium.id = "abecedarium-button";
	featureAbecedarium.title = "$titleAbecedarium";
	featureAbecedarium.placeholder = "$holderSearchAbecedarium";
	featureAbecedarium.icon = "lib/sugar-web/graphics/icons/actions/activity-abecedarium.svg";
	featureAbecedarium.beforeActivate = function() {
		document.getElementById('favorite-button').style.visibility = "hidden";
		abecedariumInit(abecedariumFill);
	};
	featureAbecedarium.beforeUnactivate = function() {
		document.getElementById('favorite-button').style.visibility = "visible";
	};
	featureAbecedarium.onFavorite = function() {};
	featureAbecedarium.onScroll = function() {
		var container = document.getElementById('journal-container');
		var scrollValue = (container.scrollTop) / (container.scrollHeight - container.clientHeight);
		if (scrollValue > 0.90) {
			featureAbecedarium.resultCount += 30;
			abecedariumDisplay(featureAbecedarium.results, featureAbecedarium.resultCount);
		}
	};
	featureAbecedarium.onSearch = function() {
		abecedariumFill();
	};
	featureAbecedarium.onCancelSearch = function() {
		abecedariumFill();
	};

	// Init feature list: overload it if you want to change the feature list at init
	var features = [];
	var currentFeature = -1;
	chooser.init = function() {
		features = [featureLocalJournal];
		currentFeature = 0;
	}

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
	chooser.show = function(callback, filter1, orFilter2, orFilter3, orFilter4) {
		result = null;
		chooser.init();
		var imageType = "image/png";
		var soundType = "audio/mpeg";
		var filters = [filter1, orFilter2, orFilter3, orFilter4];
		for (var i = 0 ; i < filters.length ; i++) {
			if (filters[i]) {
				if (filters[i].mimetype == imageType) {
					featureAbecedarium.fileformat = ".png";
					featureAbecedarium.mimetype = imageType;
					featureAbecedarium.filelocation = "images/database/";
					features.push(featureAbecedarium);
					break;
				} else if (filters[i].mimetype == soundType) {
					featureAbecedarium.fileformat = ".mp3";
					featureAbecedarium.mimetype = soundType;
					featureAbecedarium.filelocation = "audio/{{lang}}/database/";
					features.push(featureAbecedarium);
					break;
				}
			}
		}
		var contentHeader = "<div id='pictotoolbar' class='toolbar' style='padding: 0'>";
		for (var i = 0 ; i < features.length ; i++) {
			contentHeader += "<button class='toolbutton"+(i==0?" active":"")+"' id='"+features[i].id+"' title='"+features[i].title+"' style='background-image: url("+features[i].icon+")'></button>";
		}
		contentHeader += "<button class='toolbutton pull-right' id='close-button' title='$titleClose' style='background-image: url(lib/sugar-web/graphics/icons/actions/dialog-cancel.svg)'></button>";
		contentHeader += "<div style='position: absolute; display: inline-block; margin-left: 10px; top: 20px; height:55px'>$titleChoose</div></div>";
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
				var radio = document.getElementById(features[i].id);
				radios.push(radio);
				radio.addEventListener("click", function(e) {
					var index = -1;
					for (var j = 0 ; j < features.length ; j++) {
						if (features[j].id == e.srcElement.id) {
							index = j;
							break;
						}
					}
					if (index != currentFeature) {
						features[currentFeature].beforeUnactivate();
						document.getElementById(features[currentFeature].id).style.backgroundImage = "url("+features[currentFeature].icon+")";
						document.getElementById('journal-container').innerHTML = "";
						document.getElementById('search-text').value = '';
						currentFeature = index;
						features[currentFeature].filters = [filter1, orFilter2, orFilter3, orFilter4];
						features[currentFeature].beforeActivate();
						icon.colorize(document.getElementById(features[currentFeature].id), color, function() {});
						document.getElementById('search-text').placeholder=doLocalize(features[currentFeature].placeholder);
					}
				})
			}
			new radioButtonsGroup.RadioButtonsGroup(radios);

			var targetHeight = document.getElementById("pictotoolbar").parentNode.offsetHeight - 55*2;
			document.getElementById('journal-container').style.height = targetHeight + "px";
			document.getElementById('journal-container').addEventListener("scroll", function() {
				features[currentFeature].onScroll();
			});
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

	// --- Journal feature functions

	// Get journal entries and fill dialog with entries
	function journalFill(filter1, orFilter2, orFilter3, orFilter4) {
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
					match = match || journalFilterMatch(entry, filters[j]);
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
	function journalEntryMatch(entry, name, value) {
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
	function journalFilterMatch(entry, filter) {
		var metadata = entry.metadata;
		var keys = Object.keys(filter);
		var match = true;
		for (var j = 0 ; j < keys.length ; j++) {
			var field = keys[j];
			var value = filter[field];
			if (value instanceof Array) {
				var or = false;
				for (var k = 0 ; k < value.length ; k++) {
					or = or || journalEntryMatch(metadata, field, value[k]);
				}
				match = match && or;
			} else {
				match = match && journalEntryMatch(metadata, field, value);
			}
		}
		return match;
	}

	// --- Abecedarium feature functions

	// Load Abecedarium database
	function abecedariumInit(callback) {
		featureAbecedarium.database = {};
		document.getElementById('journal-empty').style.visibility = 'visible';
		featureAbecedarium.baseURL = document.location.href.substr(0, document.location.href.indexOf("/activities/"))+"/activities/Abecedarium.activity/";
		featureAbecedarium.lang = (["en","es","fr"].indexOf(userSettings.language)!=-1)?userSettings.language:"en";
		featureAbecedarium.filelocation = featureAbecedarium.filelocation.replace("{{lang}}",featureAbecedarium.lang);
		var loadDatabase = function(file, entry, subcallback) {
			var client = new XMLHttpRequest();
			var source = featureAbecedarium.baseURL+file;
			client.onload = function() {
				if (entry == "ping") {
					featureAbecedarium.database[entry]=(this.status == 0 || (this.status >= 200 && this.status < 300));
				} else if (this.status == 0 || (this.status >= 200 && this.status < 300)) {
					featureAbecedarium.database[entry]=JSON.parse(this.responseText);
				}
				subcallback();
			};
			client.open("GET", source);
			client.send();
		};
		loadDatabase("database/db_url.json", "url", function() {
			loadDatabase("database/db_meta.json", "meta", function() {
				loadDatabase("database/db_"+featureAbecedarium.lang+".json", "words", function() {
					loadDatabase("images/database/_ping.png?"+(new Date()).getTime(), "ping", function() {
						var len = featureAbecedarium.database.meta.length;
						var entries = [];
						for (var i = 0 ; i < len; i++) {
							if (featureAbecedarium.database.meta[i][featureAbecedarium.lang]) {
								entries.push({"code":featureAbecedarium.database.meta[i]["code"],"text":featureAbecedarium.database.words[featureAbecedarium.database.meta[i]["text"]]});
							}
						}
						entries.sort(function(a,b) {
							return a.text.localeCompare(b.text, 'en', {sensitivity: 'base'});
						});
						var sortedEntries = [];
						for (var i = 0 ; i < entries.length ; i++) {
							entries[i].i = sortedEntries.length;
							sortedEntries.push(entries[i]);
						}
						featureAbecedarium.database.content = sortedEntries;
						delete featureAbecedarium.database.meta;
						delete featureAbecedarium.database.words;
						callback();
					});
				});
			});
		});
	}

	// Fill popup with Abecedarium items
	function abecedariumFill() {
		// Find entries matching search field
		var content = featureAbecedarium.database.content;
		var title = document.getElementById('search-text').value.toLowerCase();
		if (title.length) {
			content = [];
			for (var i = 0 ; i < featureAbecedarium.database.content.length ; i++) {
				if (featureAbecedarium.database.content[i].text.toLowerCase().indexOf(title) != -1) {
					content.push(featureAbecedarium.database.content[i]);
				}
			}
		}

		// Display result
		featureAbecedarium.results = content;
		featureAbecedarium.resultCount = 30;
		abecedariumDisplay(content, featureAbecedarium.resultCount);
	}

	function abecedariumDisplay(content, count) {
		// Display entries
		var template = "\
			{{#items}}\
			<div id='entry_{{i}}' style='height:60px'>\
				<div id='eicon_{{i}}' class='toolbutton' style='background-image:url(../../activities/MediaViewer.activity/activity/activity-icon.svg);background-size:40px 40px;width:40px;height:40px;display:inline-block;margin-left:20px;margin-top:5px;'></div>\
				<div id='etext_{{i}}' style='color:black;display:inline-block;vertical-align:middle;margin-left:30px;height:60px;margin-top:10px;font-weight:bold;font-size:14px;'>{{text}}</div>\
			</div>\
			{{/items}}\
		";
		var items = {items: content.slice(0, count)};
		var render = mustache.render(template, items);
		document.getElementById('journal-empty').style.visibility = (content.length != 0 ? 'hidden' : 'visible');
		document.getElementById('journal-container').innerHTML = render;

		// Handle click
		var len = Math.min(count, content.length);
		for (var i = 0 ; i < len; i++) {
			var entry = document.getElementById('entry_'+content[i].i);
			entry.addEventListener('click', function(e) {
				var id = e.target.id;
				id = id.substr(id.indexOf("_")+1);
				var line = document.getElementById('entry_'+id);
				line.style.backgroundColor = "#808080";
				abecedariumCreateEntry(featureAbecedarium.database.content[id], function() {
					modal.close(result);
				});
			});
			if (featureAbecedarium.mimetype == "image/png") {
				document.getElementById('eicon_'+content[i].i).style.backgroundImage="url("+(featureAbecedarium.database.ping?featureAbecedarium.baseURL:featureAbecedarium.database.url)+"images/database/"+content[i].code+".png"+")";
			}
		}
	}

	// Create a record in Journal for the entry
	function abecedariumCreateEntry(entry, callback) {
		var url = featureAbecedarium.database.ping?featureAbecedarium.baseURL:featureAbecedarium.database.url;
		var mimetype = featureAbecedarium.mimetype;
		var request = new XMLHttpRequest();
		request.open("GET",url+featureAbecedarium.filelocation+entry.code+featureAbecedarium.fileformat,true);
		request.setRequestHeader("Content-type",mimetype);
		request.responseType = "arraybuffer";
		var that = this;
		request.onload = function() {
			if (request.status == 200 || request.status == 0) {
				var blob = new Uint8Array(this.response);
				var base64 = "data:"+mimetype+";base64,"+toBase64(blob);
				var metadata = {
					mimetype: mimetype,
					title: entry.text+featureAbecedarium.fileformat,
					activity: "org.olpcfrance.MediaViewerActivity",
					timestamp: new Date().getTime(),
					creation_time: new Date().getTime(),
					file_size: 0
				};
				datastore.create(metadata, function(err, objectId) {
					console.log("Entry '"+entry.text+"' saved in journal.");
					result = {metadata:metadata, objectId: objectId};
					callback();
				}, base64);
			} else {
				console.log("Error loading entry '"+entry.code+"'.");
				callback();
			}
		};
		request.onerror = function() {
			console.log("Error loading entry '"+entry.code+"'.");
			callback();
		};
		request.send();
	}

	// --- Utility functions

	// Localize content - currently means only localize in English
	var l10n = {
		titleJournal: {en: 'Journal', fr: 'Journal', es: 'Diario', pt: 'Diário'},
		titleAbecedarium: {en: 'Abecedarium', fr: 'Abecedarium', es: 'Abecedarium', pt: 'Abecedarium'},
		titleClose: {en: 'Cancel', fr: 'Annuler', es: 'Cancelar', pt: 'Cancelar'},
		titleChoose: {en: 'Choose an object', fr: 'Choisir un objet', es: 'Elige un objeto', pt: 'Escolher um objeto'},
		holderSearchJournal: {en: 'Search in Journal', fr: 'Recherche dans le journal', es: 'Buscar en el diario', pt: 'Pesquisar no diário'},
		holderSearchAbecedarium: {en: 'Search in Abecedarium', fr: 'Recherche dans Abecedarium', es: 'Buscar en Abecedarium', pt: 'Pesquisar no Abecedarium'},
		noMatchingEntries: {en: 'No matching entries', fr: 'Aucune entrée correspondante', es: 'No hay actividades coincidentes', pt: 'Sem atividades correspondentes'},
		SecondsAgo: {en: 'Seconds ago', fr: "A l'instant", es: 'Segundos atrás', pt: 'Segundos atrás'},
		Ago: {en: '{{time}} ago', fr: 'il y a {{time}}', es: '{{time}} atrás', pt: '{{time}} atrás'},
		Minutes_one: {en: 'minute', fr: 'minute', es: 'minuto', pt: 'minuto'},
		Minutes_other: {en: 'minutes', fr: 'minutes', es: 'minutos', pt: 'minutos'},
		Hours_one: {en: 'hour', fr: 'heure', es: 'hora', pt: 'hora'},
		Hours_other: {en: 'hours', fr: 'heures', es: 'horas', pt: 'horas'},
		Days_one: {en: 'day', fr: 'jour', es: 'día', pt: 'dia'},
		Days_other: {en: 'days', fr: 'jours', es: 'días', pt: 'dias'},
		Weeks_one: {en: 'week', fr: 'semaine', es: 'semana', pt: 'semana'},
		Weeks_other: {en: 'weeks', fr: 'semaines', es: 'semanas', pt: 'semanas'},
		Months_one: {en: 'month', fr: 'mois', es: 'mes', pt: 'mês'},
		Months_other: {en: 'months', fr: 'mois', es: 'meses', pt: 'meses'},
		Years_one: {en: 'year', fr: 'année', es: 'año', pt: 'ano'},
		Years_other: {en: 'years', fr: 'années', es: 'años', pt: 'anos'},
	};
	function doLocalize(str, params) {
		var lang = (["en","fr","es", "pt"].indexOf(userSettings.language)!=-1)?userSettings.language:"en";
		var out = str;
		for(var current in l10n) {
			out = out.replace('$'+current, l10n[current][lang]);
		}
		for(var param in params) {
			out = out.replace('{{'+param+'}}', params[param]);
		}
		return out;
	}

	// Compute elapsed time as a string
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

		return doLocalize("$Ago", {time: time_period});
	}

	// Encoding functions taken from
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	function uint6ToB64(nUint6) {
		return nUint6 < 26 ?
			nUint6 + 65 : nUint6 < 52 ?
			nUint6 + 71 : nUint6 < 62 ?
			nUint6 - 4 : nUint6 === 62 ?
			43 : nUint6 === 63 ?
			47 : 65;
	}
	function toBase64(aBytes) {
		var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";
		for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
			nMod3 = nIdx % 3;
			nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
			if (nMod3 === 2 || aBytes.length - nIdx === 1) {
				sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
				nUint24 = 0;
			}
		}
		return  eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
	}

	return chooser;
});
