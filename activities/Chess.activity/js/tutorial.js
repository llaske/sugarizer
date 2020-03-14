
// Tutorial component based on bootstrap tour
var Tutorial = {
	template: '<div/>',
	data: function() {
		return {
			l10n: {
				stringPrevShort: '',
				stringNextShort: '',
				stringEndShort: '',
				stringTutoUITitle: '',
				stringTutoUIContent: '',
				stringTutoRulesTitle: '',
				stringTutoRulesContent: '',
				stringTutoGoalTitle: '',
				stringTutoGoalContent: '',
				stringTutoChessboardUITitle: '',
				stringTutoChessboardUIContent: '',
				stringTutoChessboardTitle: '',
				stringTutoChessboardContent: '',
				stringTutoChessInfoTitle: '',
				stringTutoChessInfoContent: '',
				stringTutoOpponentInfoTitle: '',
				stringTutoOpponentInfoContent: '',
				stringTutoRestartTitle: '',
				stringTutoRestartContent: '',
				stringTutoUndoTitle: '',
				stringTutoUndoContent: '',
				stringTutoDifficultyTitle: '',
				stringTutoDifficultyContent: '',
				stringTutoNetworkTitle: '',
				stringTutoNetworkContent: '',
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
				stringTutoInitPositionTitle: '',
				stringTutoInitPositionContent: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			localization.localize(this.l10n);
		},

		show: function(type) {
			let vm = this;
			var steps = [];
			if(type == 'ui') {
				steps.push(
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: this.l10n.stringTutoUITitle,
						content: this.l10n.stringTutoUIContent
					}
				);
				steps = steps.concat([
					{
						element: "#chessboard",
						placement: "right",
						title: this.l10n.stringTutoChessboardUITitle,
						content: this.l10n.stringTutoChessboardUIContent
					},
					{
						element: "#chess-info",
						placement: "left",
						title: this.l10n.stringTutoChessInfoTitle,
						content: this.l10n.stringTutoChessInfoContent
					},
					{
						element: "#opponent-info",
						placement: "bottom",
						title: this.l10n.stringTutoOpponentInfoTitle,
						content: this.l10n.stringTutoOpponentInfoContent
					},
					{
						element: "#restart-button",
						placement: "bottom",
						title: this.l10n.stringTutoRestartTitle,
						content: this.l10n.stringTutoRestartContent
					},
					{
						element: "#undo-button",
						placement: "bottom",
						title: this.l10n.stringTutoUndoTitle,
						content: this.l10n.stringTutoUndoContent
					},
					{
						element: "#difficulty-button",
						placement: "bottom",
						title: this.l10n.stringTutoDifficultyTitle,
						content: this.l10n.stringTutoDifficultyContent
					},
					{
						element: "#network-button",
						placement: "bottom",
						title: this.l10n.stringTutoNetworkTitle,
						content: this.l10n.stringTutoNetworkContent
					}
				]);
			} else if(type == 'rules') {
				steps.push(
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: this.l10n.stringTutoRulesTitle,
						content: this.l10n.stringTutoRulesContent
					}
				);
				steps = steps.concat([
					{
						element: "#chessboard-tut",
						placement: "right",
						title: this.l10n.stringTutoChessboardTitle,
						content: this.l10n.stringTutoChessboardContent
					},
					{
						element: "img[id|='wP']",
						placement: "top",
						title: this.l10n.stringTutoPawnTitle,
						content: this.l10n.stringTutoPawnContent
					},
					{
						element: "img[id|='wN']",
						placement: "top",
						title: this.l10n.stringTutoKnightTitle,
						content: this.l10n.stringTutoKnightContent
					},
					{
						element: "img[id|='wB']",
						placement: "top",
						title: this.l10n.stringTutoBishopTitle,
						content: this.l10n.stringTutoBishopContent
					},
					{
						element: "img[id|='wR']",
						placement: "top",
						title: this.l10n.stringTutoRookTitle,
						content: this.l10n.stringTutoRookContent
					},
					{
						element: "img[id|='wQ']",
						placement: "top",
						title: this.l10n.stringTutoQueenTitle,
						content: this.l10n.stringTutoQueenContent
					},
					{
						element: "img[id|='wK']",
						placement: "top",
						title: this.l10n.stringTutoKingTitle,
						content: this.l10n.stringTutoKingContent
					},
					{
						element: "#chessboard-tut",
						placement: "right",
						title: this.l10n.stringTutoInitPositionTitle,
						content: this.l10n.stringTutoInitPositionContent
					},
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: this.l10n.stringTutoGoalTitle,
						content: this.l10n.stringTutoGoalContent
					},
				]);
			}
			var tour = new Tour({
				template: "\
				<div class='popover tour'>\
					<div class='arrow'></div>\
					<h3 class='popover-title tutorial-title'></h3>\
					<div class='popover-content'></div>\
					<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
						<div class='tutorial-prev-icon tutorial-icon-button' data-role='prev'>\
							<div class='tutorial-prev-icon1 web-activity'>\
								<div class='tutorial-prev-icon2 web-activity-icon'></div>\
								<div class='tutorial-prev-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringPrevShort+"</div>\
						</div>\
						<span data-role='separator' style='margin: 4px'>|</span>\
						<div class='tutorial-next-icon tutorial-icon-button' data-role='next'>\
							<div class='tutorial-next-icon1 web-activity'>\
								<div class='tutorial-next-icon2 web-activity-icon'></div>\
								<div class='tutorial-next-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringNextShort+"</div>\
						</div>\
						<div class='tutorial-end-icon tutorial-icon-button' data-role='end'>\
							<div class='tutorial-end-icon1 web-activity'>\
								<div class='tutorial-end-icon2 web-activity-icon'></div>\
								<div class='tutorial-end-icon3 web-activity-disable'></div>\
							</div>\
							<div class='tutorial-icon-text'>"+this.l10n.stringEndShort+"</div>\
						</div>\
					</div>\
				</div>",
				storage: false,
				backdrop: true,
				steps: steps,
				onShow: function (tour) {
					if(tour._current == 7) {
						vm.$emit('startpos');
					} 
					else if(tour._current == 8) {
						vm.$emit('end', type);
					}
				},
				onEnd: function (tour) {
					vm.$emit('end', type);
				},
			});
			tour.init();
			tour.start(true);
		}
	}
}
