var requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';


var generateXOLogoWithColor = function(color) {
  var coloredLogo = xoLogo;
  coloredLogo = coloredLogo.replace("#010101", color.stroke)
  coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
  return "data:image/svg+xml;base64," + btoa(coloredLogo);
}

var ChessGame = {
  template: `
  <div id="chess-container">
    <div id="play-container">

      <div id="board" ></div>


		<div id="chess-panel" class="panel">
			<div id="info-container">
        <div id="opponent-clock">
          <div class="usrlogo">
          </div>
          <div class="usrtime">
            <p v-if="!presence">PC</p>
            <p v-else-if="!clock">_:_</p>
            <p v-else>{{parsedOpponentClockTime}}</p>
          </div>

        </div>
        <div id="flagDiv">
          <p>{{infotext}}</p>
        </div>
        <div id="player-clock">
          <div class="usrlogo">
          </div>
          <div class="usrtime">
          <p v-if="!clock">_:_</p>
          <p v-else>{{parsedClockTime}}</p>
            </div>
        </div>

			</div>
			<div id="moves-container">
        <ol v-if="moves.length!=0">
          <template v-for="(move, index) in moves" v-bind:key="index">
          <li v-bind:class="{
            bB: move.piece == 'b',
            bK: move.piece == 'k',
            bN: move.piece == 'n',
            bP: move.piece == 'p',
            bQ: move.piece == 'q',
            bR: move.piece == 'r',
            wB: move.piece == 'B',
            wK: move.piece == 'K',
            wN: move.piece == 'N',
            wP: move.piece == 'P',
            wQ: move.piece == 'Q',
            wR: move.piece == 'R',
          }"
          > {{move.from}}-{{move.to}}</li>
          </template>
        </ol>
			</div>
		</div>
    </div>
	</div>
  `,
  props: ['currentuser', 'opponentuser', 'presence', 'ishost', 'humane'],
  data: function() {
    return {
      state: null,
      board: null,
      whiteSquareGrey: "#7b98ed",
      blackSquareGrey: '#476bd6',
      inCheckColor: '#db3a2c',
      wonColor: '#a3e84f',
      drawColor: '#ffffff',
      normalColor: '#f0d9b5',
      game_won: false,
      game_lost: false,
      game_draw: false,
      game_check: false,
      other_check: false,
      timeexpired: false,
      playercolor: 0,
      level: 1,
      moves: [],
      infotext: 'Vs',
      clock: 0,
      stopClock: true,
      stopOpponentClock: true,
      clockTime: 30,
      opponentClockTime: 30,
      previousTime: new Date(),
      clockTotalTime: 30,
      l10n: {
        stringYouWon: '',
        stringYouCheck: '',
        stringYouLost: '',
        stringMatchDraw: '',
        stringVs: '',
        stringTimeExpired: '',
        stringThinking: ''

      }
    }
  },
  watch: {
    currentuser: function() {
      $('#player-clock .usrlogo').css('background-image', 'url(' + generateXOLogoWithColor(this.currentuser.colorvalue) + ')');
    },
    opponentuser: function() {
      if (this.opponentuser) {
        $('#opponent-clock .usrlogo').css('background-image', 'url(' + generateXOLogoWithColor(this.opponentuser.colorvalue) + ')');
        $("#opponent-clock .usrtime").css("background-color", this.opponentuser.colorvalue.fill);
      } else {
        var nullOpponent = {
          colorvalue: {
            stroke: "#000000",
            fill: "#ffffff"
          }
        };
        $("#opponent-clock .usrtime").css("background-color", this.normalColor);
        $('#opponent-clock .usrlogo').css('background-image', 'url(./icons/computer-icon.svg)');
      }
    },

    game_check: function() {
      var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(this.currentuser.colorvalue) + "'>";
      if (this.game_check) {
        $('#flagDiv').css('background-color', this.inCheckColor);
        this.infotext = this.l10n.stringYouCheck;
        this.humane.log(html + this.l10n.stringYouCheck);
      } else {
        $('#flagDiv').css('background-color', this.normalColor);
        this.infotext = this.l10n.stringVs;
      }
    },

    game_won: function() {
      if (this.game_won) {
        $('#flagDiv').css('background-color', this.wonColor);
        this.infotext = this.l10n.stringYouWon;
        this.stopClock = true;
        this.stopOpponentClock = true;
        $('#player-clock').css('border-style','none');
        $('#opponent-clock').css('border-style','none');
      } else {
        $('#flagDiv').css('background-color', this.normalColor);
        this.infotext = this.l10n.stringVs;
      }
    },

    game_lost: function() {
      if (this.game_lost) {
        $('#flagDiv').css('background-color', this.inCheckColor);
        this.infotext = this.l10n.stringYouLost;
        this.stopClock = true;
        this.stopOpponentClock = true;
        $('#player-clock').css('border-style','none');
        $('#opponent-clock').css('border-style','none');
      } else {
        $('#flagDiv').css('background-color', this.normalColor);
        this.infotext = this.l10n.stringVs;
      }
    },

    game_draw: function() {
      if (this.game_draw) {
        $('#flagDiv').css('background-color', this.drawColor);
        this.infotext = this.l10n.stringMatchDraw;
        this.stopClock = true;
        this.stopOpponentClock = true;
        $('#player-clock').css('border-style','none');
        $('#opponent-clock').css('border-style','none');
      } else {
        $('#flagDiv').css('background-color', this.normalColor);
        this.infotext = this.l10n.stringVs;
      }
    }

  },
  computed: {
    parsedClockTime: function() {
      var timeInSeconds = this.clockTime;
      var pad = function(num, size) {
          return ('000' + num).slice(size * -1);
        },
        time = parseFloat(timeInSeconds).toFixed(3),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60),
        milliseconds = time.slice(-3);
      return pad(minutes, 2) + ':' + pad(seconds, 2);

    },
    parsedOpponentClockTime: function() {
      var timeInSeconds = this.opponentClockTime;
      var pad = function(num, size) {
          return ('000' + num).slice(size * -1);
        },
        time = parseFloat(timeInSeconds).toFixed(3),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60),
        milliseconds = time.slice(-3);
      return pad(minutes, 2) + ':' + pad(seconds, 2);
    }
  },
  created: function() {

    this.state = new p4_new_game();

  },
  mounted: function() {
    let vm = this;

    this.board = Chessboard('board', {
      draggable: true,
      position: 'start',
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onSnapEnd: this.onSnapEnd,
      onMouseoverSquare: this.onMouseoverSquare,
      onMouseoutSquare: this.onMouseoutSquare
    });

    this.tick();
    $('#player-clock .usrlogo').css('background-image', 'url(' + generateXOLogoWithColor(this.currentuser.colorvalue) + ')');

    // Handle resize
    window.addEventListener("resize", function() {
      vm.board.resize();
    });

  },
  methods: {
    localized: function(localization) {
      localization.localize(this.l10n);
    },
    tick: function() {
      if (((this.presence && this.ishost && this.opponentuser) || !this.presence) && this.clock) {
        if (!this.stopClock) {
          var currentTime = new Date();
          if (currentTime - this.previousTime >= 1000) {
            this.previousTime = currentTime;

            if (this.clockTime == 0) {
              //game_lost
              this.game_lost = true;
              this.stopClock = true;
              this.stopOpponentClock = true;
              this.timeexpired = true;
              this.$emit('timeexpired', {
                data: {
                  player: 0,
                }
              });
            } else {
              this.clockTime--;
            }
          }
        }

        if (this.presence && this.ishost && this.opponentuser) {
          if (!this.stopOpponentClock) {
            var currentTime = new Date();
            if (currentTime - this.previousTime >= 1000) {
              this.previousTime = currentTime;
              if (this.opponentClockTime == 0) {
                //game won
                this.game_won = true;
                this.stopClock = true;
                this.stopOpponentClock = true;
                this.timeexpired = true;
                this.$emit('timeexpired', {
                  data: {
                    player: 1,
                  }
                });
              } else {
                this.opponentClockTime--;
              }
            }
          }
          this.$emit('sendclock', {
            data: {
              clockTime: this.clockTime,
              opponentClockTime: this.opponentClockTime
            }
          });
        }
      }

      requestAnimationFrame(this.tick.bind(this));
    },

    onSnapEnd: function() {
      this.board.position(p4_state2fen(this.state, true));
    },

    removeGreySquares: function(square) {
      $('#board .square-55d63').css('background', '')
    },

    greySquare: function(square) {
      var whiteSquareGrey = "#a9a9a9";
      var blackSquareGrey = '#696969';

      var $square = $('#board .square-' + square)

      var background = whiteSquareGrey
      if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey
      }

      $square.css('background', background);
    },

    updateMoves: function() {
      var movesHistory = this.state.history;
      var len = movesHistory.length;

      if (movesHistory.length != 0) {
        this.moves.push({
          piece: '  PpRrNnBbKkQq'.charAt(this.state.board[movesHistory[len - 1][1]]),
          from: p4_stringify_point(movesHistory[len - 1][0]),
          to: p4_stringify_point(movesHistory[len - 1][1]),
          check: this.game_check
        });
      }

    },

    onDragStart: function(source, piece, position, orientation) {
      // do not pick up pieces if the state is over
      if (this.game_won || this.game_lost || this.game_draw || this.timeexpired) return false;

      // only pick up pieces for White
      if (this.state.to_play) {
        if (piece.search(/^w/) !== -1 && this.state.to_play == 1) return false;
      } else {
        if (piece.search(/^b/) !== -1 && this.state.to_play == 0) return false;
      }

    },

    makeRandomMove: function() {
      this.infotext = this.l10n.stringThinking;

      var start_time = Date.now();
      var possibleMove = this.state.findmove(this.level);
      var delta = Date.now() - start_time;
      // game over
      if (possibleMove.length === 0) {
        this.game_won = true;
        return;
      }
      if (1 / possibleMove[2] == 1 / this.state.stalemate_scores[this.state.to_play]) {
        this.game_draw = true;
        return;
      }
      var move = this.state.move(possibleMove[0], possibleMove[1]);

      if (!(move.flags & (1 << 0))) {
        var depth = this.level;
        depth++;
        //find at higher depths until it runs out of time
        if (depth > 2){
          var min_time = 25 * depth;
          while (delta < min_time){
              depth++;
              possibleMove = state.findmove(depth);
              delta = Date.now() - start_time;
          }
        }
        if (possibleMove.length === 0) {
          this.game_won = true;
          return;
        }
        if (possibleMove[2] == this.state.stalemate_scores[this.state.to_play]) {
          this.game_draw = true;
          return;
        }
        move = this.state.move(possibleMove[0], possibleMove[1]);
        if (!(move.flags & (1 << 0))) {
          this.game_won = true;
          return;
        }
      }

      if (move.flags & (1 << 1) && move.flags & (1 << 2)) {
        this.game_lost = true;

      } else if (move.flags & (1 << 1) && !(move.flags & (1 << 2))) {
        this.game_check = true;
      } else if ((!(move.flags & (1 << 1)) && move.flags & (1 << 2)) || move.flags & (1 << 6)) {
        this.game_draw = true;
      } else {
        this.game_check = false;
      }

      this.board.position(p4_state2fen(this.state, true));
      if (this.clock) {
        this.stopClock = false;
      }
      $('#player-clock').css('border-style','solid');
      $('#opponent-clock').css('border-style','none');
      this.updateMoves();
      this.infotext = this.l10n.stringVs;

    },

    onDrop: function(source, target) {
      var turn = this.playercolor ? this.state.moveno % 2 != 0 : this.state.moveno % 2 == 0;
      if (!this.presence || (this.presence && turn)) {
        this.removeGreySquares();

        var move = this.state.move(source, target);

        // illegal move
        if (move.flags === 0) return 'snapback';

        if (move.flags === 7) {
          this.game_won = true;
        } else if ((!(move.flags & (1 << 1)) && move.flags & (1 << 2)) || move.flags & (1 << 6)) {
          this.game_draw = true;
        } else {
          this.game_check = false;
        }

        if (move.flags & (1 << 1) && !(move.flags & (1 << 2))) {
          this.other_check = true;
        } else {
          this.other_check = false;
        }

        if (this.presence) {
          if (this.ishost) {
            this.stopClock = true;
            this.stopOpponentClock = false;
          }
        } else {
          this.stopClock = true;
          this.stopOpponentClock = false;
        }

        $('#player-clock').css('border-style','none');
        $('#opponent-clock').css('border-style','solid');

        if (this.presence) {
          this.$emit('sendmove', {
            data: {
              chessColor: this.playercolor,
              state: this.state,
              game_won: this.game_lost,
              game_lost: this.game_won,
              game_draw: this.game_draw,
              game_check: this.other_check,
            }
          });

        }
        $("#canvas").css("background-color", this.currentuser.colorvalue.fill);
        this.updateMoves();

        if (!this.presence) {
          // make random legal move for black
          window.setTimeout(this.makeRandomMove, 250);
        }
      }

    },

    onMouseoverSquare: function(square, piece) {
      // get list of possible moves for this square
      var moves = [];
      p4_prepare(this.state);
      var allMoves = p4_parse(this.state, this.state.to_play, undefined, 0);

      for (var i = 0; i < allMoves.length; i++) {
        if (p4_stringify_point(allMoves[i][1]) == square) {
          moves.push(p4_stringify_point(allMoves[i][2]));
        }
      }

      if (moves.length === 0) return;

      if (this.state.to_play != this.playercolor) return;

      if (this.game_won || this.game_draw || this.game_lost) return;

      this.greySquare(square);

      // highlight the possible squares for this piece
      for (var i = 0; i < moves.length; i++) {
        this.greySquare(moves[i]);
      }
    },

    onMouseoutSquare: function(square, piece) {
      this.removeGreySquares()
    },

    newGame: function() {

      this.board.start();
      p4_jump_to_moveno(this.state, 0);
      this.game_won = false;
      this.game_lost = false;
      this.game_draw = false;
      this.game_check = false;
      this.other_check = false;
      this.timeexpired = false;
      this.clockTime = this.clockTotalTime;
      this.opponentClockTime = this.clockTotalTime;
      this.stopClock = true;
      this.stopOpponentClock = true;

      this.moves = [];

      if (this.playercolor) {
        //if it is black oriented
        $('#player-clock').css('border-style','none');
        $('#opponent-clock').css('border-style','solid');
        if (!this.presence) {
          this.makeRandomMove();
        }
      }
      else {
        $('#player-clock').css('border-style','solid');
        $('#opponent-clock').css('border-style','none');
      }

      if (this.presence) {
        this.$emit('restart');
      }
      if (this.clock) {
        this.stopClock = false;
      }

    },

    undo: function() {
      if (!this.presence) {
        if ((!this.playercolor && this.state.moveno > 0) || (this.playercolor && this.state.moveno > 1)) {
          if(this.game_won){
            this.game_won = false;
          }
          if(this.game_draw){
            this.game_draw = false;
          }
          if(this.game_lost){
            this.game_lost = false;
          }
          p4_jump_to_moveno(this.state, this.state.moveno - 2);
          this.board.position(p4_state2fen(this.state, true));
          this.moves.pop();
          this.moves.pop();
          this.game_check = this.moves[this.moves.length - 1].check;
        }
      }
    },

    changeColor: function(flipInMultiplayer) {
      if (flipInMultiplayer) {
        if (this.playercolor) {
          this.board.orientation('white');
          this.playercolor = 0;
        }
        else {
          this.board.orientation('black');
          this.playercolor = 1;
        }
      }
      else {
        if (this.state.moveno == 0) {
          this.board.orientation('black');
          this.playercolor = 1;
        } else if (this.state.moveno == 1) {
          this.board.start(false);
          this.board.orientation('white');
          this.playercolor = 0;
        }
      }

      this.newGame();

    },

    onComputerlevelChanged: function(lvl) {
      this.level = lvl;
    },

    onClockSelected: function(index, withTime) {
      switch (index) {
        case 0:
          this.clockTotalTime = 0;
          this.stopClock = true;
          this.stopOpponentClock = true;
          document.getElementById("disabled-clock").classList.add("selected");
          document.getElementById("lightning-clock").classList.remove("selected");
          document.getElementById("blitz-clock").classList.remove("selected");
          document.getElementById("tournament-clock").classList.remove("selected");
          break;
        case 1:
          this.clockTotalTime = 30;
          if (this.state.to_play == this.playercolor) {
            this.stopClock = false;
            this.stopOpponentClock = true;
          } else {
            this.stopClock = true;
            this.stopOpponentClock = false;
          }
          document.getElementById("lightning-clock").classList.add("selected");
          document.getElementById("disabled-clock").classList.remove("selected");
          document.getElementById("blitz-clock").classList.remove("selected");
          document.getElementById("tournament-clock").classList.remove("selected");
          break;
        case 2:
          this.clockTotalTime = 3 * 60;
          if (this.state.to_play == this.playercolor) {
            this.stopClock = false;
            this.stopOpponentClock = true;
          } else {
            this.stopClock = true;
            this.stopOpponentClock = false;
          }
          document.getElementById("blitz-clock").classList.add("selected");
          document.getElementById("disabled-clock").classList.remove("selected");
          document.getElementById("lightning-clock").classList.remove("selected");
          document.getElementById("tournament-clock").classList.remove("selected");
          break;
        case 3:
          this.clockTotalTime = 10 * 60;
          if (this.state.to_play == this.playercolor) {
            this.stopClock = false;
            this.stopOpponentClock = true;
          } else {
            this.stopClock = true;
            this.stopOpponentClock = false;
          }
          document.getElementById("tournament-clock").classList.add("selected");
          document.getElementById("disabled-clock").classList.remove("selected");
          document.getElementById("blitz-clock").classList.remove("selected");
          document.getElementById("lightning-clock").classList.remove("selected");
          break;
        default:
          this.clockTotalTime = 0;
          this.stopClock = true;
          this.stopOpponentClock = true;
          document.getElementById("disabled-clock").classList.remove("selected");
          document.getElementById("lightning-clock").classList.remove("selected");
          document.getElementById("blitz-clock").classList.remove("selected");
          document.getElementById("tournament-clock").classList.remove("selected");
      }
      this.clock = index;
      if (withTime != undefined) {
        this.clockTime = withTime;
      }
      else {
        this.clockTime = this.clockTotalTime;
      }
      this.opponentClockTime = this.clockTotalTime;

    }

  }

}
