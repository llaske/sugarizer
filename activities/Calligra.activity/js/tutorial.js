
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
				stringTutoNextButtonTitle: '',
				stringTutoNextButtonContent: '',
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
			let steps = [];
			if (options.currentView === TemplateViewer && !options.editMode) {
				steps.push(
					{
						title: this.l10n.stringTutoExplainTitle,
						intro: this.l10n.stringTutoExplainContent
					}
				);
			}
			steps = steps.concat([
				{
					element: options.templatebutton,
					position: "bottom",
					title: this.l10n.stringTutoTemplateButtonTitle,
					intro: this.l10n.stringTutoTemplateButtonContent
				},
				{
					element: options.item,
					position: "right",
					title: options.editMode?this.l10n.stringTutoEditorItemTitle:this.l10n.stringTutoPlayerItemTitle,
					intro: options.editMode?this.l10n.stringTutoEditorItemContent:this.l10n.stringTutoPlayerItemContent
				}
			]);
			if (options.currentView === TemplateViewer && options.editMode) {
				steps.push(
					{
						element: options.insertimagebutton,
						position: "bottom",
						title: this.l10n.stringTutoInsertImageButtonTitle,
						intro: this.l10n.stringTutoInsertImageButtonContent
					}
				);
			}
			var settingsItemName = "stringTuto"+(options.editMode?"Player":"Editor")+(options.currentView === TemplateViewer?"Template":"Item")+"Button";
			steps = steps.concat([
				{
					element: options.settingsbutton,
					position: "bottom",
					title: this.l10n[settingsItemName+"Title"],
					intro: this.l10n[settingsItemName+"Content"]
				},
				{
					element: options.fullscreenbutton,
					position: "bottom",
					title: this.l10n.stringTutoFullscreenButtonTitle,
					intro: this.l10n.stringTutoFullscreenButtonContent
				}
			]);
			if (options.currentView !== TemplateViewer) {
				steps = steps.concat([
					{
						element: options.linesbutton,
						position: "bottom",
						title: this.l10n.stringTutoLinesButtonTitle,
						intro: this.l10n.stringTutoLinesButtonContent
					},
					{
						element: options.zoombutton,
						position: "bottom",
						title: this.l10n.stringTutoZoomButtonTitle,
						intro: this.l10n.stringTutoZoomButtonContent
					},
					{
						element: options.backbutton,
						position: "right",
						title: this.l10n.stringTutoBackButtonTitle,
						intro: this.l10n.stringTutoBackButtonContent
					},
					{
						element: options.editoraddbutton,
						position: "left",
						title: this.l10n.stringTutoEditorAddButtonTitle,
						intro: this.l10n.stringTutoEditorAddButtonContent
					},
					{
						element: options.editorremovebutton,
						position: "left",
						title: this.l10n.stringTutoEditorRemoveButtonTitle,
						intro: this.l10n.stringTutoEditorRemoveButtonContent
					},
					{
						element: options.editoraddpathbutton,
						position: "left",
						title: this.l10n.stringTutoEditorAddPathButtonTitle,
						intro: this.l10n.stringTutoEditorAddPathButtonContent
					},
					{
						element: options.editorremovepathbutton,
						position: "left",
						title: this.l10n.stringTutoEditorRemovePathButtonTitle,
						intro: this.l10n.stringTutoEditorRemovePathButtonContent
					},
					{
						element: options.restartbutton,
						position: "left",
						title: this.l10n.stringTutoRestartButtonTitle,
						intro: this.l10n.stringTutoRestartButtonContent
					},
					{
						element: options.nextbutton,
						position: "left",
						title: this.l10n.stringTutoNextButtonTitle,
						intro: this.l10n.stringTutoNextButtonContent
					}
				]);
			}
            
			steps = steps.filter((step) => !('element' in step) || (step['element'].style.display != 'none'));	

			introJs().setOptions({
				tooltipClass: 'customTooltip',
				steps: steps,
				prevLabel: this.l10n.stringPrevShort,
				nextLabel: this.l10n.stringNextShort,
				exitOnOverlayClick: false,
				nextToDone: false,
				showBullets: false
			}).start();	
		}
	}
}
