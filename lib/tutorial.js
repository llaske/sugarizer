

// Tutorial handling
define([], function (datastore) {
	var tutorial = {};
	var tour;

	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<div class='popover-content'></div>\
				<div class='popover-navigation'>\
					<div class='tutorial-prev-icon icon-button'>\
						<div class='tutorial-prev-icon1 web-activity'>\
							<div class='tutorial-prev-icon2 web-activity-icon'></div>\
							<div class='tutorial-prev-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-button-text' data-role='prev'>"+prevString+"</div>\
					</div>\
					<span data-role='separator'>|</span>\
					<div class='tutorial-next-icon icon-button'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-button-text' data-role='next'>"+nextString+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-button-text'>"+endString+"</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			steps: [
				{
					element: tutorial.getElement("owner"),
					placement: "right",
					title: l10n.get("TutoUserTitle"),
					content: l10n.get("TutoUserContent")
				},
				{
					element: tutorial.getElement("activity"),
					placement: "bottom",
					title: l10n.get("TutoActivityTitle"),
					content: l10n.get("TutoActivityContent")
				},
				{
					element: tutorial.getElement("journal"),
					placement: "right",
					title: l10n.get("TutoJournalTitle"),
					content: l10n.get("TutoJournalContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					placement: "bottom",
					title: l10n.get("TutoFavoriteTitle"),
					content: l10n.get("TutoFavoriteContent")
				},
				{
					element: tutorial.getElement("listbutton"),
					placement: "bottom",
					title: l10n.get("TutoListTitle"),
					content: l10n.get("TutoListContent")
				},
				{
					element: tutorial.getElement("favoriteitembutton"),
					placement: "bottom",
					title: l10n.get("TutoFavswitchTitle"),
					content: l10n.get("TutoFavswitchContent")
				},
				{
					element: tutorial.getElement("searchtext"),
					placement: "bottom",
					title: l10n.get("TutoSearchTitle"),
					content: l10n.get("TutoSearchContent")
				},
				{
					element: tutorial.getElement("neighborbutton"),
					placement: "bottom",
					title: l10n.get("TutoNeighborTitle"),
					content: l10n.get("TutoNeighborContent")
				},
			]
		});
		tour.init();
	}

	// Handle tutorial element id
	tutorial.setElement = function(name, id) {
		tutorial.elements[name] = id;
	}
	tutorial.getElement = function(name) {
		return "#"+tutorial.elements[name];
	}

	// Start tutorial
	tutorial.start = function() {
		tutorial.init();
		tour.start(true);
	};

	return tutorial;
});
