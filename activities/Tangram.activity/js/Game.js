var Game = {
  components: {
    "clock": Clock,
  },
  props: ['strokeColor', 'fillColor', 'puzzles', 'pNo', 'showHint', 'hintNumber', 'noOfHintsUsed', 'mode', 'level', 'gameOver', 'time', 'userResponse', 'score', 'disabled', 'l10n'],
  template: `
    <div id="game-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="game-main">
        <v-stage class="stage" ref="stage" v-bind:config="configKonva"
          v-bind:style="{
            backgroundColor: '#ffffff',
            borderRadius: '10px'
          }"
          v-on:dragstart="onDragStart"
          v-on:dragend="onDragEnd"
        >
          <v-layer ref="layer" :config="configLayer">
          <v-line :config="partitionLine"></v-line>
          <template v-if="puzzles[pNo]">
            <v-line
              v-for="(outline,index) in puzzles[pNo].outlinePoints" :key="index"
              :config="{
                points: outline,
                fill: index===0 ? strokeColor: '#ffffff',
                closed: true,
                lineJoin: 'round',
              }"
            ></v-line>
            <v-line v-for="(targetTan,index) in targetPuzzleTans" :key="targetTan.id"
              :config="{
                ...targetTan,
                fill: gameOver==='solved' ? fillColor : targetTan.fill
              }"
            ></v-line>
          </template>
          <template v-if="!(gameOver==='passed')">
            <v-line v-for="tan in konvaTans" :key="tan.id" v-if="!(showHint && (tansSnapped[tan.id] || tansPlaced[tan.id]!=-1))"
              :config="{
                ...tan,
                listening: !gameOver,
              }"
              v-on:tap="onTap"
              v-on:click="onClick"
              v-on:mouseover="onMouseOver"
              v-on:mouseout="onMouseOut"
            ></v-line>
          </template>
          </v-layer>
        </v-stage>
        <button id="back-button" v-if="!disabled" v-on:click="$emit('go-to-dataset-list')"></button>
        <div id="floating-info-block"
          v-if="mode=='timer'"
          v-bind:style="{width: infoContainer.width + 'px',
            height: infoContainer.height + 'px',
            top: infoContainer.top + 'px',
            right: infoContainer.right + 'px'
          }"
        >
          <div class="detail-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-logo clock-logo"></div>
            <div class="detail-block-content">
              <clock v-bind:time="time"></clock>
            </div>
          </div>

          <div class="detail-block score-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="detail-block-content score-title"><div>{{ l10n.stringScore }}:</div></div>
            <div class="detail-block-content score-val"><div>{{score}}</div></div>
          </div>

        </div>
        <div class="tangram-name detail-block floating-block"
          v-bind:style="{width: nameBlock.width + 'px',
            height: nameBlock.height + 'px',
            top: nameBlock.top + 'px',
            left: nameBlock.left + 'px',
            borderColor: 'transparent'
          }"
        >
          <div class="detail-block-content tangram-name-content"><div>{{ puzzles[pNo] ? $root.SugarL10n.get(puzzles[pNo].name) : ''}}</div></div>
        </div>

        <canvas id="floating-celebration-block"
          v-if="mode==='non-timer' && gameOver==='solved'"
          v-bind:style="{width: celebrationBlock.width + 'px',
            height: celebrationBlock.height + 'px',
            top: celebrationBlock.top + 'px',
            left: celebrationBlock.left + 'px'
          }"
        >
        </canvas>

        <div id="floating-game-over-block"
          v-if="mode==='non-timer' && gameOver"
          v-bind:style="{width: gameOverContainer.width + 'px',
            height: gameOverContainer.height + 'px',
            top: gameOverContainer.top + 'px',
            right: gameOverContainer.right + 'px'
          }"
        >
          <div class="gameOver-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="gameOver-block-logo clock-logo"></div>
            <div class="gameOver-block-content">
              <clock v-bind:time="time"></clock>
            </div>
          </div>

          <div class="gameOver-block score-block"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="gameOver-block-content score-title"><div>Score:</div></div>
            <div class="gameOver-block-content score-val"><div>{{userResponse[pNo] ? userResponse[pNo].score : 0}}</div></div>
          </div>

          <div class="gameOver-block hintsUsed-block"
            v-if="level && gameOver ==='solved'"
            v-bind:style="{borderColor: strokeColor}"
          >
            <div class="gameOver-block-content hintsUsed-title"><div>Hints Used:</div></div>
            <div class="gameOver-block-content hintsUsed-val"><div>{{noOfHintsUsed}}</div></div>
          </div>

          <div class="gameOver-block emoji-won-block"
            v-if="gameOver==='solved'"
            v-bind:style="{borderColor: null}"
          ></div>
          <div class="gameOver-block emoji-lost-block"
            v-if="gameOver==='passed'"
            v-bind:style="{borderColor: null}"
          ></div>

        </div>
      </div>
      <div class="game-footer">
        <div>
        </div>
        <div class="footer-actions">
          <transition name="fade" mode="out-in">
            <button
              v-if="!gameOver"
              class="btn-in-footer btn-replay"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="onRefresh"
            ></button>
          </transition>
          <transition name="fade" mode="out-in">
            <button
              class="btn-in-footer btn-restart"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('restart-game')"
              v-if="(mode==='timer'?'true':gameOver) && !disabled"
            ></button>
          </transition>
          <transition name="fade" mode="out-in">
            <button
              class="btn-in-footer btn-pass"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('pass-puzzle')"
              v-if="!gameOver"
            ></button>
          </transition>
        </div>
      </div>

    </div>
  `,
  data: function() {
    return {
      configKonva: {
        width: 60,
        height: 60,
      },
      configLayer: {
        scaleX: 6,
        scaleY: 6
      },
      infoContainer: {
        width: 1,
        height: 1,
        top: 0,
        right: 0,
      },
      gameOverContainer: {
        width: 1,
        height: 1,
        top: 0,
        right: 0,
      },
      nameBlock: {
        width: 1,
        height: 1,
        top: 0,
        left: 0
      },
      celebrationBlock: {
        width: 1,
        height: 1,
        top: 0,
        left: 0
      },
      partitionLine: {
        points: [],
        stroke: 'green',
        strokeWidth: 0.8,
        lineJoin: 'round',
        dash: [2, 2]
      },
      actionButtons: {
        width: 30,
        width: 30,
      },
      tans: [],
      tanState: 0,
      currentTan: 0,
      flip: 5,
      initialPositions: [],
      tanColors: ["blue", "purple", "red", "green", "yellow", "yellow"],
      tansPlaced: [-1, -1, -1, -1, -1, -1, -1],
      snapRange: 1.5,
      tansSnapped: [false, false, false, false, false, false, false],
      konvaTans: []
    }
  },

  created: function() {
    let vm = this;
    window.addEventListener('resize', vm.resize);
    window.addEventListener('keydown', vm.onKeyDown);
    window.addEventListener('keyup', vm.onKeyUp);
  },

  destroyed: function() {
    let vm = this;
    window.removeEventListener("resize", vm.resize);
    window.removeEventListener('keydown', vm.onKeyDown);
    window.removeEventListener('keyup', vm.onKeyUp);
  },

  mounted: function() {
    let vm = this;
    vm.resize();
    setTimeout(() => {
      vm.initializeTans();
    }, 0);
  },

  computed: {
    targetPuzzleTans: function() {
      let vm = this;
      if (vm.gameOver != null) {
        return vm.puzzles[vm.pNo].targetTans;
      }

      if (vm.level === 1 && !vm.showHint && vm.gameOver === null) {
        return [];
      }
      let targetPuzzleTans = vm.puzzles[vm.pNo].targetTans.filter((targetTan, index) => {
        if (vm.tansPlaced.includes(index)) return false;
        if (!vm.showHint) return true;
        if (vm.showHint && index === vm.hintNumber) return true;
      });
      return targetPuzzleTans
    }
  },

  watch: {
    mode: function() {
      let vm = this;
      vm.resize();
      vm.initializeTans();
    },

    puzzles: function() {
      this.initializeTans();
    },

    pNo: function() {
      this.initializeTans();
    },

    gameOver: function() {
      let vm = this;
      if (vm.gameOver === 'solved') {
        vm.deSelectTan(vm.currentTan);
        if (vm.mode === 'non-timer') {
          setTimeout(() => {
            let myCanvas = document.querySelector('#floating-celebration-block');
            let myConfetti = confetti.create(myCanvas, {
              resize: true,
              useWorker: true
            });
            myConfetti({
              particleCount: 150,
              spread: 100,
              origin: {
                x: 0.5,
                y: 0.85
              }
            });
            setTimeout(() => {
              confetti.reset();
            }, 3000);
          }, 0);
        }
      } else if (vm.gameOver === null) {
        vm.initializeTans();
      }
    },

    tans: function () {
      this.konvaTans = [...this.tans];
    }
  },

  methods: {
    resize: function() {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight

      document.querySelector('#game-screen').style.height = newHeight + "px";
      let gameMainEle = document.querySelector('.game-main');
      let cw = gameMainEle.offsetWidth * 0.985;
      let ch = gameMainEle.offsetHeight * 0.97;
      let scale = Math.min(cw * 0.65, ch) / 75;

      let pw = vm.configKonva.width;
      let ph = vm.configKonva.height;
      let pScale = Math.min(pw * 0.65, ph) / 75;

      vm.$set(vm.configKonva, 'width', cw);
      vm.$set(vm.configKonva, 'height', ch);

      vm.$set(vm.configLayer, 'scaleX', scale);
      vm.$set(vm.configLayer, 'scaleY', scale);

      vm.$emit('config-changed', {
        stageWidth: cw,
        stageHeight: ch,
        scale: scale
      });

      vm.$emit('center-tangram');

      vm.initializeTansPosition();

      if (vm.tans.length != 0) {
        setTimeout(() => {
          for (var index = 0; index < 7; index++) {
            if (vm.tansPlaced[index] !== -1) {
              let tan_dx = cw / (3 * scale) - pw / (3 * pScale);
              let tan_dy = ch / (2 * scale) - ph / (2 * pScale);
              vm.moveTan(index, tan_dx, tan_dy);
            } else {
              let tan_dx = ((cw / pw) * (pScale / scale) - 1) * vm.tans[index].x;
              let tan_dy = ((ch / ph) * (pScale / scale) - 1) * vm.tans[index].y;
              vm.moveTan(index, tan_dx, tan_dy);
            }
          }
        }, 0);
      }

      vm.$set(vm.infoContainer, 'width', gameMainEle.offsetWidth * 0.36);
      vm.$set(vm.infoContainer, 'height', gameMainEle.offsetHeight * 0.15);
      vm.$set(vm.infoContainer, 'top', gameMainEle.offsetHeight * 0.02);
      vm.$set(vm.infoContainer, 'right', gameMainEle.offsetWidth * 0.01);

      vm.$set(vm.gameOverContainer, 'width', gameMainEle.offsetWidth * 0.34);
      vm.$set(vm.gameOverContainer, 'height', gameMainEle.offsetHeight * 0.95);
      vm.$set(vm.gameOverContainer, 'top', gameMainEle.offsetHeight * 0.02);
      vm.$set(vm.gameOverContainer, 'right', gameMainEle.offsetWidth * 0.01);

      vm.resizePartitionLine();

      vm.$set(vm.nameBlock, 'width', gameMainEle.offsetWidth * 0.65);
      vm.$set(vm.nameBlock, 'height', gameMainEle.offsetHeight * 0.12);
      vm.$set(vm.nameBlock, 'top', gameMainEle.offsetHeight * 0.006);
      vm.$set(vm.nameBlock, 'left', gameMainEle.offsetWidth * 0.01);

      vm.$set(vm.celebrationBlock, 'width', cw * 0.7);
      vm.$set(vm.celebrationBlock, 'height', ch);
      vm.$set(vm.celebrationBlock, 'top', gameMainEle.offsetHeight * 0.02);
      vm.$set(vm.celebrationBlock, 'left', gameMainEle.offsetWidth * 0.01);

      let gameFooterEle = document.querySelector('.game-footer');
      vm.$set(vm.actionButtons, 'width', gameFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', gameFooterEle.offsetHeight * 0.95);
    },

    initializeTansPosition: function() {
      let vm = this;
      let gameMainEle = document.querySelector('.game-main');
      let cw = gameMainEle.offsetWidth * 0.98;
      let ch = gameMainEle.offsetHeight * 0.97;
      let scale = vm.configLayer.scaleX;
      let tmp = vm.mode === 'timer' ? 0.08 : 0;

      vm.initialPositions = [];
      for (var i = 0; i < 7; i++) {
        switch (i) {
          case 0:
            vm.initialPositions.push({
              tanType: 0,
              orientation: 1,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.88),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.70 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 1:
            vm.initialPositions.push({
              tanType: 0,
              orientation: 7,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.87),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.27 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 2:
            vm.initialPositions.push({
              tanType: 1,
              orientation: 0,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.72),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.70 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 3:
            vm.initialPositions.push({
              tanType: 2,
              orientation: 3,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.93),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.50 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 4:
            vm.initialPositions.push({
              tanType: 2,
              orientation: 5,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.75),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.43),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 5:
            vm.initialPositions.push({
              tanType: 3,
              orientation: 7,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.78),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.52 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
          case 6:
            vm.initialPositions.push({
              tanType: 5,
              orientation: 0,
              anchor: {
                x: {
                  coeffInt: (cw / scale) * (0.72),
                  coeffSqrt: 1
                },
                y: {
                  coeffInt: (ch / scale) * (0.23 + tmp),
                  coeffSqrt: 1
                }
              }
            })
            break;
        }
      }
    },

    resizePartitionLine: function() {
      let vm = this;
      let gameMainEle = document.querySelector('.game-main');
      let cw = gameMainEle.offsetWidth * 0.98;
      let ch = gameMainEle.offsetHeight * 0.97;
      let scale = vm.configLayer.scaleX;

      let partitionLinePoints;
      if (vm.mode === 'timer') {
        partitionLinePoints = [gameMainEle.offsetWidth * 0.625 / scale, gameMainEle.offsetHeight * 0.16 / scale, gameMainEle.offsetWidth * 0.625 / scale, ch / scale];
      } else {
        partitionLinePoints = [gameMainEle.offsetWidth * 0.625 / scale, gameMainEle.offsetHeight * 0.01 / scale, gameMainEle.offsetWidth * 0.625 / scale, ch / scale];
      }
      vm.$set(vm.partitionLine, 'points', partitionLinePoints);
      vm.$set(vm.partitionLine, 'stroke', vm.strokeColor);
    },

    loadContext: function(context) {
      let vm = this;
      let tanObjsArr = context.tans;
      let pScale = context.pScale;
      let pw = context.pStage.width;
      let ph = context.pStage.height;
      vm.populateTans(tanObjsArr);
      for (var i = 0; i < 7; i++) {
        let dx, dy;
        if (tanObjsArr[i].placedAnchor) {
          dx = vm.configKonva.width / (3 * vm.configLayer.scaleX) - context.pStage.width / (3 * context.pScale);
          dy = vm.configKonva.height / (2 * vm.configLayer.scaleY) - context.pStage.height / (2 * context.pScale);
        } else {
          dx = ((vm.configKonva.width / pw) * (pScale / vm.configLayer.scaleX) - 1) * vm.tans[i].tanObj.anchor.toFloatX();
          dy = ((vm.configKonva.height / ph) * (pScale / vm.configLayer.scaleY) - 1) * vm.tans[i].tanObj.anchor.toFloatY();
        }
        vm.moveTan(i, dx, dy);
      }
      vm.tansSnapped = context.tansSnapped ? context.tansSnapped : [false, false, false, false, false, false, false];
      vm.tansPlaced = context.tansPlaced ? context.tansPlaced : [-1, -1, -1, -1, -1, -1, -1];
      vm.$emit('update-tans-placed', vm.tansPlaced);
    },

    initializeTans: function() {
      let vm = this;
      let tans = [];
      vm.populateTans(vm.initialPositions);
      vm.tansSnapped = [false, false, false, false, false, false, false];
      vm.tansPlaced = [-1, -1, -1, -1, -1, -1, -1];
      vm.$emit('tangram-status', {
        res: false,
        tans: [],
      });
      vm.$emit('update-tans-placed', vm.tansPlaced);
    },

    populateTans: function(tanObjsArr) {
      let vm = this;
      let tans = [];
      for (var i = 0; i < 7; i++) {
        let orientation = tanObjsArr[i].orientation;
        let tanType = tanObjsArr[i].tanType;
        let anchor = null,
          placedAnchor = null;
        let coeffIntX = tanObjsArr[i].anchor.x.coeffInt;
        let coeffSqrtX = tanObjsArr[i].anchor.x.coeffSqrt;
        let coeffIntY = tanObjsArr[i].anchor.y.coeffInt;
        let coeffSqrtY = tanObjsArr[i].anchor.y.coeffSqrt;
        anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
        if (tanObjsArr[i].placedAnchor) {
          let coeffIntX = tanObjsArr[i].placedAnchor.x.coeffInt;
          let coeffSqrtX = tanObjsArr[i].placedAnchor.x.coeffSqrt;
          let coeffIntY = tanObjsArr[i].placedAnchor.y.coeffInt;
          let coeffSqrtY = tanObjsArr[i].placedAnchor.y.coeffSqrt;
          placedAnchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
        }
        let tan = {
          id: i,
          x: 100,
          y: 100,
          offsetX: 100,
          offsetY: 100,
          points: [],
          tanObj: null,
          placedAnchor: placedAnchor,
          stroke: vm.strokeColor,
          strokeEnabled: false,
          strokeWidth: 0.8,
          closed: true,
          draggable: true,
          fill: 'blue',
          lineJoin: 'round',
          shadowColor: 'black',
          shadowBlur: 4,
          shadowOpacity: 0.5,
          shadowEnabled: false
        }
        tan.tanObj = new Tan(tanType, anchor, orientation);
        let points = [...tan.tanObj.getPoints()];
        let center = tan.tanObj.center();

        let floatPoints = [];
        for (let j = 0; j < points.length; j++) {
          let tmpPoint = points[j].dup();
          floatPoints.push(tmpPoint.toFloatX());
          floatPoints.push(tmpPoint.toFloatY());
        }
        tan.offsetX = center.toFloatX();
        tan.offsetY = center.toFloatY();
        tan.x = tan.offsetX;
        tan.y = tan.offsetY;
        tan.points = floatPoints;
        tan.fill = vm.tanColors[tan.tanObj.tanType];
        tans.push(tan);
      }
      vm.tans = tans;
      vm.tanState = 0;
      vm.flip = tans[5].tanObj.tanType === 5 ? 6 : 5;
    },

    snapTan: function(index) {
      let vm = this;
      let currentTan = this.tans[index];
      let x = currentTan.x;
      let y = currentTan.y;
      let currentTanPoints = currentTan.points;
      let currentTanPointsObjs = currentTan.tanObj.getPoints();

      let flag = false;
      for (let i = 0; i < 7; i++) {
        if (i == index) {
          continue;
        }
        let otherTanPoints = [...vm.tans[i].points];
        let otherTanPointsObjs = [...vm.tans[i].tanObj.getPoints()];

        for (let j = 0; j < currentTanPoints.length; j += 2) {
          let fl = false;
          for (let k = 0; k < otherTanPoints.length; k += 2) {
            if (Math.abs(currentTanPoints[j] - otherTanPoints[k]) <= vm.snapRange && Math.abs(currentTanPoints[j + 1] - otherTanPoints[k + 1]) <= vm.snapRange) {
              let diff;
              if (!vm.tansSnapped[i]) {
                diff = otherTanPointsObjs[k / 2].dup().subtract(currentTanPointsObjs[j / 2]);
                currentTan.tanObj.anchor.add(diff);
              } else {
                let placedAnchor = null;
                let prevAnchor = currentTan.tanObj.anchor.dup();
                currentTan.tanObj.anchor = k === 0 ?
                  vm.tans[i].tanObj.anchor.dup() : vm.tans[i].tanObj.anchor.dup().add(Directions[vm.tans[i].tanObj.tanType][vm.tans[i].tanObj.orientation][k / 2 - 1]);

                placedAnchor = k === 0 ?
                  vm.tans[i].placedAnchor.dup() : vm.tans[i].placedAnchor.dup().add(Directions[vm.tans[i].tanObj.tanType][vm.tans[i].tanObj.orientation][k / 2 - 1]);

                if (j != 0) {
                  currentTan.tanObj.anchor.subtract(Directions[currentTan.tanObj.tanType][currentTan.tanObj.orientation][j / 2 - 1]);
                  placedAnchor.subtract(Directions[currentTan.tanObj.tanType][currentTan.tanObj.orientation][j / 2 - 1]);
                }
                diff = currentTan.tanObj.anchor.dup().subtract(prevAnchor);
                vm.tansSnapped[index] = true;
                vm.$set(vm.tans[index], 'placedAnchor', placedAnchor);
              }
              let dx = diff.toFloatX();
              let dy = diff.toFloatY();
              //update points
              vm.updatePoints(index);
              fl = true;
              break;
            }
          }
          if (fl) {
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }

      if (!flag) {
        for (var i = 0; i < currentTanPoints.length; i += 2) {

          for (var targetTan = 0; targetTan < vm.puzzles[vm.pNo].targetTans.length; targetTan++) {
            var fl = false;
            for (var j = 0; j < vm.puzzles[vm.pNo].targetTans[targetTan].points.length; j += 2)
              if (Math.abs(currentTanPoints[i] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j]) <= vm.snapRange && Math.abs(currentTanPoints[i + 1] - vm.puzzles[vm.pNo].targetTans[targetTan].points[j + 1]) <= vm.snapRange) {
                let pointObj = new Point(new IntAdjoinSqrt2(vm.puzzles[vm.pNo].targetTans[targetTan].points[j], 0), new IntAdjoinSqrt2(vm.puzzles[vm.pNo].targetTans[targetTan].points[j + 1], 0));
                let placedAnchor = vm.puzzles[vm.pNo].targetTans[targetTan].pointsObjs[j / 2].dup();

                currentTan.tanObj.anchor = pointObj.dup();
                if (i != 0) {
                  placedAnchor.subtract(Directions[currentTan.tanObj.tanType][currentTan.tanObj.orientation][i / 2 - 1]);
                  currentTan.tanObj.anchor.subtract(Directions[currentTan.tanObj.tanType][currentTan.tanObj.orientation][i / 2 - 1]);
                }
                vm.$set(vm.tans[index], 'placedAnchor', placedAnchor);
                vm.tansSnapped[index] = true;
                //update points
                vm.updatePoints(index);
                fl = true;
                break;
              }
            if (fl) {
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
      }
      if (!flag) {
        vm.tansSnapped[index] = false;
        vm.$set(vm.tans[index], 'placedAnchor', null);
      }
    },

    updatePoints: function(index) {
      let vm = this;
      let points = vm.tans[index].tanObj.getPoints();
      let center = vm.tans[index].tanObj.center();
      vm.$set(vm.tans[index], 'points', []);

      for (let j = 0; j < points.length; j++) {
        vm.tans[index].points.push(points[j].toFloatX());
        vm.tans[index].points.push(points[j].toFloatY());
      }
      vm.$set(vm.tans[index], 'offsetX', center.toFloatX());
      vm.$set(vm.tans[index], 'offsetY', center.toFloatY());
      vm.$set(vm.tans[index], 'x', center.toFloatX());
      vm.$set(vm.tans[index], 'y', center.toFloatY());
    },

    moveTan: function(index, dx, dy) {
      let vm = this;
      vm.tans[index].tanObj.anchor.add(new Point(new IntAdjoinSqrt2(dx, 0), new IntAdjoinSqrt2(dy, 0)));
      vm.updatePoints(index);
    },

    rotateTan: function(index) {
      let vm = this;
      let cx = vm.tans[index].x;
      let cy = vm.tans[index].y;
      let tanCenter = new Point(new IntAdjoinSqrt2(cx, 0), new IntAdjoinSqrt2(cy, 0));

      if (vm.tans[index].tanObj.tanType == vm.flip && vm.tans[index].tanObj.orientation == 3) {
        //flip parallelogram
        let newTanType = vm.flip == 4 ? 5 : 4;
        let newOrientation = 0;
        let anchor = tanCenter.dup();
        let sub = InsideDirections[newTanType][newOrientation][0];
        anchor.x.subtract(new IntAdjoinSqrt2(sub.toFloatX(), 0));
        anchor.y.subtract(new IntAdjoinSqrt2(sub.toFloatY(), 0));
        vm.tans[index].tanObj.anchor = anchor.dup();
        vm.tans[index].tanObj.tanType = newTanType;
        vm.tans[index].tanObj.orientation = newOrientation;
        vm.updatePoints(index);

        vm.flip = vm.flip == 4 ? 5 : 4;
      } else {
        //rotate tan
        vm.tans[index].tanObj.anchor.subtract(tanCenter).rotate(45).add(tanCenter);
        vm.tans[index].tanObj.orientation = (vm.tans[index].tanObj.orientation + 1) % 8;

        vm.updatePoints(index);
      }
    },

    checkIfSolved: function() {
      let vm = this;
      let solved = true;
      let currentTanPoints = [...vm.tans[vm.currentTan].points].sort();
      let tanType = vm.tans[vm.currentTan].tanObj.tanType;
      let placed = -1;

      for (let i = 0; i < vm.puzzles[vm.pNo].targetTans.length; i++) {
        let targetTan = vm.puzzles[vm.pNo].targetTans[i];
        if (targetTan.tanObj.tanType === tanType) {
          let tmp = 0;
          let targetPoints = [...targetTan.points].sort();
          for (var j = 0; j < targetPoints.length; j++) {
            if (Math.abs(targetPoints[j] - currentTanPoints[j]) < 0.5) {
              tmp++;
            }
          }
          if (tmp === targetPoints.length) {
            placed = i;
            break;
          }
        }
      }
      vm.$set(vm.tansPlaced, vm.currentTan, placed);
      vm.$emit('update-tans-placed', vm.tansPlaced);

      //check if all tans are well placed...
      for (var i = 0; i < 7; i++) {
        if (vm.tansPlaced[i] === -1) {
          solved = false;
          break;
        }
      }
      if (solved) {
        let tans = [];
        for (var i = 0; i < 7; i++) {
          if (vm.tansSnapped[i]) {
            let point = vm.tans[i].placedAnchor.dup();
            var tan = new Tan(vm.tans[i].tanObj.tanType, point, vm.tans[i].tanObj.orientation);
            tans.push(tan);
          }
        }
        vm.$emit('tangram-status', {
          res: true,
          tans: tans
        });
        return;
      }

      //check the outline
      let tans = [];
      let notFinished = false;
      for (let i = 0; i < vm.tans.length; i++) {
        if (vm.tansSnapped[i]) {
          let point = vm.tans[i].placedAnchor.dup();
          var tan = new Tan(vm.tans[i].tanObj.tanType, point, vm.tans[i].tanObj.orientation);
          tans.push(tan);
        } else {
          notFinished = true;
          break;
        }
      }
      if (!notFinished) {
        let currentOut = computeOutline(tans, true);
        if (typeof currentOut === 'undefined' ||
          currentOut.length != vm.puzzles[vm.pNo].outline.length) {
          solved = false;
        } else {
          var tmp = true;
          for (var outlineId = 0; outlineId < vm.puzzles[vm.pNo].outline.length; outlineId++) {
            tmp = tmp && arrayEq(vm.puzzles[vm.pNo].outline[outlineId], currentOut[outlineId], comparePoints);
          }
          solved = tmp;
          if (solved) {
            let tanSegments = computeSegments(getAllPoints(tans), tans);
            for (let segmentId = 0; segmentId < tanSegments.length; segmentId++) {
              for (let otherSegmentsId = segmentId + 1; otherSegmentsId < tanSegments.length; otherSegmentsId++) {
                if (tanSegments[segmentId].intersects(tanSegments[otherSegmentsId])) {
                  solved = false;
                  break;
                }
              }
            }
          }
          console.log(solved);
        }
      } else {
        solved = false;
      }
      vm.$emit('tangram-status', {
        res: solved,
        tans: tans
      });

    },

    selectTan: function(index) {
      let vm = this;
      vm.$set(vm.tans[index], 'strokeEnabled', true);
      vm.$set(vm.tans[index], 'shadowEnabled', true);
    },

    deSelectTan: function(index) {
      let vm = this;
      vm.$set(vm.tans[index], 'strokeEnabled', false);
      vm.$set(vm.tans[index], 'shadowEnabled', false);
    },

    updateKonvaTans: function (index) {
      this.konvaTans = [...this.tans];
      let indx = this.konvaTans.findIndex(ele => ele.id===index);
      let item = this.konvaTans[indx];
      this.konvaTans.splice(indx, 1);
      this.konvaTans.push(item);
    },

    onClick: function(e) {
      let vm = this;
      let index = e.target.id();
      vm.tanState = 1;
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(vm.currentTan);
      vm.updateKonvaTans(index);
      if (vm.tanState === 1) {
        vm.rotateTan(index);
      }
    },

    onTap: function(e) {
      let vm = this;
      let index = e.target.id();
      vm.tanState = 1;
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(vm.currentTan);
      vm.updateKonvaTans(index);
      if (vm.tanState === 1) {
        vm.rotateTan(index);
      }
    },

    onDragStart: function(e) {
      let vm = this;
      let index = e.target.id();
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(vm.currentTan);
      vm.updateKonvaTans(index);
      vm.tanState = 1;
    },

    onDragEnd: function(e) {
      let vm = this;
      let index = e.target.id();
      let isTanOutsideCanvas = false;
      let finalX = e.target.attrs.x;
      let finalY = e.target.attrs.y;

      let mdx = finalX - vm.tans[index].x;
      let mdy = finalY - vm.tans[index].y;

      setTimeout(() => {
        vm.moveTan(index, mdx, mdy);
      }, 0);
      setTimeout(()=>{
        let boundingBox = e.target.getClientRect();
        boundingBox.width *= 0.5;
        boundingBox.height *= 0.5;
        let iw = vm.mode === 'timer' ? vm.infoContainer.width : 0;
        let ih = vm.mode === 'timer' ? vm.infoContainer.height : 0;

        //checking conditions if the tan gets out of canvas boundary
        let scale = vm.configLayer.scaleX;
        if (boundingBox.x < 0) {
          finalX = boundingBox.width / (2 * scale);
          isTanOutsideCanvas = true;
        }
        if (boundingBox.y < 0) {
          finalY = boundingBox.height / (2 * scale);
          isTanOutsideCanvas = true;
        }
        if (boundingBox.y + boundingBox.height > vm.configKonva.height) {
          finalY = (vm.configKonva.height - boundingBox.height / 2) / scale;
          isTanOutsideCanvas = true;
        }
        if (boundingBox.x + boundingBox.width > vm.configKonva.width - iw && boundingBox.y < ih) {
          let tmpx = (vm.configKonva.width - iw - boundingBox.width / 2) / scale;
          let tmpy = (ih + boundingBox.height / 2) / scale;
          let d1 = Math.abs(tmpx - vm.tans[index].x);
          let d2 = Math.abs(tmpy - vm.tans[index].y);
          if (d1 <= d2) {
            finalX = tmpx;
          } else {
            finalY = tmpy;
          }
          isTanOutsideCanvas = true;
        }
        if (boundingBox.x + boundingBox.width > vm.configKonva.width && (boundingBox.y > ih || boundingBox.y < 0)) {
          finalX = (vm.configKonva.width - boundingBox.width / 2) / scale;
          isTanOutsideCanvas = true;
        }

        if (isTanOutsideCanvas) {
          let dx = finalX - this.tans[index].x;
          let dy = finalY - this.tans[index].y;
          setTimeout(() => {
            vm.moveTan(index, dx, dy);
          }, 0);
        }
        setTimeout(() => {
          vm.snapTan(index);
        }, 0);
        setTimeout(() => {
          vm.checkIfSolved();
        }, 0);
      }, 0)

    },

    onMouseOver: function(e) {
      let vm = this;
      let index = e.target.id();
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(index);
      vm.tanState = 0;
    },

    onMouseOut: function(e) {
      let vm = this;
      let index = e.target.id();
      vm.tanState = 0;
      vm.deSelectTan(vm.currentTan);
      vm.deSelectTan(index);
    },

    onKeyDown: function(e) {
      let vm = this;
      if (vm.gameOver) return;

      if (vm.tanState === 0) {
        if (e.keyCode === 37 || e.keyCode === 40) {
          vm.deSelectTan(vm.currentTan);
          let newTan = (vm.currentTan - 1) % 7;
          vm.currentTan = newTan < 0 ? newTan + 7 : newTan;
          vm.selectTan(vm.currentTan);
        } else if (e.keyCode === 38 || e.keyCode === 39) {
          vm.deSelectTan(vm.currentTan);
          vm.currentTan = (vm.currentTan + 1) % 7;
          vm.selectTan(vm.currentTan);
        } else if (e.keyCode === 13) {
          vm.updateKonvaTans(vm.currentTan);
          vm.tanState = 1;
        }
      } else if (vm.tanState === 1) {
        let delta = 4;
        let scale = vm.configLayer.scaleX;
        let dx = delta / scale;
        let dy = delta / scale;

        if (e.keyCode === 37) {
          dx *= -1;
          dy = 0;
        } else if (e.keyCode === 38) {
          dx = 0;
          dy *= -1;
        } else if (e.keyCode === 39) {
          dx *= 1;
          dy = 0;
        } else if (e.keyCode === 40) {
          dx = 0;
          dy *= 1;
        } else {
          dx = 0;
          dy = 0;
        }

        if (e.keyCode === 16) {
          vm.rotateTan(vm.currentTan);
        }

        if (e.keyCode === 13) {
          vm.tanState = 0;
        }
        vm.moveTan(vm.currentTan, dx, dy);
      }
    },

    onKeyUp: function(e) {
      let vm = this;
      if (vm.gameOver) return;

      if (vm.tanState === 1) {
        setTimeout(() => {
          vm.snapTan(vm.currentTan);
        }, 0);
        setTimeout(() => {
          vm.checkIfSolved();
        }, 0);
      }
    },

    onRefresh: function(e) {
      let vm = this;
      if (vm.gameOver) {
        return;
      }
      if (e && e.screenX === 0 && e.screenY === 0) {
        return;
      }
      setTimeout(() => {
        vm.initializeTans();
      }, 0);
    },

  }
}
