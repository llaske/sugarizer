var TemplateSelection = {
	/*html*/
	template: `
		<div class="template-selection" :style="{backgroundColor: userColors.fill}">
			<div class="template" v-for="template in templates" :key="template.title" @click="$emit('template-selected', template)">
				<div class="template-image">
					<img :src="'images/skills/' + template.templateImage">
				</div>
				<p>{{ template.templateTitle }}</p>
			</div>
			<button id="add-button" @click="showPopup = true"></button>

			<form @submit.prevent="addTemplate" class="template-popup" v-if="showPopup">
				<div class="popup-header">
					<h2 style="margin: 0">Add Template</h2>
					<div class="popup-buttons">
						<button type="button" id="cancel-button" @click="showPopup = false"></button>
						<button type="submit" id="confirm-button" :disabled="templateURL == ''"></button>
					</div>
				</div>
				<div class="popup-body">
					<label for="template-url">Template URL</label>
					<input type="url" id="template-url" v-model="templateURL">
				</div>
			</form>
		</div>
	`,
	props: ['userColors'],
	data: function() {
		return {
			showPopup: false,
			templateURL: '',
			templates: []
		}
	},
	mounted: function() {
		var vm = this;
		requirejs(["text!../defaultTemplates/Kindergarten.json", "text!../defaultTemplates/Primary.json", "text!../defaultTemplates/Montessori.json"], function(Kindergarten, Primary, Montessori) {
			vm.templates.push(JSON.parse(Kindergarten));
			vm.templates.push(JSON.parse(Primary));
			vm.templates.push(JSON.parse(Montessori));
		});
	},
	methods: {
		addTemplate: function() {
			var vm = this;
			requirejs([`text!${vm.templateURL}`], function(template) {
				var data = JSON.parse(vm.$root.$refs.SugarJournal.LZString.decompressFromUTF16(JSON.parse(template).text))
				vm.$emit('template-selected', {
					fromURL: true,
					categories: data.categories,
					notationLevel: data.notationLevel
				});
				showPopup = false;
			});
		}
	}
}