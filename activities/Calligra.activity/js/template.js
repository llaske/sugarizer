
// Template item
var TemplateItem = {
	template: `
		<div class="col-xs-4 col-md-2 col-lg-2 template-col" v-on:click="onClick">
			<img class="mr3 template-item-image" v-bind:src="image"></img>
			<div id="remove-item" v-bind:class="computeClass()"></div>
		</div>
		`,
	props: ['image','editMode'],
	methods: {
		onClick: function() {
			this.$emit('clicked');
		},

		computeClass: function() {
			return "template-item-remove" + (this.editMode?" template-item-remove-editable":"");
		}
	}
}

// Template Viewer component
var TemplateViewer = {
	components: {'template-item': TemplateItem},
	template: `
		<div class="row">
		<template v-if="template">
			<template-item v-for="(item,i) in template.images" :key="item.image"
				v-bind:ref="'item'+(i++)"
				v-bind:image="item.image"
				v-bind:editMode="editMode"
				v-on:clicked="itemClicked(item)">
			</template-item>
		</template>
		</div>
	`,
	props: ['template'],
	data: function() {
		return {
			editMode: false
		}
	},
	methods: {
		itemClicked: function(item) {
			this.$emit('selected', item, this.editMode);
		}
	}
};
