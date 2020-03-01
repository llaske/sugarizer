

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

// Toolbar component
var Toolbar = {
	components: {'toolbar-item': ToolbarItem},
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringEbookReaderActivity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>

			<toolbar-item ref="switchbutton" v-on:clicked="getApp().showContents()" class="toolbutton" id="contents-button" v-bind:title="l10n.stringContents" v-if="showContentsBtn()"></toolbar-item>
			<toolbar-item ref="switchbutton" v-on:clicked="getApp().switchView()" class="toolbutton" id="library-button" v-bind:title="l10n.stringLibrary"></toolbar-item>
			<div class="splitbar"></div>
			<toolbar-item ref="settings" v-on:clicked="getApp().setLibraryUrl()" class="toolbutton" id="settings-button" v-bind:title="l10n.stringSettings"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onHelp()" id="help-button" v-bind:title="l10n.stringHelp" toRight="true"></toolbar-item>
		</div>
	`,
	data: function() {
		return {
			l10n: {
				stringEbookReaderActivity: '',
				stringPrevious: '',
				stringNext: '',
				stringLibrary: '',
				stringSettings: '',
				stringHelp: '',
				stringFullscreen: '',
				stringContents: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			var vm = this;
			Object.keys(this.l10n).forEach(function(key, index) {
				vm.l10n[key] = localization.get(key.substr(6));
			});
		},

		showContentsBtn: function() {
			if(typeof this.getApp() == 'undefined') return false;
			return this.getApp().currentView == this.getReader();
		},

		getApp: function() {
			return app;
		},

		getReader: function() {
			return EbookReader;
		}
	}
}
