var Leaderboard = {
  props: ['strokeColor', 'fillColor', 'playersAll', 'playersPlaying', 'l10n'],
  template: `
    <div id="leaderboard-view">
      <div class="leaderboard-main">
        <div
          class="leaderboard-main-header"
          v-bind:style="{backgroundColor: fillColor}"
        >
          <div class="leaderboard-item" style="width:25%">{{ l10n.stringRank }}</div>
          <div class="leaderboard-item" style="width:50%">{{ l10n.stringUser }}</div>
          <div class="leaderboard-item" style="width:25%">{{ l10n.stringScore }}</div>
        </div>
        <div
          class="leaderboard-main-body"
        >
          <div
            class="leaderboard-panel-container"
            v-for="(item, index) in players"
            v-bind:key="index"
            v-bind:style="{borderColor: item.user.colorvalue.stroke}"
          >
            <div class="leaderboard-item leaderboard-item-rank">{{  initP + index + 1  }}</div>
            <div
              class="leaderboard-item leaderboard-item-icon"
              v-bind:style="{backgroundImage: 'url('+ generateXOLogoWithColor(item.user.colorvalue.stroke, item.user.colorvalue.fill)+')'}"
            ></div>
            <div class="leaderboard-item leaderboard-item-name">{{  item.user.name  }}</div>
            <div class="leaderboard-item leaderboard-item-score"
            v-bind:style="{backgroundImage: item.score===null ? 'url(./icons/hourglass.svg)' : ''}"
            >{{  item.score!=null ? item.score : "" }}</div>
          </div>
        </div>
      </div>
      <div class="leaderboard-footer">
        <div class="pagination">
          <button
            v-if="playersAll.length > 3"
            v-bind:disabled="isPreviousButtonDisabled"
            class="btn-general-block btn-previous-page"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="pageChangeHandler('previous')"
          >
          </button>
          <button
            v-if="playersAll.length > 3"
            class="btn-general-block page-no"
            v-bind:style="{backgroundColor: fillColor}"
          >
            {{ currentPage }}/{{ pageCount }}
          </button>
          <button
            v-if="playersAll.length > 3"
            v-bind:disabled="isNextButtonDisabled"
            class="btn-general-block btn-next-page"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="pageChangeHandler('next')"
          >
          </button>
        </div>
        <div class="footer-actions">
          <button class="btn-general-block btn-back-block"
            v-bind:style="{backgroundColor: fillColor}"
            v-on:click="$emit('go-to-result')"
          >
          </button>
        </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      players: [],
      currentPage: 1,
      pageCount: 1,
      visibleItemsPerPageCount: 3,
      initP: 0
    }
  },
  created: function() {
    var vm = this;
    window.addEventListener('resize', vm.resize)
    vm.sortLeaderboard();
  },
  unmounted: function() {
    var vm = this;
    window.removeEventListener("resize", vm.resize);
  },
  mounted: function() {
    var vm = this;
    vm.pageCount = Math.ceil(vm.playersAll.length / vm.visibleItemsPerPageCount);
    vm.resize();
  },
  watch: {
    playersAll: {
      handler(){
        var vm = this;
        vm.pageCount = Math.ceil(vm.playersAll.length / vm.visibleItemsPerPageCount);
        vm.sortLeaderboard();
        setTimeout(() => {
          vm.resize();
        }, 0);
      },
      deep: true
    },

    playersPlaying: {
      handler() {
        var vm = this;
        vm.sortLeaderboard();
      },
      deep: true
    },

    currentPage: function () {
      const leaderboardMainBody = document.querySelector(".leaderboard-main-body");
      if (leaderboardMainBody) {
        leaderboardMainBody.scrollTo(0,0);
      }
    }
  },
  computed: {
    isPreviousButtonDisabled: function() {
      return this.currentPage === 1
    },

    isNextButtonDisabled: function() {
      return this.currentPage === this.pageCount
    }
  },
  methods: {
    resize: function() {
      var vm = this;
      var toolbarElem = document.getElementById("main-toolbar");
      var toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      var newHeight = window.innerHeight - toolbarHeight;

      document.querySelector('#leaderboard-view').style.height = newHeight + "px";
      document.querySelector('.btn-back-block').style.width = document.querySelector('.btn-back-block').offsetHeight + "px";
      if (vm.playersAll.length > vm.visibleItemsPerPageCount) {
        document.querySelector('.btn-previous-page').style.width = document.querySelector('.btn-previous-page').offsetHeight + "px";
        document.querySelector('.page-no').style.width = document.querySelector('.page-no').offsetHeight + "px";
        document.querySelector('.btn-next-page').style.width = document.querySelector('.btn-next-page').offsetHeight + "px";
      }
    },

    sortLeaderboard: function(all) {
      var vm = this;
      vm.players = [];
      var tmp = [];

      for (var i = 0; i < vm.playersAll.length; i++) {
        tmp.push(vm.playersAll[i]);
      }

      tmp.sort(function(a, b) {
        return b.score - a.score;
      })

      vm.initP = (vm.currentPage - 1) * vm.visibleItemsPerPageCount;
      var len = vm.playersAll.length - vm.initP;
      if (len > vm.visibleItemsPerPageCount) {
        len = vm.visibleItemsPerPageCount;
      }
      vm.players = tmp.slice(vm.initP, vm.initP + len);
    },

    pageChangeHandler: function(value) {
      switch (value) {
        case 'next':
          if (this.currentPage < this.pageCount) {
            this.currentPage += 1
          }
          break
        case 'previous':
          if (this.currentPage > 1) {
            this.currentPage -= 1
          }
          break
        default:
          this.currentPage = value
      }
      this.sortLeaderboard();
    },

    generateXOLogoWithColor: function (strokeColor, fillColor) {
      var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
      var coloredLogo = xoLogo;
      coloredLogo = coloredLogo.replace("#010101", strokeColor)
      coloredLogo = coloredLogo.replace("#FFFFFF", fillColor)
      return "data:image/svg+xml;base64," + btoa(coloredLogo);
    }

  }
}
