

// Tutorial handling
define([], function () {
	var tutorial = {};
	var tour;
	var launched = false;

	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		this.activityId = "org.olpcfrance.sharednotes";
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
			steps: []
		});
		var currentView = app.getView();
		if (currentView == constant.radialView) {
			tour.addSteps([
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
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoRunTitle"),
					content: l10n.get("TutoRunContent")
				}
			]);
		} else if (currentView == constant.listView) {
			tour.addSteps([
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
				}
			]);
		} else if (currentView == constant.journalView) {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoJournalIntroTitle"),
					content: l10n.get("TutoJournalIntroContent")
				},
				{
					element: tutorial.getElement("activityitem"),
					placement: "bottom",
					title: l10n.get("TutoJournalActivityTitle"),
					content: l10n.get("TutoJournalActivityContent")
				},
				{
					element: tutorial.getElement("timeitem"),
					placement: "bottom",
					title: l10n.get("TutoJournalTimeTitle"),
					content: l10n.get("TutoJournalTimeContent")
				},
				{
					element: tutorial.getElement("titleitem"),
					placement: "bottom",
					title: l10n.get("TutoJournalTitleTitle"),
					content: l10n.get("TutoJournalTitleContent")
				},
				{
					element: tutorial.getElement("favoriteitem"),
					placement: "bottom",
					title: l10n.get("TutoJournalFavoriteTitle"),
					content: l10n.get("TutoJournalFavoriteContent")
				},
				{
					element: tutorial.getElement("checkitem"),
					placement: "bottom",
					title: l10n.get("TutoJournalCheckTitle"),
					content: l10n.get("TutoJournalCheckContent")
				},
				{
					element: tutorial.getElement("searchtext"),
					placement: "bottom",
					title: l10n.get("TutoJournalSearchTitle"),
					content: l10n.get("TutoJournalSearchContent")
				},
				{
					element: tutorial.getElement("favoritebutton"),
					placement: "bottom",
					title: l10n.get("TutoJournalFavButtonTitle"),
					content: l10n.get("TutoJournalFavButtonContent")
				},
				{
					element: tutorial.getElement("typeselect"),
					placement: "bottom",
					title: l10n.get("TutoJournalTypeTitle"),
					content: l10n.get("TutoJournalTypeContent")
				},
				{
					element: tutorial.getElement("timeselect"),
					placement: "bottom",
					title: l10n.get("TutoJournalTimeButtonTitle"),
					content: l10n.get("TutoJournalTimeButtonContent")
				},
				{
					element: tutorial.getElement("sortselect"),
					placement: "bottom",
					title: l10n.get("TutoJournalSortButtonTitle"),
					content: l10n.get("TutoJournalSortButtonContent")
				},
				{
					element: tutorial.getElement("fromdevicebutton"),
					placement: "bottom",
					title: l10n.get("TutoJournalFromDeviceButtonTitle"),
					content: l10n.get("TutoJournalFromDeviceButtonContent")
				},
				{
					element: tutorial.getElement("journalbutton"),
					placement: "top",
					title: l10n.get("TutoJournalLocalTitle"),
					content: l10n.get("TutoJournalLocalContent")
				},
				{
					element: tutorial.getElement("cloudonebutton"),
					placement: "top",
					title: l10n.get("TutoJournalCloudOneTitle"),
					content: l10n.get("TutoJournalCloudOneContent")
				},
				{
					element: tutorial.getElement("cloudallbutton"),
					placement: "top",
					title: l10n.get("TutoJournalCloudAllTitle"),
					content: l10n.get("TutoJournalCloudAllContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					placement: "bottom",
					title: l10n.get("TutoGotoHomeTitle"),
					content: l10n.get("TutoGotoHomeContent")
				}
			]);
		} else if (currentView == constant.neighborhoodView) {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoNeighborIntroTitle"),
					content: window.sugarizerOS ? l10n.get("TutoNeighborIntroContent2") : l10n.get("TutoNeighborIntroContent")
				},
				{
					element: tutorial.getElement("owner"),
					placement: "right",
					title: l10n.get("TutoNeighborUserTitle"),
					content: l10n.get("TutoNeighborUserContent")
				},
				{
					element: tutorial.getElement("server"),
					placement: "auto",
					title: l10n.get("TutoNeighborServerTitle"),
					content: l10n.get("TutoNeighborServerContent")
				},
				{
					element: tutorial.getElement("other"),
					placement: "auto",
					title: l10n.get("TutoNeighborOtherTitle"),
					content: l10n.get("TutoNeighborOtherContent")
				},
				{
					element: tutorial.getElement("activity"),
					placement: "auto",
					title: l10n.get("TutoNeighborActivityTitle"),
					content: l10n.get("TutoNeighborActivityContent")
				},
				{
					element: tutorial.getElement("wifi"),
					placement: "auto",
					title: l10n.get("TutoNeighborWifiTitle"),
					content: l10n.get("TutoNeighborWifiContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					placement: "bottom",
					title: l10n.get("TutoGotoHomeTitle"),
					content: l10n.get("TutoGotoHomeContent")
				}
			]);
		}
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
		launched = true;
	};

	// Test if launched
	tutorial.isLaunched = function() {
		return launched;
	};

	return tutorial;
});
