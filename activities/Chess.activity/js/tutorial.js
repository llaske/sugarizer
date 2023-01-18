// Tutorial component based on introjs tour
var Tutorial = {
  template: '<div/>',
  data: function () {
    return {
      showPiece: false,
      visuals: "",
      l10n: {
        stringPrevShort: '',
        stringNextShort: '',
        stringEndShort: '',
        stringTutoWelcomeTitle: '',
        stringTutoWelcomeContent: '',
        stringTutoBoardTitle: '',
        stringTutoBoardContent: '',
        stringTutoPlayerClockTitle: '',
        stringTutoPlayerClockContent: '',
        stringTutoOpponentClockTitle: '',
        stringTutoOpponentClockContent: '',
        stringTutoFlagTitle: '',
        stringTutoFlagContent: '',
        stringTutoMovesTitle: '',
        stringTutoMovesContent: '',
        stringTutoNetworkTitle: '',
        stringTutoNetworkContent: '',
        stringTutoComputerLevelTitle: '',
        stringTutoComputerLevelContent: '',
        stringTutoClockTitle: '',
        stringTutoClockContent: '',
        stringTutoUndoTitle: '',
        stringTutoUndoContent: '',
        stringTutoRestartTitle: '',
        stringTutoRestartContent: '',
        stringTutoColorChangeTitle: '',
        stringTutoColorChangeContent: '',
        stringTutoBasicTitle: '',
        stringTutoBasicContent: '',
        stringTutoAimTitle: '',
        stringTutoAimContent: '',
        stringTutoPawnTitle: '',
        stringTutoPawnContent: '',
        stringTutoKnightTitle: '',
        stringTutoKnightContent: '',
        stringTutoBishopTitle: '',
        stringTutoBishopContent: '',
        stringTutoRookTitle: '',
        stringTutoRookContent: '',
        stringTutoQueenTitle: '',
        stringTutoQueenContent: '',
        stringTutoKingTitle: '',
        stringTutoKingContent: '',
        stringTutoPawnPromotionTitle: '',
        stringTutoPawnPromotionContent: '',
        stringTutoCastlingTitle: '',
        stringTutoCastlingContent: '',
        stringTutoDrawTitle: '',
        stringTutoDrawContent: '',
      }
    }
  },
  methods: {
    localized: function (localization) {
      localization.localize(this.l10n);
    },

    showPieces: function (i, step) {
      switch (i) {
        case 14:
          this.visuals = "<div class='wP tutPiece'></div>"
          break;
        case 15:
          this.visuals = "<div class='wN tutPiece'></div>"
          break;
        case 16:
          this.visuals = "<div class='wB tutPiece'></div>"
          break;
        case 17:
          this.visuals = "<div class='wR tutPiece'></div>"
          break;
        case 18:
          this.visuals = "<div class='wQ tutPiece'></div>"
          break;
        case 19:
          this.visuals = "<div class='wK tutPiece'></div>"
          break;
        default:
          this.visuals = ""
      }
      return Tutorial;
    },

    show: function () {
      let vm = this;
      var steps = [];
      steps = steps.concat([
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoWelcomeTitle,
          intro: this.l10n.stringTutoWelcomeContent
        },
        {
          element: "#board",
          position: "right",
          title: this.l10n.stringTutoBoardTitle,
          intro: this.l10n.stringTutoBoardContent
        },
        {
          element: "#player-clock",
          position: "left",
          title: this.l10n.stringTutoPlayerClockTitle,
          intro: this.l10n.stringTutoPlayerClockContent
        },
        {
          element: "#opponent-clock",
          position: "left",
          title: this.l10n.stringTutoOpponentClockTitle,
          intro: this.l10n.stringTutoOpponentClockContent
        },
        {
          element: "#flagDiv",
          position: "left",
          title: this.l10n.stringTutoFlagTitle,
          intro: this.l10n.stringTutoFlagContent
        },
        {
          element: "#moves-container",
          position: "top",
          title: this.l10n.stringTutoMovesTitle,
          intro: this.l10n.stringTutoMovesContent
        },
        {
          element: "#network-button",
          position: "bottom",
          title: this.l10n.stringTutoNetworkTitle,
          intro: this.l10n.stringTutoNetworkContent
        },
        {
          element: "#new-button",
          position: "bottom",
          title: this.l10n.stringTutoRestartTitle,
          intro: this.l10n.stringTutoRestartContent
        },
        {
          element: "#undo-button",
          position: "bottom",
          title: this.l10n.stringTutoUndoTitle,
          intro: this.l10n.stringTutoUndoContent
        },
        {
          element: "#level-button",
          position: "bottom",
          title: this.l10n.stringTutoComputerLevelTitle,
          intro: this.l10n.stringTutoComputerLevelContent
        },
        {
          element: "#clock-button",
          position: "bottom",
          title: this.l10n.stringTutoClockTitle,
          intro: this.l10n.stringTutoClockContent
        },
        {
          element: "#color-button",
          position: "bottom",
          title: this.l10n.stringTutoColorChangeTitle,
          intro: this.l10n.stringTutoColorChangeContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoBasicTitle,
          intro: this.l10n.stringTutoBasicContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoAimTitle,
          intro: this.l10n.stringTutoAimContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoPawnTitle,
          intro: this.l10n.stringTutoPawnContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoKnightTitle,
          intro: this.l10n.stringTutoKnightContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoBishopTitle,
          intro: this.l10n.stringTutoBishopContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoRookTitle,
          intro: this.l10n.stringTutoRookContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoQueenTitle,
          intro: this.l10n.stringTutoQueenContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoKingTitle,
          intro: this.l10n.stringTutoKingContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoPawnPromotionTitle,
          intro: this.l10n.stringTutoPawnPromotionContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoCastlingTitle,
          intro: this.l10n.stringTutoCastlingContent
        },
        {
          element: "",
          orphan: true,
          position: "bottom",
          title: this.l10n.stringTutoDrawTitle,
          intro: this.l10n.stringTutoDrawContent
        },

      ]);

      steps = steps.filter(function (obj) {
        return !('element' in obj) || ((obj.element).length && document.querySelector(obj.element) && document.querySelector(obj.element).style.display != 'none');
      });
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
  }
}



