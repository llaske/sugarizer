
// Vue for toolbar
var toolbar = new Vue({
	el: '#toolbar',
	template: `
		<div id="main-toolbar" class="toolbar">
			<button class="toolbutton" id="activity-button" title="My Activity"></button>

			<div class="splitbar"></div>
			<button class="toolbutton" id="previous-button" title="Previous">
			</button>
			<button class="toolbutton" id="next-button" title="Next">
			</button>
			<div class="splitbar"></div>
			<button class="toolbutton" id="library-button" title="Library">
			</button>

			<button class="toolbutton pull-right" id="stop-button" title="Stop"></button>
			<button class="toolbutton pull-right" id="fullscreen-button" title="Fullscreen"></button>
		</div>
	`,
	mounted: function() {
		// Handle previous/next page
		document.getElementById("next-button").addEventListener("click", function() {
			app.onNext();
		});
		document.getElementById("previous-button").addEventListener("click", function() {
			app.onPrevious();
		});

		// Handle full screen
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			console.log("fullscreen");
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			console.log("unfullscreen");
		});

		// Handle library button
		document.getElementById("library-button").addEventListener("click", function() {
			app.switchView();
		});

		// Handle full screen / unfull screen buttons
		document.getElementById("fullscreen-button").addEventListener('click', function() {
			app.fullscreen();
		});
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			app.unfullscreen();
		});

		// Handle stop button
		document.getElementById("stop-button").addEventListener('click', function(event) {
			app.onStop();
		});
	}
});
