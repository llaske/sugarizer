

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
	components: {'toolbar-item': ToolbarItem},
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" title="My Activity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onPrevious()" id="previous-button" title="Previous"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onNext()" id="next-button" title="Next"></toolbar-item>
			<div class="splitbar"></div>
			<toolbar-item v-on:clicked="getApp().switchView()" class="toolbutton" id="library-button" title="Library"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().fullscreen()" id="fullscreen-button" title="Fullscreen" toRight="true"></toolbar-item>
		</div>
	`,
	methods: {
		getApp: function() {
			return app;
		}
	}
});
