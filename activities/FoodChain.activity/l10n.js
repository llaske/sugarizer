// Localization API

 var l10n;


// Change current language setting
__$FC_l10n_set = function(dict) {
	console.log("[NOT NEED]");
}

// Localization function
__$FC = function(str) {
	// Look in dictionnary
	var value = l10n.get(str);
	if (value != undefined)
		return value.replace("%27", "'").replace("%22", '"');
	return str;
}