define(["l10n"], function (l10n) {
	var tutorial = {};

	tutorial.startMainTutorial = function(boardType) {

		var steps = [
			{
				title: l10n.get("TutoTitleMemorize"),
				intro: l10n.get("TutoExplainContent")
			},
			{
				element: "#activity-button",
				position: "bottom",
				title: l10n.get("TutoTitleActivity"),
				intro: l10n.get("TutoActivity")
			},
			{
				element: "#network-button",
				position: "bottom",
				title: l10n.get("TutoTitleNetwork"),
				intro: l10n.get("TutoNetwork")
			},
			{
				element: "#game-templates-button",
				position: "bottom",
				title: l10n.get("TutoTitleTemplate"),
				intro: l10n.get("TutoGameTemplate")
			},
			{
				element: "#game-size-button",
				position: "bottom",
				title: l10n.get("TutoTitleSize"),
				intro: l10n.get("TutoGameSize")
            },
            {
				element: "#game-reset-button",
				position: "bottom",
				title: l10n.get("TutoTitleReset"),
				intro: l10n.get("TutoResetGame")
            },
            {
				element: "#game-editor-button",
				position: "bottom",
				title: l10n.get("TutoTitleOpen"),
				intro: l10n.get("TutoOpenEditor")
			},
			{
				title: l10n.get("TutoTitleInstructions"),
				intro: l10n.get("TutoExplainPlay")
			},

		];

		if (boardType === 1) {
			steps.splice(7, 0, {
				element: "#numberOneTutorial",
				orphan: true,
				position: "right",
				title: l10n.get("TutoTitleCardType1"),
				intro: l10n.get("TutoNumberOne")
			},
			{
				element: "#numberTwoTutorial",
				orphan: true,
				position: "right",
				title: l10n.get("TutoTitleCardType2"),
				intro: l10n.get("TutoNumberTwo")
			});
		} else if (boardType === 2) {
			steps.splice(7, 0, {
				element: "#soundTutorial",
				orphan: true,
				position: "bottom",
				title: l10n.get("TutoTitleSounds"),
				intro: l10n.get("TutoSounds")
			},
			{
				element: "#soundTutorial2",
				orphan: true,
				position: "top",
				title: l10n.get("TutoTitleSounds"),
				intro: l10n.get("TutoSounds2")
			})
		};



		steps = steps.filter(
			(obj) =>
			  !("element" in obj) ||
			  (obj.element.length &&
				document.querySelector(obj.element) &&
				document.querySelector(obj.element).style.display != "none")
		  );
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
			.start();

	};

	tutorial.startEditorTutorial = function() {
		var steps = [

			{
				element: "#game-editor-button",
				position: "bottom",
				title: l10n.get("TutoTitleGoPlay"),
				intro: l10n.get("TutoEditorPlayMode")
			},
			{
				element: "#game-editor-insert-mode-button",
				position: "bottom",
				title: l10n.get("TutoTitleInsert"),
				intro: l10n.get("TutoInsertMode")
			},
			{
				element: "#game-editor-play-mode-button",
				position: "bottom",
				title: l10n.get("TutoTitlePlay"),
				intro: l10n.get("TutoPlayMode")
			},
			{
				element: "#game-editor-clear-button",
				position: "bottom",
				title: l10n.get("TutoTitleClear"),
				intro: l10n.get("TutoClear")
			},
			{
				element: "#InputBox",
				position: "bottom",
				title: l10n.get("TutoTitleInput"),
				intro: l10n.get("TutoEditorInputBox")
			},
			{
				element: "#InsertImage",
				position: "right",
				title: l10n.get("TutoTitleInsertImage"),
				intro: l10n.get("TutorEditorInsertImage")
			},
			{
				element: "#EditorAddButton",
				position: "left",
				title: l10n.get("TutoTitleAddCard"),
				intro: l10n.get("TutoEditorAddButton")
			},
			{
				element: "#EditorUpdateButton",
				position: "left",
				title: l10n.get("TutoTitleUpdateCard"),
				intro: l10n.get("TutoEditorUpdateButton")
			},
			{
				element: "#EditorDeleteButton",
				position: "left",
				title: l10n.get("TutoTitleClearCard"),
				intro: l10n.get("TutoEditorDeleteButton")
			}
		];
		steps = steps.filter(
			(obj) =>
			  !("element" in obj) ||
			  (obj.element.length &&
				document.querySelector(obj.element) &&
				document.querySelector(obj.element).style.display != "none")
		  );
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
			.start();
	};

	return tutorial;
});
