// Localization API

 var l10n;


// Localization function
__$FC = function(str) {
	// Look in dictionnary
	var value = l10n.get(str);
	if (value != undefined && value != "")
		return value.replace("%27", "'").replace("%22", '"');
	if (str == "sounddir")   // HACK: At first launch not always initialized
		return l10n.language.code;
	return str;
}
