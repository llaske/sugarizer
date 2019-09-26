

// Tutorial handling
define([], function () {
	var tutorial = {};
	var tour;
	var launched = false;

	tutorial.elements = [];
	tutorial.icons = null;

	// Init tutorial
	tutorial.init = function() {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		this.activityId = "org.olpcfrance.sharednotes";
		var gotoStep = undefined;
		tour = new Tour({
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<table><tr><td style='vertical-align:top;'><div id='icon-tutorial' style='visibility:hidden;display:inline-block;'></div>\
				</td><td><div class='popover-content'></div></td></tr></table>\
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
			steps: [],
			onShown: function() {
				if (tutorial.icons && tutorial.icons.steps && tutorial.icons.steps[tour.getCurrentStep()]) {
					var icon = tutorial.icons.steps[tour.getCurrentStep()];
					var iconElement = document.getElementById("icon-tutorial");
					iconElement.style.visibility = 'visible';
					iconElement.style.backgroundImage = "url('"+ icon.directory + "/" + icon.icon + "')";
					iconElement.style.backgroundSize = icon.size + "px";
					iconElement.style.width = icon.size + "px";
					iconElement.style.height = icon.size + "px";
					iconElement.style.marginTop = "15px";
					iconElement.style.marginLeft = "5px";
					if (icon.color) {
						iconLib.colorize(iconElement, icon.color, function(){});
					}
				}
			},
			onEnd: function() {
				tutorial.elements = [];
				tutorial.icons = null;
			}
		});
		var currentView = app.getView();
		if (currentView == constant.radialView) {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: l10n.get("TutoInitMainTitle"),
					content: l10n.get("TutoInitMainContent")
				},
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
					element: tutorial.getElement("offlinebutton"),
					placement: "bottom",
					title: l10n.get("TutoOfflineTitle"),
					content: l10n.get("TutoOfflineContent")
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
			tutorial.icons = {
				steps: {
					0: {icon: 'owner-icon.svg', directory: 'icons', size: constant.sizeEmpty, color: preferences.getColor()},
					3: {icon: 'activity-journal.svg', directory: 'icons', size: constant.sizeEmpty},
					7: {icon: 'cloud-warning.svg', directory: 'icons', size: constant.sizeEmpty},
					9: {icon: 'activity-icon.svg', directory: 'activities/SharedNotes.activity/activity', size: constant.sizeEmpty},
				}
			};
		} else if (currentView == constant.listView) {
			var activities = tutorial.getElementAsObject("activities");
			if (!activities) {
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
			} else {
				var steps = [];
				tutorial.icons = {steps: {}};
				for (var i = 0 ; i < activities.length ; i++) {
					steps.push({
						element: "",
						orphan: true,
						placement: "bottom",
						title: activities[i].title,
						content: activities[i].description
					});
					tutorial.icons.steps[i] = activities[i].icon;
				}
				tour.addSteps(steps);
				gotoStep = tutorial.getElementAsObject("step");
			}
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
		} else if (currentView == constant.initView) {
			var previous = {
				element: tutorial.getElement("previous"),
				placement: "top",
				title: l10n.get("TutoInitPreviousTitle"),
				content: l10n.get("TutoInitPreviousContent")
			};
			var next = {
				element: tutorial.getElement("next"),
				placement: "top",
				title: l10n.get("TutoInitNextTitle"),
				content: l10n.get("TutoInitNextContent")
			};
			var createMode = tutorial.getElementAsObject("createnew");
			var steps = [
				[
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: l10n.get("TutoInitIntroTitle"),
						content: l10n.get("TutoInitIntroTitleIntroContent")
					},
					{
						element: tutorial.getElement("newuser"),
						placement: "left",
						title: l10n.get("TutoInitNewUserTitle"),
						content: l10n.get("TutoInitNewUserContent")
					},
					{
						element: tutorial.getElement("login"),
						placement: "right",
						title: l10n.get("TutoInitLoginTitle"),
						content: l10n.get("TutoInitLoginContent")
					},
					{
						element: tutorial.getElement("historybox"),
						placement: "bottom",
						title: l10n.get("TutoInitHistoryTitle"),
						content: l10n.get("TutoInitHistoryContent")
					},
					{
						element: tutorial.getElement("helpbutton"),
						placement: "bottom",
						title: l10n.get("TutoInitHelpTitle"),
						content: l10n.get("TutoInitHelpContent")
					},
				],
				[
					{
						element: tutorial.getElement("serverbox"),
						placement: "bottom",
						title: l10n.get("TutoInitServerTitle"),
						content: l10n.get("TutoInitServerContent")
					},
					{
						element: tutorial.getElement("qrcode"),
						placement: "bottom",
						title: l10n.get("TutoInitQRCodeTitle"),
						content: l10n.get("TutoInitQRCodeContent")
					},
					previous,
					next,
				],
				[
					{
						element: tutorial.getElement("namebox"),
						placement: "bottom",
						title: (createMode ? l10n.get("TutoInitNameNewTitle") : l10n.get("TutoInitNameTitle")),
						content: (createMode ? l10n.get("TutoInitNameNewContent") : l10n.get("TutoInitNameContent"))
					},
					previous,
					next,
				],
				[
					{
						element: tutorial.getElement("passbox"),
						placement: "right",
						title: (createMode ? l10n.get("TutoInitPasswordNewTitle") : l10n.get("TutoInitPasswordTitle")),
						content: (createMode ? l10n.get("TutoInitPasswordNewContent") : l10n.get("TutoInitPasswordContent"))
					},
					previous,
					next,
				],
				[
					{
						element: (createMode ? tutorial.getElement("owner") : tutorial.getElement("passbox")),
						placement: "right",
						title: (createMode ? l10n.get("TutoInitColorTitle") : l10n.get("TutoInitPasswordTitle")),
						content: (createMode ? l10n.get("TutoInitColorContent") : l10n.get("TutoInitPasswordContent"))
					},
					previous,
					next,
				],
			];
			var currentstep = tutorial.getElementAsObject("currentstep");
			tour.addSteps(steps[currentstep]);
			if (currentstep == 0) {
				tutorial.icons = {steps: {0: {icon: 'owner-icon.svg', directory: 'icons', size: constant.sizeEmpty, color: {stroke: "#005FE4", fill: "#FF2B34"}}}};
			}
		}
		tour.init();
		if (gotoStep !== undefined) {
			tour.goTo(gotoStep);
		}
	}

	// Handle tutorial element id
	tutorial.setElement = function(name, id) {
		tutorial.elements[name] = id;
	}
	tutorial.getElement = function(name) {
		return "#"+tutorial.elements[name];
	}
	tutorial.getElementAsObject = function(name) {
		return tutorial.elements[name];
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
