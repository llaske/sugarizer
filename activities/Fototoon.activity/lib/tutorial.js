define([], function () {
	var tutorial = {};

	tutorial.start = function() {
		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: "FotoToon Activity",
				content: "FotoToon allow you to use your pictures, drawing or images coming from Journal to create in few minutes an amazing comic strip to share with your friends."
            },
            {
				element: "#previous-button",
				placement: "bottom",
				title: "Previous",
				content: "Click here to go to previous page."
            },
            {
				element: "#next-button",
				placement: "bottom",
				title: "Next",
				content: "Click here to go to next page."
			},
			{
				element: "#add-button",
				placement: "bottom",
				title: "Add page",
				content: "Click here to add picture, drawing or image as new page."
            },
            {
				element: "#add-globe",
				placement: "bottom",
				title: "Add globe",
				content: "Click here to add different type of text box in current page."
            },
			{
                element: "#text-button",
                placement: "bottom",
				title: "Edit text",
				content: "Click here to to write in the text box."
            },
            {
				element: "#sort-button",
				placement: "bottom",
				title: "Sort boxes",
				content: "Click here to sort all pages in a column."
            },
            {
				element: "#clean-all-button",
				placement: "bottom",
				title: "Clean all",
				content: "Click here to clears all the changes and bring to initial state."
            },
            {
				element: "#image-save",
				placement: "bottom",
				title: "Save as image",
				content: "Click here to save current state of comic as a page in one row, one column, or two columns."
            },
            {
				element: "#page-counter",
				placement: "bottom",
				title: "Page counter",
				content: "It shows current page out of total number of pages."
            },
            {
				element: "#stop-button",
				placement: "bottom",
				title: "Stop",
				content: "Click here to end activity."
            }
		];
		var tour = new Tour({steps: steps});
		tour.init();
		tour.start(true);

	};

	return tutorial;
});