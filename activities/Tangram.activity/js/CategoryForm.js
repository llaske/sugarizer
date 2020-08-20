var CategoryForm = {
  props: ['strokeColor', 'fillColor', 'dataSetHandler', 'puzzles', 'view', 'l10n'],
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
    					<label for="title">Title</label>
    					<input type="text" name="title" v-model="category.title" required>
    				</div>
    				<div class="buttons-row">
    					<button type="submit" :disabled="category.title == ''">
    						<img src="icons/dialog-ok.svg">
    						<span>Confirm</span>
    					</button>
    					<button type="button" @click="$emit('go-to-dataset-list')">
    						<img src="icons/dialog-cancel.svg">
    						<span>Cancel</span>
    					</button>
    				</div>
    			</form>
        </div>
      </div>
      <div class="category-form-alerts">
        <div class="alert-block pulse"
          v-if="alert.show"
          v-bind:style="{backgroundColor: alert.color}"
        >
          <div>{{alert.text}}</div>
        </div>
      </div>
      <div class="category-form-footer"
      >
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
        title: 'New Category'
      },
      alert: {
        show: true,
        color: '#81e32b',
        text: 'Valid Title'
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
    vm.alert.text = vm.l10n.stringCategoryValidTitle;
    vm.resize();
  },

  watch: {
    'category.title': function () {
      let vm = this;
      let index = vm.dataSetHandler.dataSet.findIndex(ele => ele.name === vm.category.title);
      if(index!==-1){
        vm.alert.color = 'red';
        vm.alert.text = vm.l10n.stringCategoryExistedTitle;
        vm.alert.show = true;
        return ;
      }
      if (this.category.title === '') {
        vm.alert.color = 'red';
        vm.alert.text = vm.l10n.stringCategoryEmptyTitle;
        vm.alert.show = true;
        return ;
      }
      vm.alert.color = '#81e32b';
      vm.alert.text = vm.l10n.stringCategoryValidTitle;
      vm.alert.show = true;
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
      vm.dataSetHandler.addNewCategory(vm.category.title);
      vm.$emit('go-to-dataset-list');
    }
  }
}
