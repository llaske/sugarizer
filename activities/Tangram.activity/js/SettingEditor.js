var SettingEditor = {
  props: ['strokeColor', 'fillColor', 'dataSetHandler', 'puzzleToBeEdited'],
  template: `
    <div id="setting-editor-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="setting-editor-main"
      >
        <v-stage class="stage" ref="stage" v-bind:config="configKonva"
          v-bind:style="{
            backgroundColor: '#ffffff',
            borderRadius: '10px'
          }"
          v-on:dragstart="onDragStart"
          v-on:dragend="onDragEnd"
          v-on:dragmove="onDragMove"
        >
          <v-layer ref="layer" :config="configLayer">
            <v-line :config="workingBox"></v-line>
            <template>
              <v-line v-for="(tan,index) in tans" :key="index" v-if="currentTan!=index"
                :config="{
                  ...tan,
                }"
                v-on:tap="onTap($event, index)"
                v-on:click="onClick($event, index)"
                v-on:mouseover="onMouseOver"
                v-on:mouseout="onMouseOut"
              ></v-line>
            </template>
            <v-line
              :config="{
                ...tans[currentTan]
              }"
              v-on:tap="onTap($event, currentTan)"
              v-on:click="onClick($event, currentTan)"
              v-on:mouseover="onMouseOver"
              v-on:mouseout="onMouseOut"
            ></v-line>
          </v-layer>
        </v-stage>
        <div class="setting-editor-sidebar box2 sb11"
          v-bind:style="{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            borderColor: fillColor,
          }"
        >
          <div class="category-chooser"
          >
            <select name="tangram-category" v-model="categoryChosen">
              <option
                v-for="option in dataSetHandler.AllCategories" v-if="option!=='Random'" :value="option"
              >{{option}}</option>
              <option value='new-category'>Create New Category<option>
            </select>
          </div>
          <div v-if="categoryChosen === 'new-category'">
            <input type='text' name='new-category' v-model="puzzleCreated.category" required>
          </div>
          <form v-on:submit.prevent="onAddPuzzle">
            <div>
              <input type='text' name='tangram-name' v-model="puzzleCreated.name" required>
            </div>
          </form>
          <div class="setting-editor-sidebar-element valid-shape-indicator"
            v-bind:style="{
              backgroundColor: puzzleCreated.tangram !== null ? '#81e32b' : 'red',
            }"
          >
            <div>{{puzzleCreated.tangram !== null ? 'Valid Shape' : 'Invalid Shape'}}</div>
          </div>

          <div class="setting-editor-sidebar-element valid-shape-difficulty"
            v-if="puzzleCreated.tangram !== null"
          >
            <div>Tangram Difficulty: {{puzzleCreated.difficulty}}</div>
          </div>

          <div class="setting-editor-sidebar-element valid-shape-display"
            v-if="puzzleCreated.tangram !== null"
            v-bind:style="{
              width: validShapeDisplayBox.width+'px',
              height: validShapeDisplayBox.height+'px',
            }"
          >
            <svg>
              <path
                v-bind:fill="fillColor"
                v-bind:transform="pathScale"
                fill-rule='evenodd'
                v-bind:d="puzzleCreated.tangramSVGdata"
              >
              </path>
            </svg>
          </div>

        </div>

      </div>
      <div class="setting-editor-footer">
          <div class="pagination">
          </div>
          <div class="footer-actions">
            <button
              class="btn-in-footer btn-save"
              v-if="canBeAdded && !puzzleToBeEdited"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="onAddPuzzle"
            ></button>
            <button
              class="btn-in-footer btn-random"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="onRandom"
            ></button>
            <button
              class="btn-in-footer btn-replay"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="onRefresh"
            ></button>
            <button
              class="btn-in-footer btn-back"
              v-bind:style="{
                backgroundColor: fillColor,
                width: actionButtons.width + 'px',
                height: actionButtons.height + 'px',
              }"
              v-on:click="$emit('go-to-dataset-list')"
            ></button>
          </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      configKonva: {
        width: 300,
        height: 300,
      },
      configLayer: {
        scaleX: 5,
        scaleY: 5
      },
      validShapeDisplayBox: {
        width: 60,
        height: 60,
        scale: 1,
      },
      workingBox: {
        points: [],
        stroke: 'green',
        strokeWidth: 0.8,
        closed: true,
        lineJoin: 'round',
        dash: [2, 2]
      },
      actionButtons: {
        width: 30,
        width: 30,
      },
      tanState: 0,
      currentTan: 0,
      flip: 5,
      tans: [],
      puzzlesSet: [],
      snapRange: 1.5,
      tanColors: ["blue", "purple", "red", "green", "yellow", "yellow"],
      puzzleCreated: {
        name: 'My Tangram',
        difficulty: '',
        category: '',
        tangram: null,
        tangramSVGdata: '',
      },
      categoryChosen: null,
      initialTangram: null
    };
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
    vm.$set(vm.workingBox, 'stroke', vm.strokeColor);
    vm.resize();
    vm.categoryChosen = vm.dataSetHandler.currentCategories[0];
    setTimeout(() => {
      if (vm.puzzleToBeEdited) {
        vm.showPuzzle(vm.puzzleToBeEdited);
      } else {
        vm.initializeTans();
      }
    }, 0);
  },

  computed: {
    pathScale: function() {
      return 'scale(' + this.validShapeDisplayBox.scale + ')';
    },

    canBeAdded: function() {
      let vm = this;
      let res = this.puzzleCreated.tangram !== null && this.puzzleCreated.name !== '' && this.puzzleCreated.category !== '';
      if (res && vm.puzzleToBeEdited) {
        vm.$emit('save-puzzle', {
          id: vm.puzzleToBeEdited.id,
          puzzle: vm.puzzleCreated
        });
      }
      return res;
    }
  },

  watch: {
    categoryChosen: function() {
      if (this.categoryChosen !== 'new-category') {
        this.puzzleCreated.category = this.categoryChosen;
      } else {
        this.puzzleCreated.category = 'New Category';
      }
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
      document.querySelector('#setting-editor-screen').style.height = newHeight + "px";
      let settingEditorMainEle = document.querySelector('.setting-editor-main');
      let cw = settingEditorMainEle.offsetWidth * 0.66;
      let ch = settingEditorMainEle.offsetHeight * 0.97;
      let pw = vm.configKonva.width;
      let ph = vm.configKonva.height;
      let pScale = Math.min(pw, ph) / 75;

      let a = cw,
        b = ch;
      let scale = Math.min(a, b) / 75;

      vm.$set(vm.configKonva, 'width', cw);
      vm.$set(vm.configKonva, 'height', ch);

      vm.$set(vm.configLayer, 'scaleX', scale);
      vm.$set(vm.configLayer, 'scaleY', scale);

      let settingEditorSidebarEle = document.querySelector('.setting-editor-sidebar')
      vm.$set(vm.validShapeDisplayBox, 'width', settingEditorSidebarEle.offsetHeight * 0.3);
      vm.$set(vm.validShapeDisplayBox, 'height', settingEditorSidebarEle.offsetHeight * 0.3);
      vm.$set(vm.validShapeDisplayBox, 'scale', settingEditorSidebarEle.offsetHeight * 0.3 / 60);

      setTimeout(() => {
        if (vm.tans.length != 0) {
          for (var index = 0; index < 7; index++) {
            let tan_dx = roundToNearest(((cw / pw) * (pScale / scale) - 1) * vm.tans[index].x, 1);
            let tan_dy = roundToNearest(((ch / ph) * (pScale / scale) - 1) * vm.tans[index].y, 1);
            vm.moveTan(index, tan_dx, tan_dy);
          }
        }
        setTimeout(() => {
          vm.checkIfTangramValid();
        }, 0);
      }, 0);

      let cenx = cw / (2 * scale),
        ceny = ch / (2 * scale);
      let workingBoxPoints = [cenx - 30, ceny - 30, cenx + 30, ceny - 30, cenx + 30, ceny + 30, cenx - 30, ceny + 30, ];
      vm.$set(vm.workingBox, 'points', workingBoxPoints);

      let settingEditorFooterEle = document.querySelector('.setting-editor-footer');
      vm.$set(vm.actionButtons, 'width', settingEditorFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', settingEditorFooterEle.offsetHeight * 0.95);
    },


    centerTangramFormed: function() {
      let dx = roundToNearest(this.configKonva.width / (2 * this.configLayer.scaleX) - 30, 1);
      let dy = roundToNearest(this.configKonva.height / (2 * this.configLayer.scaleX) - 30, 1);
      for (var i = 0; i < 7; i++) {
        this.moveTan(i, dx, dy);
      }
    },

    showPuzzle: function(puzzle) {
      let vm = this;
      vm.populateTans(puzzle.tangram.tans);
      vm.categoryChosen = puzzle.category;
      vm.puzzleCreated.name = puzzle.name;
      vm.checkIfTangramValid();
      vm.centerTangramFormed();
    },

    onRandom: function() {
      let vm = this
      let generatedTangrams = generateTangrams(2);
      let tangram = generatedTangrams[0];
      tangram.positionCentered();
      vm.initialTangram = tangram.dup();
      vm.populateTans(tangram.tans);
      vm.checkIfTangramValid();
      vm.centerTangramFormed();
    },

    loadContext: function(context) {
      let vm = this;
      let tanObjsArr = context.tans;
      let pScale = context.pScale;
      let pw = context.pStage.width;
      let ph = context.pStage.height;
      vm.populateTans(tanObjsArr);
      vm.checkIfTangramValid();
      for (var i = 0; i < 7; i++) {
        let dx = roundToNearest(((vm.configKonva.width / pw) * (pScale / vm.configLayer.scaleX) - 1) * vm.tans[i].tanObj.anchor.toFloatX(), 1);
        let dy = roundToNearest(((vm.configKonva.height / ph) * (pScale / vm.configLayer.scaleY) - 1) * vm.tans[i].tanObj.anchor.toFloatY(), 1);
        vm.moveTan(i, dx, dy);
      }
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
        anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY)).roundToNearest(1);

        if (tanObjsArr[i].placedAnchor) {
          placedAnchor = tanObjsArr[i].placedAnchor;
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

    initializeTans: function() {
      let vm = this;
      if (vm.puzzleToBeEdited) {
        vm.showPuzzle(vm.puzzleToBeEdited);
      } else {
        if (vm.initialTangram) {
          vm.showPuzzle({
            tangram: vm.initialTangram,
            name: 'My Tangram',
            category: vm.dataSetHandler.currentCategories[0]
          });
        } else {
          vm.onRandom();
        }

      }
    },

    onAddPuzzle: function() {
      let vm = this;
      if (!vm.canBeAdded) return;
      if (vm.puzzleToBeEdited) {
        vm.$emit('delete-puzzle', vm.puzzleToBeEdited.id);
      }
      vm.$emit('add-puzzle', vm.puzzleCreated);
      vm.$emit('go-to-dataset-list');
    },

    checkIfTangramValid: function() {
      let vm = this;
      //check the outline
      let tans = [];
      let notFinished = false;
      for (let i = 0; i < vm.tans.length; i++) {
        let point = vm.tans[i].tanObj.anchor.dup();
        var tan = new Tan(vm.tans[i].tanObj.tanType, point, vm.tans[i].tanObj.orientation);
        tans.push(tan);
      }
      let currentOut = computeOutline(tans, true);
      let valid = false;
      let tang = null;
      if (currentOut) {
        tang = new Tangram(tans);
        valid = tang.evaluation ? (tang.evaluation.rangeX < 60 && tang.evaluation.rangeY < 60) : false;
        if (valid) {
          let tanSegments = computeSegments(getAllPoints(tans), tans);
          for (let segmentId = 0; segmentId < tanSegments.length; segmentId++) {
            for (let otherSegmentsId = segmentId + 1; otherSegmentsId < tanSegments.length; otherSegmentsId++) {
              if (tanSegments[segmentId].intersects(tanSegments[otherSegmentsId])) {
                valid = false;
                break;
              }
            }
          }
        }
      }

      if (valid) {
        vm.puzzleCreated.tangram = tang;
        vm.puzzleCreated.tangram.positionCentered();
        vm.puzzleCreated.tangramSVGdata = vm.puzzleCreated.tangram.toSVGOutline().children[0].getAttribute('d');
        vm.puzzleCreated.difficulty = checkDifficultyOfTangram(vm.puzzleCreated.tangram);
      } else {
        vm.puzzleCreated.tangram = null;
        vm.puzzleCreated.tangramSVGdata = '';
        vm.puzzleCreated.difficulty = null;
      }
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
              diff = otherTanPointsObjs[k / 2].dup().subtract(currentTanPointsObjs[j / 2]);
              currentTan.tanObj.anchor.add(diff);
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
        currentTan.tanObj.anchor.roundToNearest(1);
        vm.updatePoints(index);
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

    onClick: function(e, index) {
      let vm = this;
      vm.tanState = 1;
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(vm.currentTan);
      if (vm.tanState === 1) {
        vm.rotateTan(index);
      }
    },

    onTap: function(e, index) {
      let vm = this;
      vm.tanState = 1;
      vm.deSelectTan(vm.currentTan);
      vm.currentTan = index;
      vm.selectTan(vm.currentTan);
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
      vm.tanState = 1;
    },

    onDragEnd: function(e) {
      let vm = this;
      let index = e.target.id();
      let isTanOutsideCanvas = false;
      let finalX = e.target.attrs.x;
      let finalY = e.target.attrs.y;
      let boundingBox = e.target.getClientRect();
      boundingBox.width *= 0.5;
      boundingBox.height *= 0.5;
      let iw = 0;
      let ih = 0;

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
        let dx = roundToNearest(finalX - this.tans[index].x, 1);
        let dy = roundToNearest(finalY - this.tans[index].y, 1);
        setTimeout(() => {
          vm.moveTan(index, dx, dy);
        }, 0);
      }

      setTimeout(() => {
        vm.snapTan(index);
      }, 0);
      setTimeout(() => {
        vm.checkIfTangramValid();
      }, 0);
    },

    onDragMove: function(e) {
      let vm = this;
      let index = e.target.id();
      let finalX = e.target.attrs.x;
      let finalY = e.target.attrs.y;
      let dx = finalX - vm.tans[index].x;
      let dy = finalY - vm.tans[index].y;

      setTimeout(() => {
        vm.moveTan(index, dx, dy);
      }, 0);
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
      if (vm.tanState === 1) {
        setTimeout(() => {
          vm.snapTan(vm.currentTan);
        }, 0);
        setTimeout(() => {
          vm.checkIfTangramValid();
        }, 0);
      }
    },

    onRefresh: function(e) {
      let vm = this;
      if (e && e.screenX === 0 && e.screenY === 0) {
        return;
      }
      setTimeout(() => {
        vm.initializeTans();
        vm.checkIfTangramValid();
      }, 0);
    }

  }
}
