define(["webL10n"], function (l10n) {
	var tutorial = {};

	tutorial.startMainTutorial = function(boardType) {

		var steps = [
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoTitleMemorize"),
			    content: l10n.get("TutoExplainContent")
			},
			{
				element: "#activity-button",
				placement: "bottom",
				title: l10n.get("TutoTitleActivity"),
				content: l10n.get("TutoActivity")
			},
			{
				element: "#network-button",
				placement: "bottom",
				title: l10n.get("TutoTitleNetwork"),
			    content: l10n.get("TutoNetwork")
			},
			{
				element: "#game-templates-button",
				placement: "bottom",
				title: l10n.get("TutoTitleTemplate"),
			    content: l10n.get("TutoGameTemplate")
			},
			{
				element: "#game-size-button",
				placement: "bottom",
				title: l10n.get("TutoTitleSize"),
			    content: l10n.get("TutoGameSize")
            },
            {
				element: "#game-reset-button",
				placement: "bottom",
				title: l10n.get("TutoTitleReset"),
			    content: l10n.get("TutoResetGame")
            },
            {
				element: "#game-editor-button",
				placement: "bottom",
				title: l10n.get("TutoTitleOpen"),
			    content: l10n.get("TutoOpenEditor")
			},
			{
				element: "",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoTitleInstructions"),
			    content: l10n.get("TutoExplainPlay")
			},

		];

		if (boardType === 1) {
			steps.splice(7, 0, {
				element: "#numberOneTutorial",
				orphan: true,
				placement: "right",
				title: l10n.get("TutoTitleCardType1"),
				content: l10n.get("TutoNumberOne")
			},
			{
				element: "#numberTwoTutorial",
				orphan: true,
				placement: "right",
				title: l10n.get("TutoTitleCardType2"),
				content: l10n.get("TutoNumberTwo")
			});
		} else if (boardType === 2) {
			steps.splice(7, 0, {
				element: "#soundTutorial",
				orphan: true,
				placement: "bottom",
				title: l10n.get("TutoTitleSounds"),
				content: l10n.get("TutoSounds")
			},
			{
				element: "#soundTutorial2",
				orphan: true,
				placement: "top",
				title: l10n.get("TutoTitleSounds"),
				content: l10n.get("TutoSounds2")
			})
		};



		var tour = new Tour({
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
						<div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init();
		tour.start(true);

	};

	tutorial.startEditorTutorial = function() {
		var steps = [

			{
				element: "#game-editor-button",
				placement: "bottom",
				title: l10n.get("TutoTitleGoPlay"),
				content: l10n.get("TutoEditorPlayMode")
			},
			{
				element: "#game-editor-insert-mode-button",
				placement: "bottom",
				title: l10n.get("TutoTitleInsert"),
				content: l10n.get("TutoInsertMode")
			},
			{
				element: "#game-editor-play-mode-button",
				placement: "bottom",
				title: l10n.get("TutoTitlePlay"),
			    content: l10n.get("TutoPlayMode")
			},
			{
				element: "#game-editor-clear-button",
				placement: "bottom",
				title: l10n.get("TutoTitleClear"),
			    content: l10n.get("TutoClear")
			},
			{
				element: "#InputBox",
				placement: "bottom",
				title: l10n.get("TutoTitleInput"),
			    content: l10n.get("TutoEditorInputBox")
			},
			{
				element: "#InsertImage",
				placement: "right",
				title: l10n.get("TutoTitleInsertImage"),
			    content: l10n.get("TutorEditorInsertImage")
			},
			{
				element: "#EditorAddButton",
				placement: "left",
				title: l10n.get("TutoTitleAddCard"),
			    content: l10n.get("TutoEditorAddButton")
			},
			{
				element: "#EditorUpdateButton",
				placement: "left",
				title: l10n.get("TutoTitleUpdateCard"),
			    content: l10n.get("TutoEditorUpdateButton")
			},
			{
				element: "#EditorDeleteButton",
				placement: "left",
				title: l10n.get("TutoTitleClearCard"),
			    content: l10n.get("TutoEditorDeleteButton")
			}
		];
		var tour = new Tour({
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
						<div class='icon-tutorial-text'>"+l10n.get("TutoPrev")+"</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoNext")+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+l10n.get("TutoEnd")+"</div>\
					</div>\
				</div>\
			</div>",
			storage: false,
			backdrop: true,
			steps: steps
		});
		tour.init
		tour.start(true)
	};

	return tutorial;
});
