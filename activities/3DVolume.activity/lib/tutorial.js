define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.start = function (ifAdding) {
		var steps = [
			{
				title: l10n.get("VolumeTitle"),
				intro: l10n.get("VolumeIntro"),
			},
			{
				element: "#tetra-button",
				title: l10n.get("AddTetrahedronsTitle"),
				intro: l10n.get("AddTetrahedronsIntro"),
			},
			{
				element: "#cube-button",
				title: l10n.get("AddCubesTitle"),
				intro: l10n.get("AddCubesIntro"),
			},
			{
				element: "#octa-button",
				title: l10n.get("AddOctahedronsTitle"),
				intro: l10n.get("AddOctahedronsIntro"),
			},
			{
				element: "#deca-button",
				title: l10n.get("AddDecahedronsTitle"),
				intro: l10n.get("AddDecahedronsIntro"),
			},
			{
				element: "#dodeca-button",
				title: l10n.get("AddDodecahedronTitle"),
				intro: l10n.get("AddDodecahedronIntro"),
			},
			{
				element: "#icosa-button",
				title: l10n.get("AddIcosahedronTitle"),
				intro: l10n.get("AddIcosahedronIntro"),
			},
			{
				element: "#clear-button",
				title: l10n.get("RemoveVolumesTitle"),
				intro: l10n.get("RemoveVolumesIntro"),
			},
			{
				element: "#volume-button",
				title: l10n.get("SelectVolumeTypeTitle"),
				intro: l10n.get("SelectVolumeTypeIntro"),
			},
			{
				element: "#color-button-fill",
				title: l10n.get("ChangeVolumeColorTitle"),
				intro: l10n.get("ChangeVolumeColorIntro"),
			},
			{
				element: "#color-button-text",
				title: l10n.get("ChangeVolumeTextColorTitle"),
				intro: l10n.get("ChangeVolumeTextColorIntro"),
			},
			{
				element: "#bg-button",
				position: "bottom",
				title: l10n.get("ChangeBoardBackgroundTitle"),
				intro: l10n.get("ChangeBoardBackgroundIntro"),
			},
			{
				element: "#zoom-button",
				title: l10n.get("ZoomInOutTitle"),
				intro: l10n.get("ZoomInOutIntro"),
			},
			{
				element: "#throw-button",
				title: l10n.get("ThrowButtonTitle"),
				intro: l10n.get("ThrowButtonIntro"),
			},
			{
				element: "#sensor-button",
				title: l10n.get("SensorButtonTitle"),
				intro: l10n.get("SensorButtonIntro"),
			},
			{
				element: ".arrow-container",
				title: l10n.get("RotateBoardTitle"),
				intro: l10n.get("RotateBoardIntro"),
			},
		];

		// Filter out hidden buttons based on screen width
		var hiddenButtonSelectors = [];
		var screenWidth = window.innerWidth;

		if (screenWidth <= 1120) {
			hiddenButtonSelectors.push(
				"#color-button-text",
				"#bg-button",
				"#zoom-button"
			);
		}
		if (screenWidth <= 800) {
			hiddenButtonSelectors.push(
				"#volume-button",
				"#color-button-fill",
				"#remove-first"
			);
		}
		if (screenWidth <= 690) {
			hiddenButtonSelectors.push("#sensor-button", "#throw-button");
		}

		steps = steps.filter(function (obj) {
			return (
				!("element" in obj) ||
				(obj.element.length &&
					document.querySelector(obj.element) &&
					document.querySelector(obj.element).style.display !=
						"none" &&
					!hiddenButtonSelectors.includes(obj.element))
			);
		});

		introJs()
			.setOptions({
				tooltipClass: "customTooltip",
				steps: steps,
				prevLabel: l10n.get("TutoPrev"),
				nextLabel: l10n.get("TutoNext"),
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false,
			})
			.start()
			.onexit(function () {
				ifAdding.adding = true;
			});
	};

	return tutorial;
});
