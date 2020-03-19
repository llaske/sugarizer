define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "Pawn Activity",
				content: "Welcome into the Pawn activity. This activity is an activity to test Sugarizer development."
			},
			{
				element: "#add-button2",
				placement: "bottom",
				title: "Add pawn",
				content: "Click here to add one to three pawns on the board."
			},
			{
				element: "#picture-button",
				title: "Change background",
				content: "Click here to choose a new background for the board."
			}
		];
		var tour = new Tour({steps: steps});
		tour.init();
		tour.start(true);

	};

	return tutorial;
});
