

// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" v-bind:class="toRight ? 'toolbutton pull-right' : 'toolbutton'" v-else/>
	`,
	props: ['id', 'title', 'isSplitbar', 'toRight'],
	methods: {
		onClick: function() {
			this.$emit('clicked');
		}
	}
}

// Vue for toolbar
var toolbar = new Vue({
	el: '#toolbar',
	components: {'toolbar-item': ToolbarItem, 'localization': Localization},
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" title="Ebook Reader Activity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onPrevious()" id="previous-button" v-bind:title="stringPrevious"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onNext()" id="next-button" v-bind:title="stringNext"></toolbar-item>
			<div class="splitbar"></div>
			<toolbar-item v-on:clicked="getApp().switchView()" class="toolbutton" id="library-button" v-bind:title="stringLibrary"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="stringFullscreen" toRight="true"></toolbar-item>
			<localization ref="localization" v-on:localized="localized"/>
		</div>
	`,
	data: function() {
		return {
			stringPrevious: '',
			stringNext: '',
			stringLibrary: '',
			stringFullscreen: '',
		}
	},
	methods: {
		localized: function() {
			this.stringPrevious = this.$refs.localization.get("Previous");
			this.stringNext = this.$refs.localization.get("Next");
			this.stringLibrary= this.$refs.localization.get("Library");
			this.stringFullscreen= this.$refs.localization.get("Fullscreen");
		},

		getApp: function() {
			return app;
		}
	}
});
