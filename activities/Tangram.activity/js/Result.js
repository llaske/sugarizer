/*
<div class="result-header">
  <div class="result-bar"
  >
    <div class="result-bar-block"
      v-bind:style="{backgroundColor: fillColor}"
    >
    </div>
    <div class="result-bar-block"
      v-bind:style="{backgroundColor: fillColor}"
    >
    </div>
  </div>
</div>
*/
var Result = {
  props: ['strokeColor', 'fillColor'],
  template: `
    <div id="result-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >


      <div class="result-main"
      >
        <div class="result-panel-primary"
          v-bind:style="{backgroundColor: '#ffffff'}"
        ></div>

        <div class="result-panel-secondary"
          v-bind:style="{backgroundColor: '#ffffff'}"
        ></div>

      </div>
      <div class="result-footer">
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              class="btn-in-footer btn-restart"
              v-bind:style="{backgroundColor: fillColor}"
              v-on:click="$emit('restart-game')"
            ></button>
          </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 1,
      canRestart: true,
    };
  },

  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
  },

  mounted: function() {
    let vm = this;
    vm.resize();
  },

  methods: {
    resize: function() {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight

      document.querySelector('#result-screen').style.height = newHeight + "px";

      document.querySelector('.btn-restart').style.width = document.querySelector('.btn-restart').offsetHeight + "px";

    }
  }
}
