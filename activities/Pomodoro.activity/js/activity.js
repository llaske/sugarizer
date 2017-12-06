define(['sugar-web/activity/activity', 'activity/progress', 'activity/stopwatch'], function (activity, Progress, stopwatch) {

	// Manipulate the DOM only when it is ready.
	require(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		var pomodoroContainer = document.getElementById('pomodoro-container')
		console.log(stopwatch)
		var pomodoro = new Progress(50, '#444', 1, pomodoroContainer)
		pomodoro.draw()
		pomodoro.update(0.9)
	});
});
