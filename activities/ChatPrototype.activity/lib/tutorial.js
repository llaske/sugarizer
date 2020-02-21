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
            }
            
        ];
        var tour = new Tour({steps: steps});
        tour.init();
        tour.start(true);

    };

    return tutorial;
});