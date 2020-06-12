requirejs(["text!activity/imported/sections.bak.json"], sections => {
	sections = JSON.parse(sections);
	var newJson = [];
	var el = document.createElement('p');

	for (var cat of sections) {
		if (cat.isDomaine) continue;

		var newCat = {};
		el.innerHTML = cat.titre;
		newCat.title = el.innerHTML;
		newCat.color = '#' + cat.color;

		newCat.skills = [];
		for (var skill of cat.items) {
			var newSkill = {};
			el.innerHTML = skill.titre;
			newSkill.title = el.innerHTML;
			newSkill.image = skill.uuid + '.jpg';
			newCat.skills.push(newSkill);
		}

		newJson.push(newCat);
	}

	// To copy result
	/*
	var textArea = document.createElement("textarea");
  textArea.value = JSON.stringify(newJson);
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
	textArea.select();
	*/

	/*
	var importSkills = function () {
		var vm = this;
		requirejs(["text!activity/imported/sections.json"], function (sections) {
			var sectionsObj = JSON.parse(sections);
			var importedCategories = [];

			var categoryId = vm.categories.length;
			sectionsObj.forEach(function (section) {
				if (section.isDomaine) return;

				var category = {
					id: categoryId,
					title: section.titre,
					color: '#' + section.color,
					skills: []
				}
				// Updating the user object
				vm.$set(vm.user.skills, categoryId, new Object());

				var skillId = 0;
				section.items.forEach(function (item) {
					var skill = {
						id: skillId,
						title: item.titre,
						image: 'js/imported/' + item.uuid + '.jpg'
					}
					category.skills.push(skill);

					// Updating the user object
					vm.$set(vm.user.skills[categoryId], skillId, {
						acquired: false,
						media: {}
					});
					skillId++;
				});

				importedCategories.push(category);
				categoryId++;
			});
			// Updating the categories object
			vm.categories = vm.categories.concat(importedCategories);
		});
	}
	*/
})