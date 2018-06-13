
// Popup component based on picoModal
var Popup = {
	template: '<div/>',
	data: function() {
		return {
			modal: null
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
					vm.$emit("after-close", result);
				})
				.show();
			});
		},

		close: function() {
			if (this.modal) {
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
