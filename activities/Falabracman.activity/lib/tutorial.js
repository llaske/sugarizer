define(["webL10n"], function(l10n) {
  var tutorial = {};

  tutorial.start = function() {
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
						<div class='icon-tutorial-text'>" + l10n.get("TutoPrev") + "</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>" + l10n.get("TutoNext") + "</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>" + l10n.get("TutoEnd") + "</div>\
					</div>\
				</div>\
			</div>",
      storage: false,
      backdrop: true,
      steps: [],
    });
    if (display == 'homeScreen') {
      tour.addSteps([{
        element: "",
        orphan: true,
        placement: "bottom",
        title: l10n.get("TutoWelcomeTitle"),
        content: l10n.get("TutoWelcomeContent")
      },
      {
        element: "",
        orphan: true,
        placement: "bottom",
        onNext: function() {
          tour.end();
        },
        title: l10n.get("TutoHomeTitle"),
        content: l10n.get("TutoHomeContent")
      }]);
    } else if (display == 'settingScreen') {
      tour.addSteps([{
          element: "",
          orphan: true,
          placement: "bottom",
          title: l10n.get("TutoSettingTitle"),
          content: l10n.get("TutoSettingContent")
        },
        {
          element: "#panel-body",
          placement: "top",
          title: l10n.get("TutoDictTitle"),
          content: l10n.get("TutoDictContent")
        },
        {
          element: "#word",
          placement: "right",
          title: l10n.get("TutoWordInputTitle"),
          content: l10n.get("TutoWordInputContent")
        },
        {
          element: "#addWord",
          placement: "top",
          title: l10n.get("TutoAddWordTitle"),
          content: l10n.get("TutoAddWordContent")
        },
        {
          element: "#deleteAllWords",
          placement: "top",
          title: l10n.get("TutoDeleteAllWordsTitle"),
          content: l10n.get("TutoDeleteAllWordsContent")
        },
        {
          element: "#saveDict",
          placement: "top",
          title: l10n.get("TutoSaveDictTitle"),
          content: l10n.get("TutoSaveDictContent")
        },
        {
          element: "#resetDict",
          placement: "top",
          title: l10n.get("TutoResetDictTitle"),
          content: l10n.get("TutoResetDictContent")
        },
        {
          element: "",
          orphan: true,
          placement: "bottom",
          title: l10n.get("TutoAddStepTitle"),
          content: l10n.get("TutoAddStepContent")
        },
        {
          element: "",
          orphan: true,
          placement: "bottom",
          title: l10n.get("TutoEditStepTitle"),
          content: l10n.get("TutoEditStepContent")
        },
        {
          element: "",
          orphan: true,
          placement: "bottom",
          title: l10n.get("TutoDeleteStepTitle"),
          content: l10n.get("TutoDeleteStepContent")
        },
        {
          element: "#restart-button",
          placement: "bottom",
          title: l10n.get("TutoReturnTitle"),
          content: l10n.get("TutoReturnContent"),
          onNext: function() {
            tour.end();
          }
        }
      ]);
    } else {
      tour.addSteps([{
          element: "",
          orphan: true,
          placement: "bottom",
          title: l10n.get("TutoExplainTitle"),
          content: l10n.get("TutoExplainContent")
        },
        {
          element: "#canvas",
          placement: "top",
          title: l10n.get("TutoGameTitle"),
          content: l10n.get("TutoGameContent")
        },
        {
          element: "#restart-button",
          placement: "bottom",
          title: l10n.get("TutoRestartTitle"),
          content: l10n.get("TutoRestartContent")
        },
        {
          element: "#sound-button",
          placement: "bottom",
          onNext: function() {
            tour.end();
          },
          title: l10n.get("TutoSoundTitle"),
          content: l10n.get("TutoSoundContent")
        }
      ]);
    }
    tour.init();
    tour.start(true);

  };

  return tutorial;
});
