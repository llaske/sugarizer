// Rebase require directory
requirejs.config({
  baseUrl: "lib",
  paths: {
    activity: "../js"
  }
});

var app = new Vue({
  el: '#app',
  components: {
    'toolbar': Toolbar,
    'localization': Localization,
    'chessgame': ChessGame,
    'tutorial': Tutorial,
  },
  data: function() {
    return {
      currentuser: {
        colorvalue: {
          stroke: "#000000",
          fill: "#ffffff"
        }
      },
      opponentuser: null,
      ishost: false,
      presence: null,
      humane: null,
      level: 0,
      clock: 0,
      l10n: {
        stringPlayerJoin: '',
        stringPlayerLeave: '',
        stringClockChanged: ''
      }
    }
  },
  created: function() {
    requirejs(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
      // Initialize Sugarizer
      activity.setup();
    });

  },
  mounted: function() {
    // Load last library from Journal
    var vm = this;
    requirejs(["sugar-web/activity/activity", "sugar-web/env", "humane", "sugar-web/graphics/presencepalette"], function(activity, env, humane, presencepalette) {
      env.getEnvironment(function(err, environment) {

        vm.currentuser = environment.user;
        $("#canvas").css("background-color", environment.user.colorvalue.fill);
        $("#player-clock .usrtime").css("background-color", environment.user.colorvalue.fill);
        // Load context
        if (!environment.objectId) {
        } else {
          activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
            if (error == null && data != null) {
              data = JSON.parse(data);
              vm.$refs.chessgame.state = Object.assign(vm.$refs.chessgame.state, data.state);

              if (!data.chessColor) {
                vm.$refs.chessgame.board.orientation('white');
                vm.$refs.chessgame.playercolor = 0;
              } else {
                vm.$refs.chessgame.board.orientation('black');
                vm.$refs.chessgame.playercolor = 1;
              }
              vm.$refs.chessgame.board.position(p4_state2fen(vm.$refs.chessgame.state, true));
              vm.$refs.chessgame.moves = data.moves;

            }
          });

        }

        // Shared instances
        if (environment.sharedId) {
          vm.presence = activity.getPresenceObject(function(error, network) {
            if (error) {
              console.log(error);
            }
            network.onDataReceived(vm.onNetworkDataReceived);
            network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
          });
        }
      });

      vm.humane = humane;

      vm.palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
      vm.palette.addEventListener('shared', function() {
        vm.palette.popDown();
        console.log("Want to share");
        vm.presence = activity.getPresenceObject(function(error, network) {
          if (error) {
            console.log("Sharing error");
            return;
          }
          network.createSharedActivity('org.sugarlabs.ChessActivity', function(groupId) {
            console.log("Activity shared");
            vm.ishost = true;
          });

          network.onConnectionClosed(function(event) {
            this.presence = null;
            document.getElementById("stop-button").click();
          });
          network.onDataReceived(vm.onNetworkDataReceived);
          network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
        });
      });
    });


    // Handle unfull screen buttons (b)
    document.getElementById("unfullscreen-button").addEventListener('click', function() {
      vm.unfullscreen();
    });
  },
  methods: {
    localized: function() {
      this.$refs.localization.localize(this.l10n);
      this.$refs.toolbar.localized(this.$refs.localization);
      this.$refs.chessgame.localized(this.$refs.localization);
      this.$refs.tutorial.localized(this.$refs.localization);
    },
    // Handle fullscreen mode
    fullscreen: function() {
      var vm = this;
      document.getElementById("main-toolbar").style.opacity = 0;
      document.getElementById("canvas").style.top = "0px";
      document.getElementById("unfullscreen-button").style.visibility = "visible";
    },

    unfullscreen: function() {
      var vm = this;
      document.getElementById("main-toolbar").style.opacity = 1;
      document.getElementById("canvas").style.top = "55px";
      document.getElementById("unfullscreen-button").style.visibility = "hidden";
    },

    onHelp: function(type) {
      this.$refs.tutorial.show();
    },

    onComputerlevelChanged: function(data) {
      this.$refs.chessgame.onComputerlevelChanged(data.level);
    },

    onClockSelected: function(data) {
      var vm = this;
      var state = vm.$refs.chessgame.state;
      var playercolor = vm.$refs.chessgame.playercolor;
      if (!vm.$refs.chessgame.game_won && !vm.$refs.chessgame.game_lost && !vm.$refs.chessgame.game_draw ) {
        if (!vm.presence) {
          if ((state.moveno == 1 && playercolor) || (state.moveno == 0 && !playercolor)) {
            vm.$refs.chessgame.onClockSelected(data.index);
          }
        }
        else {
          if (state.moveno == 0) {
            vm.$refs.chessgame.onClockSelected(data.index);
            vm.humane.log(vm.l10n.stringClockChanged);

            if(vm.ishost){
              vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
                user: vm.presence.getUserInfo(),
                content: {
                  action: 'init',
                  data: {
                    chessColor: vm.$refs.chessgame.playercolor,
                    state: vm.$refs.chessgame.state,
                    clock: vm.$refs.chessgame.clock
                  }
                }
              });
            }
          }
        }
      }
    },

    onSendClock: function(eventData) {
      var vm = this;
      if (vm.presence) {
        vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
          user: vm.presence.getUserInfo(),
          content: {
            action: 'synchronize-clock',
            data: eventData.data
          }
        });
      }
    },

    onRestartNewGame: function() {
      var vm = this;
      if (vm.presence) {
        vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
          user: vm.presence.getUserInfo(),
          content: {
            action: 'restart'
          }
        });
      }
    },



    onSendMove: function(eventData) {
      var vm = this;
      if (vm.presence) {
        vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
          user: vm.presence.getUserInfo(),
          content: {
            action: 'update',
            data: eventData.data
          }
        });
      }
    },

    onTimeExpired: function(eventData) {
      var vm = this;
      if (vm.presence) {
        vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
          user: vm.presence.getUserInfo(),
          content: {
            action: 'timeexpired',
            data: eventData.data
          }
        });
      }
    },

    undo: function() {
      this.$refs.chessgame.undo();
    },
    newGame: function() {
      if (!(this.presence && !this.ishost)) {
        this.$refs.chessgame.newGame();
      }
    },
    changeColor: function() {
      if (!this.presence) {
        this.$refs.chessgame.changeColor();
      }
    },
    onNetworkDataReceived: function(msg) {
      var vm = this;
      if (vm.presence.getUserInfo().networkId === msg.user.networkId) {
        return;
      }

      switch (msg.content.action) {
        case 'init':
          vm.$refs.chessgame.state = Object.assign(vm.$refs.chessgame.state, msg.content.data.state);
          vm.opponentuser = msg.user;
          if (msg.content.data.chessColor) {
            vm.$refs.chessgame.board.orientation('white');
            vm.$refs.chessgame.playercolor = 0;
            $('#player-clock').css('border-style','solid');
            $('#opponent-clock').css('border-style','none');
          } else {
            vm.$refs.chessgame.board.orientation('black');
            vm.$refs.chessgame.playercolor = 1;
            $('#player-clock').css('border-style','none');
            $('#opponent-clock').css('border-style','solid');
          }
          vm.$refs.chessgame.onClockSelected(msg.content.data.clock);

          vm.$refs.chessgame.board.position(p4_state2fen(vm.$refs.chessgame.state, true));
          vm.$refs.chessgame.moves = [];
          vm.$refs.chessgame.updateMoves();

          break;
        case 'update':
          vm.$refs.chessgame.state = Object.assign(vm.$refs.chessgame.state, msg.content.data.state);
          vm.$refs.chessgame.board.position(p4_state2fen(vm.$refs.chessgame.state, true));
          vm.$refs.chessgame.updateMoves();

          var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";

          vm.$refs.chessgame.game_won = msg.content.data.game_won;
          vm.$refs.chessgame.game_lost = msg.content.data.game_lost;
          vm.$refs.chessgame.game_draw = msg.content.data.game_draw;
          vm.$refs.chessgame.game_check = msg.content.data.game_check;

          vm.$refs.chessgame.stopClock = false;
          $('#player-clock').css('border-style','solid');
          vm.$refs.chessgame.stopOpponentClock = true;
          $('#opponent-clock').css('border-style','none');

          break;
        case 'exit':
          if (msg.content.data == vm.presence.getUserInfo().networkId) {
            $("#stop-button").click();
          }
          break;
        case 'synchronize-clock':
          vm.$refs.chessgame.clockTime = msg.content.data.opponentClockTime;
          vm.$refs.chessgame.opponentClockTime = msg.content.data.clockTime;
          break;
        case 'restart':
          vm.$refs.chessgame.game_won = false;
          vm.$refs.chessgame.game_lost = false;
          vm.$refs.chessgame.game_check = false;
          vm.$refs.chessgame.timeexpired = false;
          vm.$refs.chessgame.board.start();
          p4_jump_to_moveno(vm.$refs.chessgame.state, 0);
          vm.$refs.chessgame.moves = [];
          if (vm.$refs.chessgame.playercolor) {
            $('#player-clock').css('border-style','none');
            $('#opponent-clock').css('border-style','solid');
          }
          else {
            $('#player-clock').css('border-style','solid');
            $('#opponent-clock').css('border-style','none');
          }

          break;
        case 'timeexpired':
          console.log(msg.content.data.player);
          if (msg.content.data.player == 0) {
            vm.$refs.chessgame.timeexpired = false;
            vm.$refs.chessgame.game_won = true;
          } else {
            vm.$refs.chessgame.timeexpired = true;
            vm.$refs.chessgame.game_lost = true;
          }

          break;
      }
    },
    onNetworkUserChanged: function(msg) {
      var vm = this;
      var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>";
      vm.humane.log(html + msg.user.name + " " + (msg.move == 1 ? vm.l10n.stringPlayerJoin : vm.l10n.stringPlayerLeave));

      if (msg.move == 1) {
        if (vm.ishost) {
          if (vm.opponentuser == null) {
            vm.$refs.chessgame.newGame();
            vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
              user: vm.presence.getUserInfo(),
              content: {
                action: 'init',
                data: {
                  chessColor: vm.$refs.chessgame.playercolor,
                  state: vm.$refs.chessgame.state,
                  clock: vm.$refs.chessgame.clock
                }
              }
            });

            vm.opponentuser = msg.user;
          } else {
            vm.presence.sendMessage(vm.presence.getSharedInfo().id, {
              user: vm.presence.getUserInfo(),
              content: {
                action: 'exit',
                data: msg.user.networkId
              }
            });
          }

        }
      } else {
        if (vm.opponentuser != null) {
          vm.opponentuser = null;
          if ((vm.$refs.chessgame.state.to_play && !vm.$refs.chessgame.playercolor) || (!vm.$refs.chessgame.state.to_play && vm.$refs.chessgame.playercolor) ) {
            vm.$refs.chessgame.makeRandomMove();
          }
          vm.presence = null;
        }
      }
    },
    onStop: function() {
      // Save current library in Journal on Stop
      var vm = this;
      requirejs(["sugar-web/activity/activity"], function(activity) {
        if (!vm.presence) {
          let stateObj = {
            playercolor: vm.$refs.chessgame.playercolor,
            state: vm.$refs.chessgame.state,
            moves: vm.$refs.chessgame.moves
          };
          var jsonData = JSON.stringify(stateObj);
          activity.getDatastoreObject().setDataAsText(jsonData);
          activity.getDatastoreObject().save(function(error) {
          });
        }

      });
    }
  }
});
