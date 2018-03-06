// Localization API


// Change current language setting
__$FC_l10n = Abcd.enLetters;
console.log(Abcd.enLetters);
Abcd.letters = Abcd.enLetters;
if (Abcd.context !== undefined && Abcd.context.lang !== undefined) {
    __$FC_l10n = Abcd.getTextsFromLocal(Abcd.context.lang);
    Abcd.letters = Abcd.getLettersFromLocal(Abcd.context.lang);
}

__$FC_l10n_set = function(texts) {
	__$FC_l10n = texts;
	Abcd.context.lang = __$FC_l10n[0];
}

// Localization function
__$FC = function(code) {
	// Look in array
	var value = __$FC_l10n[code];
	if (value != undefined)
		return value.replace("%27", "'").replace("%22", '"');
	return code;
}