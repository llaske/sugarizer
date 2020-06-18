// Toolbar item
var ToolbarItem = {
  template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" :disabled="isDisabled" v-bind:class="computeClass()" v-else/>
	`,
  props: ['id', 'title', 'isSplitbar', 'toRight', 'paletteClass', 'paletteFile', 'paletteEvent', 'disabled', 'active'],
  data: function() {
    return {
      isDisabled: (this.disabled !== undefined),
      isActive: (this.active !== undefined),
      paletteObject: null
    }
  },
  methods: {
    onClick: function() {
      this.$emit('clicked');
    },

    computeClass: function() {
      return (this.toRight ? 'toolbutton pull-right' : 'toolbutton') + (this.isActive ? ' active' : '');
    }
  },

  mounted: function() {
    // Create palette if present
    var vm = this;
    if (vm.id && vm.paletteClass && vm.paletteFile) {
      requirejs([vm.paletteFile], function(palette) {
        vm.paletteObject = new palette[vm.paletteClass](document.getElementById(vm.id));
        if (vm.paletteEvent) {
          vm.paletteObject.addEventListener(vm.paletteEvent, function(event) {
            vm.$emit(vm.paletteEvent, event);
          });
        }
      });
    }
  }
}

// Toolbar component
var Toolbar = {
  components: {
    'toolbar-item': ToolbarItem
  },
  template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringChessActivity"></toolbar-item>

			<toolbar-item ref="networkButton" id="network-button" v-bind:title="l10n.stringNetwork"></toolbar-item>
      <toolbar-item ref="newButton" id="new-button" v-on:clicked="getApp().newGame()" v-bind:title="l10n.stringNew"></toolbar-item>
      <toolbar-item ref="undoButton" id="undo-button" v-on:clicked="getApp().undo()" v-bind:title="l10n.stringUndo"></toolbar-item>

			<toolbar-item ref="levelButton" class="toolbutton" id="level-button"
				v-bind:title="l10n.stringLevel"
				paletteFile="activity/palettes/computerLevelPalette"
				paletteClass="ComputerLevelPalette"
				paletteEvent="computerlevelChanged"
				v-on:computerlevelChanged="getApp().onComputerlevelChanged($event)">
			</toolbar-item>


			<toolbar-item ref="clockButton" class="toolbutton" id="clock-button"
				v-bind:title="l10n.stringClock"
				paletteFile="activity/palettes/clockPalette"
				paletteClass="ClockPalette"
				paletteEvent="clockSelected"
				v-on:clockSelected="getApp().onClockSelected($event)">
			</toolbar-item>

			<toolbar-item ref="colorButton" id="color-button" v-on:clicked="getApp().changeColor()" v-bind:title="l10n.stringColor"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onHelp()" id="help-button" v-bind:title="l10n.stringTut" toRight="true"></toolbar-item>
		</div>
	`,
  data: function() {
    return {
      l10n: {
        stringChessActivity: '',
        stringNew: '',
        stringTut: '',
        stringUndo: '',
        stringFullscreen: '',
        stringNetwork: '',
        stringLevel: '',
        stringClock: '',
        stringColor: ''
      }
    }
  },
  methods: {
    localized: function(localization) {
      localization.localize(this.l10n);
    },

    getApp: function() {
      return app;
    }
  }
}
