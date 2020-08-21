Vue.component('data-set-handler', {
  name: 'DataSetHandler',
  data: function() {
    return {
      tangramSet: [],
      dataSet: [],
      currentCategories: ["Animals"],
      AllCategories: [],
      nextArr: []
    }
  },
  mounted() {
    this.loadDataSet();
  },
  methods: {
    loadList() {
      return new Promise((resolve, reject) => {
        requirejs(["text!../data/dataSet.json"], function(dataSet) {
          resolve(dataSet);
        });
      });
    },

    loadDataSet: function() {
      let vm = this;
      this.loadList()
        .then(async (dataSet) => {
          dataSet = JSON.parse(dataSet);
          vm.dataSet = dataSet["data"];
          vm.AllCategories = vm.dataSet.map(ele => ele.name);
          vm.loadTangramSet();
        });
    },

    loadTangramSet: function() {
      let vm = this;
      vm.tangramSet = [];
      for (var i = 0; i < vm.dataSet.length; i++) {
        if (vm.currentCategories.includes(vm.dataSet[i].name)) {
          for (let tangram of vm.dataSet[i]["tangrams"]) {
            vm.tangramSet.push(tangram);
          }
        }
      }
      vm.nextArr = [...Array(vm.tangramSet.length).keys()]
    },

    generateTangramFromSet: function() {
      if (this.nextArr.length == 0) {
        this.nextArr = [...Array(this.tangramSet.length).keys()]
      }
      let ele = Math.floor(Math.random() * this.nextArr.length);
      let index = this.nextArr[ele];
      this.nextArr.splice(ele, 1);
      return this.buildTangramPuzzle(index);
    },

    getTangramPuzzle: function(id) {
      let vm = this;
      let index = vm.tangramSet.findIndex(ele => ele.id === id);
      if (index === -1) return null;
      return vm.buildTangramPuzzle(index);
    },

    buildTangramPuzzle: function(index) {
      let vm = this;
      if (vm.tangramSet.length === 0) {
        return;
      }
      let tang = vm.tangramSet[index];
      let tans = [];
      for (var i = 0; i < tang.targetTans.length; i++) {
        let coeffIntX = tang.targetTans[i].anchor.x[0];
        let coeffSqrtX = tang.targetTans[i].anchor.x[1];
        let coeffIntY = tang.targetTans[i].anchor.y[0];
        let coeffSqrtY = tang.targetTans[i].anchor.y[1];
        let anchor = new Point(new IntAdjoinSqrt2(coeffIntX, coeffSqrtX), new IntAdjoinSqrt2(coeffIntY, coeffSqrtY));
        let tan = new Tan(tang.targetTans[i].tanType, anchor.dup(), tang.targetTans[i].orientation);
        tans.push(tan);
      }
      let categoryId = parseInt(tang.id.substr(0, 1));
      let category = vm.dataSet.find(ele => ele.id === categoryId).name;
      let tangramPuzzle = {
        id: tang.id,
        name: tang.name,
        tangram: new Tangram(tans),
        category: category
      }
      tangramPuzzle.tangram.positionCentered();
      return tangramPuzzle;
    },

    addNewCategory: function (category) {
      let vm = this;
      let index = vm.dataSet.findIndex(ele => ele.name === category);
      if (index === -1) {
        vm.dataSet.push({
          id: vm.dataSet.length+1,
          name: category,
          tangrams: []
        });
        index = vm.dataSet.length - 1;
        vm.AllCategories = vm.dataSet.map(ele => ele.name);
      };
    },

    onChangeCategory: function(newCats) {
      let vm = this;
      vm.currentCategories = newCats;
      vm.loadTangramSet();
    },

    generateId: function(category) {
      let index = this.dataSet.findIndex(ele => ele.name === category);
      if (index === -1) {
        index = this.dataSet.length;
      };
      let id = index + "#" + Date.now();
      return id;
    },

    searchTangramPuzzle: function(puzzle) {
      let vm = this;
			if (!puzzle.tangram || !puzzle.tangram.outline) {
        return;
      }
      for (var i = 0; i < vm.dataSet.length; i++) {
        if (vm.dataSet[i].name === puzzle.category) {
          for (var j = 0; j < vm.dataSet[i].tangrams.length; j++) {
            if (vm.dataSet[j].tangrams[j].id === puzzle.id) {
              return vm.dataSet[i].tangrams[j];
            }
          }
        }
      }
      return;
    },

    deleteTangramPuzzle: function(id) {
      let vm = this;
      if (!id) {
        return;
      }
      let categoryId = parseInt(id.substr(0, 1));
      let index = vm.dataSet.findIndex(ele => ele.id === categoryId);
      if (index !== -1) {
        let tangramIndex = vm.dataSet[index]["tangrams"].findIndex(ele => ele.id === id);
				console.log(id);
        vm.dataSet[index]["tangrams"].splice(tangramIndex, 1);
        let tangramIndex2 = vm.tangramSet.findIndex(ele => ele.id === id);
				if (tangramIndex2!==-1) {
					vm.tangramSet.splice(tangramIndex2, 1);
				}
				if (vm.dataSet[index].tangrams.length === 0) {
					vm.dataSet.splice(index, 1);
					vm.AllCategories = vm.dataSet.map(ele => ele.name);
				}
      }
    },

    addTangramPuzzle: function(puzzle) {
      let vm = this;
      if (!puzzle.tangram || !puzzle.tangram.outline) {
        return;
      }
      let index = vm.dataSet.findIndex(ele => ele.name === puzzle.category);
      if (index === -1) {
        vm.dataSet.push({
          id: vm.dataSet.length+1,
          name: puzzle.category,
          tangrams: []
        });
        index = vm.dataSet.length - 1;
        vm.AllCategories = vm.dataSet.map(ele => ele.name);
      };
      let id = vm.dataSet[index].id + "#" + Date.now();
      let newDataSetElem = vm.createDataSetElem(puzzle, id);
      vm.dataSet[index]["tangrams"].push(newDataSetElem);
      if (vm.currentCategories[0] === puzzle.category) {
        vm.tangramSet.push(newDataSetElem);
        vm.nextArr.push(vm.tangramSet.length - 1);
      }
			console.log(JSON.stringify(newDataSetElem));
      return newDataSetElem;
    },

    editTangramPuzzle: function(puzzle, id) {
      let vm = this;
			if (!puzzle.tangram || !puzzle.tangram.outline) {
        return;
      }
      let index = vm.dataSet.findIndex(ele => ele.name === puzzle.category);
      if (index === -1) {
        vm.deleteTangramPuzzle(id);
        return vm.addTangramPuzzle(puzzle);
      };
      let newDataSetElem = vm.createDataSetElem(puzzle, id);
      let tangramIndex = vm.dataSet[index]["tangrams"].findIndex(ele => ele.id === id);
      if (tangramIndex === -1) {
        return vm.addTangramPuzzle(puzzle);
      }

      vm.dataSet[index]["tangrams"][tangramIndex] = newDataSetElem;
      let tangramIndex2 = vm.tangramSet.findIndex(ele => ele.id === id);
      vm.tangramSet[tangramIndex2] = newDataSetElem;
			console.log(JSON.stringify(newDataSetElem));
      return newDataSetElem;
    },

    createDataSetElem: function(puzzle, id) {
      let vm = this;
      let newDataSetElem = {
        id: id,
        name: puzzle.name,
        targetTans: []
      }

      for (var i = 0; i < puzzle.tangram.tans.length; i++) {
        let tan = puzzle.tangram.tans[i]
        newDataSetElem.targetTans.push({
          anchor: {
            x: [tan.anchor.x.coeffInt, tan.anchor.x.coeffSqrt],
            y: [tan.anchor.y.coeffInt, tan.anchor.y.coeffSqrt]
          },
          tanType: tan.tanType,
          orientation: tan.orientation
        });
      }
      return newDataSetElem;
    }
  }
})
