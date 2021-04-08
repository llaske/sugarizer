define(['mustache', 'webL10n', 'sugar-web/graphics/journalchooser'], function(mustache, l10n, journalchooser) {
	
	function backgroundColorFill() {
		featureBackgroundColor.database = [
			{code: "#ffffff", text: l10n.get('white'), i: 0},
			{code: "#919496", text: l10n.get("silver"), i: 1},
			{code: "#000000", text: l10n.get("black"), i: 2},
			{code: "#5E008C", text: l10n.get("purple"), i: 3},
			{code: "#A700FF", text: l10n.get("violet"), i: 4},
			{code: "#FFFA00", text: l10n.get("yellow"), i: 5},
			{code: "#00A0FF", text: l10n.get("lightBlue"), i: 6},
			{code: "#008009", text: l10n.get("darkGreen"), i: 7},
			{code: "#FF8F00", text: l10n.get("orange"), i: 8},
			{code: "#005FE4", text: l10n.get("darkBlue"), i: 9},
			{code: "#00EA11", text: l10n.get("lightGreen"), i: 10},
			{code: "#FF2B34", text: l10n.get("red"), i: 11}
		]
		// Find entries matching search field
		var content = featureBackgroundColor.database;
		var title = document.getElementById('search-text').value.toLowerCase();
		if (title.length) {
			content = [];
			for (var i = 0 ; i < featureBackgroundColor.database.length ; i++) {
				if (featureBackgroundColor.database[i].text.toLowerCase().indexOf(title) != -1) {
					content.push(featureBackgroundColor.database[i]);
				}
			}
		}
		// Display result
		featureBackgroundColor.results = content;
		featureBackgroundColor.resultCount = 30;
		BackgroundColorDisplay(content, featureBackgroundColor.resultCount);
	}

	function BackgroundColorDisplay(content, count) {
		// Display entries
		var template = "\
			{{#items}}\
			<div id='color_{{code}}' style='height:60px'>\
				<div id='colorIcon_{{code}}' class='toolbutton' style='border-style:solid;border-width:thin;background-color:{{code}};background-size:40px 40px;width:40px;height:40px;display:inline-block;margin-left:20px;margin-top:5px;'></div>\
				<div id='colorText_{{code}}' style='color:black;display:inline-block;vertical-align:middle;margin-left:30px;height:60px;margin-top:10px;font-weight:bold;font-size:14px;'>{{text}}</div>\
			</div>\
			{{/items}}\
		";
		var items = {items: content.slice(0, count)};
		var render = mustache.render(template, items);
		document.getElementById('journal-empty').style.visibility = (content.length != 0 ? 'hidden' : 'visible');
		document.getElementById('journal-container').innerHTML = render;

		// Handle click
		let event = new Event("updateBackgroundListener", {bubbles: true});
		var len = Math.min(count, content.length);
		for (var i = 0 ; i < len; i++) {
			var entry = document.getElementById('color_'+content[i].code);
			entry.addEventListener('click', function(e) {
				var code = e.target.id;
				code = code.substr(code.indexOf("_")+1);
				var line = document.getElementById('color_'+code);
				document.getElementById("cy").style.backgroundImage = "";
				document.getElementById("cy").style.backgroundColor = code;
				line.style.backgroundColor = "#808080";
				entry.dispatchEvent(event);
				journalchooser.close();
			});
			
		}
    }

	var featureBackgroundColor = {};
	featureBackgroundColor.id = "background-color-button";
	featureBackgroundColor.title = "titleBackgroundColor";
	featureBackgroundColor.placeholder = "holderSearchBackgroundColor";
	featureBackgroundColor.icon = "lib/sugar-web/graphics/icons/actions/tool-bucket.svg";
	featureBackgroundColor.beforeActivate = function() {
		document.getElementById('favorite-button').style.visibility = "hidden";
		backgroundColorFill();
	};
	featureBackgroundColor.beforeUnactivate = function() {
		document.getElementById('favorite-button').style.visibility = "visible";
	};
	featureBackgroundColor.onFavorite = function() {};
	featureBackgroundColor.onScroll = function() {
		var container = document.getElementById('journal-container');
		var scrollValue = (container.scrollTop) / (container.scrollHeight - container.clientHeight);
		if (scrollValue > 0.90) {
			featureBackgroundColor.resultCount += 30;
			BackgroundColorDisplay(featureBackgroundColor.results, featureBackgroundColor.resultCount);
		}
	};
	featureBackgroundColor.onSearch = function() {
		backgroundColorFill();
	};
	featureBackgroundColor.onCancelSearch = function() {
		backgroundColorFill();
    };
    return featureBackgroundColor;
});