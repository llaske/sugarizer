

// Tutorial handling
define([], function () {
	var tutorial = {};
	var tour;
	var launched = false;

	tutorial.elements = [];
	tutorial.icons = null;
	tutorial.activityId = null;

	// Init tutorial
	tutorial.init = function() {
		var prevString = l10n.get("TutoPrev");
		var nextString = l10n.get("TutoNext");
		var endString = l10n.get("TutoEnd");
		var gotoStep = undefined;
		tutorial.activityId = null;
		tour = introJs().setOptions({
				tooltipClass: 'customTooltip',
				prevLabel: prevString,
				nextLabel: nextString,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false
		});
		tour.onafterchange(function() {
			var color = this._introItems[this._currentStep].iconColor;
			if (color) {
				var iconElement = document.getElementById("icon-tutorial");
				if (iconElement) {
					iconLib.colorize(iconElement, color, function(){});
				}
			}
		});
		tour.onexit(function() {
			tutorial.elements = [];
			tutorial.icons = null;
			launched = false;
		});
		var currentView = app.getView();
		var insertIcon = function(icon) {
			return "<div id='icon-tutorial' style='min-width:55px;height:55px;margin-top:15px;margin-left:5px;margin-right:10px;background-repeat:no-repeat;background-image:url("+icon+");background-size:"+constant.sizeEmpty+"px "+constant.sizeEmpty+"px'/></div>";
		}
		if (currentView == constant.radialView) {
			tutorial.addSteps([
				{
					title: l10n.get("TutoInitMainTitle"),
					intro: insertIcon('./icons/owner-icon.svg')+l10n.get("TutoInitMainContent"),
					iconColor: preferences.getColor()
				},
				{
					element: tutorial.getElement("owner"),
					position: "right",
					title: l10n.get("TutoUserTitle"),
					intro: l10n.get("TutoUserContent")
				},
				{
					element: tutorial.getElement("activity"),
					position: "bottom",
					title: l10n.get("TutoActivityTitle"),
					intro: l10n.get("TutoActivityContent")
				},
				{
					element: tutorial.getElement("journal"),
					position: "right",
					title: l10n.get("TutoJournalTitle"),
					intro: insertIcon('./icons/activity-journal.svg')+l10n.get("TutoJournalContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					position: "bottom",
					title: l10n.get("TutoFavoriteTitle"),
					intro: l10n.get("TutoFavoriteContent")
				},
				{
					element: tutorial.getElement("listbutton"),
					position: "bottom",
					title: l10n.get("TutoListTitle"),
					intro: l10n.get("TutoListContent")
				},
				{
					element: tutorial.getElement("searchtext"),
					position: "bottom",
					title: l10n.get("TutoSearchTitle"),
					intro: l10n.get("TutoSearchContent")
				},
				{
					element: tutorial.getElement("offlinebutton"),
					position: "bottom",
					title: l10n.get("TutoOfflineTitle"),
					intro: insertIcon('./icons/cloud-warning.svg')+l10n.get("TutoOfflineContent")
				},
				{
					element: tutorial.getElement("neighborbutton"),
					position: "bottom",
					title: l10n.get("TutoNeighborTitle"),
					intro: l10n.get("TutoNeighborContent")
				},
				{
					title: l10n.get("TutoRunTitle"),
					intro: insertIcon('./activities/SharedNotes.activity/activity/activity-icon.svg')+l10n.get("TutoRunContent")
				}
			]);
			tutorial.activityId = "org.olpcfrance.sharednotes";
		} else if (currentView == constant.listView) {
			var activities = tutorial.getElementAsObject("activities");
			if (!activities) {
				tutorial.addSteps([
					{
						element: tutorial.getElement("radialbutton"),
						position: "bottom",
						title: l10n.get("TutoFavoriteTitle"),
						intro: l10n.get("TutoFavoriteContent")
					},
					{
						element: tutorial.getElement("listbutton"),
						position: "bottom",
						title: l10n.get("TutoListTitle"),
						intro: l10n.get("TutoListContent")
					},
					{
						element: tutorial.getElement("favoriteitembutton"),
						position: "bottom",
						title: l10n.get("TutoFavswitchTitle"),
						intro: l10n.get("TutoFavswitchContent")
					},
					{
						element: tutorial.getElement("searchtext"),
						position: "bottom",
						title: l10n.get("TutoSearchTitle"),
						intro: l10n.get("TutoSearchContent")
					},
					{
						element: tutorial.getElement("neighborbutton"),
						position: "bottom",
						title: l10n.get("TutoNeighborTitle"),
						intro: l10n.get("TutoNeighborContent")
					}
				]);
			} else {
				var steps = [];
				for (var i = 0 ; i < activities.length ; i++) {
					steps.push({
						title: activities[i].title,
						intro: insertIcon('./'+activities[i].icon.directory + "/" + activities[i].icon.icon)+activities[i].description
					});
				}
				tutorial.addSteps(steps);
				gotoStep = tutorial.getElementAsObject("step");
			}
		} else if (currentView == constant.journalView) {
			tutorial.addSteps([
				{
					title: l10n.get("TutoJournalIntroTitle"),
					intro: l10n.get("TutoJournalIntroContent")
				},
				{
					element: tutorial.getElement("activityitem"),
					position: "bottom",
					title: l10n.get("TutoJournalActivityTitle"),
					intro: l10n.get("TutoJournalActivityContent")
				},
				{
					element: tutorial.getElement("timeitem"),
					position: "bottom",
					title: l10n.get("TutoJournalTimeTitle"),
					intro: l10n.get("TutoJournalTimeContent")
				},
				{
					element: tutorial.getElement("titleitem"),
					position: "bottom",
					title: l10n.get("TutoJournalTitleTitle"),
					intro: l10n.get("TutoJournalTitleContent")
				},
				{
					element: tutorial.getElement("favoriteitem"),
					position: "bottom",
					title: l10n.get("TutoJournalFavoriteTitle"),
					intro: l10n.get("TutoJournalFavoriteContent")
				},
				{
					element: tutorial.getElement("checkitem"),
					position: "bottom",
					title: l10n.get("TutoJournalCheckTitle"),
					intro: l10n.get("TutoJournalCheckContent")
				},
				{
					element: tutorial.getElement("searchtext"),
					position: "bottom",
					title: l10n.get("TutoJournalSearchTitle"),
					intro: l10n.get("TutoJournalSearchContent")
				},
				{
					element: tutorial.getElement("favoritebutton"),
					position: "bottom",
					title: l10n.get("TutoJournalFavButtonTitle"),
					intro: l10n.get("TutoJournalFavButtonContent")
				},
				{
					element: tutorial.getElement("typeselect"),
					position: "bottom",
					title: l10n.get("TutoJournalTypeTitle"),
					intro: l10n.get("TutoJournalTypeContent")
				},
				{
					element: tutorial.getElement("timeselect"),
					position: "bottom",
					title: l10n.get("TutoJournalTimeButtonTitle"),
					intro: l10n.get("TutoJournalTimeButtonContent")
				},
				{
					element: tutorial.getElement("sortselect"),
					position: "bottom",
					title: l10n.get("TutoJournalSortButtonTitle"),
					intro: l10n.get("TutoJournalSortButtonContent")
				},
				{
					element: tutorial.getElement("fromdevicebutton"),
					position: "bottom",
					title: l10n.get("TutoJournalFromDeviceButtonTitle"),
					intro: l10n.get("TutoJournalFromDeviceButtonContent")
				},
				{
					element: tutorial.getElement("journalbutton"),
					position: "top",
					title: l10n.get("TutoJournalLocalTitle"),
					intro: l10n.get("TutoJournalLocalContent")
				},
				{
					element: tutorial.getElement("cloudonebutton"),
					position: "top",
					title: l10n.get("TutoJournalCloudOneTitle"),
					intro: l10n.get("TutoJournalCloudOneContent")
				},
				{
					element: tutorial.getElement("cloudallbutton"),
					position: "top",
					title: l10n.get("TutoJournalCloudAllTitle"),
					intro: l10n.get("TutoJournalCloudAllContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					position: "bottom",
					title: l10n.get("TutoGotoHomeTitle"),
					intro: l10n.get("TutoGotoHomeContent")
				}
			]);
		} else if (currentView == constant.neighborhoodView) {
			tutorial.addSteps([
				{
					title: l10n.get("TutoNeighborIntroTitle"),
					intro: window.sugarizerOS ? l10n.get("TutoNeighborIntroContent2") : l10n.get("TutoNeighborIntroContent")
				},
				{
					element: tutorial.getElement("owner"),
					position: "right",
					title: l10n.get("TutoNeighborUserTitle"),
					intro: l10n.get("TutoNeighborUserContent")
				},
				{
					element: tutorial.getElement("server"),
					position: "auto",
					title: l10n.get("TutoNeighborServerTitle"),
					intro: l10n.get("TutoNeighborServerContent")
				},
				{
					element: tutorial.getElement("other"),
					position: "auto",
					title: l10n.get("TutoNeighborOtherTitle"),
					intro: l10n.get("TutoNeighborOtherContent")
				},
				{
					element: tutorial.getElement("activity"),
					position: "auto",
					title: l10n.get("TutoNeighborActivityTitle"),
					intro: l10n.get("TutoNeighborActivityContent")
				},
				{
					element: tutorial.getElement("wifi"),
					position: "auto",
					title: l10n.get("TutoNeighborWifiTitle"),
					intro: l10n.get("TutoNeighborWifiContent")
				},
				{
					element: tutorial.getElement("radialbutton"),
					position: "bottom",
					title: l10n.get("TutoGotoHomeTitle"),
					intro: l10n.get("TutoGotoHomeContent")
				}
			]);
		} else if (currentView == constant.initView) {
			var previous = {
				element: tutorial.getElement("previous"),
				position: "top",
				title: l10n.get("TutoInitPreviousTitle"),
				intro: l10n.get("TutoInitPreviousContent")
			};
			var next = {
				element: tutorial.getElement("next"),
				position: "top",
				title: l10n.get("TutoInitNextTitle"),
				intro: l10n.get("TutoInitNextContent")
			};
			var createMode = tutorial.getElementAsObject("createnew");
			var steps = [
				[
					{
						title: l10n.get("TutoInitIntroTitle"),
						intro: insertIcon('./icons/owner-icon.svg')+l10n.get("TutoInitIntroTitleIntroContent"),
						iconColor: {stroke: "#005FE4", fill: "#FF2B34"}
					},
					{
						element: tutorial.getElement("newuser"),
						position: "left",
						title: l10n.get("TutoInitNewUserTitle"),
						intro: l10n.get("TutoInitNewUserContent")
					},
					{
						element: tutorial.getElement("login"),
						position: "right",
						title: l10n.get("TutoInitLoginTitle"),
						intro: l10n.get("TutoInitLoginContent")
					},
					{
						element: tutorial.getElement("historybox"),
						position: "bottom",
						title: l10n.get("TutoInitHistoryTitle"),
						intro: l10n.get("TutoInitHistoryContent")
					},
					{
						element: tutorial.getElement("helpbutton"),
						position: "bottom",
						title: l10n.get("TutoInitHelpTitle"),
						intro: l10n.get("TutoInitHelpContent")
					},
					{
						element: tutorial.getElement("stopbutton"),
						position: "bottom",
						title: l10n.get("TutoInitStopTitle"),
						intro: l10n.get("TutoInitStopContent")
					},
				],
				[
					{
						element: tutorial.getElement("serverbox"),
						position: "bottom",
						title: l10n.get("TutoInitServerTitle"),
						intro: l10n.get("TutoInitServerContent")
					},
					{
						element: tutorial.getElement("qrcode"),
						position: "bottom",
						title: l10n.get("TutoInitQRCodeTitle"),
						intro: l10n.get("TutoInitQRCodeContent")
					},
					previous,
					next,
				],
				[
					{
						element: tutorial.getElement("namebox"),
						position: "bottom",
						title: (createMode ? l10n.get("TutoInitNameNewTitle") : l10n.get("TutoInitNameTitle")),
						intro: (createMode ? l10n.get("TutoInitNameNewContent") : l10n.get("TutoInitNameContent"))
					},
					previous,
					next,
				],
				[
					{
						element: tutorial.getElement("passbox"),
						position: "right",
						title: (createMode ? l10n.get("TutoInitPasswordNewTitle") : l10n.get("TutoInitPasswordTitle")),
						intro: (createMode ? l10n.get("TutoInitPasswordNewContent") : l10n.get("TutoInitPasswordContent"))
					},
					previous,
					next,
				],
				[
					{
						element: (createMode ? tutorial.getElement("owner") : tutorial.getElement("passbox")),
						position: "right",
						title: (createMode ? l10n.get("TutoInitColorTitle") : l10n.get("TutoInitPasswordTitle")),
						intro: (createMode ? l10n.get("TutoInitColorContent") : l10n.get("TutoInitPasswordContent"))
					},
					previous,
					next,
				],
				[
					{
						title: l10n.get("TutoInitCookieTitle"),
						intro: l10n.get("TutoInitCookieContent")
					},
					{
						element: tutorial.getElement("decline"),
						position: "top",
						title: l10n.get("TutoInitDeclineTitle"),
						intro: l10n.get("TutoInitDeclineContent")
					},
					{
						element: tutorial.getElement("accept"),
						position: "top",
						title: l10n.get("TutoInitAcceptTitle"),
						intro: l10n.get("TutoInitAcceptContent")
					},
				],
			];
			var currentstep = tutorial.getElementAsObject("currentstep");
			tutorial.addSteps(steps[currentstep]);
		}
		tour.start();
		if (gotoStep !== undefined) {
			tour.goToStep(gotoStep+1);
		}
	}

	tutorial.addSteps = function(steps) {
		var filtered = steps.filter(function (obj) {
			return  !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
		});
		tour.addSteps(filtered);
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
		// HACK: Sometime when network performance are poor, tutorial is not ready, ignore call
		if (app.getView() === undefined) {
			return;
		}
		if (launched) {
			return;
		}
		tutorial.init();
		launched = true;
	};

	// Test if launched
	tutorial.isLaunched = function() {
		return launched;
	};

	// Stop tutorial
	tutorial.stop = function() {
		if (launched) {
			tour.exit();
		}
	};

	return tutorial;
});
