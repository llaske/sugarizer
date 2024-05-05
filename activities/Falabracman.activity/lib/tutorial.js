define(["l10n"], function(l10n) {
  var tutorial = {};

  tutorial.start = function() {
    var steps;
    if (display == 'homeScreen') {
      steps = [{
        title: l10n.get("TutoWelcomeTitle"),
        intro: l10n.get("TutoWelcomeContent")
      },
      {
        title: l10n.get("TutoHomeTitle"),
        intro: l10n.get("TutoHomeContent")
      }];
    } else if (display == 'settingScreen') {
      steps = [{
          title: l10n.get("TutoSettingTitle"),
          intro: l10n.get("TutoSettingContent")
        },
        {
          element: "#panel-body",
          position: "top",
          title: l10n.get("TutoDictTitle"),
          intro: l10n.get("TutoDictContent")
        },
        {
          element: "#word",
          position: "right",
          title: l10n.get("TutoWordInputTitle"),
          intro: l10n.get("TutoWordInputContent")
        },
        {
          element: "#addWord",
          position: "top",
          title: l10n.get("TutoAddWordTitle"),
          intro: l10n.get("TutoAddWordContent")
        },
        {
          element: "#deleteAllWords",
          position: "top",
          title: l10n.get("TutoDeleteAllWordsTitle"),
          intro: l10n.get("TutoDeleteAllWordsContent")
        },
        {
          element: "#saveDict",
          position: "top",
          title: l10n.get("TutoSaveDictTitle"),
          intro: l10n.get("TutoSaveDictContent")
        },
        {
          element: "#resetDict",
          position: "top",
          title: l10n.get("TutoResetDictTitle"),
          intro: l10n.get("TutoResetDictContent")
        },
        {
          title: l10n.get("TutoAddStepTitle"),
          intro: l10n.get("TutoAddStepContent")
        },
        {
          title: l10n.get("TutoEditStepTitle"),
          intro: l10n.get("TutoEditStepContent")
        },
        {
          title: l10n.get("TutoDeleteStepTitle"),
          intro: l10n.get("TutoDeleteStepContent")
        },
        {
          element: "#restart-button",
          position: "bottom",
          title: l10n.get("TutoReturnTitle"),
          intro: l10n.get("TutoReturnContent"),
        }
      ];
    } else {
      steps = [{
          title: l10n.get("TutoExplainTitle"),
          intro: l10n.get("TutoExplainContent")
        },
        {
          element: "#canvas",
          position: "top",
          title: l10n.get("TutoGameTitle"),
          intro: l10n.get("TutoGameContent")
        },
        {
          element: "#restart-button",
          position: "bottom",
          title: l10n.get("TutoRestartTitle"),
          intro: l10n.get("TutoRestartContent")
        }
      ];
    }
     				steps = steps.filter((obj) =>  !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none'));
		introJs().setOptions({
			tooltipClass: 'customTooltip',
			steps: steps,
			prevLabel: l10n.get("TutoPrev"),
			nextLabel: l10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false
		}).start();
	}

  return tutorial;
});
