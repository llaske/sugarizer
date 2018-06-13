
// Popup component based on picoModal
var Popup = {
	template: '<div/>',
	data: function() {
		return {
			modal: null,
			result: null
		}
	},
	methods: {
		show: function(options) {
			var vm = this;
			require(['picoModal'], function(picoModal) {
				vm.modal = modal = picoModal(options)
				.afterShow(function(modal) {
					vm.$emit("after-show");
				})
				.afterClose(function(modal) {
					vm.$emit("after-close", vm.result);
				})
				.show();
			});
		},

		close: function(result) {
			if (this.modal) {
				this.result = result;
				this.modal.close();
			}
		},

		destroy: function() {
			if (this.modal) {
				this.modal.destroy();
			}
		}
	}
}
