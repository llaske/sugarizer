

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

			<toolbar-item v-on:clicked="getApp().onPrevious()" id="previous-button" v-bind:title="l10n.stringPrevious"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onNext()" id="next-button" v-bind:title="l10n.stringNext"></toolbar-item>
			<div class="splitbar"></div>
			<toolbar-item v-on:clicked="getApp().switchView()" class="toolbutton" id="library-button" v-bind:title="l10n.stringLibrary"></toolbar-item>
			<div class="splitbar"></div>
			<toolbar-item v-on:clicked="getApp().setLibraryUrl()" class="toolbutton" id="settings-button" v-bind:title="l10n.stringSettings"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
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
				stringFullscreen: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			this.l10n.stringEbookReaderActivity = localization.get("EbookReaderActivity");
			this.l10n.stringPrevious = localization.get("Previous");
			this.l10n.stringNext = localization.get("Next");
			this.l10n.stringLibrary= localization.get("Library");
			this.l10n.stringSettings= localization.get("Settings");
			this.l10n.stringFullscreen= localization.get("Fullscreen");
		},

		getApp: function() {
			return app;
		}
	}
}
