var CategoryForm = {
  props: ['strokeColor', 'fillColor', 'dataSetHandler', 'puzzles', 'categoryToBeEdited', 'view', 'l10n'],
  template: `
    <div id="category-form-screen"
      v-bind:style="{backgroundColor: strokeColor}"
    >
      <div class="category-form-header">
        <div class="category-form-bar"
        >
          <div class="category-form-bar-block"
            v-bind:style="{backgroundColor: fillColor}"
          >
            <div>{{category.title}}</div>
          </div>
        </div>
      </div>

      <div class="category-form-main"
      >
        <div class="category-form-panel-primary"
        >
          <form @submit.prevent="onConfirm">
    				<div>
    					<label for="title">{{l10n.stringTitle}}</label>
    					<input type="text" name="title" v-model="category.title" required>
    				</div>
    				<div class="buttons-row">
    					<button type="submit" v-bind:disabled="!isValid">
    						<img src="icons/dialog-ok.svg">
    						<span>{{l10n.stringConfirm}}</span>
    					</button>
    					<button type="button" @click="$emit('go-to-dataset-list')">
    						<img src="icons/dialog-cancel.svg">
    						<span>{{l10n.stringCancel}}</span>
    					</button>
    				</div>
    			</form>
        </div>
      </div>
      <div class="category-form-footer">
        <div class="pagination">
        </div>
        <div class="footer-actions">
        </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      actionButtons: {
        width: 30,
        width: 30,
      },
      category: {
        title: ''
      },
      puzzlesSet: [],
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
    if (vm.categoryToBeEdited) {
      vm.category.title = vm.categoryToBeEdited;
    } else {
      vm.category.title = vm.l10n.stringNewTitle
    }
    vm.resize();
  },

  computed: {
    isValid: function () {
      let vm = this;
      let title = vm.category.title;
      if (title === '' || title === vm.l10n.stringNewTitle || title === vm.categoryToBeEdited) return false;
      let index = -1;
      if (!vm.categoryToBeEdited) {
        index = vm.dataSetHandler.dataSet.findIndex(ele => ele.name === title);
      }
      return index===-1;
    }
  },

  methods: {
    resize: function() {
      let vm = this;
      let toolbarElem = document.getElementById("main-toolbar");
      let toolbarHeight = toolbarElem.offsetHeight != 0 ? toolbarElem.offsetHeight + 3 : 3;
      let newHeight = window.innerHeight - toolbarHeight;
      let newWidth = window.innerWidth;
      let ratio = newWidth / newHeight;
      document.querySelector('#category-form-screen').style.height = newHeight + "px";
      let settingEditorFooterEle = document.querySelector('.category-form-footer');
      vm.$set(vm.actionButtons, 'width', settingEditorFooterEle.offsetHeight * 0.95);
      vm.$set(vm.actionButtons, 'height', settingEditorFooterEle.offsetHeight * 0.95);

    },

    onConfirm: function () {
      let vm = this;
      if (vm.categoryToBeEdited) {
        vm.dataSetHandler.editCategory(vm.categoryToBeEdited, vm.category.title);
      } else {
        vm.dataSetHandler.addNewCategory(vm.category.title);
      }
      vm.$emit('change-category', {index:vm.category.title});
      vm.$emit('go-to-dataset-list');
    }
  }
}
