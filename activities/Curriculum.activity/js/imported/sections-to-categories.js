requirejs(["text!activity/imported/sections.json"], sections => {
	sections = JSON.parse(sections);
	var categories = [];
	var locale = "[*]\n";
	var el = document.createElement('p');

	for (var cat of sections) {
		if (cat.isDomaine) continue;

		var newCat = {};
		newCat.id = categories.length;
		newCat.color = '#' + cat.color;
		newCat.title = `DefaultSkillSetCategory${newCat.id}`;
		
		//locale
		el.innerHTML = cat.titre;
		locale += `DefaultSkillSetCategory${newCat.id}=${el.innerHTML}\n`;

		newCat.skills = [];
		for (var skill of cat.items) {
			var newSkill = {};
			newSkill.id = newCat.skills.length;
			newSkill.image = skill.uuid + '.jpg';
			newSkill.title = `DefaultSkillSetCategory${newCat.id}Skill${newSkill.id}`;
			
			//locale
			el.innerHTML = skill.titre;
			locale += `DefaultSkillSetCategory${newCat.id}Skill${newSkill.id}=${el.innerHTML}\n`;
			newCat.skills.push(newSkill);
		}

		categories.push(newCat);
	}

	function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
	}
	download(JSON.stringify(categories), 'categories.json', 'application/json');
	download(locale, 'locale.ini', 'application/l10n');
});