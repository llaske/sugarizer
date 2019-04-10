define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/icon", "webL10n"], function (activity, env, icon, webL10n) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		i = 0;
		let total = 10,
			count = 0;
		// Welcome user
		env.getEnvironment(function (err, environment) {
			currentenv = environment;
			document.getElementById("user").innerHTML = "<h1> Welcome " + environment.user.name + " !</h1>";
			c = 3;

			//event listener

			$("#start-button").click(function () {
				$("#home").toggle();
				$("#user").toggle();
				$("#levels").toggle();
				$("#levels").append("<span class='level'>1</span>");
				$(".level").click(function () {
					$("#levels").toggle();
					amaze();
				});
			});
			$(".finish").hover(function () {
				$(".playarea").css("display", "none");
				$("#dialog1").css("display", "block");
			});

			$("#start").click(function () {

				$(".gamesvg").css("cursor", "crosshair");
			});

			function amaze() {
				var ball = document.getElementById("ball");
				$(".playarea").css("display", "block");
				$("up").click((e) => {
					ball.animate(() => {

					}, 2000);
				});
				$("down").click((e) => {
					ball.animate((e) => {}, 2000);
				});
				$("left").click((e) => {
					ball.animate((e) => {}, 2000);
				});
				$("right").click((e) => {
					ball.animate((e) => {}, 2000);
				});
			}
		});


	});
	/* Load from datastore
			if (environment.objectId) {
				activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
					if (error == null && data != null) {
		
					}
				});
			}*/


	/* Save in Journal on Stop
			document.getElementById("stop-button").addEventListener('click', function (event) {
				console.log("writing...");
				var jsonData = JSON.stringify();
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			}); 
		
			// Process localize event
			window.addEventListener("localized", function () {
				document.getElementById("user").innerHTML = "<h1>" + webL10n.get("Hello", { name: currentenv.user.name }) + "</h1>";
				document.getElementById("add-button").title = webL10n.get("AddPawn");
			});*/

});