

// Tutorial handling
define(["webL10n", "activity/activity"], function () {
	var tutorial = {};
	var tour;
	var l10n = l10n_s;

	tutorial.elements = [];
	tutorial.tourInit = 1;
	tutorial.tourStandard = 2;

	// Init tutorial
	tutorial.init = function(tourType) {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		var steps;
		if (tourType == tutorial.tourInit) {
			steps = [
				{
					reflex: "click",
					element: tutorial.getElement("activity"),
					placement: "bottom",
					title: l10n.get("TutoActivityTitle"),
					content: l10n.get("TutoActivityContent")
				},
				{
					onPrev: function(tourType){
						document.getElementById("activity-palette").style.visibility = "hidden";
					},
					onShow: function(tourType){
						document.getElementById("activity-palette").style.visibility = "visible";
					},
					onNext: function(tourType){
						document.getElementById("activity-palette").style.visibility = "hidden";
					},
					element: tutorial.getElement("title"),
					placement: "right",
					title: l10n.get("TutoTitleTitle"),
					content: l10n.get("TutoTitleContent")
				},
				{
					reflex: "click",
					element: tutorial.getElement("network"),
					placement: "bottom",
					title: l10n.get("TutoNetworkTitle"),
					content: l10n.get("TutoNetworkContent")
				},
				{
					onPrev: function(tourType){
						document.getElementsByClassName("palette")[3].style.visibility = "hidden";
					},
					onShow: function(tourType){
						document.getElementsByClassName("palette")[3].style.visibility = "visible";
					},
					onNext: function(tourType){
						document.getElementsByClassName("palette")[3].style.visibility = "hidden";
					},
					element: tutorial.getElement("shared"),
					placement: "right",
					title: l10n.get("TutoSharedTitle"),
					content: l10n.get("TutoSharedContent")
				},
				{
					element: tutorial.getElement("help"),
					placement: "bottom",
					title: l10n.get("TutoHelpTitle"),
					content: l10n.get("TutoHelpContent")
				},
				{
					element: tutorial.getElement("stop"),
					placement: "bottom",
					title: l10n.get("TutoStopTitle"),
					content: l10n.get("TutoStopContent")
				},
			];
		} else {
			steps = [
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoExplainTitle"),
					content: l10n.get("TutoExplainContent")
				},
				{
					element: tutorial.getElement("node"),
					placement: "right",
					title: l10n.get("TutoNodeTitle"),
					content: l10n.get("TutoNodeContent")
				},
				{
					element: tutorial.getElement("color"),
					placement: "bottom",
					title: l10n.get("TutoColorTitle"),
					content: l10n.get("TutoColorContent")
				},
				{
					element: tutorial.getElement("add"),
					placement: "bottom",
					title: l10n.get("TutoAddTitle"),
					content: l10n.get("TutoAddContent")
				},
				{
					element: tutorial.getElement("remove"),
					placement: "bottom",
					title: l10n.get("TutoRemoveTitle"),
					content: l10n.get("TutoRemoveContent")
				},
				{
					element: tutorial.getElement("undo"),
					placement: "bottom",
					title: l10n.get("TutoUndoTitle"),
					content: l10n.get("TutoUndoContent")
				},
				{
					element: tutorial.getElement("redo"),
					placement: "bottom",
					title: l10n.get("TutoRedoTitle"),
					content: l10n.get("TutoRedoContent")
				},
				{
					element: tutorial.getElement("zoom"),
					placement: "bottom",
					title: l10n.get("TutoZoomTitle"),
					content: l10n.get("TutoZoomContent")
				},
				{
					element: tutorial.getElement("png"),
					placement: "bottom",
					title: l10n.get("TutoPngTitle"),
					content: l10n.get("TutoPngContent")
				},
			];
		}
		tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<div class='popover-content'></div>\
				<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
					<div class='tutorial-prev-icon icon-button' data-role='prev'>\
						<div class='tutorial-prev-icon1 web-activity'>\
							<div class='tutorial-prev-icon2 web-activity-icon'></div>\
							<div class='tutorial-prev-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+prevString+"</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+nextString+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+endString+"</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init();
	}

	// Handle tutorial element id
	tutorial.setElement = function(name, id) {
		tutorial.elements[name] = id;
	}
	tutorial.getElement = function(name) {
		return tutorial.elements[name];
	}

	// Start tutorial
	tutorial.start = function(tourType) {
		tutorial.init(tourType);
		tour.start(true);
	};

	return tutorial;
});
