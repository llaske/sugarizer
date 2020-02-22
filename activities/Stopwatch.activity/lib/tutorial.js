define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "Stopwatch Activity",
				content: "Welcome into the Stopwatch activity."
			},
			{
				element: "#fullscreen-button",
				placement: "bottom",
				title: "Fullscreen button",
				content: "Press on this button to go fullscreen."
			},
			{
                element: "#stop-button",
                placement: "left",
				title: "Stop",
				content: "Press on this button to stop the activity."
			}
		];
		var tour = new Tour({steps: steps});
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
