

// Tutorial handling
define(["l10n", "activity/activity"], function (l10n) {
	var tutorial = {};

	tutorial.elements = [];
	tutorial.tourInit = 1;
	tutorial.tourStandard = 2;

	// Init tutorial
	tutorial.init = function(tourType) {
		var steps;
		var intro = introJs();
		if (tourType == tutorial.tourInit) {
			var nextStep = function() { intro.nextStep(); }
			tutorial.getElement("activity").addEventListener("click", nextStep);
			tutorial.getElement("network").addEventListener("click", nextStep);
			intro.onafterchange(function() {
				document.getElementById("activity-palette").style.visibility = (this._currentStep == 1 ? "visible":"hidden");
				document.getElementsByClassName("palette")[3].style.visibility = (this._currentStep == 3 ? "visible":"hidden");
			});
			intro.onexit(function() {
				tutorial.getElement("activity").removeEventListener("click", nextStep);
				tutorial.getElement("network").removeEventListener("click", nextStep);
			});
			steps = [
				{
					element: tutorial.getElement("activity"),
					position: "bottom",
					title: l10n.get("TutoActivityTitle"),
					intro: l10n.get("TutoActivityContent")
				},
				{
					element: tutorial.getElement("title"),
					position: "right",
					title: l10n.get("TutoTitleTitle"),
					intro: l10n.get("TutoTitleContent")
				},
				{
					element: tutorial.getElement("network"),
					position: "bottom",
					title: l10n.get("TutoNetworkTitle"),
					intro: l10n.get("TutoNetworkContent")
				},
				{
					element: tutorial.getElement("shared"),
					position: "right",
					title: l10n.get("TutoSharedTitle"),
					intro: l10n.get("TutoSharedContent")
				},
				{
					element: tutorial.getElement("help"),
					position: "bottom",
					title: l10n.get("TutoHelpTitle"),
					intro: l10n.get("TutoHelpContent")
				},
				{
					element: tutorial.getElement("stop"),
					position: "bottom",
					title: l10n.get("TutoStopTitle"),
					intro: l10n.get("TutoStopContent")
				},
			];
		} else {
			steps = [
				{
					title: l10n.get("TutoExplainTitle"),
					intro: l10n.get("TutoExplainContent")
				},
				{
					element: tutorial.getElement("node"),
					position: "left",
					title: l10n.get("TutoNodeTitle"),
					intro: l10n.get("TutoNodeContent")
				},
				{
					element: tutorial.getElement("color"),
					position: "bottom",
					title: l10n.get("TutoColorTitle"),
					intro: l10n.get("TutoColorContent")
				},
				{
					element: tutorial.getElement("add"),
					position: "bottom",
					title: l10n.get("TutoAddTitle"),
					intro: l10n.get("TutoAddContent")
				},
				{
					element: '#background-image-button',
					position: "bottom",
					title: l10n.get("BackgroundChangeTitle"),
					intro: l10n.get("TutoBackgroundChangeContent")
				},
				{
					element: tutorial.getElement("remove"),
					position: "bottom",
					title: l10n.get("TutoRemoveTitle"),
					intro: l10n.get("TutoRemoveContent")
				},
				{
					element: tutorial.getElement("undo"),
					position: "bottom",
					title: l10n.get("TutoUndoTitle"),
					intro: l10n.get("TutoUndoContent")
				},
				{
					element: tutorial.getElement("redo"),
					position: "bottom",
					title: l10n.get("TutoRedoTitle"),
					intro: l10n.get("TutoRedoContent")
				},
				{
					element: tutorial.getElement("zoom"),
					position: "bottom",
					title: l10n.get("TutoZoomTitle"),
					intro: l10n.get("TutoZoomContent")
				},
				{
					element: tutorial.getElement("png"),
					position: "bottom",
					title: l10n.get("TutoPngTitle"),
					intro: l10n.get("TutoPngContent")
				}
			];
		}
		steps = steps.filter((obj) =>  !('element' in obj) || (!obj.element.style) || (obj.element.style.display != 'none'));
		intro.setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
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
	};

	return tutorial;
});
