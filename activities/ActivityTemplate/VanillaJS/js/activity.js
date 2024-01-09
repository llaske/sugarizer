define(["sugar-web/activity/activity","sugar-web/env"], function (activity,env) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		// Welcome user
		env.getEnvironment(function(err,environment) {
			document.getElementById("user").innerHTML = "<h1>"+"Hello"+" "+environment.user.name+" !</h1>";
		});

	});

});
