
// Tutorial component based on bootstrap tour
var Tutorial = {
	template: '<div/>',
	data: function() {
		return {
			l10n: {
				stringPrevShort: '',
				stringNextShort: '',
				stringEndShort: '',
				stringTutoExplainTitle: '',
				stringTutoExplainContent: '',
				stringTutoFullscreenButtonTitle: '',
				stringTutoFullscreenButtonContent: '',
				stringTutoEditorItemTitle: '',
				stringTutoEditorItemContent: '',
				stringTutoPlayerItemTitle: '',
				stringTutoPlayerItemContent: '',
				stringTutoInsertImageButtonTitle: '',
				stringTutoInsertImageButtonContent: '',
				stringTutoEditorTemplateButtonTitle: '',
				stringTutoEditorTemplateButtonContent: '',
				stringTutoPlayerTemplateButtonTitle: '',
				stringTutoPlayerTemplateButtonContent: '',
				stringTutoEditorItemButtonTitle: '',
				stringTutoEditorItemButtonContent: '',
				stringTutoPlayerItemButtonTitle: '',
				stringTutoPlayerItemButtonContent: '',
				stringTutoLinesButtonTitle: '',
				stringTutoLinesButtonContent: '',
				stringTutoZoomButtonTitle: '',
				stringTutoZoomButtonContent: '',
				stringTutoBackButtonTitle: '',
				stringTutoBackButtonContent: '',
				stringTutoRestartButtonTitle: '',
				stringTutoRestartButtonContent: '',
				stringTutoEditorAddButtonTitle: '',
				stringTutoEditorAddButtonContent: '',
				stringTutoEditorRemoveButtonTitle: '',
				stringTutoEditorRemoveButtonContent: '',
				stringTutoEditorAddPathButtonTitle: '',
				stringTutoEditorAddPathButtonContent: '',
				stringTutoEditorRemovePathButtonTitle: '',
				stringTutoEditorRemovePathButtonContent: '',
				stringTutoTemplateButtonTitle: '',
				stringTutoTemplateButtonContent: ''
			}
		}
	},
	methods: {
		localized: function(localization) {
			localization.localize(this.l10n);
		},

		show: function(options) {
			options = options || {};
			var steps = [];
			if (options.currentView === TemplateViewer && !options.editMode) {
				steps.push(
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: this.l10n.stringTutoExplainTitle,
						content: this.l10n.stringTutoExplainContent
					}
				);
			}
			steps = steps.concat([
				{
					element: options.templatebutton,
					placement: "bottom",
					title: this.l10n.stringTutoTemplateButtonTitle,
					content: this.l10n.stringTutoTemplateButtonContent
				},
				{
					element: options.item,
					placement: "right",
					title: options.editMode?this.l10n.stringTutoEditorItemTitle:this.l10n.stringTutoPlayerItemTitle,
					content: options.editMode?this.l10n.stringTutoEditorItemContent:this.l10n.stringTutoPlayerItemContent
				}
			]);
			if (options.currentView === TemplateViewer && options.editMode) {
				steps.push(
					{
						element: options.insertimagebutton,
						placement: "bottom",
						title: this.l10n.stringTutoInsertImageButtonTitle,
						content: this.l10n.stringTutoInsertImageButtonContent
					}
				);
			}
			var settingsItemName = "stringTuto"+(options.editMode?"Player":"Editor")+(options.currentView === TemplateViewer?"Template":"Item")+"Button";
			steps = steps.concat([
				{
					element: options.settingsbutton,
					placement: "bottom",
					title: this.l10n[settingsItemName+"Title"],
					content: this.l10n[settingsItemName+"Content"]
				},
				{
					element: options.fullscreenbutton,
					placement: "bottom",
					title: this.l10n.stringTutoFullscreenButtonTitle,
					content: this.l10n.stringTutoFullscreenButtonContent
				}
			]);
			if (options.currentView !== TemplateViewer) {
				steps = steps.concat([
					{
						element: options.linesbutton,
						placement: "bottom",
						title: this.l10n.stringTutoLinesButtonTitle,
						content: this.l10n.stringTutoLinesButtonContent
					},
					{
						element: options.zoombutton,
						placement: "bottom",
						title: this.l10n.stringTutoZoomButtonTitle,
						content: this.l10n.stringTutoZoomButtonContent
					},
					{
						element: options.backbutton,
						placement: "right",
						title: this.l10n.stringTutoBackButtonTitle,
						content: this.l10n.stringTutoBackButtonContent
					},
					{
						element: options.editoraddbutton,
						placement: "left",
						title: this.l10n.stringTutoEditorAddButtonTitle,
						content: this.l10n.stringTutoEditorAddButtonContent
					},
					{
						element: options.editorremovebutton,
						placement: "left",
						title: this.l10n.stringTutoEditorRemoveButtonTitle,
						content: this.l10n.stringTutoEditorRemoveButtonContent
					},
					{
						element: options.editoraddpathbutton,
						placement: "left",
						title: this.l10n.stringTutoEditorAddPathButtonTitle,
						content: this.l10n.stringTutoEditorAddPathButtonContent
					},
					{
						element: options.editorremovepathbutton,
						placement: "left",
						title: this.l10n.stringTutoEditorRemovePathButtonTitle,
						content: this.l10n.stringTutoEditorRemovePathButtonContent
					},
					{
						element: options.restartbutton,
						placement: "left",
						title: this.l10n.stringTutoRestartButtonTitle,
						content: this.l10n.stringTutoRestartButtonContent
					}
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
				steps: steps
			});
			tour.init();
			tour.start(true);
		}
	}
}
