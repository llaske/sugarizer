
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
			requirejs(['picoModal'], function(picoModal) {
				vm.modal = modal = picoModal(options)
				.afterShow(function(modal) {
					vm.$emit("after-show");
					if(_current_index==0){
						document.getElementById('right').style.visibility="visible";
					}
					else if(_current_index==(_all_things.length-1)){
						document.getElementById('left').style.visibility="visible";
					}
					else if(_current_index>0 && _current_index<(_all_things.length-1)){
						document.getElementById('right').style.visibility="visible";
						document.getElementById('left').style.visibility="visible";
					}
				})
				.afterClose(function(modal) {
					vm.$emit("after-close", vm.result);
					vm.destroy();
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
