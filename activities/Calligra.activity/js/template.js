
// Template item
var TemplateItem = {
	template: `
		<div class="col-xs-4 col-md-2 col-lg-2 template-col" v-on:click="onClick">
			<img class="mr3 template-item-image" v-bind:src="image" v-bind:style="{visibility:image?'visible':'hidden'}"></img>
			<div id="text-item" class="template-item-text" v-bind:style="computeStyle()">{{text}}</div>
			<div v-bind:class="computeClass()"></div>
		</div>
		`,
	props: ['image','text','editMode'],
	methods: {
		computeStyle: function() {
			var style = {};
			style.visibility = this.text?'visible':'hidden';
			var opt = 6;
			if (this.text && this.text.length) {
				// Compute optimal font size to fill the rectangle
				var block = document.getElementsByClassName("template-col")[0];
				var rect = block ? block.getBoundingClientRect() : {width: 194, height: 165};
				var overflow = false;
				var opt = 6;
				for (var i = opt ; i<300 && !overflow ; i++) {
					var size = getTextSize(this.text, i+"px Arial"); // HACK: Should be Graphecrit but can't wait to load it
					overflow = size.width > rect.width-10 || 2*size.height > rect.height-15;
					if (!overflow) { opt = i }
				}
				size = getTextSize(this.text, opt+"px Arial");
				style.top = -7.5+(rect.height-size.height)/2+"px";
				style.left = +22.5+(rect.width-size.width)/2+"px";
			}
			style.fontSize = opt+'px';
			return style;
		},

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
			<template-item v-for="(item,i) in visibleImages" :key="item.image"
				v-bind:ref="'item'+(i++)"
				v-bind:image="item.image"
				v-bind:text="item.text"
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
	computed: {
		visibleImages: function() {
			return this.template.images.filter(function(item) {
				return item.visible!=false;
			});
		}
	},
	methods: {
		itemClicked: function(item) {
			this.$emit('selected', item, this.editMode);
		}
	}
};

// Compute text size
function getTextSize(text, font) {
	var canvas = getTextSize.canvas || (getTextSize.canvas = document.createElement("canvas"));
	var context = canvas.getContext("2d");
	context.font = font;
	var metrics = {width: context.measureText(text).width, height: parseInt(context.font)}
	return metrics;
}
